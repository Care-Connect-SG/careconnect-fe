"use client";

import { getForms } from "@/app/api/form";
import { Spinner } from "@/components/ui/spinner";
import { FormResponse } from "@/types/form";
import { ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import FormCardPublished from "./_components/form-card-published";

export default function IncidentReportingForms() {
  const [forms, setForms] = useState<FormResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    setIsLoading(true);
    try {
      const data = await getForms("Published");
      setForms(data);
    } catch (error) {
      console.error("Failed to fetch forms");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Incident Reporting
          </h1>
          <p className="text-gray-500 mt-1">
            Select a suitable form to use for your incident reporting needs
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <Spinner />
            <p className="mt-4 text-gray-500">Loading available forms...</p>
          </div>
        </div>
      ) : forms.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No forms available
          </h3>
          <p className="text-gray-500">
            There are currently no published forms available for incident
            reporting.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      )}
    </div>
  );
}
