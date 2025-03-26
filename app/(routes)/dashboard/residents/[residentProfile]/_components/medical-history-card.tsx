"use client";

import { deleteMedicalHistory } from "@/app/api/medical-history";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  MedicalHistory as BackendMedicalHistory,
  MedicalHistoryType,
  inferTemplateType,
} from "@/types/medical-history";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import EditMedicalHistoryDialog from "./edit-medical-history-dialog";

interface MedicalHistoryCardProps {
  record: BackendMedicalHistory;
  onRecordUpdated?: () => void;
  onEdit: (record: BackendMedicalHistory) => void;
}

const MedicalHistoryCard: React.FC<MedicalHistoryCardProps> = ({
  record,
  onRecordUpdated,
  onEdit,
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const { residentProfile } = useParams() as { residentProfile: string };

  const handleDelete = async () => {
    try {
      const recordType = inferTemplateType(record) as MedicalHistoryType;
      await deleteMedicalHistory(
        (record.id || "") as string,
        recordType,
        residentProfile,
      );
      toast({
        variant: "default",
        title: "Success",
        description: "Medical record deleted successfully.",
      });
      if (onRecordUpdated) onRecordUpdated();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error: ${error.message}`,
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
        const conditionRecord = record as any;
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Condition</p>
                <p className="text-sm">
                  {conditionRecord.condition_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Diagnosis Date
                </p>
                <p className="text-sm">
                  {formatDate(conditionRecord.date_of_diagnosis)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Treating Physician
                </p>
                <p className="text-sm">
                  {conditionRecord.treating_physician || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Current Status
                </p>
                <p className="text-sm">
                  {conditionRecord.current_status || "N/A"}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">
                Treatment Details
              </p>
              <p className="text-sm">
                {conditionRecord.treatment_details || "N/A"}
              </p>
            </div>
          </>
        );

      case MedicalHistoryType.ALLERGY:
        const allergyRecord = record as any;
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Allergen</p>
                <p className="text-sm">{allergyRecord.allergen || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Severity</p>
                <p className="text-sm">{allergyRecord.severity || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">First Noted</p>
                <p className="text-sm">
                  {formatDate(allergyRecord.date_first_noted)}
                </p>
              </div>
            </div>
            {allergyRecord.management_notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">
                  Management Notes
                </p>
                <p className="text-sm">{allergyRecord.management_notes}</p>
              </div>
            )}
          </>
        );

      case MedicalHistoryType.CHRONIC_ILLNESS:
        const chronicRecord = record as any;
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Illness</p>
                <p className="text-sm">{chronicRecord.illness_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Onset Date</p>
                <p className="text-sm">
                  {formatDate(chronicRecord.date_of_onset)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Managing Physician
                </p>
                <p className="text-sm">
                  {chronicRecord.managing_physician || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Monitoring Parameters
                </p>
                <p className="text-sm">
                  {chronicRecord.monitoring_parameters || "N/A"}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">
                Treatment Plan
              </p>
              <p className="text-sm">
                {chronicRecord.current_treatment_plan || "N/A"}
              </p>
            </div>
          </>
        );

      case MedicalHistoryType.SURGICAL:
        const surgicalRecord = record as any;
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Procedure</p>
                <p className="text-sm">{surgicalRecord.procedure || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Surgery Date
                </p>
                <p className="text-sm">
                  {formatDate(surgicalRecord.surgery_date)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Surgeon</p>
                <p className="text-sm">{surgicalRecord.surgeon || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Hospital</p>
                <p className="text-sm">{surgicalRecord.hospital || "N/A"}</p>
              </div>
            </div>
            {surgicalRecord.complications && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">
                  Complications
                </p>
                <p className="text-sm">{surgicalRecord.complications}</p>
              </div>
            )}
          </>
        );

      case MedicalHistoryType.IMMUNIZATION:
        const immunizationRecord = record as any;
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Vaccine</p>
                <p className="text-sm">{immunizationRecord.vaccine || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Administered Date
                </p>
                <p className="text-sm">
                  {formatDate(immunizationRecord.date_administered)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Facility</p>
                <p className="text-sm">
                  {immunizationRecord.administering_facility || "N/A"}
                </p>
              </div>
              {immunizationRecord.next_due_date && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Next Due Date
                  </p>
                  <p className="text-sm">
                    {formatDate(immunizationRecord.next_due_date)}
                  </p>
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
          {inferTemplateType(record).replace("_", " ")}
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditDialogOpen(true)}
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

      <EditMedicalHistoryDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        templateType={inferTemplateType(record) as MedicalHistoryType}
        residentId={residentProfile}
        initialData={record}
        onSave={async (data) => {
          if (onRecordUpdated) onRecordUpdated();
          return Promise.resolve();
        }}
      />
    </Card>
  );
};

export default MedicalHistoryCard;
