"use client";

import { getCarePlansForResident } from "@/app/api/careplan";
import { getMedicalRecordsByResident } from "@/app/api/medical-record";
import { updateMedicalRecord } from "@/app/api/medical-record";
import { getMedicationsForResident } from "@/app/api/medication";
import { Button } from "@/components/ui/button";
import { CarePlanRecord } from "@/types/careplan";
import { MedicalRecord } from "@/types/medical-record";
import { inferTemplateType } from "@/types/medical-record";
import { MedicationRecord } from "@/types/medication";
import { ResidentRecord } from "@/types/resident";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { getResidentById, updateResident } from "../../../../api/resident";
import CarePlanDisplay from "../_components/careplan-display";
import CreateMedication from "../_components/create-medication";
import EditMedication from "../_components/edit-medication";
import MedicationDisplay from "../_components/medication-display";
import EditMedicalRecordModal from "./_components/edit-medical-record-dialog";
import EditResidentDialog from "./_components/edit-resident-dialog";
import MedicalRecordCard from "./_components/medical-record-card";
import CreateMedicalHistoryDialog from "./_components/medical-record-form";
import ResidentDetailsCard from "./_components/resident-detail-card";
import ResidentDetailsNotesCard from "./_components/resident-detail-notes";
import ResidentProfileCard from "./_components/resident-profile-header";
import {
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
} from "@/components/ui/toast";

const TABS = [
  { label: "Overview", value: "overview" },
  { label: "Record History", value: "history" },
  { label: "Medication", value: "medication" },
  { label: "Care Plan", value: "careplan" },
  { label: "Wellness Report", value: "wellness" },
];

export default function ResidentDashboard() {
  const { residentProfile } = useParams() as { residentProfile: string };
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateMedicalModalOpen, setIsCreateMedicalModalOpen] =
    useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] =
    useState<MedicationRecord | null>(null);
  const [isEditMedicalModalOpen, setIsEditMedicalModalOpen] = useState(false);
  const [selectedMedicalRecord, setSelectedMedicalRecord] =
    useState<MedicalRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [toastOpen, setToastOpen] = useState(false);

  const { data: resident, isLoading: isResidentLoading } =
    useQuery<ResidentRecord>({
      queryKey: ["resident"],
      queryFn: () => getResidentById(residentProfile),
    });

  const { data: medicalRecords = [] } = useQuery({
    queryKey: ["medicalRecords"],
    queryFn: () => getMedicalRecordsByResident(residentProfile),
    enabled: !!residentProfile,
  });

  const { data: medications = [], refetch: refetchMedications } = useQuery<
    MedicationRecord[]
  >({
    queryKey: ["medications"],
    queryFn: () => getMedicationsForResident(residentProfile),
    enabled: activeTab === "medication",
  });

  const { data: carePlans = [], refetch: refetchCarePlans } = useQuery<
    CarePlanRecord[]
  >({
    queryKey: ["carePlans"],
    queryFn: () => getCarePlansForResident(residentProfile),
    enabled: activeTab === "careplan",
  });

  const updateResidentMutation = useMutation({
    mutationFn: (updatedData: Partial<ResidentRecord>) =>
      updateResident(residentProfile, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resident"] });
      setIsModalOpen(false);
    },
  });

  const handleEditResident = () => setIsModalOpen(true);

  const handleModalSave = (updatedData: Partial<ResidentRecord>) => {
    updateResidentMutation.mutate(updatedData);
  };

  const handleSaveAdditionalNotes = async (newNotes: string) => {
    if (!resident) return;
    try {
      const updatedResident = await updateResident(resident.id, {
        ...resident,
        additional_notes: newNotes,
        additional_notes_timestamp: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ["resident"] });
    } catch (error) {
      console.error("Error updating additional notes:", error);
    }
  };

  const handleEditMedication = (medication: MedicationRecord) => {
    setSelectedMedication(medication);
    setIsEditModalOpen(true);
  };

  const handleEditMedicalRecord = (record: MedicalRecord) => {
    setSelectedMedicalRecord(record);
    setIsEditMedicalModalOpen(true);
  };

  const handleSaveMedicalRecord = async (updatedData: any) => {
    if (!selectedMedicalRecord || !resident) return;
    try {
      const templateType = inferTemplateType(selectedMedicalRecord);
      const updatedRecord = await updateMedicalRecord(
        templateType,
        selectedMedicalRecord.id,
        resident.id,
        updatedData,
      );
      setIsEditMedicalModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["medicalRecords"] });
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

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <ResidentProfileCard
        name={resident.full_name}
        age={
          new Date().getFullYear() -
          new Date(resident.date_of_birth).getFullYear()
        }
        room={resident.room_number}
        imageUrl={resident.photograph || "/images/no-image.png"}
        onEdit={handleEditResident}
      />

      <EditResidentDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={resident}
        onSave={handleModalSave}
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

      {activeTab === "overview" && (
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mt-6">
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
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Medical History</h2>
            <Button onClick={() => setIsCreateMedicalModalOpen(true)}>
              Add Medical Record
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            {medicalRecords.length > 0 ? (
              medicalRecords.map((record, index) => (
                <MedicalRecordCard
                  key={index}
                  record={record}
                  onEdit={handleEditMedicalRecord}
                />
              ))
            ) : (
              <p className="text-gray-500">No medical records found.</p>
            )}
          </div>

          {selectedMedicalRecord && (
            <EditMedicalRecordModal
              isOpen={isEditMedicalModalOpen}
              onClose={() => setIsEditMedicalModalOpen(false)}
              templateType={inferTemplateType(selectedMedicalRecord!)}
              residentId={resident.id}
              initialData={selectedMedicalRecord}
              onSave={handleSaveMedicalRecord}
            />
          )}

          <CreateMedicalHistoryDialog
            isOpen={isCreateMedicalModalOpen}
            onClose={() => setIsCreateMedicalModalOpen(false)}
            onRecordCreated={() => {}}
          />
        </div>
      )}

      {activeTab === "medication" && (
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Medication List</h2>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Add Medication
            </Button>
          </div>

          <div className="space-y-4 mt-4">
            {medications.length > 0 ? (
              medications.map((medication, index) => (
                <MedicationDisplay
                  key={index}
                  medication={medication}
                  onEdit={() => handleEditMedication(medication)}
                />
              ))
            ) : (
              <p className="text-gray-500">No medications found.</p>
            )}
          </div>

          <CreateMedication
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            residentId={residentProfile}
            onMedicationAdded={() => {
              setIsCreateModalOpen(false);
              refetchMedications();
            }}
          />

          {selectedMedication && (
            <EditMedication
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedMedication(null);
              }}
              medication={selectedMedication}
              residentId={residentProfile}
              onMedicationUpdated={() => {
                setIsEditModalOpen(false);
                setSelectedMedication(null);
                refetchMedications();
              }}
            />
          )}
        </div>
      )}

      {activeTab === "careplan" && (
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Care Plans</h2>
            <Button>Add Care Plan</Button>
          </div>

          <div className="space-y-4 mt-4">
            {carePlans.length > 0 ? (
              carePlans.map((carePlan, index) => (
                <CarePlanDisplay key={index} careplan={carePlan} />
              ))
            ) : (
              <p className="text-gray-500">No care plans found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
