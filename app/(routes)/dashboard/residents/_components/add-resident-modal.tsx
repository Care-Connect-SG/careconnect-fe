"use client";

import React, { useState, useEffect } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { getAllNurses } from "../../../../api/user";
import { UserResponse } from "../../../../api/user";

interface AddResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    full_name: string;
    gender: string;
    date_of_birth: string;
    nric_number: string;
    emergency_contact_name: string;
    emergency_contact_number: string;
    relationship: string;
    room_number?: string;
    additional_notes?: string;
    primary_nurse?: string;
  }) => void;
}

const AddResidentModal: React.FC<AddResidentModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nricNumber, setNricNumber] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactNumber, setEmergencyContactNumber] = useState("");
  const [relationship, setRelationship] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [primaryNurse, setPrimaryNurse] = useState("");
  const [nurseOptions, setNurseOptions] = useState<UserResponse[]>([]);

  // Fetch nurse options when modal opens
  useEffect(() => {
    if (isOpen) {
      getAllNurses()
        .then((data) => {
          setNurseOptions(data);
        })
        .catch((error) => {
          console.error("Error fetching nurse options:", error);
        });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      full_name: fullName,
      gender,
      date_of_birth: dateOfBirth,
      nric_number: nricNumber,
      emergency_contact_name: emergencyContactName,
      emergency_contact_number: emergencyContactNumber,
      relationship,
      room_number: roomNumber,
      additional_notes: additionalNotes,
      primary_nurse: primaryNurse,
    });
    // Optionally, reset the form here.
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      {/* Modal Container with max-height and scrolling */}
      <div className="relative z-10 bg-white rounded-lg shadow-lg max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Add New Resident</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <Cross2Icon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Select gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          {/* NRIC Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">NRIC Number</label>
            <input
              type="text"
              value={nricNumber}
              onChange={(e) => setNricNumber(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          {/* Emergency Contact Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
            <input
              type="text"
              value={emergencyContactName}
              onChange={(e) => setEmergencyContactName(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          {/* Emergency Contact Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input
              type="text"
              value={emergencyContactNumber}
              onChange={(e) => setEmergencyContactNumber(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          {/* Relationship */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Relationship</label>
            <input
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          {/* Room Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Room Number</label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              rows={3}
            />
          </div>
          {/* Primary Nurse Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Primary Nurse</label>
            <select
              value={primaryNurse}
              onChange={(e) => setPrimaryNurse(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Select Nurse</option>
              {nurseOptions.map((nurse) => (
                <option key={nurse.id} value={nurse.name}>
                  {nurse.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResidentModal;
