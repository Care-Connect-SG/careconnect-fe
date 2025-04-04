"use client";

import { deleteMedicalHistory } from "@/app/api/medical-history";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  MedicalHistory,
  MedicalHistoryType,
  inferTemplateType,
} from "@/types/medical-history";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";

interface MedicalHistoryCardProps {
  record: MedicalHistory;
  onEdit?: (record: MedicalHistory) => void;
}

const MedicalHistoryCard: React.FC<MedicalHistoryCardProps> = ({
  record,
  onEdit,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { residentProfile } = useParams() as { residentProfile: string };
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const recordType = inferTemplateType(record) as MedicalHistoryType;
      await deleteMedicalHistory(record.id, recordType, residentProfile);
      toast({
        variant: "default",
        title: "Success",
        description: "Medical record deleted successfully.",
      });
      queryClient.setQueryData<MedicalHistory[]>(
        ["medicalHistory", residentProfile],
        (oldRecords = []) => oldRecords.filter((r) => r.id !== record.id),
      );
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error deleting record: ${error.message}`,
      });
    } finally {
      setIsDeleting(false);
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
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Condition</p>
                <p className="text-sm">
                  {(record as any).condition_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Diagnosis Date
                </p>
                <p className="text-sm">
                  {formatDate((record as any).date_of_diagnosis)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Treating Physician
                </p>
                <p className="text-sm">
                  {(record as any).treating_physician || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Current Status
                </p>
                <p className="text-sm">
                  {(record as any).current_status || "N/A"}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-500">
                Treatment Details
              </p>
              <p className="text-sm">
                {(record as any).treatment_details || "N/A"}
              </p>
            </div>
          </>
        );
      case MedicalHistoryType.ALLERGY:
        return (
          <>
            <div className="grid grid-cols-2 gap-6">
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
                <p className="text-sm">
                  {formatDate((record as any).date_first_noted)}
                </p>
              </div>
            </div>
            {(record as any).management_notes && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-500">
                  Management Notes
                </p>
                <p className="text-sm">{(record as any).management_notes}</p>
              </div>
            )}
          </>
        );
      case MedicalHistoryType.CHRONIC_ILLNESS:
        return (
          <>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Illness</p>
                <p className="text-sm">
                  {(record as any).illness_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Onset Date</p>
                <p className="text-sm">
                  {formatDate((record as any).date_of_onset)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Managing Physician
                </p>
                <p className="text-sm">
                  {(record as any).managing_physician || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Monitoring Parameters
                </p>
                <p className="text-sm">
                  {(record as any).monitoring_parameters || "N/A"}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-500">
                Treatment Plan
              </p>
              <p className="text-sm">
                {(record as any).current_treatment_plan || "N/A"}
              </p>
            </div>
          </>
        );
      case MedicalHistoryType.SURGICAL:
        return (
          <>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Procedure</p>
                <p className="text-sm">{(record as any).procedure || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Surgery Date
                </p>
                <p className="text-sm">
                  {formatDate((record as any).surgery_date)}
                </p>
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
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-500">
                  Complications
                </p>
                <p className="text-sm">{(record as any).complications}</p>
              </div>
            )}
          </>
        );
      case MedicalHistoryType.IMMUNIZATION:
        return (
          <>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Vaccine</p>
                <p className="text-sm">{(record as any).vaccine || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Administered Date
                </p>
                <p className="text-sm">
                  {formatDate((record as any).date_administered)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Facility</p>
                <p className="text-sm">
                  {(record as any).administering_facility || "N/A"}
                </p>
              </div>
              {(record as any).next_due_date && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Next Due Date
                  </p>
                  <p className="text-sm">
                    {formatDate((record as any).next_due_date)}
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
    <Card className="w-full border bg-gray-50 rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-sm font-bold">
          {inferTemplateType(record).toUpperCase()}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onEdit && onEdit(record)}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="cursor-pointer text-red-600 focus:text-red-600"
              disabled={isDeleting}
            >
              <Trash className="mr-2 h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>{renderRecordDetails()}</CardContent>
    </Card>
  );
};

export default MedicalHistoryCard;
