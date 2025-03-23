"use client";

import { addDays } from "date-fns/addDays";
import { addMonths } from "date-fns/addMonths";
import { format } from "date-fns/format";
import { getDay } from "date-fns/getDay";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { subMonths } from "date-fns/subMonths";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar as BigCalendar,
  NavigateAction,
  View,
  dateFnsLocalizer,
  stringOrDate,
} from "react-big-calendar";
import type { Components } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import type { withDragAndDropProps } from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import {
  createActivity,
  deleteActivity,
  fetchActivities,
  updateActivity,
} from "@/app/api/activities";
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
import { cn } from "@/lib/utils";
import { Activity, ActivityCreate } from "@/types/activity";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Lock,
  Plus,
  Search,
} from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import ActivityDialog from "./activity-dialog";

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

type DateCellWrapperProps = {
  value: Date;
  children: React.ReactNode;
};
type TimeSlotWrapperProps = {
  value: Date;
  children: React.ReactNode;
};

const customDayPropGetter = (date: Date) => ({
  className: "custom-day",
  style: {
    position: "relative" as const,
  },
});

interface WrapperProps {
  children?: React.ReactNode;
  value: Date;
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
}

interface CalendarProps {
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
  searchQuery: string;
  locationFilter: string;
  categoryFilter: string;
  dateFilter?: Date;
  isAddDialogOpen?: boolean;
  onAddDialogClose?: () => void;
}

const DateCellWrapper: React.FC<WrapperProps> = ({
  children,
  value,
  onSelectSlot,
}) => (
  <div className="relative h-full group cursor-pointer">
    {children}
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/5 transition-opacity">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const end = new Date(value.getTime() + 30 * 60000);
          onSelectSlot({ start: value, end });
        }}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Activity
      </Button>
    </div>
  </div>
);

const TimeSlotWrapper: React.FC<WrapperProps> = ({
  children,
  value,
  onSelectSlot,
}) => (
  <div className="relative h-full group cursor-pointer">
    {children}
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/5 transition-opacity">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const end = new Date(value.getTime() + 30 * 60000);
          onSelectSlot({ start: value, end });
        }}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Activity
      </Button>
    </div>
  </div>
);

