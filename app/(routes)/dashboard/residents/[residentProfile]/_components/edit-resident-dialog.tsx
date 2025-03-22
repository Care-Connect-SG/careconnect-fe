"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";

interface EditResidentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    photograph?: string | null;
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
    photograph?: string | null;
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

const EditResidentDialog: React.FC<EditResidentDialogProps> = ({
  isOpen,
  onClose,
  initialData = {},
  onSave,
}) => {
  const [fullName, setFullName] = useState(initialData.full_name || "");
  const [roomNumber, setRoomNumber] = useState(initialData.room_number || "");
  const [gender, setGender] = useState(initialData.gender || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    initialData.date_of_birth || "",
  );
  const [nricNumber, setNricNumber] = useState(initialData.nric_number || "");
  const [relationship, setRelationship] = useState(
    initialData.relationship || "",
  );
  const [emergencyContactName, setEmergencyContactName] = useState(
    initialData.emergency_contact_name || "",
  );
  const [emergencyContactNumber, setEmergencyContactNumber] = useState(
    initialData.emergency_contact_number || "",
  );
  const [primaryNurse, setPrimaryNurse] = useState(
    initialData.primary_nurse || "",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      photograph: initialData.photograph,
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Resident Profile</DialogTitle>
          <DialogDescription>
            Modify Resident Profile Information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="roomNumber">Room</Label>
            <Input
              id="roomNumber"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={(value) => setGender(value)}>
              <SelectTrigger
                id="gender"
                className="mt-1  w-full border border-gray-300 rounded-md p-2"
              >
                <SelectValue placeholder="Select a gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              type="date"
              id="dateOfBirth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="nricNumber">NRIC Number</Label>
            <Input
              id="nricNumber"
              value={nricNumber}
              onChange={(e) => setNricNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="relationship">Relationship</Label>
            <Input
              id="relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="emergencyContactName">Emergency Contact</Label>
            <Input
              id="emergencyContactName"
              value={emergencyContactName}
              onChange={(e) => setEmergencyContactName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="emergencyContactNumber">Contact Number</Label>
            <Input
              id="emergencyContactNumber"
              value={emergencyContactNumber}
              onChange={(e) => setEmergencyContactNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="primaryNurse">Primary Nurse</Label>
            <Input
              id="primaryNurse"
              value={primaryNurse}
              onChange={(e) => setPrimaryNurse(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditResidentDialog;
