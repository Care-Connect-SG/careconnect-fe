"use client";

import { getForms } from "@/app/api/form";
import { FormResponse } from "@/types/form";
import { useEffect, useState } from "react";
import FormCardPublished from "./_components/form-card-published";

export default function IncidentReportingForms() {
  const [forms, setForms] = useState<FormResponse[]>([]);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const data = await getForms("Published");
      setForms(data);
    } catch (error) {
      console.error("Failed to fetch forms");
    }
  };

  return (
    <>
      <div className="px-8 py-4">
        <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight py-2">
          Incident Reporting
        </h1>
        <p className="text-sm text-muted-foreground">
          Select a suitable form to use for your incident reporting needs
        </p>
      </div>
      <hr className="border-t-1 border-gray-300 mx-8 py-2"></hr>
      <div className="w-full grid grid-cols-3 gap-4 px-8 py-4">
        {forms.map((form) => (
          <div key={form.id} onClick={(e) => e.preventDefault()}>
            <FormCardPublished
              id={form.id}
              title={form.title}
              description={form.description}
              created_date={new Date(form.created_at).toLocaleDateString()}
            />
          </div>
        ))}
      </div>
    </>
  );
}
