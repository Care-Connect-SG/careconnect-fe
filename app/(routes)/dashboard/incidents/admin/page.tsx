"use client";

import { createForm, deleteForm, getForms, publishForm } from "@/app/api/form";
import { Card } from "@/components/ui/card";
import { FormCreate, FormResponse } from "@/types/form";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import FormCard from "../_components/form-card";
import { toast } from "@/hooks/use-toast";

export default function IncidentReportingFormsAdmin() {
  const [forms, setForms] = useState<FormResponse[]>([]);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const data = await getForms();
      setForms(data);
    } catch (error) {
      console.error("Failed to fetch forms");
    }
  };

  const handlePublish = async (formId: string) => {
    try {
      await publishForm(formId);
      toast({
        title: "Form published.",
        description: "Your form is saved and published successfully."
      })
      fetchForms();
    } catch (error) {
      console.error("Failed to publish form");
    }
  };

  const handleDelete = async (formId: string) => {
    try {
      await deleteForm(formId);
      toast({
        title: "Form deleted.",
        description: "Your form has been deleted successfully."
      })
      fetchForms();
    } catch (error) {
      console.error("Failed to delete form");
    }
  };

  const handleDuplicate = async (formId: string) => {
    const originalForm = forms.find((form) => form.id === formId);
    const duplicatedForm: FormCreate = {
      title: originalForm!.title,
      description: originalForm!.description,
      creator_id: "user567",
      json_content: originalForm!.json_content,
      status: "Draft",
    };

    try {
      await createForm(duplicatedForm);
      toast({
        title: "Form duplicated.",
        description: "A duplicate form has been created and saved as a draft successfully."
      })
      fetchForms();
    } catch (error) {
      console.error("Error duplicating form:", error);
    }
  };

  return (
    <>
      <div className="px-8 py-4">
        <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight py-2">
          Incident Reporting Form Studio
        </h1>
        <p className="text-sm text-muted-foreground">
          Create, review and publish your incident reporting forms.
        </p>
      </div>
      <hr className="border-t-1 border-gray-300 mx-8 py-2"></hr>
      <div className="w-full grid grid-cols-3 gap-4 px-8 py-4">
        {forms.map((form) => (
          <div key={form.id} onClick={(e) => e.preventDefault()}>
            <FormCard
              id={form.id}
              title={form.title}
              description={form.description}
              created_at={new Date(form.created_at).toLocaleDateString()}
              status={form.status}
              onPublish={handlePublish}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          </div>
        ))}
        <Card className="border-dashed w-xs max-w-xs h-[11rem] hover:bg-gray-100">
          <Link href="/dashboard/incidents/admin/build">
            <div className="flex flex-col justify-center items-center h-full">
              <Plus className="mb-0 h-6 w-6 text-gray-500" />
              <p className="text-sm text-gray-400 mt-1">Create a new form</p>
            </div>
          </Link>
        </Card>
      </div>
    </>
  );
}
