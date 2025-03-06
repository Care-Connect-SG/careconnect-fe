"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResidentRecord } from "@/types/resident";
import { UserResponse } from "@/types/user";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  createResident,
  deleteResident,
  getResidents,
  updateResidentNurse,
} from "../../../api/resident";
import { getAllNurses } from "../../../api/user";
import AddResidentModal from "./_components/add-resident-modal";
import ResidentCard, { NurseOption } from "./_components/all-resident-card";

export default function AllResidentsPage() {
  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [nurseOptions, setNurseOptions] = useState<NurseOption[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
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

  const filteredResidents = residents.filter((resident) =>
    resident.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const computeAge = (dob: string) => {
    const birthDate = new Date(dob);
    const diffMs = Date.now() - birthDate.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  const handleNurseChange = async (id: string, newNurse: string) => {
    const currentResident = residents.find((res) => res.id === id);
    if (!currentResident) return;
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
      setResidents((prev) =>
        prev.map((res) => (res.id === id ? updatedResident : res)),
      );
      console.log("Updated resident:", updatedResident);
    } catch (error) {
      console.error("Error updating nurse:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resident?")) return;
    try {
      await deleteResident(id);
      setResidents((prev) => prev.filter((res) => res.id !== id));
      console.log("Deleted resident with id:", id);
    } catch (error) {
      console.error("Error deleting resident:", error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCardClick = (id: string) => {
    router.push(`/dashboard/residents/${id}`);
  };

  const handleAddResidentSave = async (newResidentData: any) => {
    try {
      const createdResident = await createResident(newResidentData);
      setResidents((prev) => [...prev, createdResident]);
      console.log("Created new resident:", createdResident);
    } catch (error) {
      console.error("Error creating resident:", error);
    }
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Search Bar with Add Buttons */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-full max-w-xl">
          <Input
            type="text"
            placeholder="Search residents..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={handleSearch}
          />
          <div className="absolute left-3 top-2 text-gray-400">
            <Search className="h-5 w-5" />
          </div>
        </div>
        <div className="flex gap-4 right-4" style={{ marginRight: "25px" }}>
          <Button variant="default" onClick={() => setIsAddModalOpen(true)}>
            Add New Resident
          </Button>
        </div>
      </div>

      <AddResidentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddResidentSave}
      />

      <div className="space-y-4">
        {filteredResidents.length > 0 ? (
          filteredResidents.map((resident) => (
            <ResidentCard
              key={resident.id}
              resident={{
                id: resident.id,
                name: resident.full_name,
                age: computeAge(resident.date_of_birth),
                room: resident.room_number || "N/A",
                nurse: resident.primary_nurse || "N/A",
                imageUrl: "/images/no-image.png",
              }}
              onNurseChange={handleNurseChange}
              onClick={handleCardClick}
              onDelete={handleDelete}
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
