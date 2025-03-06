"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Clock,
  MapPin,
  MoreHorizontal,
  Users,
} from "lucide-react";

const ActivityList = () => {
  const activities = [
    {
      activity: "Group Exercise",
      type: "Event",
      datetime: "2024-02-15 10:00 AM",
      participants: 12,
      status: "Upcoming",
      location: "Activity Room",
      facilitator: "Sarah Johnson",
      description: "Morning exercise session focusing on mobility and strength",
    },
    {
      activity: "Physical Therapy",
      type: "Task",
      datetime: "2024-02-15 2:30 PM",
      participants: 1,
      status: "In Progress",
      location: "Room 203",
      facilitator: "Mike Wilson",
      description: "Individual therapy session for post-surgery recovery",
    },
    {
      activity: "Art Class",
      type: "Event",
      datetime: "2024-02-15 3:00 PM",
      participants: 8,
      status: "Upcoming",
      location: "Craft Room",
      facilitator: "Emily Brown",
      description: "Watercolor painting session for beginners",
    },
    {
      activity: "Music Therapy",
      type: "Event",
      datetime: "2024-02-15 4:00 PM",
      participants: 15,
      status: "Scheduled",
      location: "Common Room",
      facilitator: "David Lee",
      description: "Group music session with singing and instruments",
    },
  ];
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button className="bg-transparent hover:bg-transparent flex items-center space-x-2 text-sm text-gray-600">
            <span>Sort by Date</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button className="bg-transparent hover:bg-transparent flex items-center space-x-2 text-sm text-gray-600">
            <span>Filter by Type</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
        <span className="text-sm text-gray-500">
          {activities.length} activities
        </span>
      </div>
      <div className="divide-y divide-gray-200">
        {activities.map((item, i) => (
          <div key={i} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {item.activity}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      item.type === "Event"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {item.type}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      item.status === "Upcoming"
                        ? "bg-yellow-100 text-yellow-800"
                        : item.status === "In Progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {item.datetime}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {item.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {item.participants} participants
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button className="bg-transparent hover:bg-transparent text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Edit
                </Button>
                <Button className="bg-transparent hover:bg-transparent text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityList;
