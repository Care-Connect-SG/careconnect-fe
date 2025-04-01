"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getReports } from "@/app/api/report";
import { Report } from "@/types/report";
import { format } from "date-fns";

const RecentIncidents = () => {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getReports();
        setReports(data);
      } catch (error) {
        console.error("Error fetching incidents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const recentReports = reports.slice(0, 4);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-lg font-semibold text-gray-800">Recent Incidents</p>
          <Button variant="ghost" onClick={() => router.push("/dashboard/incidents")}>
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-lg font-semibold text-gray-800">Recent Incidents</p>
        <Button variant="ghost" onClick={() => router.push("/dashboard/incidents")}>
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {recentReports.map((report) => (
          <div
            key={report.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
            onClick={() => router.push(`/dashboard/incidents/${report.id}`)}
          >
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{report.title}</p>
              <p className="text-sm text-gray-500">
                {report.resident?.name} • {format(new Date(report.created_at), "MMM d, yyyy")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                report.severity === "high"
                  ? "bg-red-100 text-red-800"
                  : report.severity === "medium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}>
                {report.severity}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                report.status === "open"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {report.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentIncidents;
