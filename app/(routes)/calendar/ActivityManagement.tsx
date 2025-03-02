import React, { useState } from "react";
import {
  Calendar,
  ChevronRight,
  Grid,
  List,
  Filter,
  Plus,
  MoreHorizontal,
  Users,
  Clock,
  MapPin,
  ChevronDown,
  Search,
} from "lucide-react";
interface HeaderProps {
  view: "calendar" | "list";
  setView: (view: "calendar" | "list") => void;
}
const Breadcrumb = () => (
  <div className="flex items-center text-sm text-gray-600 mb-6">
    <a href="#" className="hover:text-blue-600">
      Dashboard
    </a>
    <ChevronRight className="w-4 h-4 mx-2" />
    <a href="#" className="hover:text-blue-600">
      Calendar Management
    </a>
    <ChevronRight className="w-4 h-4 mx-2" />
    <span className="text-gray-800">Activities</span>
  </div>
);
const Header = ({ view, setView }: HeaderProps) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Activity Management
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage and schedule activities for residents
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setView("calendar")}
            className={`px-4 py-2 rounded-md flex items-center ${view === "calendar" ? "bg-white text-gray-700 shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 rounded-md flex items-center ${view === "list" ? "bg-white text-gray-700 shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <List className="w-4 h-4 mr-2" />
            List
          </button>
        </div>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          New Activity
        </button>
      </div>
    </div>
    <div className="mt-6 flex items-center space-x-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search activities..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center">
        <Filter className="w-4 h-4 mr-2" />
        Filters
      </button>
    </div>
  </div>
);
const CalendarView = () => (
  <div className="bg-white border border-gray-200 rounded-lg">
    <div className="grid grid-cols-7 gap-px bg-gray-200">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div
          key={day}
          className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-500"
        >
          {day}
        </div>
      ))}
      {Array.from({
        length: 35,
      }).map((_, i) => (
        <div key={i} className="bg-white min-h-[120px] p-2">
          <div className="text-sm text-gray-400 mb-2">{i + 1}</div>
          {i === 15 && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 mb-2">
              <div className="text-sm font-medium text-blue-700">
                Group Activity
              </div>
              <div className="flex items-center text-xs text-blue-600 mt-1">
                <Clock className="w-3 h-3 mr-1" />
                10:00 AM
              </div>
              <div className="flex items-center text-xs text-blue-600 mt-1">
                <Users className="w-3 h-3 mr-1" />
                12 participants
              </div>
            </div>
          )}
          {i === 16 && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-2">
              <div className="text-sm font-medium text-green-700">
                Physical Therapy
              </div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <Clock className="w-3 h-3 mr-1" />
                2:30 PM
              </div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                Room 203
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);
const ListView = () => {
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
          <button className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Sort by Date</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Filter by Type</span>
            <ChevronDown className="w-4 h-4" />
          </button>
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
                    className={`px-2 py-1 text-xs rounded-full ${item.type === "Event" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
                  >
                    {item.type}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${item.status === "Upcoming" ? "bg-yellow-100 text-yellow-800" : item.status === "In Progress" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
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
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Edit
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export const ActivityManagement = () => {
  const [view, setView] = useState<"calendar" | "list">("list");
  return (
    <div className="flex-1 bg-gray-50 p-8">
      <Breadcrumb />
      <Header view={view} setView={setView} />
      {view === "calendar" ? <CalendarView /> : <ListView />}
    </div>
  );
};
