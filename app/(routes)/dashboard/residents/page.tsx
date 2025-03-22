"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResidentRecord } from "@/types/resident";
import { User } from "@/types/user";
import { ChevronLeft, ChevronRight, MoreHorizontal, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  createResident,
  deleteResident,
  getResidentsByPage,
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
  const [hasNextPage, setHasNextPage] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const LIMIT = 8; // Assuming your backend limit is 8
  const [totalPages, setTotalPages] = useState(1);

  const fetchResidents = () => {
    getResidentsByPage(currentPage)
      .then((data: ResidentRecord[]) => {
        setResidents(data);
        const hasMore = data.length === LIMIT;
        setHasNextPage(hasMore);
        // If we have more pages, we're at least on page 2
        // If we're on page 2 and have no more pages, total is 2
        // If we're on page 1 and have no more pages, total is 1
        setTotalPages(hasMore ? currentPage + 1 : currentPage);
      })
      .catch((error) => {
        console.error("Error fetching residents:", error);
      });
  };

  useEffect(() => {
    fetchResidents();
  }, [currentPage]);

  useEffect(() => {
    getAllNurses()
      .then((data: User[]) => {
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
    } catch (error) {
      console.error("Error updating nurse:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resident?")) return;
    try {
      await deleteResident(id);
      setResidents((prev) => prev.filter((res) => res.id !== id));
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
      if (currentPage === 1) {
        setResidents((prev) => [...prev, createdResident]);
      }
    } catch (error) {
      console.error("Error creating resident:", error);
    }
    setIsAddModalOpen(false);
  };

  // Update the URL query parameter for pagination.
  const goToPage = (page: number) => {
    router.push(`/dashboard/residents?page=${page}`);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => goToPage(i)}
            className="w-8"
          >
            {i}
          </Button>
        );
      }
    } else {
      // Always show first page
      pages.push(
        <Button
          key={1}
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(1)}
          className="w-8"
        >
          1
        </Button>
      );

      // Show ellipsis and pages around current page
      if (currentPage > 3) {
        pages.push(
          <span key="start-ellipsis" className="px-2">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        );
      }

      // Show pages around current page
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => goToPage(i)}
            className="w-8"
          >
            {i}
          </Button>
        );
      }

      // Show ellipsis and last page
      if (currentPage < totalPages - 2) {
        pages.push(
          <span key="end-ellipsis" className="px-2">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        );
      }

      // Always show last page
      pages.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(totalPages)}
          className="w-8"
        >
          {totalPages}
        </Button>
      );
    }

    return pages;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">All Residents</h1>
        <p className="text-sm text-gray-500">
          Manage resident information and assigned nurses.
        </p>
        <hr className="mt-3 border-gray-300" />
      </div>

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
        <div className="flex gap-4">
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

      <div className="mt-6 flex justify-center items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {renderPageNumbers()}
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToPage(currentPage + 1)}
          disabled={!hasNextPage}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

