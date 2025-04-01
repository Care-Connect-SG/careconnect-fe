"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getReports } from "@/app/api/report";
import { ReportResponse } from "@/types/report";
import { formatDistanceToNow } from "date-fns";

const RecentIncidents = () => {
  const router = useRouter();
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getReports();
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-1/6 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 bg-gray-50">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-lg font-semibold text-gray-800">Recent Incidents</p>
        <Button
          variant="link"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          onClick={() => router.push("/dashboard/incidents")}
        >
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {reports.slice(0, 4).map((report) => (
          <Card
            key={report.id}
            className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => router.push(`/dashboard/incidents/${report.id}`)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{report.form_name}</p>
                <p className="text-sm text-gray-500">
                  {report.primary_resident?.name || "N/A"} • {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.severity === "high"
                      ? "bg-red-100 text-red-700"
                      : report.severity === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {report.severity}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : report.status === "in_progress"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {report.status}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};

export default RecentIncidents;
