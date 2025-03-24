"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useState } from "react";

import {
  createCarePlanWithEmptyValues,
  getCarePlansForResident,
} from "@/app/api/careplan";
import {
  getMedicalRecordsByResident,
  updateMedicalRecord,
} from "@/app/api/medical-record";
import { getMedicationsForResident } from "@/app/api/medication";
import { getResidentById, updateResident } from "@/app/api/resident";
import { getWellnessReportsForResident } from "@/app/api/wellness-report";

import { Button } from "@/components/ui/button";
import CreateMedication from "../_components/create-medication-dialog";
import EditableCarePlan from "../_components/edit-careplan";
import EditMedication from "../_components/edit-medication";
import CarePlanDisplay from "../_components/resident-careplan";
import MedicationDisplay from "../_components/resident-medication";
import WellnessReportList from "../_components/wellness-report-list";
import EditMedicalRecordModal from "./_components/edit-medical-record-dialog";
import EditResidentDialog from "./_components/edit-resident-dialog";
import MedicalRecordCard from "./_components/medical-record-card";
import CreateMedicalHistoryDialog from "./_components/medical-record-form";
import ResidentDetailsCard from "./_components/resident-detail-card";
import ResidentDetailsNotesCard from "./_components/resident-detail-notes";
import ResidentProfileCard from "./_components/resident-profile-header";

import { CarePlanRecord } from "@/types/careplan";
import { MedicalRecord, inferTemplateType } from "@/types/medical-record";
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
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabValue>("overview");
  const [modals, setModals] = useState({
    editResident: false,
    createMedication: false,
    editMedication: false,
    createMedicalRecord: false,
    editMedicalRecord: false,
  });
  const [selectedMedication, setSelectedMedication] =
    useState<MedicationRecord | null>(null);
  const [selectedMedicalRecord, setSelectedMedicalRecord] =
    useState<MedicalRecord | null>(null);
  const [isCreatingCarePlan, setIsCreatingCarePlan] = useState(false);

  const { data: resident, isLoading: isResidentLoading } =
    useQuery<ResidentRecord>({
      queryKey: ["resident", residentProfile],
      queryFn: () => getResidentById(residentProfile),
    });

  const { data: medicalRecords = [] } = useQuery<MedicalRecord[]>({
    queryKey: ["medicalRecords", residentProfile],
    queryFn: () => getMedicalRecordsByResident(residentProfile),
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
    } else if (modalName === "editMedicalRecord" && item) {
      setSelectedMedicalRecord(item);
    }

    setModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));

    if (modalName === "editMedication") {
      setSelectedMedication(null);
    } else if (modalName === "editMedicalRecord") {
      setSelectedMedicalRecord(null);
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

  const handleSaveMedicalRecord = async (updatedData: any) => {
    if (!selectedMedicalRecord || !resident) return;

    try {
      const templateType = inferTemplateType(selectedMedicalRecord);
      await updateMedicalRecord(
        templateType,
        selectedMedicalRecord.id,
        resident.id,
        updatedData,
      );
      closeModal("editMedicalRecord");
      queryClient.invalidateQueries({
        queryKey: ["medicalRecords", residentProfile],
      });
    } catch (error) {
      console.error("Error updating medical record:", error);
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

  const calculateAge = () => {
    return (
      new Date().getFullYear() - new Date(resident.date_of_birth).getFullYear()
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <ResidentProfileCard
        name={resident.full_name}
        age={calculateAge()}
        room={resident.room_number}
        imageUrl={resident.photograph || "/images/no-image.png"}
        onEdit={() => openModal("editResident")}
      />

      <div className="mt-6 border-b border-gray-200">
        <div className="flex space-x-8">
          {TABS.map((tab) => (
            <Button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`py-2 px-1 text-sm font-medium ${
                activeTab === tab.value
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              }`}
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
              <Button onClick={() => openModal("createMedicalRecord")}>
                Add Medical Record
              </Button>
            </div>
            <div className="mt-4 space-y-4">
              {medicalRecords.length > 0 ? (
                medicalRecords.map((record, index) => (
                  <MedicalRecordCard
                    key={record.id || index}
                    record={record}
                    onEdit={() => openModal("editMedicalRecord", record)}
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
                  <MedicationDisplay
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
              <EditableCarePlan
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
                  <CarePlanDisplay
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
        isOpen={modals.createMedicalRecord}
        onClose={() => closeModal("createMedicalRecord")}
        onRecordCreated={() => {
          closeModal("createMedicalRecord");
          queryClient.invalidateQueries({
            queryKey: ["medicalRecords", residentProfile],
          });
        }}
      />

      {selectedMedicalRecord && (
        <EditMedicalRecordModal
          isOpen={modals.editMedicalRecord}
          onClose={() => closeModal("editMedicalRecord")}
          templateType={inferTemplateType(selectedMedicalRecord)}
          residentId={resident.id}
          initialData={selectedMedicalRecord}
          onSave={handleSaveMedicalRecord}
        />
      )}
    </div>
  );
}
