import { getFormById } from "@/app/api/form";
import { getResidentById } from "@/app/api/resident";
import { getUserById } from "@/app/api/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { toTitleCase } from "@/lib/utils";
import { ReportResponse, ReportStatus } from "@/types/report";
import { Role, User } from "@/types/user";
import { pdf } from "@react-pdf/renderer";
import { Download, Edit, MoreHorizontal, Share2, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import getReportBadgeConfig from "./badge-config";
import ReportPDF from "./report-pdf";

interface ReportsTableProps {
  user: User;
  reports: ReportResponse[];
  activeTab: string;
  handleDelete: (reportId: string) => void;
}

export default function ReportsTable({
  user,
  reports,
  activeTab,
  handleDelete,
}: ReportsTableProps) {
  const router = useRouter();

  const handleView = (report: ReportResponse) => {
    router.push(`/dashboard/incidents/view?reportId=${report.id}`);
  };

  const handleEdit = (report: ReportResponse) => {
    router.push(
      `/dashboard/incidents/fill?formId=${report.form_id}&reportId=${report.id}`
    );
  };

  const handleDownload = async (report: ReportResponse) => {
    const form = await getFormById(report.form_id);
    const reporter = await getUserById(report.reporter.id);
    const resident = report.primary_resident?.id
      ? await getResidentById(report.primary_resident.id)
      : undefined;

    if (!report || !form || !reporter) return;

    const blob = await pdf(
      <ReportPDF
        form={form}
        report={report}
        reporter={reporter}
        resident={resident}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.title}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async (report: ReportResponse) => {
    try {
      const form = await getFormById(report.form_id);
      const reporter = await getUserById(report.reporter.id);
      const resident = report.primary_resident?.id
        ? await getResidentById(report.primary_resident.id)
        : undefined;

      if (!report || !form || !reporter) {
        toast({
          title: "Error",
          description: "Could not load report details.",
          variant: "destructive",
        });
        return;
      }

      if (!resident?.emergency_contact_number) {
        toast({
          title: "Error",
          description:
            "No emergency contact number available for this resident.",
          variant: "destructive",
        });
        return;
      }

      const pdfBlob = await pdf(
        <ReportPDF
          form={form}
          report={report}
          reporter={reporter}
          resident={resident}
        />
      ).toBlob();

      const formData = new FormData();
      const pdfFile = new File(
        [pdfBlob],
        `${toTitleCase(resident.full_name)}'s ${form.title}.pdf`,
        { type: "application/pdf" }
      );
      formData.append("media", pdfFile);
      formData.append("jid", `65${resident.emergency_contact_number}`);
      formData.append(
        "caption",
        `🚨 URGENT: Incident Report for ${toTitleCase(resident.full_name)}`
      );

      const response = await fetch("/api/whatsapp/media", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Report shared",
          description:
            "The report has been shared with the next of kin via WhatsApp.",
        });
      } else {
        throw new Error(result.error || "Failed to share report");
      }
    } catch (error) {
      console.error("Error sharing report:", error);
      toast({
        title: "Error",
        description: "Failed to share the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderCellContent = (value: string | null | undefined) => {
    if (!value) return <span className="text-gray-400">N/A</span>;
    return toTitleCase(value);
  };

  const canShowActions = (report: ReportResponse) => {
    return ![ReportStatus.SUBMITTED, ReportStatus.CHANGES_MADE].includes(
      report.status
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Created Date
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Form
              </TableHead>
              {activeTab === "all" && (
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reporter
                </TableHead>
              )}
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Resident
              </TableHead>
              {activeTab === "my" && (
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </TableHead>
              )}
              {(user?.role === Role.ADMIN || activeTab === "my") && (
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-200">
            {reports.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="px-6 py-8 text-center text-gray-500 bg-gray-50"
                >
                  {activeTab === "my"
                    ? "You have not created any reports yet."
                    : "No reports found matching your search criteria."}
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow
                  key={report.id}
                  className="hover:bg-blue-50 hover:duration-300 ease-in-out"
                  onClick={() => handleView(report)}
                >
                  <TableCell className="px-6 py-4 font-medium text-gray-900">
                    {new Date(report.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-gray-900">
                    {report.form_name}
                  </TableCell>
                  {activeTab === "all" && (
                    <TableCell className="px-6 py-4 text-gray-900">
                      {report.reporter.name}
                    </TableCell>
                  )}
                  <TableCell className="px-6 py-4 text-gray-900">
                    {renderCellContent(report.primary_resident?.name)}
                  </TableCell>
                  {activeTab === "my" && (
                    <TableCell className="px-6 py-4">
                      <Badge
                        className={`${getReportBadgeConfig(
                          report.status
                        )} font-normal`}
                      >
                        {report.status}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell className="px-6 py-4 w-[1%] whitespace-nowrap">
                    {canShowActions(report) ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-transparent"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {report.status === ReportStatus.CHANGES_REQUESTED && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/dashboard/incidents/resolve?formId=${report.form_id}&reportId=${report.id}`
                                );
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Resolve
                            </DropdownMenuItem>
                          )}
                          {report.status === ReportStatus.PUBLISHED && (
                            <>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(report);
                                }}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShare(report);
                                }}
                              >
                                <Share2 className="mr-2 h-4 w-4" />
                                Share with Guardian
                              </DropdownMenuItem>
                            </>
                          )}
                          {report.status === ReportStatus.DRAFT && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(report);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {(report.status === ReportStatus.DRAFT ||
                            user?.role === Role.ADMIN) && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(report.id);
                              }}
                              className="text-red-500 hover:text-red-500"
                            >
                              <Trash className="mr-2 h-4 w-4 text-red-500 hover:text-red-500" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <div className="h-4 w-4" /> // empty but still sized
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
