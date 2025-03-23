"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Search, X } from "lucide-react";
import { CalendarIcon } from "lucide-react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface OptionType {
  id: string;
  name: string;
}

interface IncidentReportFiltersProps {
  uniqueReporters: OptionType[];
  uniqueResidents: OptionType[];
  filterOptions: any;
  setFilterOptions: (filters: any) => void;
}

export default function IncidentReportFilters({
  uniqueReporters,
  uniqueResidents,
  filterOptions,
  setFilterOptions,
}: IncidentReportFiltersProps) {
  const [selectedReporters, setSelectedReporters] = useState<string[]>(
    filterOptions.reporterId || [],
  );
  const [selectedResidents, setSelectedResidents] = useState<string[]>(
    filterOptions.residentId === "all" ? [] : filterOptions.residentId || [],
  );

  useEffect(() => {
    setFilterOptions({
      ...filterOptions,
      reporterId: selectedReporters,
      residentId: selectedResidents.length === 0 ? "all" : selectedResidents,
    });
  }, [selectedReporters, selectedResidents]);

  const handleToggleReporter = (id: string) => {
    setSelectedReporters((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const handleToggleResident = (id: string) => {
    setSelectedResidents((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const hasActiveFilters = () => {
    return (
      selectedReporters.length > 0 ||
      selectedResidents.length > 0 ||
      filterOptions.search?.trim() !== "" ||
      filterOptions.startDate !== null ||
      filterOptions.endDate !== null
    );
  };

  const handleReset = () => {
    setSelectedReporters([]);
    setSelectedResidents([]);
    setFilterOptions({
      search: "",
      reporterId: [],
      residentId: "all",
      startDate: null,
      endDate: null,
    });
  };

  return (
    <div className="flex flex-row items-center gap-4">
      <div className="relative w-full md:w-1/3">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Search forms..."
          className="pl-10"
          value={filterOptions.search || ""}
          onChange={(e) =>
            setFilterOptions({ ...filterOptions, search: e.target.value })
          }
        />
      </div>

      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="fullBorder">
              {selectedReporters.length === 0
                ? "All Reporters"
                : `${selectedReporters.length} selected`}
              <ChevronDownIcon className="w-4 h-4 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="bg-white border p-2 shadow-md rounded-md w-56">
            <div className="max-h-60 overflow-auto">
              {uniqueReporters.map((reporter) => (
                <div
                  key={reporter.id}
                  className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 rounded-md"
                  onClick={() => handleToggleReporter(reporter.id)}
                >
                  <div
                    className={`w-5 h-5 border rounded-md flex items-center justify-center ${
                      selectedReporters.includes(reporter.id)
                        ? "bg-blue-500"
                        : "bg-white"
                    }`}
                  >
                    {selectedReporters.includes(reporter.id) && (
                      <CheckIcon className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm">{reporter.name}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="fullBorder">
              {selectedResidents.length === 0
                ? "All Residents"
                : `${selectedResidents.length} selected`}
              <ChevronDownIcon className="w-4 h-4 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="bg-white border p-2 shadow-md rounded-md w-56">
            <div className="max-h-60 overflow-auto">
              {uniqueResidents.map((resident) => (
                <div
                  key={resident.id}
                  className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 rounded-md"
                  onClick={() => handleToggleResident(resident.id)}
                >
                  <div
                    className={`w-5 h-5 border rounded-md flex items-center justify-center ${
                      selectedResidents.includes(resident.id)
                        ? "bg-blue-500"
                        : "bg-white"
                    }`}
                  >
                    {selectedResidents.includes(resident.id) && (
                      <CheckIcon className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm">{resident.name}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filterOptions.startDate
                ? format(new Date(filterOptions.startDate), "PPP")
                : "Select start date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={
                filterOptions.startDate
                  ? new Date(filterOptions.startDate)
                  : undefined
              }
              onSelect={(date) =>
                setFilterOptions({
                  ...filterOptions,
                  startDate: date?.toISOString().split("T")[0] || null,
                })
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filterOptions.endDate
                ? format(new Date(filterOptions.endDate), "PPP")
                : "Select end date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={
                filterOptions.endDate
                  ? new Date(filterOptions.endDate)
                  : undefined
              }
              onSelect={(date) =>
                setFilterOptions({
                  ...filterOptions,
                  endDate: date?.toISOString().split("T")[0] || null,
                })
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button
        variant="outline"
        onClick={handleReset}
        disabled={!hasActiveFilters()}
      >
        <X className="w-4 h-4 mr-2" />
        Clear
      </Button>
    </div>
  );
}
