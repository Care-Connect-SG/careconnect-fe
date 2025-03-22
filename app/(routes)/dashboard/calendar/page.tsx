"use client";

import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Calendar as DatePicker } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { addMonths, subMonths } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, Plus, Search } from "lucide-react";
import { useState } from "react";
import ActivityCalendar from "./_components/activity-calendar";

export const metadata: Metadata = {
  title: "Calendar | CareConnect",
  description: "Activity Management Calendar",
};

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<Date>();

  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    switch (action) {
      case "PREV":
        setDate(subMonths(date, 1));
        break;
      case "NEXT":
        setDate(addMonths(date, 1));
        break;
      case "TODAY":
        setDate(new Date());
        break;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handleNavigate("PREV")}
              variant="outline"
              size="icon"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => handleNavigate("TODAY")}
              variant="outline"
              size="sm"
            >
              Today
            </Button>
            <Button
              onClick={() => handleNavigate("NEXT")}
              variant="outline"
              size="icon"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="ml-4 text-lg font-semibold">
              {format(date, "MMMM yyyy")}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid space-y-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="Filter by location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    placeholder="Filter by category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateFilter && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFilter ? format(dateFilter, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <DatePicker
                        mode="single"
                        selected={dateFilter}
                        onSelect={setDateFilter}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setLocationFilter("");
                    setCategoryFilter("");
                    setDateFilter(undefined);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <ActivityCalendar
        date={date}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        locationFilter={locationFilter}
        categoryFilter={categoryFilter}
        dateFilter={dateFilter}
      />
    </div>
  );
}
