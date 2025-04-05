"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ReportResponse } from "@/types/report";
import { X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FormSchema } from "../admin/build/schema";

interface FormHeaderViewProps {
  title: string;
  description: string;
  reports?: ReportResponse[];
  referenceReportId?: string | null;
  onReferenceReportChange?: (reportId: string | null) => void;
}

function FormHeaderEdit() {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormSchema>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Input
            {...register("title")}
            className="md:text-2xl font-bold rounded-none border-0 border-b-2 border-transparent
                            hover:border-gray-500 focus:border-gray-500 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Untitled Form"
          />
        </CardTitle>
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
        <CardDescription>
          <Textarea
            {...register("description")}
            className="rounded-none border-0 border-b border-transparent overflow-hidden pb-2 resize-none
                            hover:border-gray-500 focus:border-gray-500 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Add a description for your form"
            rows={2}
          ></Textarea>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function FormHeaderView({
  title,
  description,
  reports = [],
  referenceReportId = null,
  onReferenceReportChange,
}: FormHeaderViewProps) {
  const handleReferenceReportChange = (reportId: string) => {
    if (onReferenceReportChange) {
      if (reportId === "none") {
        onReferenceReportChange(null);
      } else {
        onReferenceReportChange(reportId);
      }
    }
  };

  const handleClearReference = () => {
    if (onReferenceReportChange) {
      onReferenceReportChange(null);
    }
  };

  return (
    <Card className="border bg-white w-full  flex flex-col">
      <CardHeader className="flex flex-col h-full justify-between space-y-6">
        <div>
          <CardTitle>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
              {title}
            </h1>
          </CardTitle>
          <CardDescription className="mt-2 text-gray-600">
            <p>{description}</p>
          </CardDescription>
        </div>

        {reports && reports.length > 0 && (
          <div className="pt-4 border-t border-gray-100 mt-auto">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">
                Reference Report
              </Label>

              {referenceReportId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearReference}
                  className="h-8 text-gray-500 hover:text-red-600 transition-colors px-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <div className="mt-2">
              <Select
                value={referenceReportId || "none"}
                onValueChange={handleReferenceReportChange}
              >
                <SelectTrigger className="w-full border-gray-200">
                  <SelectValue placeholder="Select a reference report (optional)" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectGroup>
                    <SelectItem value="none" className="text-gray-500 italic">
                      No reference report
                    </SelectItem>

                    {reports.map((report) => (
                      <SelectItem
                        key={report.id}
                        value={report.id}
                        className="cursor-pointer py-2"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {report.form_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardHeader>
    </Card>
  );
}

export { FormHeaderEdit, FormHeaderView };
