"use client";

import { useState } from "react";
import ResidentDetailsCard from "../components/resident-detail-card";
import ResidentDetailsNotesCard from "../components/resident-detail-notes";
import ResidentProfileCard from "../components/resident-profile-card";

const TABS = [
  { label: "Overview", value: "overview" },
  { label: "Record History", value: "history" },
  { label: "Medication", value: "medication" },
  { label: "Wellness Report", value: "wellness" },
];

const ResidentDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [primaryNurse, setPrimaryNurse] = useState("");

  const handleEditProfile = () => {
    alert("Edit Profile clicked!");
  };

  const handlePrimaryNurseChange = (value: string) => {
    setPrimaryNurse(value);
  };

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
          {/* Details Card */}
          <ResidentDetailsCard
            gender="Female"
            dateOfBirth="1945-05-12"
            nricNumber="S1234567A"
            emergencyContactName="Bob Johnson"
            emergencyContactNumber="91234567"
            relationship="Spouse"
            primaryNurse={primaryNurse}
            onPrimaryNurseChange={handlePrimaryNurseChange}
          />

          {/* Notes Card */}
          <ResidentDetailsNotesCard additionalNotes="Requires special diet" />
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
          <h2 className="text-lg font-semibold">Medication</h2>
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
