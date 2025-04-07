"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  admissionDate?: string;
}

const ResidentDetailsCard: React.FC<ResidentDetailsCardProps> = ({
  gender,
  dateOfBirth,
  nricNumber,
  emergencyContactName,
  emergencyContactNumber,
  relationship,
  additionalNotes,
  primaryNurse,
  admissionDate,
}) => {
  const renderCellContent = (value: string | undefined) => {
    if (!value) {
      return <p className="text-sm text-gray-400">N/A</p>;
    }
    return <p className="text-sm">{value}</p>;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-semibold">
          Resident Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Gender</p>
            {renderCellContent(gender)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Date of Birth</p>
            {renderCellContent(dateOfBirth)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">NRIC Number</p>
            {renderCellContent(nricNumber)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Relationship</p>
            {renderCellContent(relationship)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Emergency Contact
            </p>
            {renderCellContent(emergencyContactName)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Contact Number</p>
            {renderCellContent(emergencyContactNumber)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Primary Nurse</p>
            {renderCellContent(primaryNurse)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Registration Date
            </p>
            {renderCellContent(admissionDate)}
          </div>
        </div>
        {additionalNotes && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">
              Additional Notes
            </p>
            {renderCellContent(additionalNotes)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResidentDetailsCard;
