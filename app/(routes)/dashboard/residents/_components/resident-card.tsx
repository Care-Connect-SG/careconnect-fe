"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toTitleCase } from "@/lib/utils";
import { ResidentRecord } from "@/types/resident";
import { Mars, Phone, Venus } from "lucide-react";
import React from "react";

export type NurseOption = {
  id: string;
  name: string;
};

interface ResidentCardProps {
  resident: ResidentRecord;
  onNurseChange: (id: string, newNurse: string) => void;
  onClick?: (id: string) => void;
  nurseOptions: NurseOption[];
}

function ResidentCard({
  resident,
  onNurseChange,
  onClick,
  nurseOptions,
}: ResidentCardProps) {
  const currentValue = resident.primary_nurse || "";

  const handleChange = (value: string) => {
    onNurseChange(resident.id, value);
  };

  return (
    <div
      className="flex items-center justify-between p-4 bg-white shadow-sm rounded-lg border transition-all hover:bg-blue-50 gap-4 w-full"
      onClick={() => onClick && onClick(resident.id)}
    >
      <div className="flex items-center w-64">
        <Avatar className="h-16 w-16 rounded-lg cursor-pointer flex-shrink-0">
          <AvatarImage src={resident.photograph!} alt={resident.full_name} />
          <AvatarFallback className="rounded-lg">
            {resident.full_name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col ml-4 overflow-hidden">
          <Label className="text-base font-semibold text-gray-800 truncate">
            {toTitleCase(resident.full_name)}
          </Label>
        </div>
      </div>

      <div className="flex items-center bg-transparent flex-1 justify-between px-6">
        <div className="flex flex-col items-start w-28 space-y-2">
          <span className="text-xs text-gray-500">Age</span>
          <span className="font-medium text-gray-700">
            {new Date().getFullYear() -
              new Date(resident.date_of_birth).getFullYear()}
          </span>
        </div>

        <div className="flex flex-col items-start w-28 space-y-2">
          <span className="text-xs text-gray-500">Room</span>
          <span className="font-medium text-gray-700">
            {resident.room_number}
          </span>
        </div>

        <div className="flex flex-col items-start w-32 space-y-2">
          <span className="text-xs text-gray-500">Gender</span>
          <div className="flex items-center">
            {resident.gender === "Female" ? (
              <Venus className="h-4 w-4 text-pink-500 mr-1" />
            ) : resident.gender === "Male" ? (
              <Mars className="h-4 w-4 text-blue-500 mr-1" />
            ) : null}
            <span className="font-medium text-gray-700">
              {resident.gender || "Others"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start w-48 space-y-2">
          <span className="text-xs text-gray-500">Contact</span>
          <div className="flex items-center">
            <Phone className="h-3 w-3 text-green-500 mr-2" />
            <span className="font-medium text-gray-700">
              {resident.emergency_contact_number || "N/A"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-48 space-y-2">
        <Label className="text-xs font-medium text-gray-600">
          Nurse In Charge
        </Label>
        <Select value={currentValue} onValueChange={handleChange}>
          <SelectTrigger className="w-40 h-8 text-sm rounded-md border-gray-300 shadow-sm text-gray-700">
            <SelectValue placeholder="Select Nurse" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-md rounded-md">
            {nurseOptions.map((option) => (
              <SelectItem
                key={option.id}
                value={option.name}
                className="hover:bg-gray-100 text-sm"
              >
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default ResidentCard;
