"use client";

import { addDays } from "date-fns/addDays";
import { addMonths } from "date-fns/addMonths";
import { format } from "date-fns/format";
import { getDay } from "date-fns/getDay";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { subMonths } from "date-fns/subMonths";
import { useCallback, useEffect, useState } from "react";
import {
  Calendar as BigCalendar,
  Components,
  View,
  dateFnsLocalizer,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import type { withDragAndDropProps } from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
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
import {
  createActivity,
  deleteActivity,
  fetchActivities,
  updateActivity,
} from "@/lib/api/activities";
import { cn } from "@/lib/utils";
import { Activity, ActivityCreate } from "@/types/activity";
import { ChevronLeft, ChevronRight, Filter, Plus, Search } from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import ActivityDialog from "./ActivityDialog";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const views = {
  month: true,
  week: true,
};

type CalendarEvent = Activity & {
  start: Date;
  end: Date;
};

const DnDCalendar = withDragAndDrop<CalendarEvent>(BigCalendar);

const eventStyleGetter = (event: Activity) => {
  return {
    style: {
      backgroundColor: "#0969da99",
      borderColor: "#0969da",
      color: "#000",
      borderWidth: "2px",
      borderStyle: "solid",
      opacity: 0.8,
      transition: "all 0.2s ease",
    },
  };
};

const customDayPropGetter = (date: Date) => ({
  className: "custom-day",
  style: {
    position: "relative" as const,
  },
});

export default function Calendar() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  const loadActivities = useCallback(async () => {
    try {
      const data = await fetchActivities();
      setActivities(data);
    } catch (error) {
      console.error("Failed to load activities:", error);
      toast.error("Failed to load activities");
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    setSelectedDate(start);
    setSelectedActivity(null);
    setIsDialogOpen(true);
  }, []);

  const handleSelectActivity = useCallback((activity: Activity) => {
    setSelectedActivity(activity);
    setIsDialogOpen(true);
  }, []);

  const handleSaveActivity = async (activityData: Partial<ActivityCreate>) => {
    try {
      console.log("Saving activity with data:", activityData);

      if (selectedActivity) {
        const updatedActivity = await updateActivity(
          selectedActivity._id,
          activityData,
        );
        console.log("Updated activity:", updatedActivity);
        setActivities(
          activities.map((activity) =>
            activity._id === selectedActivity._id ? updatedActivity : activity,
          ),
        );
        toast.success("Activity updated successfully");
      } else {
        const newActivity = await createActivity(activityData);
        console.log("Created activity:", newActivity);
        setActivities([...activities, newActivity]);
        toast.success("Activity created successfully");
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to save activity:", error);
      toast.error("Failed to save activity");
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      await deleteActivity(id);
      setActivities(activities.filter((activity) => activity._id !== id));
      toast.success("Activity deleted successfully");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete activity:", error);
      toast.error("Failed to delete activity");
    }
  };

  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    switch (action) {
      case "PREV":
        setDate(view === "month" ? subMonths(date, 1) : addDays(date, -7));
        break;
      case "NEXT":
        setDate(view === "month" ? addMonths(date, 1) : addDays(date, 7));
        break;
      case "TODAY":
        setDate(new Date());
        break;
    }
  };

  const messages = {
    allDay: "All Day",
    previous: "Previous",
    next: "Next",
    today: "Today",
    month: "Month",
    week: "Week",
    day: "Day",
    agenda: "Agenda",
    date: "Date",
    time: "Time",
    event: "Activity",
    showMore: (total: number) => `+${total} more`,
    noEventsInRange: "No activities to display",
  };

  const eventPropGetter = (event: Activity) => {
    return {
      className: "rbc-event",
      style: {
        backgroundColor: "rgba(9, 105, 218, 0.6)", // Translucent blue
        borderColor: "#0969da",
        color: "#000000",
        borderWidth: "1px",
        borderStyle: "solid",
        borderRadius: "4px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      },
    };
  };

  const handleDuplicateActivity = async (activity: Activity) => {
    try {
      const duplicateData: Partial<ActivityCreate> = {
        title: `${activity.title} (Copy)`,
        description: activity.description,
        start_time: activity.start_time,
        end_time: activity.end_time,
        location: activity.location,
        category: activity.category,
      };

      const newActivity = await createActivity(duplicateData);
      setActivities([...activities, newActivity]);
      toast.success("Activity duplicated successfully");
    } catch (error) {
      console.error("Failed to duplicate activity:", error);
      toast.error("Failed to duplicate activity");
    }
  };

  const handleEventDrop = async ({
    event,
    start,
    end,
  }: {
    event: CalendarEvent;
    start: Date;
    end: Date;
  }) => {
    try {
      const updatedEvent = {
        ...event,
        start_time: format(start, "yyyy-MM-dd'T'HH:mm:ss"),
        end_time: format(end || start, "yyyy-MM-dd'T'HH:mm:ss"),
      };
      await updateActivity(event._id, updatedEvent);
      await loadActivities();
    } catch (error) {
      console.error("Failed to update activity:", error);
    }
  };

  // Filter activities based on search and filters
  const filteredEvents: CalendarEvent[] = activities
    .filter((activity) => {
      const matchesSearch = activity.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesLocation =
        locationFilter === "all" ||
        activity.location?.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" ||
        activity.category?.toLowerCase().includes(categoryFilter.toLowerCase());
      const matchesDate =
        !dateFilter ||
        format(new Date(activity.start_time), "yyyy-MM-dd") ===
          format(dateFilter, "yyyy-MM-dd");

      return matchesSearch && matchesLocation && matchesCategory && matchesDate;
    })
    .map((activity) => ({
      ...activity,
      start: new Date(activity.start_time),
      end: new Date(activity.end_time),
      title: activity.title,
    }));

  // Get unique locations and categories for filters
  const uniqueLocations = Array.from(
    new Set(
      activities
        .map((a) => a.location)
        .filter((loc): loc is string => Boolean(loc)),
    ),
  );
  const uniqueCategories = Array.from(
    new Set(
      activities
        .map((a) => a.category)
        .filter((cat): cat is string => Boolean(cat)),
    ),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleNavigate("PREV")}
              variant="outline"
              size="icon"
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => handleNavigate("TODAY")}
              variant="outline"
              className="h-8 text-sm"
            >
              Today
            </Button>
            <Button
              onClick={() => handleNavigate("NEXT")}
              variant="outline"
              size="icon"
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="ml-4 text-lg font-semibold">
              {format(date, view === "month" ? "MMMM yyyy" : "MMM d, yyyy")}
            </span>
          </div>
        </div>

        <div className="flex gap-4 items-center">
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
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select
                    value={locationFilter}
                    onValueChange={setLocationFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All locations</SelectItem>
                      {uniqueLocations.map((location) => (
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
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {uniqueCategories.map((category) => (
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
                        variant={"outline"}
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
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setLocationFilter("all");
                    setCategoryFilter("all");
                    setDateFilter(undefined);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Select value={view} onValueChange={(v) => setView(v as View)}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => handleSelectSlot({ start: new Date() })}
            size="sm"
            className="h-9"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Activity
          </Button>
        </div>
      </div>

      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 8px;
          font-weight: 600;
          font-size: 14px;
          border-bottom: none;
          background-color: #f8f9fa;
        }
        .rbc-month-view {
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .rbc-day-bg {
          transition: all 0.2s;
        }
        .rbc-month-view .rbc-day-bg:hover::after {
          content: "Add activity";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: #f3f4f6;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: #374151;
          white-space: nowrap;
          z-index: 1;
          opacity: 0.9;
        }
        .rbc-time-slot {
          transition: all 0.2s;
          position: relative;
        }
        .rbc-timeslot-group {
          min-height: 60px;
          border-bottom: 1px solid #e5e7eb;
        }
        .rbc-time-slot:hover {
          background-color: rgba(0, 0, 0, 0.04);
        }
        .rbc-time-slot:hover::after {
          content: "Add activity";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: #f3f4f6;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: #374151;
          white-space: nowrap;
          z-index: 10;
          opacity: 0.9;
          pointer-events: none;
        }
        .rbc-time-view {
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .rbc-time-content {
          border-top: 1px solid #e5e7eb;
        }
        .rbc-time-header-content {
          border-left: 1px solid #e5e7eb;
        }
        .rbc-time-view .rbc-time-gutter .rbc-timeslot-group {
          border-bottom: 1px solid #e5e7eb;
        }
        .rbc-off-range-bg {
          background-color: #f9fafb;
        }
        .rbc-today {
          background-color: #f0f9ff;
        }
        .rbc-event {
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .rbc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .rbc-toolbar button {
          color: #374151;
          border: 1px solid #e5e7eb;
        }
        .rbc-toolbar button:hover {
          background-color: #f3f4f6;
        }
        .rbc-toolbar button.rbc-active {
          background-color: #e5e7eb;
        }
      `}</style>

      <div className="h-[700px] bg-background rounded-lg overflow-hidden">
        <DnDCalendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectActivity}
          onSelectSlot={handleSelectSlot}
          onEventDrop={({ event, start, end }) => {
            handleEventDrop({
              event: event as CalendarEvent,
              start: new Date(start),
              end: new Date(end || start),
            });
          }}
          draggableAccessor={() => true}
          resizable={false}
          selectable
          popup
          views={views}
          view={view}
          onView={setView as any}
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          messages={messages}
          eventPropGetter={eventPropGetter}
          dayPropGetter={customDayPropGetter}
          step={60}
          timeslots={1}
          formats={{
            monthHeaderFormat: (date: Date) => format(date, "MMMM yyyy"),
          }}
          className="h-full"
        />
      </div>

      <ActivityDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        activity={selectedActivity}
        selectedDate={selectedDate}
        onSave={handleSaveActivity}
        onDelete={handleDeleteActivity}
        onDuplicate={handleDuplicateActivity}
      />
    </div>
  );
}
