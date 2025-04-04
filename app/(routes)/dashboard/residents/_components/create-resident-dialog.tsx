"use client";

import { getAllNurses } from "@/app/api/user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
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
import React, { useState, useEffect } from "react";
import ExtractIDCard, { ExtractedIDData } from "./extract-id-ocr";

interface CreateResidentDialogProps {
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

const CreateResidentDialog: React.FC<CreateResidentDialogProps> = ({
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

  const [filledByExtractor, setFilledByExtractor] = useState<{
    fullName: boolean;
    gender: boolean;
    dateOfBirth: boolean;
    nricNumber: boolean;
  }>({
    fullName: false,
    gender: false,
    dateOfBirth: false,
    nricNumber: false,
  });

  useEffect(() => {
    if (isOpen) {
      getAllNurses()
        .then((data) => setNurseOptions(data))
        .catch((error) =>
          console.error("Error fetching nurse options:", error),
        );
    }
  }, [isOpen]);

  const handleIDCardExtract = (data: ExtractedIDData) => {
    const updatedFields = { ...filledByExtractor };

    if (data.fullName) {
      setFullName(data.fullName);
      updatedFields.fullName = true;
    }

    if (data.dateOfBirth) {
      setDateOfBirth(data.dateOfBirth);
      updatedFields.dateOfBirth = true;
    }

    if (data.nricNumber) {
      setNricNumber(data.nricNumber);
      updatedFields.nricNumber = true;
    }

    if (data.gender) {
      const normalizedGender = data.gender.trim();
      if (
        normalizedGender === "Male" ||
        normalizedGender === "Female" ||
        normalizedGender === "M" ||
        normalizedGender === "F"
      ) {
        const fullGender =
          normalizedGender === "M"
            ? "Male"
            : normalizedGender === "F"
              ? "Female"
              : normalizedGender;
        setGender(fullGender);
        updatedFields.gender = true;
      }
    }

    setFilledByExtractor(updatedFields);
  };

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
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFullName("");
    setGender("");
    setDateOfBirth("");
    setNricNumber("");
    setEmergencyContactName("");
    setEmergencyContactNumber("");
    setRelationship("");
    setRoomNumber("");
    setAdditionalNotes("");
    setPrimaryNurse("");

    setFilledByExtractor({
      fullName: false,
      gender: false,
      dateOfBirth: false,
      nricNumber: false,
    });
  };

  const getInputClassName = (field: keyof typeof filledByExtractor) => {
    return `mt-1 block w-full ${
      filledByExtractor[field]
        ? "bg-blue-50 border-blue-500 ring-blue-200 ring-1"
        : ""
    }`;
  };

  const getSelectClassName = (field: keyof typeof filledByExtractor) => {
    return `mt-1 w-full ${
      filledByExtractor[field]
        ? "bg-blue-50 border-blue-500 ring-blue-200 ring-1"
        : ""
    }`;
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Resident</DialogTitle>
          <DialogClose
            onClick={onClose}
            className="absolute right-4 top-4"
          ></DialogClose>
        </DialogHeader>
        <ExtractIDCard onExtract={handleIDCardExtract} />
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (filledByExtractor.fullName) {
                    setFilledByExtractor({
                      ...filledByExtractor,
                      fullName: false,
                    });
                  }
                }}
                required
                className={getInputClassName("fullName")}
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={gender}
                onValueChange={(value) => {
                  setGender(value);
                  if (filledByExtractor.gender) {
                    setFilledByExtractor({
                      ...filledByExtractor,
                      gender: false,
                    });
                  }
                }}
              >
                <SelectTrigger
                  id="gender"
                  className={getSelectClassName("gender")}
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => {
                  setDateOfBirth(e.target.value);
                  if (filledByExtractor.dateOfBirth) {
                    setFilledByExtractor({
                      ...filledByExtractor,
                      dateOfBirth: false,
                    });
                  }
                }}
                required
                className={getInputClassName("dateOfBirth")}
              />
            </div>
            <div>
              <Label htmlFor="nricNumber">NRIC Number</Label>
              <Input
                id="nricNumber"
                type="text"
                value={nricNumber}
                onChange={(e) => {
                  setNricNumber(e.target.value);
                  if (filledByExtractor.nricNumber) {
                    setFilledByExtractor({
                      ...filledByExtractor,
                      nricNumber: false,
                    });
                  }
                }}
                required
                className={getInputClassName("nricNumber")}
              />
            </div>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="relationship">Relationship</Label>
              <Select
                value={relationship}
                onValueChange={(value) => setRelationship(value)}
                required
              >
                <SelectTrigger id="relationship" className="mt-1 w-full">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mother">Mother</SelectItem>
                  <SelectItem value="Father">Father</SelectItem>
                  <SelectItem value="Daughter">Daughter</SelectItem>
                  <SelectItem value="Son">Son</SelectItem>
                  <SelectItem value="Spouse">Spouse</SelectItem>
                  <SelectItem value="Sibling">Sibling</SelectItem>
                  <SelectItem value="Friend">Friend</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
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
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateResidentDialog;
