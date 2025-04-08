"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

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

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filterOptions.startDate && filterOptions.endDate
      ? {
          from: parseISO(filterOptions.startDate),
          to: parseISO(filterOptions.endDate),
        }
      : undefined,
  );

  useEffect(() => {
    setFilterOptions({
      ...filterOptions,
      reporterId: selectedReporters,
      residentId: selectedResidents.length === 0 ? "all" : selectedResidents,
      startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : null,
      endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : null,
    });
  }, [selectedReporters, selectedResidents, dateRange]);

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
      dateRange?.from ||
      dateRange?.to
    );
  };

  const handleReset = () => {
    setSelectedReporters([]);
    setSelectedResidents([]);
    setDateRange(undefined);
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
      <div className="relative w-[400px]">
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
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button
        variant="ghost"
        onClick={handleReset}
        disabled={!hasActiveFilters()}
        className="px-2"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
