"use client";

import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ActivityManagement } from "./ActivityManagement";

const ActivityManagementPage = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar /> {/* Sidebar Navigation */}

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 w-full">
          <main className="flex-1 overflow-auto w-full bg-gray-50">
            <ActivityManagement />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ActivityManagementPage;
