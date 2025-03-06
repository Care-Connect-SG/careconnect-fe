"use client";

import { createReport } from "@/app/api/report";
import { getCurrentUser } from "@/app/api/user";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { FormElementData } from "@/hooks/useFormReducer";
import { useReportReducer } from "@/hooks/useReportReducer";
import { FormResponse } from "@/types/form";
import { ReportCreate } from "@/types/report";
import { ChevronLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import FormElementFill from "./form-element-fill";
import { FormHeaderView } from "./form-header";
import ResidentSelector from "./tag-personnel";

interface FormSubmitProps {
  form: FormResponse;
}

export default function FormSubmit({ form }: FormSubmitProps) {
  const [state, dispatch] = useReportReducer();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const blankReport = form.json_content.map((element: FormElementData) => ({
      form_element_id: element.element_id,
      input: null,
    }));
    dispatch({ type: "SET_REPORT", payload: blankReport });
  }, [form]);

  const handleInputChange = (form_element_id: string, input: any) => {
    dispatch({ type: "UPDATE_INPUT", payload: { form_element_id, input } });
  };

  const requiresInput = (id: string) => {
    const formElement = form.json_content.find(
      (element: FormElementData) => element.element_id === id,
    );
    return formElement?.required;
  };

  const handleSubmit = async () => {
    dispatch({ type: "SET_SUBMITTING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    for (const section of state.report) {
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

    try {
      const submissionData: ReportCreate = {
        form_id: form.id,
        form_name: form.title,
        reporter_id: user.id,
        reporter_name: user.name,
        report_content: state.report.map((section) => ({
          form_element_id: section.form_element_id,
          input: section.input ?? "",
        })),
        primary_resident: state.primaryResident?.id,
        primary_resident_name: state.primaryResident?.name,
        involved_residents: state.involvedResidents.map((res) => res.id),
        involved_residents_name: state.involvedResidents.map((res) => res.name),
        involved_caregivers: state.involvedCaregivers.map((cg) => cg.id),
        involved_caregivers_name: state.involvedCaregivers.map((cg) => cg.name),
        status: "Published",
      };
      await createReport(submissionData);
      router.replace(`/dashboard/incidents`);
    } catch (error) {
      console.error("Error submitting report: ", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to submit the report." });
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  };

  return (
    <div className="py-4 px-8">
      <div className="flex justify-between pb-2">
        <div className="flex justify-start gap-2">
          <Link href="/dashboard/form">
            <button className="border h-6 w-10 rounded-md hover:bg-gray-50">
              <ChevronLeft className="h-4 w-4 mx-auto" />
            </button>
          </Link>
        </div>
      </div>

      <div>
        <div className="flex justify-between gap-4">
          <FormHeaderView title={form.title} description={form.description} />
          <ResidentSelector dispatch={dispatch} selectedState={state} />
        </div>
        <div className="py-4 space-y-4">
          {form.json_content.map((element) => (
            <FormElementFill
              key={element.element_id}
              element={element}
              onInputChange={handleInputChange}
            />
          ))}
        </div>
      </div>

      <Button
        disabled={state.isSubmitting}
        onClick={handleSubmit}
        className="bg-black hover:bg-gray-300 hover:text-black"
      >
        Submit Form
      </Button>
    </div>
  );
}
