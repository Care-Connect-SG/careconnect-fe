"use client";

import React from "react";

interface ResidentDetailsCardProps {
  gender: string;
  dateOfBirth: string;
  nricNumber: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  relationship: string;
  additionalNotes?: string;
  primaryNurse: string;
}

const nurseOptions = [
  { value: "", label: "Select Primary Nurse" },
  { value: "nurse_a", label: "Nurse A" },
  { value: "nurse_b", label: "Nurse B" },
  { value: "nurse_c", label: "Nurse C" },
];

const ResidentDetailsCard: React.FC<ResidentDetailsCardProps> = ({
  gender,
  dateOfBirth,
  nricNumber,
  emergencyContactName,
  emergencyContactNumber,
  relationship,
  primaryNurse,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-6 p-4 bg-white border rounded-md">
      <h3 className="text-xl font-semibold mb-4">Resident Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Gender:</span> {gender}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Date of Birth:</span> {dateOfBirth}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">NRIC Number:</span> {nricNumber}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Relationship:</span> {relationship}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Emergency Contact:</span>{" "}
            {emergencyContactName}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Contact Number:</span>{" "}
            {emergencyContactNumber}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Nurse:</span> {primaryNurse}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResidentDetailsCard;
