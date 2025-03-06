"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getFormById } from "@/app/api/form";
import { getReportById, createReport, updateReport } from "@/app/api/report";
import { FormResponse } from "@/types/form";
import { ReportState, useReportReducer } from "@/hooks/useReportReducer";
import { FormElementData } from "@/hooks/useFormReducer";
import { CaregiverTag, ReportStatus, ReportCreate, ReportResponse } from "@/types/report";
import { getCurrentUser } from "@/app/api/user";

import { LoadingSkeleton } from "../_components/loading-skeleton";
import { FormHeaderView } from "../_components/form-header";
import ResidentSelector from "./_components/tag-personnel";
import FormElementFill from "./_components/form-element-fill";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function CreateReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId");
  const reportId = searchParams.get("reportId");
  const isEditing = !!reportId;
  const { data: session } = useSession();

  // ---------------------------
  // The main reducer for the form
  // ---------------------------
  const [state, dispatch] = useReportReducer();
  const [form, setForm] = useState<FormResponse>();
  const [loading, setLoading] = useState(true);

  // ---------------------------
  // Step 1: Fetch the form definition
  // ---------------------------
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

  // ---------------------------
  // Step 2: Fetch the existing report if editing
  // ---------------------------
  const fetchReport = async () => {
    try {
      const data: ReportResponse = await getReportById(reportId!);
      // Convert the returned data into the structure expected by our reducer
      const reportState: ReportState = {
        report_content: data.report_content,
        primaryResident: data.primary_resident || null,
        involvedResidents: data.involved_residents || [],
        involvedCaregivers: data.involved_caregivers || [],
        isSubmitting: false,
        error: null,
      };
      return reportState;
    } catch {
      console.error("Report not found");
      router.replace("/404");
      return null;
    }
  };

  // ---------------------------
  // Step 3: Initialize our reducer based on editing or creating new
  // ---------------------------
  const initializeReport = async () => {
    const formData = await fetchForm();
    if (!formData) return;

    // If editing an existing report
    if (isEditing) {
      const reportState = await fetchReport();
      if (reportState) {
        // Replace entire state (including "report_content")
        dispatch({ type: "SET_REPORT", payload: reportState });
      }
    } else {
      // Creating a new blank report
      const blankReport = formData.json_content.map((element: FormElementData) => ({
        form_element_id: element.element_id,
        input: null,
      }));
      dispatch({ type: "SET_REPORT_CONTENT", payload: blankReport });
    }
    setLoading(false);
  };

  // Trigger once on mount or when formId changes
  useEffect(() => {
    if (formId) {
      initializeReport();
    }
  }, [formId, isEditing, reportId, router]);

  // ---------------------------
  // Update a single field's input in the reducer
  // ---------------------------
  const handleInputChange = (form_element_id: string, inputValue: any) => {
    dispatch({
      type: "UPDATE_INPUT",
      payload: { form_element_id, input: inputValue },
    });
  };

  // ---------------------------
  // Check if a form element is required
  // ---------------------------
  const requiresInput = (id: string) => {
    const formElement = form?.json_content.find(
      (element: FormElementData) => element.element_id === id
    );
    return formElement?.required;
  };

  // ---------------------------
  // Submitting / Saving
  // ---------------------------
  const handleSubmit = async (mode: "Save" | "Publish") => {
    dispatch({ type: "SET_SUBMITTING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    // Check required fields
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

    // Build data to send
    const user = await getCurrentUser(session!.user!.email!);
    const reporter: CaregiverTag = { id: user.id, name: user.email, role: user.role };

    const createReportData = (status: ReportStatus) => {
      return {
        form_id: form!.id,
        form_name: form!.title,
        reporter,
        report_content: state.report_content.map((section) => ({
          form_element_id: section.form_element_id,
          input: section.input ?? "",
        })),
        primary_resident: state.primaryResident,
        involved_residents: state.involvedResidents,
        involved_caregivers: state.involvedCaregivers,
        status,
      } 
    };

    try {
      if (mode === "Save") {
        // Save as draft
        const reportData = createReportData(ReportStatus.DRAFT);

        if (!reportId) {
          // create
          const newReportId = await createReport(reportData);
          router.replace(`/dashboard/incidents/fill?formId=${formId}&reportId=${newReportId}`);
        } else {
          // update
          await updateReport(reportId, reportData);
        }
      } else {
        // Publish
        const reportData = createReportData(ReportStatus.PUBLISHED);

        if (!reportId) {
          await createReport(reportData);
          router.replace(`/dashboard/incidents`);
        } else {
          await updateReport(reportId, reportData);
        }
      }
    } catch (error) {
      console.error("Error saving or publishing report:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to submit the report." });
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  };

  // ---------------------------
  // Loading / Render
  // ---------------------------
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
          {/* This presumably updates state.primaryResident, etc. */}
          <ResidentSelector dispatch={dispatch} selectedState={state} />
        </div>

        {/* 
          Step 4: 
          Render each form element from state (or from the form definition, 
          but typically from state so we see the user's current values).
        */}
        <div className="py-4 space-y-4">
          {state.report_content.map((section) => {
            // Grab the definition from form.json_content if needed
            const elementDef = form!.json_content.find(
              (el) => el.element_id === section.form_element_id
            );
            if (!elementDef) return null;

            return (
              <FormElementFill
                key={section.form_element_id}
                element={elementDef}
                // We'll pass the current input directly
                value={section.input ?? ""}
                onInputChange={handleInputChange}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
