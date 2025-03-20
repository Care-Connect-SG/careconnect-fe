import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    filterOptions.reporterId || []
  );
  const [selectedResidents, setSelectedResidents] = useState<string[]>(
    filterOptions.residentId || []
  );

  const handleToggleReporter = (id: string) => {
    setSelectedReporters((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleToggleResident = (id: string) => {
    setSelectedResidents((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleApplyFilters = () => {
    setFilterOptions({
      ...filterOptions,
      reporterId: selectedReporters.length === 0 ? [] : selectedReporters,
      residentId: selectedResidents.length === 0 ? "all" : selectedResidents,
      startDate: filterOptions.startDate || null,
      endDate: filterOptions.endDate || null,
    });
  };

  const handleReset = () => {
    setSelectedReporters([]);
    setSelectedResidents([]);
    setFilterOptions({
      formId: "all",
      reporterId: [],
      residentId: "all",
      startDate: null,
      endDate: null,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
      {/* Form Filter */}
      <div>
        <label className="text-sm font-medium">Form</label>
        <Select
          value={filterOptions.formId}
          onValueChange={(value) =>
            setFilterOptions({ ...filterOptions, formId: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Forms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Forms</SelectItem>
            <SelectItem value="form1">Form 1</SelectItem>
            <SelectItem value="form2">Form 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reporter Multi-Select Dropdown */}
      <div>
        <label className="text-sm font-medium">Reporter</label>
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="w-full flex items-center justify-between border rounded-md p-2">
              {selectedReporters.length === 0
                ? "All Reporters"
                : `${selectedReporters.length} selected`}
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </Popover.Trigger>
          <Popover.Content className="bg-white border p-2 shadow-md rounded-md w-56">
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
                  <span>{reporter.name}</span>
                </div>
              ))}
            </div>
          </Popover.Content>
        </Popover.Root>
      </div>

      {/* Resident Multi-Select Dropdown (Fixed & Matching Reporter Filter) */}
      <div>
        <label className="text-sm font-medium">Primary Resident</label>
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="w-full flex items-center justify-between border rounded-md p-2">
              {selectedResidents.length === 0
                ? "All Residents"
                : `${selectedResidents.length} selected`}
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </Popover.Trigger>
          <Popover.Content className="bg-white border p-2 shadow-md rounded-md w-56">
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
                  <span>{resident.name}</span>
                </div>
              ))}
            </div>
          </Popover.Content>
        </Popover.Root>
      </div>

      {/* Start Date Filter */}
      <div>
        <label className="text-sm font-medium">Start Date</label>
        <Input
          type="date"
          value={filterOptions.startDate || ""}
          onChange={(e) =>
            setFilterOptions({ ...filterOptions, startDate: e.target.value })
          }
        />
      </div>

      {/* End Date Filter */}
      <div>
        <label className="text-sm font-medium">End Date</label>
        <Input
          type="date"
          value={filterOptions.endDate || ""}
          onChange={(e) =>
            setFilterOptions({ ...filterOptions, endDate: e.target.value })
          }
        />
      </div>

      {/* Apply & Reset Filters Buttons (Fixed Reset) */}
      <div className="col-span-full flex justify-between">
        <Button variant="outline" onClick={handleReset}>
          Reset Filters
        </Button>
        <Button variant="outline" onClick={handleApplyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
