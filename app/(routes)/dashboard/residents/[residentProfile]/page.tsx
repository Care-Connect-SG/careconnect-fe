"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import {
  createCarePlanWithEmptyValues,
  getCarePlansForResident,
} from "@/app/api/careplan";
import {
  getMedicalHistoryByResident,
  updateMedicalHistory,
} from "@/app/api/medical-history";
import { getMedicationsForResident } from "@/app/api/medication";
import { getResidentById, updateResident } from "@/app/api/resident";
import { getWellnessReportsForResident } from "@/app/api/wellness-report";

import { Button } from "@/components/ui/button";
import CreateMedication from "./_components/create-medication-dialog";
import EditCarePlan from "./_components/edit-careplan";
import EditMedicalHistoryModal from "./_components/edit-medical-history-dialog";
import EditMedication from "./_components/edit-medication";
import EditResidentDialog from "./_components/edit-resident-dialog";
import MedicalHistoryCard from "./_components/medical-history-card";
import CreateMedicalHistoryDialog from "./_components/medical-history-form";
import ResidentCarePlan from "./_components/resident-careplan";
import ResidentDetailsCard from "./_components/resident-detail-card";
import ResidentDetailsNotesCard from "./_components/resident-detail-notes";
import ResidentMedication from "./_components/resident-medication";
import ResidentProfileHeader from "./_components/resident-profile-header";
import WellnessReportList from "./_components/wellness-report-list";

import { useBreadcrumb } from "@/context/breadcrumb-context";
import { toTitleCase } from "@/lib/utils";
import { CarePlanRecord } from "@/types/careplan";
import { MedicalHistory, inferTemplateType } from "@/types/medical-history";
import { MedicationRecord } from "@/types/medication";
import { ResidentRecord } from "@/types/resident";
import { WellnessReportRecord } from "@/types/wellness-report";

