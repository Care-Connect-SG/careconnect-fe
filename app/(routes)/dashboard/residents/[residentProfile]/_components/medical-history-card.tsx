"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { MedicalHistory, MedicalHistoryType, inferTemplateType } from "@/types/medical-history";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { deleteMedicalHistory } from "@/app/api/medical-history";

interface MedicalHistoryCardProps {
  record: MedicalHistory;
  onEdit?: (record: MedicalHistory) => void;
}

const MedicalHistoryCard: React.FC<MedicalHistoryCardProps> = ({ record, onEdit }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { residentProfile } = useParams() as { residentProfile: string };

  const handleDelete = async () => {
    try {
      const recordType = inferTemplateType(record) as MedicalHistoryType;
      // Call the delete API function
      await deleteMedicalHistory(record.id, recordType, residentProfile);
      toast({
        variant: "default",
        title: "Success",
        description: "Medical record deleted successfully.",
      });
      // Remove the deleted record from the query cache to update the list
      queryClient.setQueryData<MedicalHistory[]>(["medicalHistory", residentProfile], (oldRecords = []) =>
        oldRecords.filter((r) => r.id !== record.id)
      );
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error deleting record: ${error.message}`,
      });
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      return dateString;
    }
  };

  const renderRecordDetails = () => {
    const recordType = inferTemplateType(record);
    switch (recordType) {
      case MedicalHistoryType.CONDITION:
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Condition</p>
                <p className="text-sm">{(record as any).condition_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Diagnosis Date</p>
                <p className="text-sm">{formatDate((record as any).date_of_diagnosis)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Treating Physician</p>
                <p className="text-sm">{(record as any).treating_physician || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Current Status</p>
                <p className="text-sm">{(record as any).current_status || "N/A"}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">Treatment Details</p>
              <p className="text-sm">{(record as any).treatment_details || "N/A"}</p>
            </div>
          </>
        );
      case MedicalHistoryType.ALLERGY:
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Allergen</p>
                <p className="text-sm">{(record as any).allergen || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Severity</p>
                <p className="text-sm">{(record as any).severity || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">First Noted</p>
                <p className="text-sm">{formatDate((record as any).date_first_noted)}</p>
              </div>
            </div>
            {(record as any).management_notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">Management Notes</p>
                <p className="text-sm">{(record as any).management_notes}</p>
              </div>
            )}
          </>
        );
      case MedicalHistoryType.CHRONIC_ILLNESS:
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Illness</p>
                <p className="text-sm">{(record as any).illness_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Onset Date</p>
                <p className="text-sm">{formatDate((record as any).date_of_onset)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Managing Physician</p>
                <p className="text-sm">{(record as any).managing_physician || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Monitoring Parameters</p>
                <p className="text-sm">{(record as any).monitoring_parameters || "N/A"}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">Treatment Plan</p>
              <p className="text-sm">{(record as any).current_treatment_plan || "N/A"}</p>
            </div>
          </>
        );
      case MedicalHistoryType.SURGICAL:
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Procedure</p>
                <p className="text-sm">{(record as any).procedure || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Surgery Date</p>
                <p className="text-sm">{formatDate((record as any).surgery_date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Surgeon</p>
                <p className="text-sm">{(record as any).surgeon || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Hospital</p>
                <p className="text-sm">{(record as any).hospital || "N/A"}</p>
              </div>
            </div>
            {(record as any).complications && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">Complications</p>
                <p className="text-sm">{(record as any).complications}</p>
              </div>
            )}
          </>
        );
      case MedicalHistoryType.IMMUNIZATION:
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Vaccine</p>
                <p className="text-sm">{(record as any).vaccine || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Administered Date</p>
                <p className="text-sm">{formatDate((record as any).date_administered)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Facility</p>
                <p className="text-sm">{(record as any).administering_facility || "N/A"}</p>
              </div>
              {(record as any).next_due_date && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Next Due Date</p>
                  <p className="text-sm">{formatDate((record as any).next_due_date)}</p>
                </div>
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {inferTemplateType(record).toUpperCase()}
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit && onEdit(record)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>{renderRecordDetails()}</CardContent>
    </Card>
  );
};

export default MedicalHistoryCard;
