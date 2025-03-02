"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ResidentProfileCard from "../_components/resident-profile-card";
import ResidentDetailsCard from "../_components/resident-detail-card";
import ResidentDetailsNotesCard from "../_components/resident-detail-notes";
import EditProfileModal from "../_components/edit-modal"; // your modal component
import { getResidentById, updateResident } from "../../../../api/resident";
import { ResidentRecord } from "@/types/resident";

const TABS = [
  { label: "Overview", value: "overview" },
  { label: "Record History", value: "history" },
  { label: "Medication", value: "medication" },
  { label: "Care Plan", value: "careplan" },
  { label: "Wellness Report", value: "wellness" },
];

export default function ResidentDashboard() {
  // Extract residentProfile parameter from the URL
  const { residentProfile } = useParams() as { residentProfile: string };
  console.log("Resident Profile ID:", residentProfile);

  const [activeTab, setActiveTab] = useState("overview");
  const [primaryNurse, setPrimaryNurse] = useState("");
  const [resident, setResident] = useState<ResidentRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch resident data on mount/when residentProfile changes
  useEffect(() => {
    if (residentProfile) {
      getResidentById(residentProfile)
        .then((data: ResidentRecord) => {
          setResident(data);
          setPrimaryNurse(data.primary_nurse || "");
          console.log("Resident fetched:", data);
        })
        .catch((error: any) => {
          console.error("Error fetching resident info:", error);
        });
    }
  }, [residentProfile]);

  // Simple age calculator (assuming date_of_birth is an ISO string)
  const computeAge = (dob: string) => {
    const birthDate = new Date(dob);
    const diffMs = Date.now() - birthDate.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  // Opens the edit profile modal
  const handleEditProfile = () => {
    setIsModalOpen(true);
  };

  // Called when the modal form is saved (editing full profile)
  const handleModalSave = async (updatedData: any) => {
    if (!resident) return;
    try {
      const residentId = resident.id || resident.id;
      if (!residentId) throw new Error("Resident ID is missing.");
      const updatedResident = await updateResident(residentId, updatedData);
      setResident(updatedResident);
      setPrimaryNurse(updatedResident.primary_nurse || "");
      console.log("Updated resident (profile):", updatedResident);
    } catch (error) {
      console.error("Error updating resident profile:", error);
    }
    setIsModalOpen(false);
  };

  // Called when additional notes are saved from the inline edit in the notes card
  const handleSaveAdditionalNotes = async (newNotes: string) => {
    if (!resident) return;
    // Build a full update payload using the current resident data and the updated additional notes
    const updatePayload = {
      full_name: resident.full_name,
      gender: resident.gender,
      date_of_birth: resident.date_of_birth,
      nric_number: resident.nric_number,
      emergency_contact_name: resident.emergency_contact_name,
      emergency_contact_number: resident.emergency_contact_number,
      relationship: resident.relationship,
      room_number: resident.room_number,
      additional_notes: newNotes,
      primary_nurse: resident.primary_nurse || "",
    };

    try {
      const updatedResident = await updateResident(resident.id, updatePayload);
      setResident(updatedResident);
      console.log("Updated resident (notes):", updatedResident);
    } catch (error) {
      console.error("Error updating additional notes:", error);
    }
  };

  const handlePrimaryNurseChange = (value: string) => {
    setPrimaryNurse(value);
    // Optionally, you could update the nurse field immediately using a similar update payload.
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  if (!resident) {
    return <div className="text-center mt-10">Loading resident details...</div>;
  }

  const age = computeAge(resident.date_of_birth);

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      {/* Profile Card (Always Visible) */}
      <ResidentProfileCard
        name={resident.full_name}
        age={age}
        room={resident.room_number}
        imageUrl="/images/no-image.png" // Use resident.imageUrl if provided by your backend
        onEdit={handleEditProfile}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialData={{
          full_name: resident.full_name,
          room_number: resident.room_number,
          gender: resident.gender,
          date_of_birth: resident.date_of_birth,
          nric_number: resident.nric_number,
          relationship: resident.relationship,
          emergency_contact_name: resident.emergency_contact_name,
          emergency_contact_number: resident.emergency_contact_number,
          primary_nurse: resident.primary_nurse || "",
        }}
        onSave={handleModalSave}
      />

      {/* Tab Bar */}
      <div className="mt-6 border-b border-gray-200">
        <div className="flex space-x-8">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`py-2 px-1 text-sm font-medium ${
                activeTab === tab.value
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
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
            onSaveNotes={handleSaveAdditionalNotes}
          />
        </div>
      )}

      {activeTab === "history" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Record History</h2>
          {/* Insert record history content here */}
        </div>
      )}

      {activeTab === "medication" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Medication</h2>
          {/* Insert medication content here */}
        </div>
      )}

      {activeTab === "careplan" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Care Plan</h2>
          {/* Insert care plan content here */}
        </div>
      )}

      {activeTab === "wellness" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Wellness Report</h2>
          {/* Insert wellness report content here */}
        </div>
      )}
    </div>
  );
}