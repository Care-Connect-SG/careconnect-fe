"use client"

import { getFormById } from "@/app/api/form";
import { createReport, getReportById, updateReport } from "@/app/api/report";
import { getCurrentUser } from "@/app/api/user";
import { toast } from "@/hooks/use-toast";
import { FormElementData } from "@/hooks/useFormReducer";
import { ReportState, useReportReducer } from "@/hooks/useReportReducer";
import { FormResponse } from "@/types/form";
import { CaregiverTag, ReportCreate, ReportResponse, ReportStatus } from "@/types/report";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormHeaderView } from "../_components/form-header";
import ResidentSelector from "../_components/tag-personnel";
import FormElementFill from "../_components/form-element-fill";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { LoadingSkeleton } from "../_components/loading-skeleton";


export default function CreateReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId");
  const reportId = searchParams.get("reportId");
  const isEditing = !!reportId;
  const { data: session } = useSession();

  const [state, dispatch] = useReportReducer();
  const [form, setForm] = useState<FormResponse>();
  const [loading, setLoading] = useState<boolean>(true);

  const fetchForm = async () => {
    try {
      const data = await getFormById(formId!);
      setForm(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch form");
      return null;
    }
  };

  const fetchReport = async () => {
    try {
      const data: ReportResponse = await getReportById(reportId!);
      return {
        report_content: data.report_content,
        primaryResident: data.primary_resident || null,
        involvedResidents: data.involved_residents || [],
        involvedCaregivers: data.involved_caregivers || [],
        isSubmitting: false,
        error: null,
      } as ReportState;
    } catch {
      console.error("Report not found");
      router.replace("/404");
      return null;
    }
  };

  const initializeReport = async () => {
    const formData = await fetchForm();
    if (!formData) return;

    if (isEditing) {
      const reportState = await fetchReport();
      if (reportState) {
        dispatch({ type: "SET_REPORT", payload: reportState });
      }
    } else {
      const blankReport = formData.json_content.map((element: FormElementData) => ({
        form_element_id: element.element_id,
        input: null,
      }));
      dispatch({ type: "SET_REPORT_CONTENT", payload: blankReport });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (formId) {
      initializeReport();
    }
  }, [formId, isEditing, reportId, router]);


  const handleInputChange = (form_element_id: string, input: any) => {
    dispatch({ type: "UPDATE_INPUT", payload: { form_element_id, input } });
  };

  const requiresInput = (id: string) => {
    const formElement = form!.json_content.find(
      (element: FormElementData) => element.element_id === id,
    );
    return formElement?.required;
  };

  const handleSubmit = async (mode: string) => {
    dispatch({ type: "SET_SUBMITTING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    for (const section of state.report_content) {
      if (requiresInput(section.form_element_id) && !section.input) {
        dispatch({
          type: "SET_ERROR",
          payload: "Some required fields are missing.",
        });
        dispatch({ type: "SET_SUBMITTING", payload: false });
        toast({
          variant: "destructive",
          title: "Report is missing required fields",
          description: "Please ensure that all fields with * are filled in.",
        });
        return;
      }
    }

    const user = await getCurrentUser(session!.user!.email!);
    const reporter: CaregiverTag = { id: user.id, name: user.email, role: user.role };

    const createReportData = (status: ReportStatus) => {
      const reportData: ReportCreate = {
        form_id: form!.id,
        form_name: form!.title,
        reporter: reporter,
        report_content: state.report_content!.map((section) => ({
          form_element_id: section.form_element_id,
          input: section.input ?? "",
        })),
        primary_resident: state.primaryResident,
        involved_residents: state.involvedResidents,
        involved_caregivers: state.involvedCaregivers,
        status: status,
      }
      return reportData;
    }

    if (mode === "Save") {
      const reportData = createReportData(ReportStatus.DRAFT);
      if (!reportId) {
        try {
          const reportId = await createReport(reportData);
          router.replace(`/dashboard/incidents/fill?formId=${formId}&reportId=${reportId}`)
        } catch (error) {
          console.error("Error saving report:", error);
          dispatch({ type: "SET_ERROR", payload: "Failed to submit the report." });
        }
      } else {
        try {
          await updateReport(reportId, reportData);
        } catch (error) {
          console.error("Error updating report:", error);
          dispatch({ type: "SET_ERROR", payload: "Failed to submit the report." });
        }
      }
    } else {
      const reportData = createReportData(ReportStatus.PUBLISHED);
      if (!reportId) {
        try {
          await createReport(reportData);
          router.replace(`/dashboard/incidents`)
        } catch (error) {
          console.error("Error saving report:", error);
          dispatch({ type: "SET_ERROR", payload: "Failed to submit the report." });
        }
      } else {
        try {
          await updateReport(reportId, reportData);
        } catch (error) {
          console.error("Error updating report:", error);
          dispatch({ type: "SET_ERROR", payload: "Failed to submit the report." });
        }
      }
    }
    dispatch({ type: "SET_SUBMITTING", payload: false });
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="py-4 px-8">
      <div className="flex justify-between">
        <Link href="/dashboard/incidents/form">
          <button className="border h-10 w-10 rounded-md hover:bg-gray-50">
            <ChevronLeft className="h-4 w-4 mx-auto" />
          </button>
        </Link>
        <div className="flex gap-2 justify-end">
          <Button
            disabled={state.isSubmitting}
            onClick={() => handleSubmit("Save")}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Save
          </Button>
          <Button
            disabled={state.isSubmitting}
            onClick={() => handleSubmit("Publish")}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Publish
          </Button>
        </div>
      </div>

      <div>
        <div className="flex justify-between gap-4">
          <FormHeaderView title={form!.title} description={form!.description} />
          <ResidentSelector dispatch={dispatch} selectedState={state} />
        </div>
        <div className="py-4 space-y-4">
          {form!.json_content.map((element) => (
            <FormElementFill
              key={element.element_id}
              element={element}
              onInputChange={handleInputChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};