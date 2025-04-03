"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { ResidentRecord } from "@/types/resident";
import { User } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Search,
  XCircle,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  createResident,
  getResidentsByPage,
  getResidentsCount,
  updateResidentNurse,
} from "../../../api/resident";
import { getAllNurses } from "../../../api/user";
import CreateResidentDialog from "./_components/create-resident-dialog";
import ResidentCard from "./_components/resident-card";

export default function AllResidentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

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
    queryKey: ["residentsCount", debouncedSearchTerm],
    queryFn: () => getResidentsCount(debouncedSearchTerm),
    staleTime: 30000,
  });

  const totalPages = Math.max(Math.ceil(totalCount / 8), 1);

  const {
    data: residents = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["residents", currentPage, debouncedSearchTerm],
    queryFn: () => getResidentsByPage(currentPage, 8, debouncedSearchTerm),
    staleTime: 30000,
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
    staleTime: 300000,
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
      toast({
        variant: "default",
        title: "Resident created",
        description: "New resident has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error creating resident",
        description: error.message,
      });
    },
  });

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    router.push(`${pathname}?${createQueryString("page", page.toString())}`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (currentPage !== 1) {
      router.push(`${pathname}?page=1`);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    if (currentPage !== 1) {
      router.push(`${pathname}?page=1`);
    }
  };

  const handleNurseChange = async (id: string, newNurse: string) => {
    const currentResident = residents.find(
      (res: ResidentRecord) => res.id === id,
    );
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

  const handleCardClick = (id: string) => {
    router.push(`/dashboard/residents/${id}`);
  };

  const handleAddResidentSave = async (newResidentData: any) => {
    createResidentMutation.mutate(newResidentData);
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

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      router.push(`${pathname}?page=1`);
    }
  }, [totalPages, currentPage, router, pathname]);

  useEffect(() => {
    if (!searchParams.has("page")) {
      router.push(`${pathname}?page=1`);
    }
  }, [pathname, router, searchParams]);

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">All Residents</h1>
        <div className="flex flex-row space-x-4">
          <div className="relative w-[400px]">
            <Input
              type="text"
              placeholder="Search residents..."
              className="pl-10 pr-10 py-2"
              value={searchTerm}
              onChange={handleSearch}
            />
            <div className="absolute left-3 top-2 text-gray-400">
              <Search className="h-5 w-5" />
            </div>
            {searchTerm && (
              <div
                className="absolute right-3 top-2 text-gray-400 cursor-pointer hover:text-gray-600"
                onClick={clearSearch}
              >
                <XCircle className="h-5 w-5" />
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <Button
              variant="default"
              onClick={() => setIsAddModalOpen(true)}
              disabled={createResidentMutation.isPending}
            >
              {createResidentMutation.isPending ? (
                <Spinner />
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
        <div className="text-center text-red-500 p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="font-semibold">Error loading residents</p>
          <p className="text-sm mt-2">
            {error instanceof Error
              ? error.message
              : "An unknown error occurred"}
          </p>
          <p className="text-sm mt-1">
            Please try refreshing the page or contact support if the issue
            persists.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {residents.length > 0 ? (
            residents.map((resident: ResidentRecord, index: number) => (
              <ResidentCard
                key={resident.id || index}
                resident={resident}
                onNurseChange={handleNurseChange}
                onClick={handleCardClick}
                nurseOptions={nurseOptions}
              />
            ))
          ) : (
            <div className="text-gray-500 text-center p-8 border rounded-lg bg-gray-50">
              {debouncedSearchTerm
                ? `No residents found matching "${debouncedSearchTerm}".`
                : "No residents found."}
            </div>
          )}
        </div>
      )}

      {!isLoading && residents.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-center items-center gap-2">
            {currentPage > 1 && (
              <Button
                variant="outline"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {renderPageNumbers()}
            {currentPage < totalPages && (
              <Button
                variant="outline"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-1.5"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
