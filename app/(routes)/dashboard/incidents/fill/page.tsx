"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getFormById } from "@/app/api/form";
import {
  createReport,
  deleteReport,
  getReportById,
  getReports,
  updateReport,
} from "@/app/api/report";
import { getCurrentUser } from "@/app/api/user";
import { FormElementData, FormResponse } from "@/types/form";
import { CaregiverTag, ReportCreate, ReportStatus } from "@/types/report";

import FormElementFill from "../_components/form-element-fill";
import { FormHeaderView } from "../_components/form-header";
import PersonSelector from "../_components/tag-personnel";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ReportResponse } from "@/types/report";
import { User } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Trash } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { LoadingSkeleton } from "../_components/loading-skeleton";
import { ReportSchema, reportSchema } from "../schema";

export default function CreateReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId");
  const reportId = searchParams.get("reportId");
  const isEditing = !!reportId;

  const [form, setForm] = useState<FormResponse | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableReports, setAvailableReports] = useState<ReportResponse[]>(
    [],
  );
  const [referenceReportId, setReferenceReportId] = useState<string | null>(
    null,
  );

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

        if (isEditing && reportId) {
          try {
            const reportData = await getReportById(reportId);

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
  }, [formId, isEditing, reportId, router, methods]);

  const handleReferenceReportChange = (reportId: string | null) => {
    setReferenceReportId(reportId);
  };

  const prepareReport = (data: ReportSchema, mode: string) => {
    const missingRequired = form!.json_content.some((element, idx) => {
      if (!element.required) return false;

      const input = data.report_content[idx]?.input;
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
      status: ReportStatus.DRAFT,
    };

    if (referenceReportId) {
      reportData.reference_report_id = referenceReportId;
    }

    if (mode === "submit") {
      reportData.status = ReportStatus.SUBMITTED;
    }

    return reportData;
  };

  const onSaveDraft = methods.handleSubmit(async (data) => {
    if (!user || !form) return;

    try {
      const reportData = prepareReport(data, "draft");

      if (!reportData) {
        toast({
          title: "Required fields missing",
          description: "Please fill in all fields with * before saving.",
          variant: "destructive",
        });
        return;
      }

      if (!reportId) {
        const newReportId = await createReport(reportData);
        toast({
          title: "Draft report created",
          description: "Your form response was saved successfully.",
        });
        router.replace(
          `/dashboard/incidents/fill?formId=${formId}&reportId=${newReportId}`,
        );
      } else {
        await updateReport(reportId, reportData);
        toast({
          title: "Draft report updated",
          description: "Your edits to the report are saved successfully.",
        });
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error",
        description: "Failed to save the report. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!user || !form) return;

    try {
      const reportData = prepareReport(data, "submit");

      if (!reportData) {
        toast({
          title: "Required fields missing",
          description: "Please fill in all fields with * before submitting.",
          variant: "destructive",
        });
        return;
      }

      if (!reportId) {
        await createReport(reportData);
        toast({
          title: "Report submitted",
          description: "Your report has been submitted successfully.",
        });
        router.replace("/dashboard/incidents");
      } else {
        await updateReport(reportId, reportData);
        toast({
          title: "Report submitted",
          description: "Your report has been submitted successfully.",
        });
        router.replace("/dashboard/incidents");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "Failed to submit the report. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDeleteReport = async () => {
    if (!reportId) return;

    try {
      await deleteReport(reportId);
      toast({
        title: "Report deleted",
        description: "Your report has been deleted successfully.",
      });
      router.back();
    } catch (error) {
      console.error("Failed to delete report:", error);
      toast({
        title: "Error",
        description: "Failed to delete the report. Please try again.",
        variant: "destructive",
      });
    }
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
            {reportId && (
              <Button
                type="button"
                onClick={handleDeleteReport}
                variant="outline"
                className="flex items-center gap-2 text-red-600 hover:text-red-600"
              >
                <Trash className="h-4 w-4" />
                Delete
              </Button>
            )}
            <Button
              type="button"
              disabled={methods.formState.isSubmitting}
              onClick={onSaveDraft}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              Save Draft
            </Button>
            <Button
              type="button"
              disabled={methods.formState.isSubmitting}
              onClick={onSubmit}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              Submit Report
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <FormHeaderView
              title={form.title}
              description={form.description}
              reports={availableReports}
              referenceReportId={referenceReportId}
              onReferenceReportChange={handleReferenceReportChange}
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
    </FormProvider>
  );
}
