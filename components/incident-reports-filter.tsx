import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function IncidentReportFilters() {
  const [formId, setFormId] = useState("all");
  const [reporterId, setReporterId] = useState("all");
  const [residentId, setResidentId] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleReset = () => {
    setFormId("all");
    setReporterId("all");
    setResidentId("all");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
      {/* Form Filter */}
      <div>
        <label className="text-sm font-medium">Form</label>
        <Select value={formId} onValueChange={setFormId}>
          <SelectTrigger>
            <SelectValue placeholder="All Forms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Forms</SelectItem>
            <SelectItem value="form1">Form 1</SelectItem>
            <SelectItem value="form2">Form 2</SelectItem>
            {/* Add dynamic form options here */}
          </SelectContent>
        </Select>
      </div>

      {/* Reporter Filter */}
      <div>
        <label className="text-sm font-medium">Reporter</label>
        <Select value={reporterId} onValueChange={setReporterId}>
          <SelectTrigger>
            <SelectValue placeholder="All Reporters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reporters</SelectItem>
            <SelectItem value="reporter1">Reporter 1</SelectItem>
            <SelectItem value="reporter2">Reporter 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resident Filter */}
      <div>
        <label className="text-sm font-medium">Primary Resident</label>
        <Select value={residentId} onValueChange={setResidentId}>
          <SelectTrigger>
            <SelectValue placeholder="All Residents" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Residents</SelectItem>
            <SelectItem value="resident1">Resident 1</SelectItem>
            <SelectItem value="resident2">Resident 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Start Date Filter */}
      <div>
        <label className="text-sm font-medium">Start Date</label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      {/* End Date Filter */}
      <div>
        <label className="text-sm font-medium">End Date</label>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Reset Filters Button */}
      <div className="col-span-full flex justify-end">
        <Button variant="outline" onClick={handleReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
