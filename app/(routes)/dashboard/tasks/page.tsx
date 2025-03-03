"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import TaskKanbanView from "./_components/task-kanban";
import TaskListView from "./_components/task-list";
import { TaskViewToggle } from "./_components/task-viewtoggle";

const TaskManagement = () => {
  const [currentView, setCurrentView] = useState<"list" | "kanban">("list");

  return (
    <div className="flex flex-col w-full gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Task Management
        </h1>
        <div className="flex items-center space-x-4">
          <TaskViewToggle view={currentView} onChange={setCurrentView} />
          <Button>
            <Plus className="w-4 h-4 mr-2" /> New Task
          </Button>
        </div>
      </div>
      {currentView === "list" ? <TaskListView /> : <TaskKanbanView />}
    </div>
  );
};

export default TaskManagement;
