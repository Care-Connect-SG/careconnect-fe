"use client";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  AlarmClockIcon,
  CalendarIcon,
  ClipboardListIcon,
  PencilIcon,
  PillIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import Top from "./top"; // Import the Top component

// Define MedicationRecord Type
interface MedicationRecord {
  id: string;
  resident_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string; // ISO date string format
  end_date?: string; // Optional, might be null
  instructions?: string; // Optional instructions for usage
}

// Dummy Data for a Single Medication
const dummyMedication: MedicationRecord = {
  id: "med001",
  resident_id: "res123",
  medication_name: "Atorvastatin",
  dosage: "20mg",
  frequency: "Once daily",
  start_date: "2024-03-01",
  end_date: "2024-06-01",
  instructions: "Take with food to reduce stomach upset.",
};

export default function MedicationRecordPage() {
  const [medication] = useState<MedicationRecord>(dummyMedication);

  const handleEdit = () => {
    alert(`Editing medication: ${medication.medication_name}`);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this medication?")) {
      alert(`Deleted medication: ${medication.medication_name}`);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-start bg-gray-100 p-6">
      <Card className="w-full max-w-lg bg-white shadow-lg rounded-lg ml-6">
        <CardHeader className="flex justify-between items-center border-b">
          <div>
            <CardTitle className="text-2xl font-semibold text-gray-800">
              {medication.medication_name}
            </CardTitle>
            <p className="text-gray-500 text-sm">Medication Details</p>
          </div>

          {/* Icon-Only Edit and Delete Buttons */}
          <div className="flex space-x-4">
            <PencilIcon
              className="w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer transition-all"
              onClick={handleEdit}
              title="Edit"
            />
            <Trash2Icon
              className="w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer transition-all"
              onClick={handleDelete}
              title="Delete"
            />
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Dosage and Frequency */}
          <div className="flex items-center space-x-3 text-gray-700">
            <PillIcon className="w-6 h-6 text-blue-500" />
            <span className="font-semibold">Dosage:</span>
            <span>{medication.dosage}</span>
          </div>

          <div className="flex items-center space-x-3 text-gray-700">
            <AlarmClockIcon className="w-6 h-6 text-blue-500" />
            <span className="font-semibold">Frequency:</span>
            <span>{medication.frequency}</span>
          </div>

          {/* Start and End Dates */}
          <div className="flex items-center space-x-3 text-gray-700">
            <CalendarIcon className="w-6 h-6 text-blue-500" />
            <span className="font-semibold">Start Date:</span>
            <span>{format(new Date(medication.start_date), "PPP")}</span>
          </div>

          {medication.end_date && (
            <div className="flex items-center space-x-3 text-gray-700">
              <CalendarIcon className="w-6 h-6 text-red-500" />
              <span className="font-semibold">End Date:</span>
              <span>{format(new Date(medication.end_date), "PPP")}</span>
            </div>
          )}

          {/* Instructions */}
          {medication.instructions && (
            <div className="flex items-start space-x-3 text-gray-700">
              <ClipboardListIcon className="w-6 h-6 text-green-500" />
              <div>
                <span className="font-semibold">Instructions:</span>
                <p className="text-sm">{medication.instructions}</p>
              </div>
            </div>
          )}

          {/* View Full Record Button */}
          <Button className="w-full mt-4">View Full Record</Button>
        </CardContent>
      </Card>
    </div>
  );
}
