"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Filter, List, Plus, Search } from "lucide-react";
import { ActivityDialog } from './activity-dialog';

interface HeaderProps {
  view: "calendar" | "list";
  setView: (view: "calendar" | "list") => void;
}

const CalendarHeader: React.FC<HeaderProps> = ({ view, setView }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Calendar and Activities Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage and schedule activities for residents
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <Button
              variant={view === 'calendar' ? 'default' : 'outline'}
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-md flex items-center focus:ring-0 focus:ring-offset-0 ${
                view === "calendar"
                  ? "bg-white text-gray-800 hover:bg-white"
                  : "bg-gray-200 text-gray-600 shadow-sm hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-md flex items-center focus:ring-0 focus:ring-offset-0 ${
                view === "list"
                  ? "bg-white text-gray-800 hover:bg-white"
                  : "bg-gray-200 text-gray-600 shadow-sm hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            New Activity
          </Button>
        </div>
      </div>
      <div className="mt-6 flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search activities..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button className="bg-white px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      <ActivityDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </div>
  );
};

export default CalendarHeader;
