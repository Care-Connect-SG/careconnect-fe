"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getFormById } from "@/app/api/form";
import {
  getReportById,
  getReports,
  resolveReportReview,
  updateReport,
} from "@/app/api/report";
import { getCurrentUser } from "@/app/api/user";
import { FormElementData, FormResponse } from "@/types/form";
import { CaregiverTag, ReportCreate, ReportStatus } from "@/types/report";

import { FormHeaderView } from "../_components/form-header";


import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ReportResponse } from "@/types/report";
import { User } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, X } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { LoadingSkeleton } from "../_components/loading-skeleton";
import { reportSchema, ReportSchema } from "../schema";
import PersonSelector from "../_components/tag-personnel";
import FormElementFill from "../_components/form-element-fill";
import { report } from "process";


export default function ResolveReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId");
  const reportId = searchParams.get("reportId");

  const [form, setForm] = useState<FormResponse | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [formTitle, setFormTitle] = useState<string>("");
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

  const onSubmit = methods.handleSubmit(async (data) => {
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
        description: "Failed to resolve the review and update the report. Please try again.",
        variant: "destructive",
      });
    }
  });


  if (loading || !form || !user) return <LoadingSkeleton />;

  return (
    <FormProvider {...methods}>
      <div className="py-4 px-8">
        <div className="flex justify-between">
          <div className="flex justify-start gap-2">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              className="border h-10 mb-2 rounded-md"
            >
              <ChevronLeft className="h-4 w-4 mx-auto" />
              Return
            </Button>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              disabled={methods.formState.isSubmitting}
              onClick={onSubmit}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Submit
            </Button>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex justify-between gap-4">
            <FormHeaderView title={form.title} description={form.description} />
            <PersonSelector user={user} />
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700">
                Reference Report (optional)
              </Label>
              {showReference ? (
                <div className="flex items-center gap-2 mt-1">
                  <Select
                    value={referenceReportId || ""}
                    onValueChange={(value) => setReferenceReportId(value)}
                  >
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Select a report" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Available Reports</SelectLabel>
                        {availableReports.map((report) => (
                          <SelectItem key={report.id} value={report.id}>
                            {report.form_name} —{" "}
                            {new Date(report.created_at).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setReferenceReportId(null);
                      setShowReference(false);
                    }}
                    className="rounded-full h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={() => setShowReference(true)}
                >
                  + Add Reference Report
                </Button>
              )}
            </div>
          </div>

          <div className="py-4 space-y-4">
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
