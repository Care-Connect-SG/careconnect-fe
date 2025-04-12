"use client";

import { tryGetFormById } from "@/app/api/form";
import {
  approveReport,
  getReportById,
  tryGetReportById,
} from "@/app/api/report";
import { getResidentById } from "@/app/api/resident";
import { getCurrentUser, getUserById } from "@/app/api/user";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";
import { formatDayMonthYear, toTitleCase } from "@/lib/utils";
import { FormResponse } from "@/types/form";
import { ReportResponse, ReportStatus } from "@/types/report";
import { ResidentRecord } from "@/types/resident";
import { User } from "@/types/user";
import { pdf } from "@react-pdf/renderer";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Download,
  Info,
  MessageCircle,
  MessageCircleReply,
  Share2,
  User as UserIcon,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import getReportBadgeConfig from "../_components/badge-config";
import { LoadingSkeleton } from "../_components/loading-skeleton";
import ReportPDF from "../_components/report-pdf";
import ReportReviewDialogue from "./_components/review-dialog";

export default function ViewReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");

  const [report, setReport] = useState<ReportResponse>();
  const [reporter, setReporter] = useState<User | null>();
  const [resident, setResident] = useState<ResidentRecord>();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [form, setForm] = useState<FormResponse | null>();
  const [user, setUser] = useState<User>();
  const [isSharing, setIsSharing] = useState(false);
  const [referenceReportValid, setReferenceReportValid] = useState(true);

  const handleShareWithNextOfKin = async () => {
    if (!report || !form || !reporter || !resident?.emergency_contact_number) {
      toast({
        title: "Error",
        description: "Missing information needed to share the report.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSharing(true);

      const pdfBlob = await pdf(
        <ReportPDF
          form={form}
          report={report}
          reporter={reporter}
          resident={resident}
        />,
      ).toBlob();

      const formData = new FormData();

      const pdfFile = new File(
        [pdfBlob],
        `${toTitleCase(resident.full_name)}'s ${form.title}.pdf`,
        {
          type: "application/pdf",
        },
      );

      formData.append("media", pdfFile);

      const whatsappNumber = `65${resident.emergency_contact_number}`;
      formData.append("jid", `${whatsappNumber}`);
      formData.append(
        "caption",
        `🚨 URGENT: Incident Report for ${toTitleCase(resident.full_name)}`,
      );

      const response = await fetch("/api/whatsapp/media", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Report shared",
          description: `The report has been shared with the next of kin via WhatsApp.`,
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
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = async () => {
    if (!report || !form || !reporter) return;

    const blob = await pdf(
      <ReportPDF
        form={form}
        report={report}
        reporter={reporter}
        resident={resident}
      />,
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

  const handleApprove = async () => {
    try {
      await approveReport(reportId!);
      router.replace("/dashboard/incidents");
      toast({
        title: "Report approved.",
        description: "The report is now published for all users.",
      });
    } catch (error) {
      console.error("Error approving report:", error);
      toast({
        title: "Error",
        description: "Failed to approve report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchUser = async () => {
    try {
      const user = await getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchReport = async () => {
    try {
      const data: ReportResponse = await getReportById(reportId!);
      const reporter = await getUserById(data.reporter.id);
      if (data.primary_resident?.id) {
        const resident: ResidentRecord = await getResidentById(
          data.primary_resident.id,
        );
        setResident(resident);
      }
      setReport(data);
      setReporter(reporter);
      fetchForm(data.form_id);

      if (data.reference_report_id) {
        const ref = await tryGetReportById(data.reference_report_id);
        setReferenceReportValid(!!ref);
      }
    } catch {
      console.error("Report not found");
      router.replace("/404");
      return null;
    }
  };

  const fetchForm = async (formId: string) => {
    try {
      const data = await tryGetFormById(formId!);
      setForm(data);
    } catch (error) {
      setForm(undefined);
    }
  };

  useEffect(() => {
    fetchUser();
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  if (!reportId) return <LoadingSkeleton />;

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 space-y-8 flex flex-col">
      <div className="flex justify-between items-center">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Return to Incident Reports</span>
        </Button>

        <div className="flex gap-3">
          {report?.status === ReportStatus.PUBLISHED && (
            <>
              <Button
                variant="outline"
                onClick={handleShareWithNextOfKin}
                disabled={!resident?.emergency_contact_number || isSharing}
                title={
                  !resident?.emergency_contact_number
                    ? "No emergency contact number available"
                    : ""
                }
                className="flex items-center gap-2"
              >
                {isSharing ? (
                  <>
                    <Spinner />
                    <span>Sharing...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    <span>Share with Guardian</span>
                  </>
                )}
              </Button>

              <Button
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Report</span>
              </Button>
            </>
          )}

          {(report?.status === ReportStatus.SUBMITTED ||
            report?.status === ReportStatus.CHANGES_MADE) &&
            user?.role === "Admin" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setReviewDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Request Changes</span>
                </Button>

                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleApprove}
                >
                  Approve
                </Button>
              </>
            )}

          {report?.status === ReportStatus.CHANGES_REQUESTED &&
            user?.id === report.reporter.id && (
              <Button
                variant="secondary"
                onClick={() =>
                  router.replace(
                    `/dashboard/incidents/resolve?formId=${report.form_id}&reportId=${reportId}`,
                  )
                }
                className="flex items-center gap-2"
              >
                <MessageCircleReply className="h-4 w-4" />
                <span>Resolve Review</span>
              </Button>
            )}
        </div>
      </div>

      {report?.status === ReportStatus.CHANGES_REQUESTED && (
        <Card className="border-red-200 bg-red-50">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1" className="border-none">
              <AccordionTrigger className="py-4 px-6 text-lg font-medium text-red-800 hover:no-underline group">
                <div className="flex items-center gap-2">
                  <CircleAlert className="text-red-600 h-5 w-5" />
                  <span>Changes Requested</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 pt-0">
                <div className="text-gray-700 space-y-4">
                  <p className="text-sm text-gray-500">
                    Reviewed by{" "}
                    <span className="font-medium">
                      {
                        report?.reviews![report?.reviews!.length - 1].reviewer
                          .name
                      }
                    </span>{" "}
                    on{" "}
                    <span className="font-medium">
                      {new Date(
                        report?.reviews![report?.reviews!.length - 1]
                          .reviewed_at,
                      ).toLocaleString()}
                    </span>
                  </p>
                  <div className="bg-white p-4 rounded-md border border-red-100">
                    {report?.reviews![report?.reviews!.length - 1].review}
                  </div>

                  {user?.id === report.reporter.id && (
                    <Button
                      className="mt-2"
                      variant="secondary"
                      onClick={() =>
                        router.replace(
                          `/dashboard/incidents/resolve?formId=${report.form_id}&reportId=${reportId}`,
                        )
                      }
                    >
                      Resolve Review
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      )}

      {report?.status === ReportStatus.CHANGES_MADE && (
        <Card className="border-green-200 bg-green-50">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1" className="border-none">
              <AccordionTrigger className="py-4 px-6 text-lg font-medium text-green-800 hover:no-underline group">
                <div className="flex items-center gap-2">
                  <Info className="text-green-600 h-5 w-5" />
                  <span>Changes Made</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 pt-0 text-gray-700">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="text-gray-500 h-5 w-5" />
                      <h3 className="font-medium text-gray-800">Review</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Reviewed by{" "}
                      <span className="font-medium">
                        {
                          report?.reviews![report?.reviews!.length - 1].reviewer
                            .name
                        }
                      </span>{" "}
                      on{" "}
                      <span className="font-medium">
                        {new Date(
                          report?.reviews![report?.reviews!.length - 1]
                            .reviewed_at,
                        ).toLocaleString()}
                      </span>
                    </p>
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      {report?.reviews![report?.reviews!.length - 1].review}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MessageCircleReply className="text-green-500 h-5 w-5" />
                      <h3 className="font-medium text-gray-800">Resolution</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Resolved on{" "}
                      <span className="font-medium">
                        {new Date(
                          report?.reviews![report?.reviews!.length - 1]
                            .resolved_at!,
                        ).toLocaleString()}
                      </span>
                    </p>
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      {report?.reviews![report?.reviews!.length - 1].resolution}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      )}

      <Card>
        <CardHeader className="bg-gray-50 border-b pb-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold">
                {form?.title}
              </CardTitle>
              <p className="text-gray-500 text-sm">
                Reported on{" "}
                <time
                  dateTime={
                    report?.created_at
                      ? new Date(report.created_at).toISOString()
                      : ""
                  }
                >
                  {report?.created_at
                    ? formatDayMonthYear(new Date(report.created_at))
                    : ""}
                </time>{" "}
                by {report?.reporter.name}
              </p>
            </div>
            <Badge
              className={`${getReportBadgeConfig(
                report?.status!,
              )} px-3 py-1 text-sm font-medium`}
            >
              {report?.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {(resident ||
              (report?.involved_residents &&
                report?.involved_residents.length > 0)) && (
              <div className="space-y-6">
                {resident && (
                  <div className="space-y-4">
                    <h2 className="text-gray-600 font-semibold flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      Primary Resident
                    </h2>
                    <Link
                      href={`/dashboard/residents/${resident.id}`}
                      className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-all group"
                    >
                      <Avatar className="h-16 w-16 border shadow-sm">
                        <AvatarImage
                          src={resident.photograph || undefined}
                          alt={resident.full_name}
                        />
                        <AvatarFallback className="bg-gray-100 text-gray-800 text-sm rounded-lg">
                          {resident.full_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors flex items-center gap-1">
                          {resident.full_name}
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="mt-1 space-y-1 text-sm text-gray-500">
                          <p>Room: {resident.room_number}</p>
                          <p>DOB: {resident.date_of_birth}</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}

                {report?.involved_residents &&
                  report?.involved_residents.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-gray-600 font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-400" />
                        Other Involved Residents
                      </h2>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        {report.involved_residents.map((ir, index) => (
                          <span key={ir.id} className="inline-block mr-1">
                            <Link
                              href={`/dashboard/residents/${ir.id}`}
                              className="text-gray-600 hover:text-gray-800 hover:underline"
                            >
                              {ir.name}
                            </Link>
                            {index < report.involved_residents!.length - 1
                              ? ", "
                              : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-gray-600 font-semibold flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  Reporter
                </h2>
                <Link
                  href={`/dashboard/nurses/${report?.reporter.id}`}
                  className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-all group"
                >
                  <Avatar className="h-16 w-16 border shadow-sm">
                    <AvatarImage
                      src={reporter?.profile_picture || undefined}
                      alt={reporter?.name}
                      className="rounded-lg bg-blue-100"
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-800 text-sm rounded-lg">
                      {reporter?.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-blue-500 transition-colors flex items-center gap-1">
                      {reporter?.name}
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="mt-1 space-y-1 text-sm text-gray-500">
                      <p>{reporter?.organisation_rank}</p>
                      <p>Role: {reporter?.role}</p>
                    </div>
                  </div>
                </Link>
              </div>

              {report?.involved_caregivers &&
                report?.involved_caregivers.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-gray-600 font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5 text-gray-400" />
                      Other Involved Caregivers
                    </h2>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      {report.involved_caregivers.map((ir, index) => (
                        <span key={ir.id} className="inline-block mr-1">
                          <Link
                            href={`/dashboard/nurses/${ir.id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {ir.name}
                          </Link>
                          {index < report.involved_caregivers!.length - 1
                            ? ", "
                            : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {report?.reference_report_id && (
                <div className="space-y-3">
                  <h2 className="text-gray-600 font-semibold">
                    Reference Report
                  </h2>

                  {referenceReportValid === false ? (
                    <div className="inline-flex items-center gap-2 text-gray-400 cursor-not-allowed">
                      <Info className="h-4 w-4" />
                      <span>Reference Report Deleted</span>
                    </div>
                  ) : referenceReportValid === true ? (
                    <Link
                      href={`/dashboard/incidents/view?reportId=${report.reference_report_id}`}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <Info className="h-4 w-4" />
                      <span className="hover:underline">
                        View Reference Report
                      </span>
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <hr className="my-8 border-gray-200" />

          <div className="space-y-6">
            {report?.report_content
              .filter((section) => !!section.input)
              .map((section) => (
                <div
                  key={section.form_element_id}
                  className="bg-gray-50 p-5 rounded-lg border border-gray-100"
                >
                  <h3 className="font-medium text-gray-800 mb-3">
                    {
                      form?.json_content.find(
                        (element) =>
                          element.element_id === section.form_element_id,
                      )?.label
                    }
                  </h3>
                  <div className="text-gray-700 whitespace-pre-line">
                    {section.input}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {reportId && user && (
        <ReportReviewDialogue
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          reportId={reportId}
          user={user}
        />
      )}
    </div>
  );
}
