"use client";

import Image from "next/image";
import React from "react";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  // Use an empty string if nurse is not set.
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
      className="flex items-center justify-between p-4 bg-white shadow-md rounded-md cursor-pointer"
      onClick={() => onClick && onClick(resident.id)}
    >
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16">
          <Image
            src={resident.imageUrl}
            alt={resident.name}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div>
          <Label className="text-lg font-semibold">{resident.name}</Label>
          <p className="text-sm text-gray-600">Age: {resident.age}</p>
          <p className="text-sm text-gray-600">Room: {resident.room}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Select value={currentValue} onValueChange={handleChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select Nurse" />
          </SelectTrigger>
          <SelectContent>
            {nurseOptions.map((option) => (
              <SelectItem key={option.id} value={option.name}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
          <Trash className="h-4 w-4 text-white" />
        </Button>
      </div>
    </div>
  );
}

export default ResidentCard;
