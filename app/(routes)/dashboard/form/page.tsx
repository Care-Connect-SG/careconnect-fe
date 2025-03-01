"use client";

import { deleteForm, getForms, publishForm } from "@/app/api/form";
import { Card } from "@/components/ui/card";
import { FormComplete } from "@/types/form";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import FormCard from "./_components/form-card";

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export default function Incident() {
  const [forms, setForms] = useState<FormComplete[]>([]);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const data = await getForms();
      console.log(data);
      setForms(data);
    } catch (error) {
      console.error("Failed to fetch forms");
    }
  };

  const handlePublish = async (formId: string) => {
    try {
      await publishForm(formId);
      console.log("Published form: ", formId);
      fetchForms();
    } catch (error) {
      console.error("Failed to publish form");
    }
  };

  const handleDelete = async (formId: string) => {
    try {
      await deleteForm(formId);
      console.log("Deleted form: ", formId);
      fetchForms();
    } catch (error) {
      console.error("Failed to delete form");
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
          <div key={form._id} onClick={(e) => e.preventDefault()}>
            <FormCard
              id={form._id}
              title={form.title}
              description={form.description}
              created_date={formatDate(form.created_date)}
              status={form.status}
              onPublish={handlePublish}
              onDelete={handleDelete}
            />
          </div>
        ))}
        <Card className="border-dashed w-xs max-w-xs h-[11rem] hover:bg-gray-100">
          <Link href="/dashboard/form/build">
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
