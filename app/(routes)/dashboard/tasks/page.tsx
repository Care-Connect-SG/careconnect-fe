"use client";

import React, { useState } from "react";
import TaskKanbanView from "./_components/task-kanban";
import TaskListView from "./_components/task-list";
import { TaskViewToggle } from "./_components/task-viewtoggle";

const TaskManagement = () => {
  const [currentView, setCurrentView] = useState<"list" | "kanban">("list");

  return (
    <div className="flex flex-col flex-1 w-full">
      <main className="flex-1 overflow-auto w-full bg-gray-50">
        <div className="p-8 pb-0">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-gray-800">
              Task Management
            </h1>
            <TaskViewToggle view={currentView} onChange={setCurrentView} />
          </div>
        </div>
        {currentView === "list" ? <TaskListView /> : <TaskKanbanView />}
      </main>
    </div>
  );
};

export default TaskManagement;
