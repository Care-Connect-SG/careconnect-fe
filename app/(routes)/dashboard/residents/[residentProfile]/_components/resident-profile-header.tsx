"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

interface ResidentProfileHeaderProps {
  name: string;
  age: number;
  room: string;
  imageUrl: string;
  onEdit: () => void;
}

const ResidentProfileHeader: React.FC<ResidentProfileHeaderProps> = ({
  name,
  age,
  room,
  imageUrl,
  onEdit,
}) => {
  return (
    <div className="w-90% max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between p-4 bg-white shadow-md rounded-md">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-20 h-20 sm:w-14 sm:h-14">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="rounded-full object-cover"
          />
        </div>

        <div className="text-center sm:text-left">
          <h2 className="text-xl font-semibold">{name}</h2>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span className="text-sm text-gray-600">Age: {age}</span>
            <span className="text-sm text-gray-600">Room: {room}</span>
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

export default ResidentProfileHeader;
