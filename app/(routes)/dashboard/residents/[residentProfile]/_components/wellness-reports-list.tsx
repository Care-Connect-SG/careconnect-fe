"use client";

import { deleteWellnessReport } from "@/app/api/wellness-report";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { WellnessReportRecord } from "@/types/wellness-report";
import { format } from "date-fns";
import { Edit2, Trash2 } from "lucide-react";
import React, { useState } from "react";
import EditWellnessReportDialog from "./edit-wellness-report-dialog";

interface WellnessReportsListProps {
  reports: WellnessReportRecord[];
  residentId: string;
  onReportDeleted: () => void;
  onReportUpdated: () => void;
}

const WellnessReportsList: React.FC<WellnessReportsListProps> = ({
  reports,
  residentId,
  onReportDeleted,
  onReportUpdated,
}) => {
  const { toast } = useToast();
  const [editingReport, setEditingReport] = useState<WellnessReportRecord | null>(
    null
  );

  const handleDelete = async (reportId: string | undefined) => {
    console.log('Attempting to delete report with ID:', reportId); // Debug log
    if (!reportId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot delete report: Missing report ID",
      });
      return;
    }

    try {
      await deleteWellnessReport(residentId, reportId);
      toast({
        variant: "default",
        title: "Success",
        description: "Wellness report deleted successfully.",
      });
      onReportDeleted();
    } catch (error: any) {
      console.error("Error deleting wellness report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error: ${error.message}`,
      });
    }
  };

  const handleEdit = (report: WellnessReportRecord) => {
    if (!report.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot edit report: Missing report ID",
      });
      return;
    }
    setEditingReport(report);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {reports.map((report, index) => {
        console.log('Rendering report:', report); // Debug log
        return (
          <Card key={report.id || `report-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg font-medium">
                  Wellness Report
                </CardTitle>
                <CardDescription>
                  Date: {formatDate(report.date)}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(report)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    console.log('Delete button clicked for report:', report); // Debug log
                    handleDelete(report.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.monthly_summary && (
                  <div>
                    <h4 className="font-medium">Monthly Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.monthly_summary}
                    </p>
                  </div>
                )}
                {report.medical_summary && (
                  <div>
                    <h4 className="font-medium">Medical Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.medical_summary}
                    </p>
                  </div>
                )}
                {report.medication_update && (
                  <div>
                    <h4 className="font-medium">Medication Update</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.medication_update}
                    </p>
                  </div>
                )}
                {report.nutrition_hydration && (
                  <div>
                    <h4 className="font-medium">Nutrition & Hydration</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.nutrition_hydration}
                    </p>
                  </div>
                )}
                {report.mobility_physical && (
                  <div>
                    <h4 className="font-medium">Mobility & Physical</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.mobility_physical}
                    </p>
                  </div>
                )}
                {report.cognitive_emotional && (
                  <div>
                    <h4 className="font-medium">Cognitive & Emotional</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.cognitive_emotional}
                    </p>
                  </div>
                )}
                {report.social_engagement && (
                  <div>
                    <h4 className="font-medium">Social Engagement</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.social_engagement}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {editingReport && (
        <EditWellnessReportDialog
          isOpen={!!editingReport}
          onClose={() => setEditingReport(null)}
          residentId={residentId}
          initialData={editingReport}
          onReportUpdated={() => {
            onReportUpdated();
            setEditingReport(null);
          }}
        />
      )}
    </div>
  );
};

export default WellnessReportsList; 