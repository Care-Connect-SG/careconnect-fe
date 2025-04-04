"use client";

import { deleteWellnessReport } from "@/app/api/wellness-report";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { WellnessReportRecord } from "@/types/wellness-report";
import { format } from "date-fns";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import React, { useState } from "react";
import EditWellnessReportDialog from "./edit-wellness-report-dialog";

interface WellnessReportListProps {
  reports: WellnessReportRecord[];
  residentId: string;
  onReportDeleted: () => void;
  onReportUpdated: () => void;
}

const WellnessReportList: React.FC<WellnessReportListProps> = ({
  reports,
  residentId,
  onReportDeleted,
  onReportUpdated,
}) => {
  const { toast } = useToast();
  const [editingReport, setEditingReport] =
    useState<WellnessReportRecord | null>(null);
  const [reportToDelete, setReportToDelete] =
    useState<WellnessReportRecord | null>(null);

  const handleDelete = async (reportId: string | undefined) => {
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
        description: "Wellness Report Deleted Successfully!",
      });
      onReportDeleted();
      setReportToDelete(null);
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
      {reports.length === 0 ? (
        <div className="text-center text-gray-500 p-8 border rounded-lg bg-gray-50">
          No wellness reports found for this resident. Create a new report to
          get started.
        </div>
      ) : (
        [...reports]
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          .map((report) => (
            <Card key={report.id} className="rounded-xl bg-gray-50">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className=" font-bold tracking-tight">
                    <span className="text-xl text-muted-foreground font-normal">
                      {formatDate(report.date)}
                    </span>
                  </h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleEdit(report)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setReportToDelete(report)}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: "Summary", value: report.monthly_summary },
                  { label: "Medical Summary", value: report.medical_summary },
                  {
                    label: "Medication Update",
                    value: report.medication_update,
                  },
                  {
                    label: "Nutrition & Hydration",
                    value: report.nutrition_hydration,
                  },
                  {
                    label: "Mobility & Physical",
                    value: report.mobility_physical,
                  },
                  {
                    label: "Cognitive & Emotional",
                    value: report.cognitive_emotional,
                  },
                  {
                    label: "Social Engagement",
                    value: report.social_engagement,
                  },
                ]
                  .filter(({ value }) => !!value)
                  .map(({ label, value }) => (
                    <div key={label} className="space-y-2">
                      <h4 className="font-semibold text-gray-500">{label}</h4>
                      <p className="text-sm text-gray-800">{value}</p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))
      )}

      {editingReport && (
        <EditWellnessReportDialog
          isOpen={!!editingReport}
          onClose={() => setEditingReport(null)}
          residentId={residentId}
          initialData={editingReport}
          onReportUpdated={() => {
            onReportUpdated();
            setEditingReport(null);
            toast({
              variant: "default",
              title: "Success",
              description: "Wellness Report Updated Successfully!",
            });
          }}
        />
      )}

      <AlertDialog
        open={!!reportToDelete}
        onOpenChange={() => setReportToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              wellness report from{" "}
              {reportToDelete ? formatDate(reportToDelete.date) : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                reportToDelete?.id && handleDelete(reportToDelete.id)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WellnessReportList;
