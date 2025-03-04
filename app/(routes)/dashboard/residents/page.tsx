"use client";

import React, { useEffect, useState } from "react";
import ResidentCard, { Resident } from "./_components/all-resident-card";
import { useRouter } from "next/navigation";
import { getResidents } from "../../../api/resident";
import { ResidentRecord } from "@/types/resident";

export default function AllResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Call your API to fetch residents
    getResidents()
      .then((data: ResidentRecord[]) => {
        // Map backend data (ResidentRecord) to your Resident type
        const formatted: Resident[] = data.map((record) => ({
          id: record.id, // or keep as string if your component supports it
          name: record.full_name,
          // If API doesn't include age, you could compute it from date_of_birth.
          // For now, we'll assume it's returned or set to a default.
          age: record.date_of_birth.length ? record.date_of_birth.length : 0,
          room: record.room_number,
          nurse: record.primary_nurse || "N/A",
          // If your API doesn't return an image URL, use a default.
          imageUrl: "/images/no-image.png",
        }));
        setResidents(formatted);
        console.log("Residents fetched:", formatted);
      })
      .catch((error) => {
        console.error("Error fetching residents:", error);
      });
  }, []);

  // Filter logic
  const filteredResidents = residents.filter((resident) =>
    resident.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle nurse selection changes
  const handleNurseChange = (id: string, newNurse: string) => {
    setResidents((prev) =>
      prev.map((res) => (res.id === id.toString() ? { ...res, nurse: newNurse } : res))
    );
  };

  // Handle search input changes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Navigate to resident detail page when a card is clicked
  const handleCardClick = (id: string) => {
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
        {filteredResidents.length > 0 ? (
          filteredResidents.map((resident) => (
            <ResidentCard
              key={resident.id}
              resident={resident}
              onNurseChange={handleNurseChange}
              onClick={handleCardClick}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center">No residents found.</p>
        )}
      </div>
    </div>
  );
}
