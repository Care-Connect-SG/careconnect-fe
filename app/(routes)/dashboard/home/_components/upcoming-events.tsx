"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, MapPin, MoreHorizontal, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Activity } from "@/types/activity";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

const UpcomingEvents = () => {
  const router = useRouter();
  const [events, setEvents] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BE_API_URL}/activities`);
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

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
      </div>
    </Card>
  );
};

export default UpcomingEvents;
