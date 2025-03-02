// components/all-resident-card.tsx
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
  nurseOptions: NurseOption[];
}

function ResidentCard({
  resident,
  onNurseChange,
  onClick,
  nurseOptions,
}: ResidentCardProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onNurseChange(resident.id, event.target.value);
  };

  return (
    <div
      className="flex items-center justify-between p-4 bg-white shadow-md rounded-md cursor-pointer"
      onClick={() => onClick && onClick(resident.id)}
    >
      <div className="flex items-center gap-4">
        {/* Profile Photo */}
        <div className="relative w-16 h-16">
          <Image
            src={resident.imageUrl}
            alt={resident.name}
            fill
            className="rounded-full object-cover"
          />
        </div>
        {/* Resident Details */}
        <div>
          <h2 className="text-lg font-semibold">{resident.name}</h2>
          <p className="text-sm text-gray-600">Age: {resident.age}</p>
          <p className="text-sm text-gray-600">Room: {resident.room}</p>
        </div>
      </div>
      {/* Nurse Dropdown */}
      <select
        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full cursor-pointer"
        value={resident.nurse}
        onClick={(e) => e.stopPropagation()} // prevent card click
        onChange={handleChange}
      >
        {nurseOptions.map((option) => (
          <option key={option.id} value={option.name}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ResidentCard;
