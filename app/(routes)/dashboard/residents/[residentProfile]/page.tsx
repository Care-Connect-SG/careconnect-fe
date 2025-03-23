"use client";

import { getCarePlansForResident } from "@/app/api/careplan";
import { getMedicationsForResident } from "@/app/api/medication";
import { getResidentById, updateResident } from "@/app/api/resident";
import { Button } from "@/components/ui/button";
import { CarePlanRecord } from "@/types/careplan";
import { MedicationRecord } from "@/types/medication";
import { ResidentRecord } from "@/types/resident";
import { WellnessReportRecord } from "@/types/wellnessReport";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import CarePlanDisplay from "../_components/careplan-display";
import EditableCarePlan from "../_components/editable-care-plan";
import CreateMedication from "../_components/create-medication";
import EditMedication from "../_components/edit-medication";
import MedicationDisplay from "../_components/medication-display";
import EditResidentDialog from "./_components/edit-resident-dialog";
import ResidentDetailsCard from "./_components/resident-detail-card";
import ResidentDetailsNotesCard from "./_components/resident-detail-notes";
import ResidentProfileCard from "./_components/resident-profile-header";
import { createCarePlanWithEmptyValues } from "@/app/api/careplan";
import { getWellnessReportsForResident } from "@/app/api/wellnessReport";
import WellnessReportList from "../_components/wellness-report-list";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<MedicationRecord | null>(null);
  const [isCreatingCarePlan, setIsCreatingCarePlan] = useState(false);
  const [wellnessReports, setWellnessReports] = useState<WellnessReportRecord[]>([]);
  const [carePlanning, setCarePlanning] = useState<CarePlanRecord[]>([]);

  const { data: resident, isLoading: isResidentLoading } =
    useQuery<ResidentRecord>({
      queryKey: ["resident"],
      queryFn: () => getResidentById(residentProfile),
    });

  const { data: medications = [], refetch: refetchMedications } = useQuery<
    MedicationRecord[]
  >({
    queryKey: ["medications", residentProfile],
    queryFn: () => getMedicationsForResident(residentProfile),
    enabled: activeTab === "medication",
  });

  const { data: carePlans = [], refetch: refetchCarePlans } = useQuery<
    CarePlanRecord[]
  >({
    queryKey: ["carePlans", residentProfile],
    queryFn: () => getCarePlansForResident(residentProfile),
    enabled: activeTab === "careplan",
  });

  useEffect(() => {
    if (activeTab === "wellness" && residentProfile) {
      getWellnessReportsForResident(residentProfile)
        .then(setWellnessReports)
        .catch(console.error);
    }
  }, [activeTab, residentProfile]);

  const updateResidentMutation = useMutation({
    mutationFn: (updatedData: Partial<ResidentRecord>) =>
      updateResident(residentProfile, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resident"] });
      setIsModalOpen(false);
    },
  });

  const handleEditProfile = () => {
    setIsModalOpen(true);
  };

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

  const handleCreateCarePlan = async () => {
    setIsCreatingCarePlan(true);
    const newCarePlan = await createCarePlanWithEmptyValues(residentProfile);
    if (newCarePlan) {
      setCarePlanning([newCarePlan]); // Refresh care plan state
    }
    setIsCreatingCarePlan(false);
  };

  const handleEditMedication = (medication: MedicationRecord) => {
    setSelectedMedication(medication);
    setIsEditModalOpen(true);
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
              className={`py-2 px-1 text-sm font-medium ${activeTab === tab.value
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
              medications.map((medication) => (
                <MedicationDisplay
                  key={medication.id}
                  medication={medication}
                  onEdit={handleEditMedication}
                />
              ))
            ) : (
              <p className="text-gray-500">No medications found.</p>
            )}
          </div>
        </div>
      )}

      <CreateMedication
        residentId={residentProfile}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onMedicationAdded={refetchMedications}
      />

      {selectedMedication && (
        <EditMedication
          residentId={residentProfile}
          medication={selectedMedication}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onMedicationUpdated={refetchMedications}
        />
      )}

      {activeTab === "careplan" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Resident Care Plan</h2>
          {carePlanning.length > 0 ? (
            <EditableCarePlan
              careplan={carePlanning[0]} // Since only one care plan exists per resident
              residentId={residentProfile}
              onCarePlanUpdated={(updatedCarePlan) => setCarePlanning([updatedCarePlan])}
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
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Wellness Reports</h2>
          <WellnessReportList reports={wellnessReports} />
        </div>
      )}
    </div>
  );
}