export default function ActivityCalendar({
  date,
  onNavigate,
  searchQuery,
  locationFilter,
  categoryFilter,
  dateFilter,
  isAddDialogOpen,
  onAddDialogClose,
}: CalendarProps) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [view, setView] = useState<View>("month");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [restrictedEventMessage, setRestrictedEventMessage] = useState<{
    id: string;
    message: string;
  } | null>(null);
  const [userCreatedActivities, setUserCreatedActivities] = useState<
    Set<string>
  >(new Set());
  const [newlyCreatedActivity, setNewlyCreatedActivity] = useState<
    string | null
  >(null);

  const canUserEditActivity = useCallback(
    (activity: Activity) => {
      const userId = session?.user?.id;
      const userRole = (session?.user as any)?.role;

      return !!(
        userRole === "admin" ||
        userRole === "Admin" ||
        userCreatedActivities.has(activity.id) ||
        (activity.created_by && activity.created_by === userId)
      );
    },
    [session, userCreatedActivities],
  );

  const eventStyleGetter = useCallback(
    (event: Activity) => {
      const userId = session?.user?.id;
      const userRole = (session?.user as any)?.role;
      const isAdmin = userRole === "admin" || userRole === "Admin";
      const isCreator = event.created_by === userId;
      const isUserCreated = userCreatedActivities.has(event.id);
      const canEdit = canUserEditActivity(event);
      const isNewlyCreated = event.id === newlyCreatedActivity;

      let title;
      if (!canEdit) {
        title = "You don't have permission to edit this activity";
      } else if (isAdmin) {
        title = isCreator ? "Your activity (Admin)" : "Editable (Admin)";
      } else if (isCreator) {
        title = "Your activity";
      } else if (isUserCreated) {
        title = "Created by you in this session";
      }

      if (isNewlyCreated) {
        title = "✨ Just created! ✨";
      }

      return {
        style: {
          backgroundColor: isNewlyCreated
            ? "#04d361aa"
            : canEdit
              ? "#0969da99"
              : "#9e9e9e99",
          borderColor: isNewlyCreated
            ? "#04d361"
            : canEdit
              ? "#0969da"
              : "#757575",
          color: "#000",
          borderWidth: isNewlyCreated ? "3px" : "2px",
          borderStyle: canEdit ? "solid" : "dashed",
          opacity: isNewlyCreated ? 1 : 0.8,
          transition: "all 0.2s ease",
          cursor: canEdit ? "move" : "not-allowed",
          position: "relative" as const,
          backgroundImage: !canEdit
            ? "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px)"
            : "none",
          boxShadow: isNewlyCreated ? "0 0 8px rgba(4, 211, 97, 0.8)" : "none",
        },
        title,
      };
    },
    [canUserEditActivity, session, userCreatedActivities, newlyCreatedActivity],
  );

  const draggableAccessor = useCallback(
    (event: CalendarEvent) => {
      return canUserEditActivity(event);
    },
    [canUserEditActivity],
  );

  const resizableAccessor = useCallback(
    (event: CalendarEvent) => {
      return canUserEditActivity(event);
    },
    [canUserEditActivity],
  );

  const debounce = <F extends (...args: any[]) => any>(
    func: F,
    delay: number,
  ) => {
    let timer: NodeJS.Timeout;
    return (...args: Parameters<F>) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const loadActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchActivities();
      setActivities(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load activities. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  useEffect(() => {
    if (isAddDialogOpen) {
      setSelectedActivity(null);
      setSelectedDate(new Date());
      setSelectedEndDate(new Date(Date.now() + 30 * 60000));
      setIsDialogOpen(true);
    }
  }, [isAddDialogOpen]);

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
    setSelectedActivity(activity);

    const startTimeString =
      activity.start_time + (activity.start_time.endsWith("Z") ? "" : "Z");
    const endTimeString =
      activity.end_time + (activity.end_time.endsWith("Z") ? "" : "Z");

    const startDate = new Date(startTimeString);
    const endDate = new Date(endTimeString);

    setSelectedDate(startDate);
    setSelectedEndDate(endDate);
    setIsDialogOpen(true);
  }, []);

  const handleSaveActivity = async (activityData: Partial<ActivityCreate>) => {
    try {
      setIsUpdating(true);

      let savedActivity: Activity;

      if (selectedActivity) {
        savedActivity = await updateActivity(selectedActivity.id, activityData);

        setActivities((prevActivities) =>
          prevActivities.map((activity) =>
            activity.id === selectedActivity.id
              ? { ...activity, ...savedActivity }
              : activity,
          ),
        );
      } else {
        savedActivity = await createActivity(activityData);
        setUserCreatedActivities((prev) => {
          const updated = new Set(prev);
          updated.add(savedActivity.id);
          return updated;
        });

        // Set the newly created activity ID to highlight it
        setNewlyCreatedActivity(savedActivity.id);
        // Clear the highlight after 3 seconds
        setTimeout(() => setNewlyCreatedActivity(null), 3000);

        setActivities((prevActivities) => [savedActivity, ...prevActivities]);
      }

      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: `Activity ${selectedActivity ? "updated" : "created"} successfully`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${selectedActivity ? "update" : "create"} activity`,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      setIsUpdating(true);

      setActivities((prevActivities) =>
        prevActivities.filter((activity) => activity.id !== id),
      );

      await deleteActivity(id);

      toast({
        title: "Success",
        description: "Activity deleted successfully",
      });
      setIsDialogOpen(false);
    } catch (error) {
      await loadActivities();

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete activity. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDuplicateActivity = async (activity: Activity) => {
    try {
      setIsUpdating(true);
      const { id, created_at, updated_at, ...activityData } = activity;

      const tempId = `temp-${Date.now()}`;

      const tempActivity: Activity = {
        ...activityData,
        id: tempId,
        title: `${activityData.title} (Copy)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setActivities((prevActivities) => [...prevActivities, tempActivity]);

      const newActivity = await createActivity({
        ...activityData,
        title: `${activityData.title} (Copy)`,
      });

      setActivities((prevActivities) =>
        prevActivities.map((act) => (act.id === tempId ? newActivity : act)),
      );

      toast({
        title: "Success",
        description: "Activity duplicated successfully",
      });
      setIsDialogOpen(false);
    } catch (error) {
      await loadActivities();

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to duplicate activity",
      });
    } finally {
      setIsUpdating(false);
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

  const filteredActivities = useCallback(() => {
    return activities
      .filter((activity) => {
        const matchesSearch =
          !searchQuery ||
          activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (activity.description &&
            activity.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()));

        const matchesLocation =
          !locationFilter ||
          locationFilter === "all" ||
          (activity.location &&
            activity.location.toLowerCase() === locationFilter.toLowerCase());

        const matchesCategory =
          !categoryFilter ||
          categoryFilter === "all" ||
          (activity.category &&
            activity.category.toLowerCase() === categoryFilter.toLowerCase());

        const matchesDate =
          !dateFilter ||
          new Date(activity.start_time).toLocaleDateString() ===
            dateFilter.toLocaleDateString();

        return (
          matchesSearch && matchesLocation && matchesCategory && matchesDate
        );
      })
      .map((activity) => {
        const start = new Date(
          activity.start_time + (activity.start_time.endsWith("Z") ? "" : "Z"),
        );
        const end = new Date(
          activity.end_time + (activity.end_time.endsWith("Z") ? "" : "Z"),
        );

        return {
          ...activity,
          start,
          end,
        };
      });
  }, [activities, searchQuery, locationFilter, categoryFilter, dateFilter]);

  const memoizedFilteredActivities = useMemo(
    () => filteredActivities(),
    [filteredActivities],
  );

  const handleEventDrop = async ({ event, start, end }: any) => {
    if (!canUserEditActivity(event)) {
      setRestrictedEventMessage({
        id: event.id,
        message:
          "You can only edit activities you've created or if you have admin privileges",
      });

      setTimeout(() => setRestrictedEventMessage(null), 3000);

      return;
    }

    try {
      setIsUpdating(true);

      setActivities(
        activities.map((activity) =>
          activity.id === event.id
            ? {
                ...activity,
                start_time: start.toISOString(),
                end_time: end.toISOString(),
              }
            : activity,
        ),
      );

      await updateActivity(event.id, {
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      });

      toast({
        title: "Success",
        description: "Activity updated successfully",
      });
    } catch (error) {
      await loadActivities();

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update activity",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEventResize = async ({ event, start, end }: any) => {
    if (!canUserEditActivity(event)) {
      setRestrictedEventMessage({
        id: event.id,
        message:
          "You can only edit activities you've created or if you have admin privileges",
      });

      setTimeout(() => setRestrictedEventMessage(null), 4000);

      return;
    }

    try {
      setIsUpdating(true);

      setActivities(
        activities.map((activity) =>
          activity.id === event.id
            ? {
                ...activity,
                start_time: start.toISOString(),
                end_time: end.toISOString(),
              }
            : activity,
        ),
      );

      await updateActivity(event.id, {
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      });

      toast({
        title: "Success",
        description: "Activity updated successfully",
      });
    } catch (error) {
      await loadActivities();

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update activity",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCalendarNavigate = useCallback(
    (newDate: Date, view: View, action: NavigateAction) => {
      if (view === "week") {
        const newDateObj = new Date(date);
        switch (action) {
          case "PREV":
            newDateObj.setDate(date.getDate() - 7);
            onNavigate("PREV");
            break;
          case "NEXT":
            newDateObj.setDate(date.getDate() + 7);
            onNavigate("NEXT");
            break;
          case "TODAY":
            onNavigate("TODAY");
            break;
        }
      } else {
        switch (action) {
          case "PREV":
            onNavigate("PREV");
            break;
          case "NEXT":
            onNavigate("NEXT");
            break;
          case "TODAY":
            onNavigate("TODAY");
            break;
        }
      }
    },
    [onNavigate, date],
  );

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    onAddDialogClose?.();
  };

  const renderDateCellWrapper = useCallback(
    (props: any) => (
      <DateCellWrapper {...props} onSelectSlot={handleSelectSlot} />
    ),
    [handleSelectSlot],
  );

  const renderTimeSlotWrapper = useCallback(
    (props: any) => (
      <TimeSlotWrapper {...props} onSelectSlot={handleSelectSlot} />
    ),
    [handleSelectSlot],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          if (e.altKey) {
            onNavigate("PREV");
          }
          break;
        case "ArrowRight":
          if (e.altKey) {
            onNavigate("NEXT");
          }
          break;
        case "t":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onNavigate("TODAY");
          }
          break;
        case "m":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setView("month");
          }
          break;
        case "w":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setView("week");
          }
          break;
        case "n":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setSelectedActivity(null);
            setSelectedDate(new Date());
            setSelectedEndDate(new Date(Date.now() + 30 * 60000));
            setIsDialogOpen(true);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNavigate]);

  const TimeGutterHeader = () => {
    return <div className="rbc-time-header-gutter"></div>;
  };

  const TimeSlotWrapper = ({ children }: any) => {
    return (
      <div className="rbc-time-slot relative">
        {children}
        <div className="absolute bottom-0 left-0 right-0 border-b border-gray-200" />
      </div>
    );
  };

  const components = {
    dateCellWrapper: renderDateCellWrapper,
    timeSlotWrapper: TimeSlotWrapper,
    timeGutterHeader: TimeGutterHeader,
  };

  return (
    <>
      <div className="h-[calc(100vh-12rem)] relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-lg text-muted-foreground">
              Loading activities...
            </div>
          </div>
        ) : (
          <>
            {isUpdating && (
              <div className="absolute top-0 right-0 m-2 bg-primary/20 text-primary font-medium py-1 px-2 rounded text-sm z-10">
                Updating...
              </div>
            )}
            {restrictedEventMessage && (
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-destructive text-white py-1 px-4 rounded shadow z-50">
                {restrictedEventMessage.message}
              </div>
            )}
            <DnDCalendar
              localizer={localizer}
              events={memoizedFilteredActivities}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              views={views}
              date={date}
              onNavigate={handleCalendarNavigate}
              selectable
              resizable
              draggableAccessor={draggableAccessor}
              resizableAccessor={resizableAccessor}
              onEventDrop={handleEventDrop}
              onEventResize={handleEventResize}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectActivity}
              eventPropGetter={eventStyleGetter}
              dayPropGetter={customDayPropGetter}
              messages={messages}
              view={view}
              onView={setView}
              step={30}
              timeslots={2}
              defaultView="month"
              min={new Date(0, 0, 0, 0, 0, 0)}
              max={new Date(0, 0, 0, 23, 59, 59)}
              components={components}
            />

            <div className="absolute bottom-2 left-2 text-xs bg-white p-2 rounded border shadow-sm">
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
            </div>

            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              <p>
                Keyboard shortcuts: Alt+← (prev), Alt+→ (next), Ctrl+T (today),
                Ctrl+M (month), Ctrl+W (week), Ctrl+N (new)
              </p>
            </div>
          </>
        )}
      </div>

      <ActivityDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        activity={selectedActivity}
        selectedDate={selectedDate}
        selectedEndDate={selectedEndDate}
        onSave={handleSaveActivity}
        onDelete={handleDeleteActivity}
        onDuplicate={handleDuplicateActivity}
        canUserEditActivity={canUserEditActivity}
      />
    </>
  );
}
