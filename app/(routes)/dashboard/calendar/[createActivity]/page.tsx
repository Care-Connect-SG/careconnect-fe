"use client";

import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Plus,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useBreadcrumb } from "../../../../../context/breadcrumb-context";

const ActivityForm = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="space-y-6">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Activity Name
          </Label>
          <Input
            type="text"
            placeholder="Enter activity name"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Activity Type
          </Label>
          <Select>
            <SelectTrigger className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Select type...</SelectItem>
              <SelectItem value="group">Group Activity</SelectItem>
              <SelectItem value="therapy">Therapy Session</SelectItem>
              <SelectItem value="social">Social Event</SelectItem>
              <SelectItem value="medical">Medical Appointment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="date"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="time"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Enter location"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ParticipantSelector = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Participants</h3>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search residents..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <Button className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center">
        <Plus className="w-4 h-4 mr-2" />
        Add More Participants
      </Button>
    </div>
  );
};

const ReminderSettings = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reminders</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-700">Notification</span>
          </div>
          <Select>
            <SelectTrigger className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="15 minutes before" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes before</SelectItem>
              <SelectItem value="30">30 minutes before</SelectItem>
              <SelectItem value="60">1 hour before</SelectItem>
              <SelectItem value="1440">1 day before</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

const CreateActivity = () => {
  const { setPageName } = useBreadcrumb();
  const { push } = useRouter();

  useEffect(() => {
    setPageName("New Activity");
  }, [setPageName]);

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <Breadcrumb />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Create New Activity
        </h1>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => push("/dashboard/activity-management")}
          >
            Cancel
          </Button>
          <Button variant="default" className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Create Activity
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <ActivityForm />
        </div>
        <div className="col-span-1 space-y-6">
          <ParticipantSelector />
          <ReminderSettings />
        </div>
      </div>
    </div>
  );
};

export default CreateActivity;
