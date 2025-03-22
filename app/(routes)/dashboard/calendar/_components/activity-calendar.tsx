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
import { useToast } from "@/hooks/use-toast";
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

interface CalendarProps {
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
  searchQuery: string;
  locationFilter: string;
  categoryFilter: string;
  dateFilter?: Date;
}

export default function ActivityCalendar({
  date,
  onNavigate,
  searchQuery,
  locationFilter,
  categoryFilter,
  dateFilter,
}: CalendarProps) {
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [view, setView] = useState<View>("month");

  const loadActivities = useCallback(async () => {
    try {
      const data = await fetchActivities();
      setActivities(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load activities",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      const slotEnd = end || new Date(start.getTime() + 30 * 60000);
      setSelectedDate(start);
      setSelectedEndDate(slotEnd);
      setSelectedActivity(null);
      setIsDialogOpen(true);
    },
    [],
  );

  const handleSelectActivity = useCallback((activity: Activity) => {
    const localActivity = {
      ...activity,
      start_time: new Date(activity.start_time + "Z").toISOString(),
      end_time: new Date(activity.end_time + "Z").toISOString(),
    };
    setSelectedActivity(localActivity);
    setIsDialogOpen(true);
  }, []);

  const handleSaveActivity = async (activityData: Partial<ActivityCreate>) => {
    try {
      const utcActivityData = {
        ...activityData,
        start_time: activityData.start_time
          ? new Date(activityData.start_time).toISOString().replace("Z", "")
          : undefined,
        end_time: activityData.end_time
          ? new Date(activityData.end_time).toISOString().replace("Z", "")
          : undefined,
      };

      if (selectedActivity?.id) {
        const updatedActivity = await updateActivity(
          selectedActivity.id,
          utcActivityData,
        );
        setActivities(
          activities.map((activity) =>
            activity.id === selectedActivity.id ? updatedActivity : activity,
          ),
        );
        toast({
          title: "Success",
          description: "Activity updated successfully",
        });
      } else {
        const newActivity = await createActivity(utcActivityData);
        setActivities([...activities, newActivity]);
        toast({
          title: "Success",
          description: "Activity created successfully",
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save activity",
      });
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      await deleteActivity(id);
      setActivities(activities.filter((activity) => activity.id !== id));
      toast({
        title: "Success",
        description: "Activity deleted successfully",
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete activity",
      });
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

  const filteredActivities = activities
    .filter((activity) => {
      const matchesSearch =
        !searchQuery ||
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (activity.description &&
          activity.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLocation =
        !locationFilter ||
        (activity.location &&
          activity.location.toLowerCase().includes(locationFilter.toLowerCase()));

      const matchesCategory =
        !categoryFilter ||
        (activity.category &&
          activity.category.toLowerCase() === categoryFilter.toLowerCase());

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
    }));

  return (
    <>
      <div className="h-[calc(100vh-12rem)]">
        <DnDCalendar
          localizer={localizer}
          events={filteredActivities}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          views={views}
          date={date}
          onNavigate={onNavigate}
          selectable
          resizable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectActivity}
          eventPropGetter={eventStyleGetter}
          dayPropGetter={customDayPropGetter}
          messages={messages}
          view={view}
          onView={setView}
        />
      </div>

      <ActivityDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        activity={selectedActivity}
        selectedDate={selectedDate}
        selectedEndDate={selectedEndDate}
        onSave={handleSaveActivity}
        onDelete={handleDeleteActivity}
        onDuplicate={handleDuplicateActivity}
      />
    </>
  );
}
