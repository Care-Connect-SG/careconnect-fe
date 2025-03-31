"use client";

import { fetchActivities } from "@/app/api/activities";
import { getCurrentUser } from "@/app/api/user";
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
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ActivityCalendar from "./_components/activity-calendar";

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<Date>();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadFilters = useCallback(async () => {
    try {
      const activities = await fetchActivities();
      const locations = [...new Set(activities.map((a) => a.location))].sort();
      const categories = [...new Set(activities.map((a) => a.category))].sort();
      setAvailableLocations(locations);
      setAvailableCategories(categories);
    } catch (error) {
      console.error("Error loading filters:", error);
    }
  }, []);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (user.role === "Admin") {
          setIsAdmin(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching user role:", error);
      });
  }, []);

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
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities or schedules..."
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
                <Select
                  value={locationFilter || undefined}
                  onValueChange={setLocationFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {availableLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={categoryFilter || undefined}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFilter && "text-muted-foreground",
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
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                variant="ghost"
                onClick={() => {
                  setLocationFilter(null);
                  setCategoryFilter(null);
                  setDateFilter(undefined);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <ActivityCalendar
          date={date}
          onNavigate={handleNavigate}
          searchQuery={searchQuery}
          locationFilter={locationFilter || ""}
          categoryFilter={categoryFilter || ""}
          dateFilter={dateFilter}
          isAddDialogOpen={isAddDialogOpen}
          onAddDialogClose={() => setIsAddDialogOpen(false)}
          isAdmin={isAdmin}
        />
        <div className="text-xs bg-white p-2 rounded border shadow-sm flex flex-row justify-between !mt-0">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 mr-1 bg-[#0969da99] border-2 border-[#0969da]"></div>
                <span>Editable</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-1 bg-[#9e9e9e99] border-2 border-dashed border-[#757575]"></div>
                <span>View only</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-1 bg-[#04d361aa] border-2 border-[#04d361]"></div>
                <span>Newly created</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 italic">
              You can edit activities you created or as an admin
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            <p>
              Keyboard shortcuts: Alt+← (prev), Alt+→ (next), Ctrl+T (today),
              Ctrl+M (month), Ctrl+W (week), Ctrl+N (new)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
