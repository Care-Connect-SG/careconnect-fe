"use client";

import { getCarePlansForResident } from "@/app/api/careplan";
import { getMedicalRecordsByResident } from "@/app/api/medical-record";
import { getMedicationsForResident } from "@/app/api/medication";
import { getResidentById, updateResident } from "@/app/api/resident";
import { Button } from "@/components/ui/button";
import { CarePlanRecord } from "@/types/careplan";
import { MedicationRecord } from "@/types/medication";
import { ResidentRecord } from "@/types/resident";
import { MedicalRecord } from "@/types/medicalHistory"; // Import union type here
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import CarePlanDisplay from "../_components/careplan-display";
import CreateMedication from "../_components/create-medication";
import EditMedication from "../_components/edit-medication";
import MedicationDisplay from "../_components/medication-display";
import EditResidentDialog from "./_components/edit-resident-dialog";
import MedicalRecordCard from "./_components/medical-record-card";
import ResidentDetailsCard from "./_components/resident-detail-card";
import ResidentDetailsNotesCard from "./_components/resident-detail-notes";
import ResidentProfileCard from "./_components/resident-profile-header";
import EditMedicalRecordModal from "./_components/edit-medicalHistory-modal";
import CreateMedicalHistoryDialog from "./_components/medical-record-form";
import { updateMedicalRecord } from "@/app/api/medical-record";
import { inferTemplateType } from "@/types/medicalHistory";
  
const TABS = [
  { label: "Overview", value: "overview" },
  { label: "Record History", value: "history" },
  { label: "Medication", value: "medication" },
  { label: "Care Plan", value: "careplan" },
  { label: "Wellness Report", value: "wellness" },
];

export default function ResidentDashboard() {
  const { residentProfile } = useParams() as { residentProfile: string };
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateMedicalModalOpen, setIsCreateMedicalModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] =
    useState<MedicationRecord | null>(null);
  const [isEditMedicalModalOpen, setIsEditMedicalModalOpen] = useState(false);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState<MedicalRecord | null>(null);

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

  const { data: medications = [], refetch: refetchMedications } = useQuery<MedicationRecord[]>({
    queryKey: ["medications"],
    queryFn: () => getMedicationsForResident(residentProfile),
    enabled: activeTab === "medication",
  });

  const { data: carePlans = [], refetch: refetchCarePlans } = useQuery<CarePlanRecord[]>({
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

  const handleSaveAdditionalNotes = (newNotes: string) => {
    if (!resident) return;
    updateResidentMutation.mutate({
      ...resident,
      additional_notes: newNotes,
      additional_notes_timestamp: new Date().toISOString(),
    });
  };

  const handleEditMedication = (medication: MedicationRecord) => {
    setSelectedMedication(medication);
    setIsEditModalOpen(true);
  };

  // For editing a medical record (using our union type)
  const handleEditMedicalRecord = (record: MedicalRecord) => {
    setSelectedMedicalRecord(record);
    setIsEditMedicalModalOpen(true);
  };

  const handleSaveMedicalRecord = async (updatedData: any) => {
    if (!selectedMedicalRecord || !resident) return;
    try {
      // Use the helper to determine the template type.
      const templateType = inferTemplateType(selectedMedicalRecord);
      const updatedRecord = await updateMedicalRecord(
        templateType,
        selectedMedicalRecord.id,
        resident.id,
        updatedData
      );
      // Optionally update local state or refetch medical records here.
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
    return <div className="text-center mt-10 text-red-500">Resident not found</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <ResidentProfileCard resident={resident} onEdit={handleEditResident} />

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
              medicalRecords.map((record) => (
                <MedicalRecordCard key={record.id} record={record} />
              ))
            ) : (
              <p className="text-gray-500">No medical records found.</p>
            )}
          </div>

          {/* Edit Medical Record Modal */}
          {selectedMedicalRecord && (
            <EditMedicalRecordModal
              isOpen={isEditMedicalModalOpen}
              onClose={() => setIsEditMedicalModalOpen(false)}
              templateType={inferTemplateType(selectedMedicalRecord)}
              residentId={resident.id}
              initialData={selectedMedicalRecord}
              onSave={handleSaveMedicalRecord}
            />
          )}

          {/* Create Medical Record Modal */}
          <CreateMedicalHistoryDialog
             isOpen={isCreateMedicalModalOpen}
             onClose={() => setIsCreateMedicalModalOpen(false)}
             onRecordCreated={() => {
               // Optionally refresh the medical records list
             }}
           />
        </div>
      )}

      {activeTab === "careplan" && (
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Resident Care Plan</h2>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Add CarePlan
            </Button>
          </div>

          <div className="space-y-4 mt-4">
            {carePlans.length > 0 ? (
              carePlans.map((careplan) => (
                <CarePlanDisplay key={careplan.id} careplan={careplan} />
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
