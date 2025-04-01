"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
<<<<<<< Updated upstream
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, MapPin, Calendar, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { getTasks } from "@/app/api/task";
import { formatDateWithoutSeconds } from "@/lib/utils";
import { useRouter } from "next/navigation";

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
=======
import { Clock, MapPin, MoreHorizontal, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Activity } from "@/types/activity";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

const UpcomingEvents = () => {
  const router = useRouter();
  const [events, setEvents] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
>>>>>>> Stashed changes

  useEffect(() => {
    const fetchEvents = async () => {
      try {
<<<<<<< Updated upstream
        setLoading(true);
        
        // Get current date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get date for tomorrow at midnight
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Get date for next week
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        // Fetch tasks
        const tasks = await getTasks();
        
        // Filter for upcoming tasks (not completed and due in the next 7 days)
        const upcomingTasks = tasks.filter(task => 
          task.status !== "Completed" && 
          task.due_date >= today && 
          task.due_date <= nextWeek
        );
        
        // Sort by due date
        const sortedEvents = upcomingTasks
          .sort((a, b) => a.due_date.getTime() - b.due_date.getTime())
          .slice(0, 3);
        
        setEvents(sortedEvents);
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
=======
        const response = await fetch(`${process.env.NEXT_PUBLIC_BE_API_URL}/activities`);
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
>>>>>>> Stashed changes
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);
<<<<<<< Updated upstream
  
  const formatEventTime = (date) => {
    if (!date) return "Unknown";
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const eventDate = new Date(date);
    
    // Format time
    const timeStr = eventDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
    
    if (eventDate.getTime() >= today.getTime() && eventDate.getTime() < tomorrow.getTime()) {
      return `Today, ${timeStr}`;
    } else if (eventDate.getTime() >= tomorrow.getTime() && eventDate.getTime() < tomorrow.getTime() + 86400000) {
      return `Tomorrow, ${timeStr}`;
    } else {
      return `${eventDate.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      })}, ${timeStr}`;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-lg font-semibold text-gray-800">Upcoming Tasks</p>
        <Button
          variant="link"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          onClick={() => router.push('/dashboard/tasks')}
        >
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {loading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="p-4 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-5 w-48 mb-2" />
                  <div className="flex flex-wrap gap-4 mt-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </Card>
          ))
        ) : events.length > 0 ? (
          events.map((event, i) => (
            <Card
              key={i}
              className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => router.push(`/dashboard/tasks/${event.id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{event.task_title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatEventTime(event.due_date)}
                    </div>
                    {event.resident_name && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {event.resident_name} {event.resident_room && `(Room ${event.resident_room})`}
                      </div>
                    )}
                    {event.category && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {event.category}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/tasks/${event.id}`);
                  }}
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No upcoming tasks found</p>
        )}
=======

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-1/6 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4 bg-gray-50">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    );
  }

  const upcomingEvents = events
    .filter(event => new Date(event.start_time) > new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 3);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-lg font-semibold text-gray-800">Upcoming Events</p>
        <Button
          variant="link"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          onClick={() => router.push("/dashboard/calendar")}
        >
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {upcomingEvents.map((event) => (
          <Card
            key={event.id}
            className="p-4 bg-gray-50 flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-gray-900">{event.title}</p>
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {format(new Date(event.start_time), "MMM d, h:mm a")}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {event.location}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {event.category}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-600"
              onClick={() => router.push(`/dashboard/calendar/event/${event.id}`)}
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </Card>
        ))}
>>>>>>> Stashed changes
      </div>
    </Card>
  );
};

export default UpcomingEvents;
