"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getFormById } from "@/app/api/form";
import {
  getReportById,
  getReports,
  resolveReportReview,
} from "@/app/api/report";
import { getCurrentUser } from "@/app/api/user";
import { FormElementData, FormResponse } from "@/types/form";
import { CaregiverTag, ReportCreate, ReportStatus } from "@/types/report";

import { FormHeaderView } from "../_components/form-header";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ReportResponse } from "@/types/report";
import { User } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, CircleAlert } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import FormElementFill from "../_components/form-element-fill";
import { LoadingSkeleton } from "../_components/loading-skeleton";
import PersonSelector from "../_components/tag-personnel";
import { ReportSchema, reportSchema } from "../schema";

export default function ResolveReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId");
  const reportId = searchParams.get("reportId");

  const [form, setForm] = useState<FormResponse | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableReports, setAvailableReports] = useState<ReportResponse[]>(
    [],
  );
  const [showReference, setShowReference] = useState(false);
  const [referenceReportId, setReferenceReportId] = useState<string | null>(
    null,
  );
  const [resolution, setResolution] = useState<string>("");
  const [open, setOpen] = useState(false);

  const methods = useForm<ReportSchema>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      report_content: [],
      primary_resident: null,
      involved_residents: [],
      involved_caregivers: [],
    },
    mode: "onChange",
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          title: "Error",
          description: "Failed to load user data. Please refresh the page.",
          variant: "destructive",
        });
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchAllReports() {
      try {
        const allReports = await getReports();
        const publishedReports = allReports.filter(
          (report: ReportResponse) => report.status === ReportStatus.PUBLISHED,
        );
        setAvailableReports(publishedReports);
      } catch (error) {
        console.error("Failed to fetch reports for reference dropdown");
      }
    }

    fetchAllReports();
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!formId) return;

      try {
        const formData = await getFormById(formId);
        setForm(formData);

        const initialReportContent = formData.json_content.map(
          (element: FormElementData) => ({
            form_element_id: element.element_id,
            input: element.type === "checkbox" ? [] : "",
          }),
        );

        if (reportId) {
          try {
            const reportData = await getReportById(reportId);
            setReport(reportData);

            const mergedReportContent = initialReportContent.map((item) => {
              const existingContent = reportData.report_content.find(
                (content) => content.form_element_id === item.form_element_id,
              );
              return existingContent ? existingContent : item;
            });

            methods.reset({
              report_content: mergedReportContent,
              primary_resident: reportData.primary_resident || null,
              involved_residents: reportData.involved_residents || [],
              involved_caregivers: reportData.involved_caregivers || [],
            });

            if (reportData.reference_report_id) {
              setReferenceReportId(reportData.reference_report_id);
              setShowReference(true);
            }
          } catch (error) {
            console.error("Error loading report:", error);
            router.replace("/404");
            return;
          }
        } else {
          methods.reset({
            report_content: initialReportContent,
            primary_resident: null,
            involved_residents: [],
            involved_caregivers: [],
          });
        }
      } catch (error) {
        console.error("Error loading form:", error);
        toast({
          title: "Error",
          description: "Failed to load form data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [formId, reportId, router, methods]);

  const prepareReport = (data: ReportSchema) => {
    const missingRequired = form!.json_content
      .filter((element) => element.required)
      .some((element, idx) => {
        const input = data.report_content[idx].input;
        return Array.isArray(input) ? input.length === 0 : !input;
      });

    if (missingRequired) {
      return;
    }

    const reporter: CaregiverTag = {
      id: user!.id,
      name: user!.email,
      role: user!.role,
    };

    const reportData: ReportCreate = {
      form_id: form!.id,
      form_name: form!.title,
      reporter,
      report_content: data.report_content,
      primary_resident: data.primary_resident,
      involved_residents: data.involved_residents,
      involved_caregivers: data.involved_caregivers,
      reviews: report?.reviews,
      status: report!.status,
    };

    if (referenceReportId) {
      reportData.reference_report_id = referenceReportId;
    }

    return reportData;
  };

  const submitForm = methods.handleSubmit(async (data) => {
    if (!user || !form) return;

    try {
      const reportData = prepareReport(data);

      if (!reportData) {
        toast({
          title: "Required fields missing",
          description: "Please fill in all fields with * before submitting.",
          variant: "destructive",
        });
        return;
      }

      await resolveReportReview(reportId!, resolution, reportData);
      toast({
        title: "Resolution submitted",
        description: "Your report has been been updated with the resolutions.",
      });
      router.replace("/dashboard/incidents");
    } catch (error) {
      console.error("Error submitting resolution:", error);
      toast({
        title: "Error",
        description:
          "Failed to resolve the review and update the report. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onClickSubmit = () => {
    setOpen(true);
  };

  const onSubmitResolution = async () => {
    setOpen(false);
    submitForm();
  };

  if (loading || !form || !user) return <LoadingSkeleton />;

  return (
    <FormProvider {...methods}>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6 pb-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Return
            </Button>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              disabled={methods.formState.isSubmitting}
              onClick={onClickSubmit}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              Submit Resolution
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {report?.status === ReportStatus.CHANGES_REQUESTED && (
            <div className="rounded-md border px-4 py-2">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-medium">
                    <CircleAlert className="text-red-500 transition-none mr-2" />
                    Changes Requested
                  </AccordionTrigger>
                  <AccordionContent className="rounded">
                    <Card className="border-none shadow-none">
                      <CardContent className="px-2 text-sm pb-4">
                        <p className="opacity-50 text-sm mt-2 pb-2">
                          Reviewed by{" "}
                          {
                            report?.reviews![report?.reviews!.length - 1]
                              .reviewer.name
                          }{" "}
                          on{" "}
                          {new Date(
                            report?.reviews![report?.reviews!.length - 1]
                              .reviewed_at,
                          ).toLocaleString()}
                        </p>
                        {report?.reviews![report?.reviews!.length - 1].review}
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <FormHeaderView
              title={form.title}
              description={form.description}
              reports={availableReports}
              referenceReportId={referenceReportId}
              onReferenceReportChange={(reportId) =>
                setReferenceReportId(reportId)
              }
            />
            <PersonSelector user={user} />
          </div>

          <div className="space-y-6">
            {form.json_content.map((element, idx) => (
              <FormElementFill
                key={element.element_id}
                element={element}
                value={methods.watch(`report_content.${idx}.input`)}
                onInputChange={(value) => {
                  methods.setValue(`report_content.${idx}.input`, value);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <DialogTitle className="text-xl">Resolution Comments</DialogTitle>
            </div>
          </DialogHeader>

          <Textarea
            id="comments"
            placeholder="Briefly describe the changes you made to resolve the review..."
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="min-h-[150px]"
          />

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                disabled={!resolution.trim()}
                onClick={onSubmitResolution}
                className="flex-1 sm:flex-auto bg-green-600 hover:bg-green-700 text-white"
              >
                Submit
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
