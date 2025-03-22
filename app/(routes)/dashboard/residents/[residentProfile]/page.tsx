"use client";

import { getCarePlansForResident } from "@/app/api/careplan";
import { getMedicationsForResident } from "@/app/api/medication";
import { Button } from "@/components/ui/button";
import { CarePlanRecord } from "@/types/careplan";
import { MedicationRecord } from "@/types/medication";
import { ResidentRecord } from "@/types/resident";
import { WellnessReportRecord } from "@/types/wellnessReport";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getResidentById, updateResident } from "../../../../api/resident";
import CarePlanDisplay from "../_components/careplan-display";
import EditableCarePlan from "../_components/editable-care-plan";
import CreateMedication from "../_components/create-medication";
import EditMedication from "../_components/edit-medication";
import EditProfileModal from "../_components/edit-modal";
import MedicationDisplay from "../_components/medication-display";
import ResidentDetailsCard from "./_components/resident-detail-card";
import ResidentDetailsNotesCard from "./_components/resident-detail-notes";
import ResidentProfileCard from "./_components/resident-profile-card";
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
  const [activeTab, setActiveTab] = useState("overview");
  const [primaryNurse, setPrimaryNurse] = useState("");
  const [medications, setMedications] = useState<MedicationRecord[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] =
    useState<MedicationRecord | null>(null);
  const [resident, setResident] = useState<ResidentRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carePlans, setCarePlans] = useState<CarePlanRecord[]>([]);
  const [isCreatingCarePlan, setIsCreatingCarePlan] = useState(false); // State to track if creating care plan
  const [wellnessReports, setWellnessReports] = useState<WellnessReportRecord[]>([]);

  useEffect(() => {
    if (residentProfile) {
      getResidentById(residentProfile)
        .then((data: ResidentRecord) => {
          setResident(data);
          setPrimaryNurse(data.primary_nurse || "");
        })
        .catch((error) => console.error("Error fetching resident:", error));
    }
  }, [residentProfile]);

  useEffect(() => {
    if (activeTab === "medication" && residentProfile) {
      getMedicationsForResident(residentProfile)
        .then(setMedications)
        .catch(console.error);
    }
  }, [activeTab, residentProfile]);

  useEffect(() => {
    if (activeTab === "careplan" && residentProfile) {
      getCarePlansForResident(residentProfile)
        .then(setCarePlans)
        .catch(console.error);
    }
  }, [activeTab, residentProfile]);

  useEffect(() => {
    if (activeTab === "wellness" && residentProfile) {
      getWellnessReportsForResident(residentProfile)
        .then(setWellnessReports)
        .catch(console.error);
    }
  }, [activeTab, residentProfile]);

  const handleEditProfile = () => {
    setIsModalOpen(true);
  };

  const handleModalSave = async (updatedData: any) => {
    if (!resident) return;
    try {
      const updatedResident = await updateResident(resident.id, updatedData);
      setResident(updatedResident);
      setPrimaryNurse(updatedResident.primary_nurse || "");
    } catch (error) {
      console.error("Error updating resident profile:", error);
    }
    setIsModalOpen(false);
  };

  const handleSaveAdditionalNotes = async (newNotes: string) => {
    if (!resident) return;
    try {
      const updatedResident = await updateResident(resident.id, {
        ...resident,
        additional_notes: newNotes,
        additional_notes_timestamp: new Date().toISOString(),
      });
      setResident(updatedResident);
    } catch (error) {
      console.error("Error updating additional notes:", error);
    }
  };

  const handleCreateCarePlan = async () => {
    setIsCreatingCarePlan(true);
    const newCarePlan = await createCarePlanWithEmptyValues(residentProfile);
    if (newCarePlan) {
      setCarePlans([newCarePlan]); // Refresh care plan state
    }
    setIsCreatingCarePlan(false);
  };


  const handleEditMedication = (medication: MedicationRecord) => {
    setSelectedMedication(medication);
    setIsEditModalOpen(true);
  };

  if (!resident) {
    return <div className="text-center mt-10">Loading resident details...</div>;
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
        imageUrl="/images/no-image.png"
        onEdit={handleEditProfile}
      />

      <EditProfileModal
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
        onMedicationAdded={() => {
          setIsCreateModalOpen(false);
          getMedicationsForResident(residentProfile).then(setMedications);
        }}
      />

      {selectedMedication && (
        <EditMedication
          residentId={residentProfile}
          medication={selectedMedication}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onMedicationUpdated={() => {
            setIsEditModalOpen(false);
            getMedicationsForResident(residentProfile).then(setMedications);
          }}
        />
      )}

      {activeTab === "careplan" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Resident Care Plan</h2>
          {carePlans.length > 0 ? (
            <EditableCarePlan
              careplan={carePlans[0]} // Since only one care plan exists per resident
              residentId={residentProfile}
              onCarePlanUpdated={(updatedCarePlan) => setCarePlans([updatedCarePlan])}
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
