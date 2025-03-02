"use client";

import React, { useState } from "react";
import TasksPage from "./TasksPage";
import ResidentKanbanView from "./ResidentKanbanView";
import { ViewToggle } from "./ViewToggle";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const TaskManagement = () => {
  const [currentView, setCurrentView] = useState<"list" | "kanban">("list");

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar /> {/* Sidebar Navigation */}

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 w-full">
          <main className="flex-1 overflow-auto w-full bg-gray-50">
            <div className="p-8 pb-0">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-semibold text-gray-800">Task Management</h1>
                <ViewToggle view={currentView} onChange={setCurrentView} />
              </div>
            </div>
            {currentView === "list" ? <TasksPage /> : <ResidentKanbanView />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default TaskManagement;
