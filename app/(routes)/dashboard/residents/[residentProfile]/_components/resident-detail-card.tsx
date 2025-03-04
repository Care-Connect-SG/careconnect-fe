"use client";

import React from "react";

interface ResidentDetailsCardProps {
  gender: string;
  dateOfBirth: string; // formatted date string, e.g. "1945-05-12"
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
    <div className="w-full max-w-4xl mx-auto mt-6 p-4 bg-white shadow-md rounded-md">
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
            <span className="font-medium">Emergency Contact:</span> {emergencyContactName}
          </p>
          </div>
        <div> 
          <p className="text-sm text-gray-600">
            <span className="font-medium">Contact Number:</span> {emergencyContactNumber}
          </p>
        </div>

        <div> 
          <p className="text-sm text-gray-600">
            <span className="font-medium">Nurse:</span> {primaryNurse}
          </p>
        </div>


        {/* <div className="sm:col-span-2">
          <label
            htmlFor="primaryNurse"
            className="block text-sm font-medium text-gray-700"
          >
            Primary Nurse
          </label>
          <select
            id="primaryNurse"
            value={primaryNurse}
            onChange={(e) => onPrimaryNurseChange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {nurseOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div> */}
      </div>
    </div>
  );
};

export default ResidentDetailsCard;
