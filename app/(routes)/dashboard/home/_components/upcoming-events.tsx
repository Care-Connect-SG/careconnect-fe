"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, MoreHorizontal, Users } from "lucide-react";

const UpcomingEvents = () => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-6">
      <p className="text-lg font-semibold text-gray-800">Upcoming Events</p>
      <Button variant="link" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
        View All
      </Button>
    </div>
    <div className="space-y-4">
      {[
        {
          title: "Morning Exercise",
          time: "Today, 10:00 AM",
          location: "Activity Room",
          participants: 12,
        },
        {
          title: "Art & Craft Workshop",
          time: "Today, 2:00 PM",
          location: "Craft Room",
          participants: 8,
        },
        {
          title: "Music Therapy",
          time: "Tomorrow, 11:00 AM",
          location: "Common Area",
          participants: 15,
        },
      ].map((event, i) => (
        <Card key={i} className="p-4 bg-gray-50 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">{event.title}</p>
            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {event.time}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {event.location}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {event.participants} participants
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </Card>
      ))}
    </div>
  </Card>
);

export default UpcomingEvents;
