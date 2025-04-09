"use client";

import { getReports } from "@/app/api/report";
import { getCurrentUser } from "@/app/api/user";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportResponse, ReportStatus } from "@/types/report";
import { Role, User } from "@/types/user";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import {
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
  TimerIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import getReportBadgeConfig from "../../_components/badge-config";

export default function ReviewReports() {
  const router = useRouter();
  const [resolvedReports, setResolvedReports] = useState<ReportResponse[]>([]);
  const [reviewedReports, setReviewedReports] = useState<ReportResponse[]>([]);
  const [submittedReports, setSubmittedReports] = useState<ReportResponse[]>(
    [],
  );
  const [user, setUser] = useState<User>();

  useEffect(() => {
    fetchUser();
    fetchReports();
  }, []);

  const handleView = (report: ReportResponse) => {
    router.push(`/dashboard/incidents/view?reportId=${report.id}`);
  };

  const fetchUser = async () => {
    try {
      const user = await getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchReports = async () => {
    try {
      const resolved = await getReports(ReportStatus.CHANGES_MADE);
      const reviewed = await getReports(ReportStatus.CHANGES_REQUESTED);
      const submitted = await getReports(ReportStatus.SUBMITTED);
      setSubmittedReports(submitted);
      setReviewedReports(reviewed);
      setResolvedReports(resolved);
    } catch (error) {
      console.error("Failed to fetch reports");
    }
  };

  const renderTable = (
    reports: ReportResponse[],
    dateLabel: string,
    isReviews: boolean = false,
  ) => (
    <Table className="bg-white">
      <TableHeader className="bg-gray-50">
        <TableRow className="hover:bg-gray-50">
          <TableHead className="font-semibold text-gray-700">
            {dateLabel}
          </TableHead>
          <TableHead className="font-semibold text-gray-700">Form</TableHead>
          <TableHead className="font-semibold text-gray-700">
            Reporter
          </TableHead>
          <TableHead className="font-semibold text-gray-700">
            Resident
          </TableHead>
          <TableHead className="font-semibold text-gray-700">Status</TableHead>
          <TableHead className="font-semibold text-gray-700 text-right">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.length === 0 ? (
          <TableRow className="hover:bg-white">
            <TableCell colSpan={6} className="h-16 text-center text-gray-500">
              No reports found in this category
            </TableCell>
          </TableRow>
        ) : (
          reports.map((report) => (
            <TableRow
              key={report.id}
              className=" hover:bg-blue-50 transition-colors"
              onClick={() => handleView(report)}
            >
              <TableCell className="font-medium">
                {isReviews
                  ? new Date(
                      report.reviews![report.reviews!.length - 1].reviewed_at,
                    ).toLocaleDateString()
                  : new Date(report.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>{report.form_name}</TableCell>
              <TableCell>{report.reporter.name}</TableCell>
              <TableCell>
                {report.primary_resident?.name || (
                  <span className="text-gray-400">Not Applicable</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  className={`${getReportBadgeConfig(
                    report.status,
                  )} px-2 py-1 font-normal`}
                >
                  {report.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {(report.status !== "Published" ||
                  user?.role === Role.ADMIN) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-gray-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Review Incident Reports
        </h1>
        <p className="text-gray-600">
          Manage submitted reports by approving or requesting changes
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg shadow-sm overflow-hidden border">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="pending-review"
          >
            <AccordionItem value="pending-review" className="border-none">
              <AccordionTrigger className="bg-blue-50 border-l-4 border-blue-500 px-6 py-4 hover:no-underline hover:bg-blue-100 transition-colors">
                <div className="flex items-center gap-3">
                  <TimerIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <h2 className="text-md font-medium text-blue-800 flex items-center">
                    Pending Admin Review
                    <span className="ml-2 text-sm py-0.5 px-2 bg-blue-100 text-blue-700 rounded-full">
                      {submittedReports.length}
                    </span>
                  </h2>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-0">
                <div className="p-4 bg-white">
                  {renderTable(submittedReports, "Submission Date")}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="rounded-lg shadow-sm overflow-hidden border">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="pending-approval"
          >
            <AccordionItem value="pending-approval" className="border-none">
              <AccordionTrigger className="bg-green-50 border-l-4 border-green-500 px-6 py-4 hover:no-underline hover:bg-green-100 transition-colors">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <h2 className="text-md font-medium text-green-800 flex items-center">
                    Updates Completed - Pending Approval
                    <span className="ml-2 text-sm py-0.5 px-2 bg-green-100 text-green-700 rounded-full">
                      {resolvedReports.length}
                    </span>
                  </h2>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-0">
                <div className="p-4 bg-white">
                  {renderTable(resolvedReports, "Resolution Date", true)}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="rounded-lg shadow-sm overflow-hidden border">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="awaiting-updates"
          >
            <AccordionItem value="awaiting-updates" className="border-none">
              <AccordionTrigger className="bg-amber-50 border-l-4 border-amber-500 px-6 py-4 hover:no-underline hover:bg-amber-100 transition-colors">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <h2 className="text-md font-medium text-amber-800 flex items-center">
                    Changes Requested - Awaiting Updates
                    <span className="ml-2 text-sm py-0.5 px-2 bg-amber-100 text-amber-700 rounded-full">
                      {reviewedReports.length}
                    </span>
                  </h2>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-0">
                <div className="p-4 bg-white">
                  {renderTable(reviewedReports, "Review Date", true)}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
