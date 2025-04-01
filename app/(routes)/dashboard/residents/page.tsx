"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { User } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  createResident,
  getResidentsByPage,
  getResidentsCount,
  updateResidentNurse,
} from "../../../api/resident";
import { getAllNurses } from "../../../api/user";
import CreateResidentDialog from "./_components/create-resident-dialog";
import ResidentCard, { NurseOption } from "./_components/resident-card";

export default function AllResidentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const LIMIT = 8;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: totalCount = 0,
    isLoading: isCountLoading,
    isError: isCountError,
  } = useQuery({
    queryKey: ["residentsCount"],
    queryFn: () => getResidentsCount(),
  });

  const totalPages = Math.ceil(totalCount / LIMIT) || 1;

  const {
    data: residents = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["residents", currentPage, LIMIT, debouncedSearchTerm],
    queryFn: () =>
      getResidentsByPage(currentPage, LIMIT, undefined, debouncedSearchTerm),
  });

  const { data: nurseOptions = [] } = useQuery({
    queryKey: ["nurses"],
    queryFn: async () => {
      const data = await getAllNurses();
      return data.map((user: User) => ({
        id: user.id,
        name: user.name,
      }));
    },
  });

  const updateNurseMutation = useMutation({
    mutationFn: ({ id, updatePayload }: { id: string; updatePayload: any }) =>
      updateResidentNurse(id, updatePayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residents"] });
    },
  });

  const createResidentMutation = useMutation({
    mutationFn: (newResidentData: any) => createResident(newResidentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residentsCount"] });
      queryClient.invalidateQueries({ queryKey: ["residents"] });
      setIsAddModalOpen(false);
    },
  });

  const filteredResidents = residents;

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

    updateNurseMutation.mutate({ id, updatePayload });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCardClick = (id: string) => {
    router.push(`/dashboard/residents/${id}`);
  };

  const handleAddResidentSave = async (newResidentData: any) => {
    createResidentMutation.mutate(newResidentData);
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    router.push(`/dashboard/residents?page=${page}`);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
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
          </Button>,
        );
      }
    } else {
      pages.push(
        <Button
          key={1}
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(1)}
          className="w-8"
        >
          1
        </Button>,
      );

      if (currentPage > 3) {
        pages.push(
          <span key="start-ellipsis" className="px-2">
            <MoreHorizontal className="h-4 w-4" />
          </span>,
        );
      }

      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => goToPage(i)}
            className="w-8"
          >
            {i}
          </Button>,
        );
      }

      if (currentPage < totalPages - 2) {
        pages.push(
          <span key="end-ellipsis" className="px-2">
            <MoreHorizontal className="h-4 w-4" />
          </span>,
        );
      }

      pages.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(totalPages)}
          className="w-8"
        >
          {totalPages}
        </Button>,
      );
    }

    return pages;
  };

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">All Residents</h1>
        <div className="flex flex-row space-x-4">
          <div className="relative w-[400px]">
            <Input
              type="text"
              placeholder="Search residents..."
              className="pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <div className="absolute left-3 top-2 text-gray-400">
              <Search className="h-5 w-5" />
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              variant="default"
              onClick={() => setIsAddModalOpen(true)}
              disabled={createResidentMutation.isPending}
            >
              {createResidentMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-1" />
              )}
              New Resident
            </Button>
          </div>
        </div>
      </div>

      <CreateResidentDialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddResidentSave}
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : isError ? (
        <div className="text-center text-red-500 p-4">
          Error loading residents: {error.message}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResidents.length > 0 ? (
            filteredResidents.map((resident, index) => (
              <ResidentCard
                key={resident.id || index}
                resident={resident}
                onNurseChange={handleNurseChange}
                onClick={handleCardClick}
                nurseOptions={nurseOptions}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center">No residents found.</p>
          )}
        </div>
      )}

      {!isLoading && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {renderPageNumbers()}
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            Page {currentPage} of {totalPages} • Showing {residents.length} of{" "}
            {totalCount} residents
          </div>
        </div>
      )}
    </div>
  );
}
