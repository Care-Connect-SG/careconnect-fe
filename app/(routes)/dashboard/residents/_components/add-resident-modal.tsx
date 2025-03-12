"use client";

import { getAllNurses } from "@/app/api/user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/types/user";
import { X } from "lucide-react";
import React, { useState, useEffect } from "react";

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
  const [nurseOptions, setNurseOptions] = useState<User[]>([]);

  // Fetch nurse options when modal opens
  useEffect(() => {
    if (isOpen) {
      getAllNurses()
        .then((data) => setNurseOptions(data))
        .catch((error) =>
          console.error("Error fetching nurse options:", error),
        );
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
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Resident</DialogTitle>
          <DialogClose
            onClick={onClose}
            className="absolute right-4 top-4"
          ></DialogClose>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Full Name & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={gender}
                onValueChange={(value) => setGender(value)}
              >
                <SelectTrigger id="gender" className="mt-1 w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Date of Birth & NRIC Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <Label htmlFor="nricNumber">NRIC Number</Label>
              <Input
                id="nricNumber"
                type="text"
                value={nricNumber}
                onChange={(e) => setNricNumber(e.target.value)}
                required
                className="mt-1 block w-full"
              />
            </div>
          </div>

          {/* Row 3: Emergency Contact Name & Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyContactName">
                Emergency Contact Name
              </Label>
              <Input
                id="emergencyContactName"
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                required
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <Label htmlFor="emergencyContactNumber">
                Emergency Contact Number
              </Label>
              <Input
                id="emergencyContactNumber"
                type="text"
                value={emergencyContactNumber}
                onChange={(e) => setEmergencyContactNumber(e.target.value)}
                required
                className="mt-1 block w-full"
              />
            </div>
          </div>

          {/* Row 4: Relationship & Room Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                required
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input
                id="roomNumber"
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="mt-1 block w-full"
              />
            </div>
          </div>

          {/* Row 5: Additional Notes (full width) */}
          <div>
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="mt-1 block w-full"
              rows={3}
            />
          </div>

          {/* Row 6: Primary Nurse (full width) */}
          <div>
            <Label htmlFor="primaryNurse">Primary Nurse</Label>
            <Select
              value={primaryNurse}
              onValueChange={(value) => setPrimaryNurse(value)}
            >
              <SelectTrigger id="primaryNurse" className="mt-1 w-full">
                <SelectValue placeholder="Select Nurse" />
              </SelectTrigger>
              <SelectContent>
                {nurseOptions.map((nurse) => (
                  <SelectItem key={nurse.id} value={nurse.name}>
                    {nurse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddResidentModal;
