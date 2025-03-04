"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import ResidentDetailsCard from "../_components/resident-detail-card";
import ResidentDetailsNotesCard from "../_components/resident-detail-notes";
import ResidentProfileCard from "../_components/resident-profile-card";
import MedicationDisplay from "../_components/medication-display";
import { MedicationRecord } from "@/types/medication";
import { getMedicationsForResident } from "@/app/api/medication";

const TABS = [
  { label: "Overview", value: "overview" },
  { label: "Record History", value: "history" },
  { label: "Medication", value: "medication" },
  { label: "Care Plan", value: "careplan" },
  { label: "Wellness Report", value: "wellness" },
];

const ResidentDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [primaryNurse, setPrimaryNurse] = useState("");
  const [medications, setMedications] = useState<MedicationRecord[]>([]);
  const pathname = usePathname();

  const handleEditProfile = () => {
    alert("Edit Profile clicked!");
  };

  const handlePrimaryNurseChange = (value: string) => {
    setPrimaryNurse(value);
  };
  // Extract Resident ID from URL
  const residentId = pathname.split("/").pop(); // Gets the last segment of the URL

  // Fetch Medications when the Medication tab is active
  useEffect(() => {
    if (activeTab === "medication" && residentId) {
      getMedicationsForResident(residentId)
        .then((data) => setMedications(data))
        .catch(console.error);
    }
  }, [activeTab, residentId]);

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      {/* Profile Card (Always Visible) */}
      <ResidentProfileCard
        name="Alice Johnson"
        age={78}
        room="203B"
        imageUrl="/images/no-image.png"
        onEdit={handleEditProfile}
      />

      {/* Tab Bar */}
      <div className="mt-6 border-b border-gray-200">
        <div className="flex space-x-8">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`py-2 px-1 text-sm font-medium ${activeTab === tab.value
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
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Medication List</h2>
          <div className="space-y-4 mt-4">
            {medications.length > 0 ? (
              medications.map((med) => <MedicationDisplay key={med.id} medication={med} />)
            ) : (
              <p className="text-gray-500">No medications found.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "health" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Health Records</h2>
          {/* Insert your health records content or components here */}
        </div>
      )}

      {activeTab === "medication" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Medication List</h2>
          <div className="space-y-4 mt-4">
            {medications.length > 0 ? (
              medications.map((medication) => (
                <MedicationDisplay key={medication.id} medication={medication} />
              ))
            ) : (
              <p className="text-gray-500">No medications found.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "careplan" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Care Plan</h2>
          {/* Insert your medication content or components here */}
        </div>
      )}

      {activeTab === "wellness" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Wellness Report</h2>
          {/* Insert your incident history content or components here */}
        </div>
      )}
    </div>
  );
};

export default ResidentDashboard;
