"use client";

import React from "react";
import { useState } from "react";
import ActivityList from "./_components/activity-list";
import CalendarHeader from "./_components/calendar-header";
import CalendarTable from "./_components/calendar-table";
import { ActivityProvider } from "@/context/activity-context";

const CalendarManagementPage = () => {
  const [view, setView] = useState<"calendar" | "list">("list");

  return (
    <ActivityProvider>
      <div className="flex-1 p-8">
        <CalendarHeader view={view} setView={setView} />
        {view === "calendar" ? <CalendarTable /> : <ActivityList />}
      </div>
    </ActivityProvider>
  );
};

export default CalendarManagementPage;
