"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WellnessReportRecord } from "@/types/wellnessReport";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  reports: WellnessReportRecord[];
}

const WellnessReportList: React.FC<Props> = ({ reports }) => {
  const router = useRouter();
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const handleViewReport = (reportId: string) => {
    router.push(`wellness/${reportId}`);
  };

  const sortedReports = [...reports].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Wellness Reports</h2>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <Label className="text-sm text-gray-700">Sort by:</Label>
          <Select
            onValueChange={(value) =>
              setSortOrder(value as "newest" | "oldest")
            }
            defaultValue="newest"
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sortedReports.length === 0 ? (
          <p className="text-gray-500 text-sm">No wellness reports found.</p>
        ) : (
          sortedReports.map((report) => (
            <Card
              key={report.id}
              className="p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col gap-2">
                <div className="text-sm font-semibold text-blue-700">
                  {format(new Date(report.date), "dd/MM/yyyy")} Monthly Report
                </div>

                <p className="text-gray-500 text-sm">
                  <span className="font-medium">Resident ID:</span>{" "}
                  {report.resident_id}
                </p>

                <p className="text-gray-800 text-sm">
                  {report.monthly_summary.slice(0, 200)}...
                </p>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={() => handleViewReport(report.id)}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    View Report
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default WellnessReportList;