const TABS = [
  { label: "Overview", value: "overview" },
  { label: "Record History", value: "history" },
  { label: "Medication", value: "medication" },
  { label: "Care Plan", value: "careplan" },
  { label: "Wellness Report", value: "wellness" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export default function ResidentDashboard() {
  const { residentProfile } = useParams() as { residentProfile: string };
  const { setPageName } = useBreadcrumb();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabValue>("overview");
  const [modals, setModals] = useState({
    editResident: false,
    createMedication: false,
    editMedication: false,
    createMedicalHistory: false,
    editMedicalHistory: false,
  });
  const [selectedMedication, setSelectedMedication] =
    useState<MedicationRecord | null>(null);
  const [selectedMedicalHistory, setSelectedMedicalHistory] =
    useState<MedicalHistory | null>(null);
  const [isCreatingCarePlan, setIsCreatingCarePlan] = useState(false);

  const { data: resident, isLoading: isResidentLoading } =
    useQuery<ResidentRecord>({
      queryKey: ["resident", residentProfile],
      queryFn: () => getResidentById(residentProfile),
    });

  useEffect(() => {
    if (resident) {
      setPageName(toTitleCase(resident.full_name) || "Resident Profile");
    }
  }, [resident, setPageName]);

  const { data: medicalHistory = [] } = useQuery<MedicalHistory[]>({
    queryKey: ["medicalHistory", residentProfile],
    queryFn: () => getMedicalHistoryByResident(residentProfile),
    enabled: !!residentProfile,
  });

  const { data: medications = [], refetch: refetchMedications } = useQuery<
    MedicationRecord[]
  >({
    queryKey: ["medications", residentProfile],
    queryFn: () => getMedicationsForResident(residentProfile),
    enabled: activeTab === "medication" && !!residentProfile,
  });

  const { data: carePlans = [], refetch: refetchCarePlans } = useQuery<
    CarePlanRecord[]
  >({
    queryKey: ["carePlans", residentProfile],
    queryFn: () => getCarePlansForResident(residentProfile),
    enabled: activeTab === "careplan" && !!residentProfile,
  });

  const { data: wellnessReports = [], refetch: refetchWellnessReports } =
    useQuery<WellnessReportRecord[]>({
      queryKey: ["wellnessReports", residentProfile],
      queryFn: () => getWellnessReportsForResident(residentProfile),
      enabled: activeTab === "wellness" && !!residentProfile,
    });

  const updateResidentMutation = useMutation({
    mutationFn: (updatedData: Partial<ResidentRecord>) =>
      updateResident(residentProfile, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["resident", residentProfile],
      });
      closeModal("editResident");
    },
  });

  const openModal = (modalName: keyof typeof modals, item?: any) => {
    if (modalName === "editMedication" && item) {
      setSelectedMedication(item);
    } else if (modalName === "editMedicalHistory" && item) {
      setSelectedMedicalHistory(item);
    }

    setModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));

    if (modalName === "editMedication") {
      setSelectedMedication(null);
    } else if (modalName === "editMedicalHistory") {
      setSelectedMedicalHistory(null);
    }
  };

  const handleSaveAdditionalNotes = async (newNotes: string) => {
    if (!resident) return;

    try {
      await updateResident(resident.id, {
        ...resident,
        additional_notes: newNotes,
        additional_notes_timestamp: new Date().toISOString(),
      });
      queryClient.invalidateQueries({
        queryKey: ["resident", residentProfile],
      });
    } catch (error) {
      console.error("Error updating additional notes:", error);
    }
  };

  const handleCreateCarePlan = async () => {
    if (!residentProfile) return;

    setIsCreatingCarePlan(true);
    try {
      await createCarePlanWithEmptyValues(residentProfile);
      refetchCarePlans();
    } catch (error) {
      console.error("Error creating care plan:", error);
    } finally {
      setIsCreatingCarePlan(false);
    }
  };

  const handleSaveMedicalHistory = async (updatedData: any) => {
    if (!selectedMedicalHistory || !resident) return;

    try {
      const templateType = inferTemplateType(selectedMedicalHistory);
      const recordId = selectedMedicalHistory.id;
      if (!recordId) {
        throw new Error("No record ID found");
      }

      await updateMedicalHistory(recordId, templateType, resident.id, {
        updatedData,
      });

      closeModal("editMedicalHistory");
      queryClient.invalidateQueries({
        queryKey: ["medicalHistory", residentProfile],
      });
    } catch (error: any) {
      console.error("Error updating medical record:", error);
      throw error;
    }
  };

  if (isResidentLoading) {
    return <div className="text-center mt-10">Loading resident details...</div>;
  }

  if (!resident) {
    return (
      <div className="text-center mt-10 text-red-500">Resident not found</div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <ResidentProfileHeader
        resident={resident}
        onEdit={() => openModal("editResident")}
      />

      <div className="mt-6 border-b border-gray-200">
        <div className="flex space-x-8">
          {TABS.map((tab) => (
            <Button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                ${
                  activeTab === tab.value
                    ? "bg-blue-600 text-white border border-blue-600"
                    : "bg-gray-400 text-white hover:bg-gray-500"
                }
              `}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {activeTab === "overview" && (
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <ResidentDetailsCard
              gender={resident.gender}
              dateOfBirth={resident.date_of_birth}
              nricNumber={resident.nric_number}
              emergencyContactName={resident.emergency_contact_name}
              emergencyContactNumber={resident.emergency_contact_number}
              relationship={resident.relationship}
              primaryNurse={resident.primary_nurse || ""}
            />
            <ResidentDetailsNotesCard
              additionalNotes={resident.additional_notes || "None"}
              initialLastSaved={resident.additional_notes_timestamp}
              onSaveNotes={handleSaveAdditionalNotes}
            />
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Medical History</h2>
              <Button onClick={() => openModal("createMedicalHistory")}>
                Add Medical Record
              </Button>
            </div>
            <div className="mt-4 space-y-4">
              {medicalHistory.length > 0 ? (
                medicalHistory.map((record, index) => (
                  <MedicalHistoryCard
                    key={record.id || index}
                    record={record}
                    onEdit={() => openModal("editMedicalHistory", record)}
                  />
                ))
              ) : (
                <p className="text-gray-500">No medical records found.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "medication" && (
          <div>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Medication List</h2>
              <Button onClick={() => openModal("createMedication")}>
                Add Medication
              </Button>
            </div>

            <div className="space-y-4 mt-4">
              {medications.length > 0 ? (
                medications.map((medication, index) => (
                  <ResidentMedication
                    key={medication.id || index}
                    medication={medication}
                    onEdit={() => openModal("editMedication", medication)}
                  />
                ))
              ) : (
                <p className="text-gray-500">No medications found.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "careplan" && (
          <div>
            {carePlans.length > 0 ? (
              <EditCarePlan
                careplan={carePlans[0]}
                residentId={residentProfile}
                onCarePlanUpdated={() => {
                  queryClient.invalidateQueries({
                    queryKey: ["carePlans", residentProfile],
                  });
                }}
              />
            ) : (
              <div className="flex flex-col items-center mt-4">
                <p className="text-gray-500">No care plan found.</p>
                <Button
                  onClick={handleCreateCarePlan}
                  variant="default"
                  className="mt-2"
                  disabled={isCreatingCarePlan}
                >
                  {isCreatingCarePlan ? "Creating..." : "Create Care Plan"}
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === "wellness" && (
          <div>
            <WellnessReportList reports={wellnessReports} />

            <div className="flex justify-between items-center mt-6">
              <h2 className="text-lg font-semibold">Care Plans</h2>
              <Button
                onClick={handleCreateCarePlan}
                disabled={isCreatingCarePlan}
              >
                {isCreatingCarePlan ? "Creating..." : "Add Care Plan"}
              </Button>
            </div>

            <div className="space-y-4 mt-4">
              {carePlans.length > 0 ? (
                carePlans.map((carePlan, index) => (
                  <ResidentCarePlan
                    key={carePlan.id || index}
                    careplan={carePlan}
                  />
                ))
              ) : (
                <p className="text-gray-500">No care plans found.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <EditResidentDialog
        isOpen={modals.editResident}
        onClose={() => closeModal("editResident")}
        initialData={resident}
        onSave={(updatedData) => updateResidentMutation.mutate(updatedData)}
      />

      <CreateMedication
        isOpen={modals.createMedication}
        onClose={() => closeModal("createMedication")}
        residentId={residentProfile}
        onMedicationAdded={() => {
          closeModal("createMedication");
          refetchMedications();
        }}
      />

      {selectedMedication && (
        <EditMedication
          isOpen={modals.editMedication}
          onClose={() => closeModal("editMedication")}
          medication={selectedMedication}
          residentId={residentProfile}
          onMedicationUpdated={() => {
            closeModal("editMedication");
            refetchMedications();
          }}
        />
      )}

      <CreateMedicalHistoryDialog
        isOpen={modals.createMedicalHistory}
        onClose={() => closeModal("createMedicalHistory")}
        onRecordCreated={() => {
          closeModal("createMedicalHistory");
          queryClient.invalidateQueries({
            queryKey: ["medicalHistory", residentProfile],
          });
        }}
      />

      {selectedMedicalHistory && (
        <EditMedicalHistoryModal
          isOpen={modals.editMedicalHistory}
          onClose={() => closeModal("editMedicalHistory")}
          templateType={inferTemplateType(selectedMedicalHistory)}
          residentId={resident.id}
          initialData={selectedMedicalHistory}
          onSave={handleSaveMedicalHistory}
        />
      )}
    </div>
  );
}
