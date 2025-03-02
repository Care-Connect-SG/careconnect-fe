"use client";

import React, { useEffect, useState } from "react";
import ResidentCard, { Resident, NurseOption } from "./_components/all-resident-card";
import { useRouter } from "next/navigation";
import { getResidents, updateResidentNurse, updateResident } from "../../../api/resident";
import { getAllNurses } from "../../../api/user";
import { ResidentRecord } from "@/types/resident";
import { UserResponse } from "../../../api/user";

export default function AllResidentsPage() {
  // We'll store the full ResidentRecord in state so we have all data for updates.
  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [nurseOptions, setNurseOptions] = useState<NurseOption[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Fetch resident records
    getResidents()
      .then((data: ResidentRecord[]) => {
        setResidents(data);
        console.log("Residents fetched:", data);
      })
      .catch((error) => {
        console.error("Error fetching residents:", error);
      });
  }, []);

  useEffect(() => {
    // Fetch nurse options from the API
    getAllNurses()
      .then((data: UserResponse[]) => {
        const options: NurseOption[] = data.map((user) => ({
          id: user.id,
          name: user.name,
        }));
        setNurseOptions(options);
      })
      .catch((error) => {
        console.error("Error fetching nurses:", error);
      });
  }, []);

  // Filter resident records based on full_name
  const filteredResidents = residents.filter((resident) =>
    resident.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle nurse selection changes using the updateResidentNurse API
  const handleNurseChange = async (id: string, newNurse: string) => {
    // Find the current resident record from state
    const currentResident = residents.find((res) => res.id === id);
    if (!currentResident) return;

    // Build a full update payload using current resident data
    const updatePayload = {
      full_name: currentResident.full_name,
      gender: currentResident.gender,
      date_of_birth: currentResident.date_of_birth,
      nric_number: currentResident.nric_number,
      emergency_contact_name: currentResident.emergency_contact_name,
      emergency_contact_number: currentResident.emergency_contact_number,
      relationship: currentResident.relationship,
      room_number: currentResident.room_number,
      additional_notes: currentResident.additional_notes,
      primary_nurse: newNurse,
    };

    try {
      const updatedResident = await updateResidentNurse(id, updatePayload);
      // Update state with the full updated resident record
      setResidents((prev) =>
        prev.map((res) => (res.id === id ? updatedResident : res))
      );
      console.log("Updated resident:", updatedResident);
    } catch (error) {
      console.error("Error updating nurse:", error);
    }
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
              resident={{
                id: resident.id,
                name: resident.full_name,
                age: 0, // You can compute age from date_of_birth if needed
                room: resident.room_number,
                nurse: resident.primary_nurse || "N/A",
                imageUrl: "/images/no-image.png",
              }}
              onNurseChange={handleNurseChange}
              onClick={handleCardClick}
              nurseOptions={nurseOptions}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center">No residents found.</p>
        )}
      </div>
    </div>
  );
}