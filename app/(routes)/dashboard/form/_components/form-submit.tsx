"use client";

import { createReport } from "@/app/api/report";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { FormComplete } from "@/types/form";
import { ReportBase, ReportSectionContent } from "@/types/report";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FormElementFill from "./form-element-fill";
import { FormHeaderView } from "./form-header";

interface FormSubmitProps {
  form: FormComplete;
}

export default function FormSubmit({ form }: FormSubmitProps) {
  const [report, setReport] = useState<ReportSectionContent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const blankReport = form.json_content.map((element) => ({
      form_element_id: element.id,
      input: null,
    }));
    setReport(blankReport);
  }, [form]);

  const handleInputChange = (form_element_id: string, input: any) => {
    setReport((prevReport) =>
      prevReport.map((section) =>
        section.form_element_id === form_element_id
          ? { ...section, input }
          : section,
      ),
    );
  };

  const requiresInput = (id: string) => {
    const formElement = form.json_content.find((element) => element.id === id);
    return formElement?.required;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    for (const section of report) {
      if (requiresInput(section.form_element_id) && !section.input) {
        setError("Some required fields(*) are not yet filled in.");
        setIsSubmitting(false);
        toast({
          variant: "destructive",
          title: "Report is missing required fields",
          description: "Please ensure that all fields with * are filled in.",
        });
        return;
      }
    }

    try {
      const submissionData: ReportBase = {
        form_id: form._id,
        reporter_id: "user456", // TODO: Replace with actual user ID
        report_content: report.map((section) => ({
          form_element_id: section.form_element_id,
          input: section.input ?? "",
        })),
        status: "Submitted",
      };
      await createReport(submissionData);
      router.replace(`/dashboard/form`);
    } catch (error) {
      console.error("Error submitting report: ", error);
    } finally {
      setIsSubmitting(false);
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
        <FormHeaderView title={form.title} description={form.description} />
        <div className="py-4 space-y-4">
          {form.json_content.map((element) => (
            <FormElementFill
              key={element.id}
              element={element}
              onInputChange={handleInputChange}
            />
          ))}
        </div>
      </div>

      <Button
        disabled={isSubmitting}
        onClick={handleSubmit}
        className="bg-black hover:bg-gray-300 hover:text-black"
      >
        Submit Form
      </Button>
    </div>
  );
}
