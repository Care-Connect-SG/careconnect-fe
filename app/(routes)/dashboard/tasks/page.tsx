"use client";

import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";

import { getTasks } from "@/app/api/task";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Task } from "@/types/task";

import TaskKanbanView from "./_components/task-kanban";
import TaskListView from "./_components/task-list";
import { TaskViewToggle } from "./_components/task-viewtoggle";

const TaskManagement = () => {
  const [currentView, setCurrentView] = useState<"list" | "kanban">("list");
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data: Task[] = await getTasks();
        setTasks(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

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
      {loading ? (
        <div className="p-8">
          <Spinner />
        </div>
      ) : currentView === "list" ? (
        <TaskListView tasks={tasks} />
      ) : (
        <TaskKanbanView tasks={tasks} />
      )}
    </div>
  );
};

export default TaskManagement;
