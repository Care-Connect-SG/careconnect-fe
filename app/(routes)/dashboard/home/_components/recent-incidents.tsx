"use client";

import { getReports } from "@/app/api/report";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ReportResponse } from "@/types/report";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const RecentIncidents = () => {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getReports();
        setReports(data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getSeverityClass = (report: ReportResponse) => {
    const hasUrgentContent = report.report_content.some((content) =>
      content.input.toString().toLowerCase().includes("urgent"),
    );
    const hasMediumContent = report.report_content.some((content) =>
      content.input.toString().toLowerCase().includes("moderate"),
    );

    if (hasUrgentContent) return "bg-red-100 text-red-700";
    if (hasMediumContent) return "bg-orange-100 text-orange-700";
    return "bg-gray-100 text-gray-700";
  };

  const getStatusClass = (report: ReportResponse) => {
    return report.status === "Published"
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Recent Incidents
        </h2>
        <Button
          variant="link"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          onClick={() => router.push("/dashboard/incidents")}
        >
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border"
            >
              <div className="flex flex-col gap-1">
                <h3 className="font-medium text-gray-900">
                  {report.form_name}
                </h3>
                <p className="text-sm text-gray-500">
                  {report.primary_resident?.name || "No resident specified"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityClass(
                    report,
                  )}`}
                >
                  {report.report_content.some((content) =>
                    content.input.toString().toLowerCase().includes("urgent"),
                  )
                    ? "High"
                    : report.report_content.some((content) =>
                          content.input
                            .toString()
                            .toLowerCase()
                            .includes("moderate"),
                        )
                      ? "Medium"
                      : "Low"}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                    report,
                  )}`}
                >
                  {report.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default RecentIncidents;
