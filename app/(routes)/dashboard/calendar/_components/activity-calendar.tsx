"use client";

import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns/format";
import { getDay } from "date-fns/getDay";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar as BigCalendar,
  NavigateAction,
  View,
  dateFnsLocalizer,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import {
  createActivity,
  deleteActivity,
  fetchActivities,
  updateActivity,
} from "@/app/api/activities";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Activity, ActivityCreate } from "@/types/activity";
import { Plus } from "lucide-react";
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
  isAdmin: boolean;
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
        <Plus className="h-4 w-4 mr-1" />
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
  isAdmin,
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
      return !!(
        isAdmin ||
        userCreatedActivities.has(activity.id) ||
        (activity.created_by && activity.created_by === userId)
      );
    },
    [session, userCreatedActivities],
  );

  const eventStyleGetter = useCallback(
    (event: Activity) => {
      const userId = session?.user?.id;
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
              ? "rgba(255,255,255,0)"
              : "#757575",
          color: "#000",
          borderWidth: canEdit ? "" : "1px",
          borderStyle: canEdit ? "" : "dashed",
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

        setNewlyCreatedActivity(savedActivity.id);
        setTimeout(() => setNewlyCreatedActivity(null), 3000);

        setActivities((prevActivities) => [savedActivity, ...prevActivities]);
      }

      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: `Activity ${
          selectedActivity ? "updated" : "created"
        } successfully`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${
          selectedActivity ? "update" : "create"
        } activity`,
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
      <div className="h-[100vh]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner />
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
              style={{
                height: "100%",
              }}
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
        isAdmin={isAdmin}
      />
    </>
  );
}
