"use client";

import React, { useState } from "react";
import ResidentCard, { Resident } from "./components/all-resident-card";
import { useRouter } from "next/navigation";


export default function AllResidentsPage() {
  // Sample data for demonstration
  const [residents, setResidents] = useState<Resident[]>([
    {
      id: 1,
      name: "Alice Johnson",
      age: 78,
      room: "203B",
      nurse: "Nurse A",
      imageUrl: "/images/no-image.png",
    },
    {
      id: 2,
      name: "Bob Smith",
      age: 82,
      room: "205A",
      nurse: "Nurse B",
      imageUrl: "/images/no-image.png",
    },
    {
      id: 3,
      name: "Cindy Lee",
      age: 90,
      room: "210C",
      nurse: "Nurse A",
      imageUrl: "/images/no-image.png",
    },
  ]);

  // State for search term
  const [searchTerm, setSearchTerm] = useState("");

  // Filter logic
  const filteredResidents = residents.filter((resident) =>
    resident.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle nurse selection changes
  const handleNurseChange = (id: number, newNurse: string) => {
    setResidents((prev) =>
      prev.map((res) => (res.id === id ? { ...res, nurse: newNurse } : res))
    );
  };

  // Handle search input changes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const router = useRouter();

  const handleCardClick = (id: number) => {
    router.push(`/dashboard/residents/${id}`);
  };


  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Search Bar */}
      <div className="flex justify-center mb-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search residents..."
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={handleSearch}
          />
          <span className="absolute right-3 top-2 text-gray-400">🔍</span>
        </div>
      </div>

      {/* List of Resident Cards */}
      <div className="space-y-4">
        {filteredResidents.map((resident) => (
          <ResidentCard
            key={resident.id}
            resident={resident}
            onNurseChange={handleNurseChange}
            onClick={handleCardClick}
          />
        ))}

        {filteredResidents.length === 0 && (
          <p className="text-gray-500 text-center">No residents found.</p>
        )}
      </div>
    </div>
  );
}
