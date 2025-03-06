"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash } from "lucide-react";
import Image from "next/image";
import React from "react";

export type Resident = {
  id: string;
  name: string;
  age: number;
  room: string;
  nurse: string;
  imageUrl: string;
};

export type NurseOption = {
  id: string;
  name: string;
};

interface ResidentCardProps {
  resident: Resident;
  onNurseChange: (id: string, newNurse: string) => void;
  onClick?: (id: string) => void;
  onDelete?: (id: string) => void;
  nurseOptions: NurseOption[];
}

function ResidentCard({
  resident,
  onNurseChange,
  onClick,
  onDelete,
  nurseOptions,
}: ResidentCardProps) {
  const currentValue = resident.nurse || "";

  const handleChange = (value: string) => {
    onNurseChange(resident.id, value);
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onDelete) onDelete(resident.id);
  };

  return (
    <div
      className="flex items-center justify-between p-4 bg-gray-50 shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer"
      onClick={() => onClick && onClick(resident.id)}
    >
      {/* Left Section: Profile Image & Details */}
      <div className="flex items-center gap-4">
        {/* Profile Image */}
        <div className="relative w-14 h-14">
          <Image
            src={resident.imageUrl}
            alt={resident.name}
            fill
            className="rounded-full object-cover border border-gray-300 shadow-sm"
          />
        </div>

        {/* Resident Details */}
        <div>
          <Label className="text-base font-semibold text-gray-800">{resident.name}</Label>
          <p className="text-xs text-gray-500">Age: <span className="font-medium text-gray-700">{resident.age}</span></p>
          <p className="text-xs text-gray-500">Room: <span className="font-medium text-gray-700">{resident.room}</span></p>
        </div>
      </div>

      {/* Right Section: Nurse Selection & Delete Button */}
      <div className="flex items-center gap-4">
        {/* Nurse Selection */}
        <div className="flex flex-col">
          <Label className="text-xs font-medium text-gray-600">Nurse In Charge</Label>
          <Select value={currentValue} onValueChange={handleChange}>
            <SelectTrigger className="w-36 h-8 text-sm rounded-md border-gray-300 shadow-sm text-gray-700">
              <SelectValue placeholder="Select Nurse" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-md rounded-md">
              {nurseOptions.map((option) => (
                <SelectItem key={option.id} value={option.name} className="hover:bg-gray-100 text-sm">
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Delete Button */}
        <Button
          onClick={handleDelete}
          className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
          title="Delete Resident"
        >
          <Trash className="h-5 w-5 text-gray-600" />
        </Button>
      </div>
    </div>
  );
}

export default ResidentCard;
