"use client";

import React, { useState } from "react";
import { PlusCircledIcon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    full_name?: string;
    room_number?: string;
    gender?: string;
    date_of_birth?: string;
    nric_number?: string;
    relationship?: string;
    emergency_contact_name?: string;
    emergency_contact_number?: string;
    primary_nurse?: string;
  };
  onSave: (data: {
    full_name: string;
    room_number: string;
    gender: string;
    date_of_birth: string;
    nric_number: string;
    relationship: string;
    emergency_contact_name: string;
    emergency_contact_number: string;
    primary_nurse: string;
  }) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  initialData = {},
  onSave,
}) => {
  const [fullName, setFullName] = useState(initialData.full_name || "");
  const [roomNumber, setRoomNumber] = useState(initialData.room_number || "");
  const [gender, setGender] = useState(initialData.gender  || "");
  const [dateOfBirth, setDateOfBirth] = useState(initialData.date_of_birth || "");
  const [nricNumber, setNricNumber] = useState(initialData.nric_number  || "" );
  const [relationship, setRelationship] = useState(initialData.relationship || "");
  const [emergencyContactName, setEmergencyContactName] = useState(initialData.emergency_contact_name || "");
  const [emergencyContactNumber, setEmergencyContactNumber] = useState(initialData.emergency_contact_number || "");
  const [primaryNurse, setPrimaryNurse] = useState(initialData.primary_nurse  || "" );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      full_name: fullName,
      room_number: roomNumber,
      gender,
      date_of_birth: dateOfBirth,
      nric_number: nricNumber,
      relationship,
      emergency_contact_name: emergencyContactName,
      emergency_contact_number: emergencyContactNumber,
      primary_nurse: primaryNurse,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      {/* Modal */}
      <div className="relative z-10 bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <Cross2Icon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          {/* Room Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Room</label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
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
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          {/* NRIC Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">NRIC Number</label>
            <input
              type="text"
              value={nricNumber}
              onChange={(e) => setNricNumber(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          {/* Relationship */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Relationship</label>
            <input
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          {/* Emergency Contact Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
            <input
              type="text"
              value={emergencyContactName}
              onChange={(e) => setEmergencyContactName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          {/* Emergency Contact Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input
              type="text"
              value={emergencyContactNumber}
              onChange={(e) => setEmergencyContactNumber(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          {/* Nurse */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nurse</label>
            <input
              type="text"
              value={primaryNurse}
              onChange={(e) => setPrimaryNurse(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
