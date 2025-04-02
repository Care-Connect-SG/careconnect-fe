"use client";

import { getFormById } from "@/app/api/form";
import { approveReport, getReportById } from "@/app/api/report";
import { getResidentById } from "@/app/api/resident";
import { getCurrentUser, getUserById } from "@/app/api/user";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDayMonthYear } from "@/lib/utils";
import { FormResponse } from "@/types/form";
import { ReportResponse, ReportStatus } from "@/types/report";
import { ResidentRecord } from "@/types/resident";
import { pdf } from "@react-pdf/renderer";
import { User } from "@/types/user";
import { ChevronLeft, ChevronRight, CircleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "../_components/loading-skeleton";
import ReportPDF from "../_components/report-pdf";
import { toast } from "@/hooks/use-toast";
import getReportBadgeConfig from "../_components/badge-config";
import ReportReviewDialogue from "./_components/review-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


export default function ViewReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");

  const [report, setReport] = useState<ReportResponse>();
  const [reporter, setReporter] = useState<User | null>();
  const [resident, setResident] = useState<ResidentRecord>();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [form, setForm] = useState<FormResponse>();
  const [user, setUser] = useState<User>();

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
      })
    } catch (error) {
      console.error("Error approving report:", error);
      toast({
        title: "Error",
        description: "Failed to approve report. Please try again.",
        variant: "destructive",
      });
    }
  }

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
    } catch {
      console.error("Report not found");
      router.replace("/404");
      return null;
    }
  };

  const fetchForm = async (formId: string) => {
    try {
      const data = await getFormById(formId!);
      setForm(data);
    } catch (error) {
      console.error("Failed to fetch form");
      return null;
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
    <div className="py-4 px-8">
      <div className="flex justify-between items-center mb-2">
        <Button onClick={() => router.back()} variant="outline" className="border rounded-md">
          <ChevronLeft className="h-4 w-4 mx-auto" />
          Return to Incident Reports
        </Button>
        {report?.status === ReportStatus.PUBLISHED && (
          <Button className="ml-2" onClick={handleDownload}>
            Download Report
          </Button>
        )}
        {
          ((report?.status === ReportStatus.SUBMITTED || report?.status === ReportStatus.CHANGES_MADE)
            && user?.role === "Admin") && (
            <div className="flex gap-2 justify-end">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setReviewDialogOpen(true)}>
                Request Changes
              </Button>
              <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handleApprove}>
                Approve
              </Button>
            </div>
          )
        }
        {
          report?.status === ReportStatus.CHANGES_REQUESTED
          && (
            <Button variant={"secondary"} onClick={() => router.replace(
              `/dashboard/incidents/resolve?formId=${report.form_id}&reportId=${reportId}`,
            )}>
              Resolve Review
            </Button>
          )
        }
      </div>
      {
        report?.status === ReportStatus.CHANGES_REQUESTED && (
          <div className="rounded-md border px-4 my-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-medium">
                  <CircleAlert className="text-red-500 transition-none" />
                  Changes Requested
                </AccordionTrigger>
                <AccordionContent className="rounded">
                  <Card className="border-none shadow-none">
                    <CardContent className="px-2 text-sm pb-4">
                      <p className="opacity-50 text-sm mt-2 pb-2">Reviewed by {report?.reviews![report?.reviews!.length - 1].reviewer.name} on {new Date(report?.reviews![report?.reviews!.length - 1].reviewed_at).toLocaleString()}</p>
                      {report?.reviews![report?.reviews!.length - 1].review}
                    </CardContent>
                  </Card>
                  <Button className="my-2 mx-2" variant={"secondary"} onClick={() => router.replace(
                    `/dashboard/incidents/resolve?formId=${report.form_id}&reportId=${reportId}`,
                  )}>
                    Resolve Review
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )
      }
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <CardTitle>{form?.title}</CardTitle>
            <Badge
              className={getReportBadgeConfig(report?.status!)}
            >
              {report?.status}
            </Badge>
          </div>
          {report?.created_at && (
            <p className="text-gray-500">
              Reported on {formatDayMonthYear(new Date(report?.created_at))} by{" "}
              {report.reporter.name}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div>
            <div className="flex my-4">
              {(resident ||
                (report?.involved_residents &&
                  report?.involved_residents.length > 0)) && (
                  <div className="w-1/2">
                    {resident && (
                      <div className="mb-4">
                        <h2 className="text-gray-500 font-semibold mb-2">
                          Primary Resident
                        </h2>
                        <div>
                          <Link
                            href={`/dashboard/residents/${resident.id}`}
                            className="flex items-center gap-3 group hover"
                          >
                            <Avatar className="h-16 w-16 group-hover:ring-1 group-hover:ring-primary group-hover:ring-offset-2 transition-all">
                              <AvatarFallback>PR</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium flex items-center gap-1">
                                <span className="border-b border-dotted border-muted-foreground group-hover:border-primary mb-1">
                                  {resident.full_name}
                                </span>
                                <ChevronRight className="h-4 w-4 mb-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Room: {resident.room_number}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                DOB: {resident.date_of_birth}
                              </p>
                            </div>
                          </Link>
                        </div>
                      </div>
                    )}
                    {report?.involved_residents &&
                      report?.involved_residents.length > 0 && (
                        <div>
                          <h2 className="text-gray-500">Involved residents:</h2>
                          <div>
                            {report.involved_residents.map((ir, index) => (
                              <span key={ir.id}>
                                <Link
                                  href={`/dashboard/residents/${ir.id}`}
                                  className="border-b border-dotted border-muted-foreground"
                                >
                                  {ir.name}
                                </Link>
                                {index < report.involved_residents!.length - 1 &&
                                  ", "}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              <div className="w-1/2">
                <h2 className="text-gray-500 font-semibold mb-2">Reporter</h2>
                <Link
                  href={`/dashboard/nurses/${report?.reporter.id}`}
                  className="flex items-center gap-3 group hover mb-4"
                >
                  <Avatar className="h-16 w-16 group-hover:ring-1 group-hover:ring-primary group-hover:ring-offset-2 transition-all">
                    <AvatarFallback>NU</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium flex items-center gap-1">
                      <span className="border-b border-dotted border-muted-foreground group-hover:border-primary mb-1">
                        {reporter?.name}
                      </span>
                      <ChevronRight className="h-4 w-4 mb-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {reporter?.organisation_rank} [{reporter?.role}]
                    </p>
                  </div>
                </Link>
                {report?.involved_caregivers &&
                  report?.involved_caregivers.length > 0 && (
                    <div>
                      <h2 className="text-gray-500">Involved caregivers:</h2>
                      <div>
                        {report.involved_caregivers.map((ir, index) => (
                          <span key={ir.id}>
                            <Link
                              href={`/dashboard/nurses/${ir.id}`}
                              className="border-b border-dotted border-muted-foreground"
                            >
                              {ir.name}
                            </Link>
                            {index < report.involved_caregivers!.length - 1 &&
                              ", "}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
              {report?.reference_report_id && (
                <div className="mt-4">
                  <h2 className="text-gray-500 font-semibold mb-2">
                    Reference Report
                  </h2>
                  <Link
                    href={`/dashboard/incidents/view?reportId=${report.reference_report_id}`}
                    className="border-b border-dotted border-muted-foreground hover:border-primary text-blue-600"
                  >
                    View Reference Report
                  </Link>
                </div>
              )}
            </div>

            <hr className="border-t-1 border-gray-300 mt-8 mb-6"></hr>

            <div>
              {report?.report_content
                .filter((section) => !!section.input)
                .map((section) => (
                  <div key={section.form_element_id} className="my-4">
                    <div className="font-bold text-gray-500 py-2">
                      {
                        form?.json_content.find(
                          (element) =>
                            element.element_id === section.form_element_id,
                        )?.label
                      }
                    </div>
                    <div className="text-sm">{section.input}</div>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
      {
        reportId && user && <ReportReviewDialogue open={reviewDialogOpen} onOpenChange={setReviewDialogOpen} reportId={reportId} user={user} />
      }
    </div>
  );
}
