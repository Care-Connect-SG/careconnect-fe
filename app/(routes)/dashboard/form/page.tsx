"use client";

import { getForms } from "@/app/api/form";
import { FormComplete } from "@/types/form";
import { useEffect, useState } from "react";
import FormCardPublished from "./_components/form-card-published";

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export default function Report() {
  const [forms, setForms] = useState<FormComplete[]>([]);

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
          <div key={form._id} onClick={(e) => e.preventDefault()}>
            <FormCardPublished
              id={form._id}
              title={form.title}
              description={form.description}
              created_date={formatDate(form.created_date)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
