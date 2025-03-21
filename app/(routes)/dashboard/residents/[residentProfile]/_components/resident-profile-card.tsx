"use client";

import { Button } from "@/components/ui/button";
import { toTitleCase } from "@/lib/utils";
import { ResidentRecord } from "@/types/resident";
import React from "react";
import ResidentProfilePictureDialog from "./resident-profile-picture-dialog";

interface ResidentProfileCardProps {
  resident: ResidentRecord;
  onEdit: () => void;
}

const ResidentProfileCard: React.FC<ResidentProfileCardProps> = ({
  resident,
  onEdit,
}) => {
  const age =
    new Date().getFullYear() - new Date(resident.date_of_birth).getFullYear();
  return (
    <div className="w-90% max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between p-4 bg-white shadow-md rounded-md">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <ResidentProfilePictureDialog resident={resident} />

        <div className="text-center sm:text-left">
          <h2 className="text-xl font-semibold">
            {toTitleCase(resident.full_name)}
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span className="text-sm text-gray-600">Age: {age}</span>
            <span className="text-sm text-gray-600">
              Room: {resident.room_number}
            </span>
          </div>
        </div>
      </div>

      <Button
        onClick={onEdit}
        className="mt-4 sm:mt-0 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Edit Profile
      </Button>
    </div>
  );
};

export default ResidentProfileCard;
