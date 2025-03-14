"use client";

import { addDays, format, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { getTasks } from "@/app/api/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Task } from "@/types/task";

import TaskForm from "./_components/task-form";
import TaskKanbanView from "./_components/task-kanban";
import TaskListView from "./_components/task-list";
import { TaskViewToggle } from "./_components/task-viewtoggle";

const TaskManagement = () => {
  const [currentView, setCurrentView] = useState<"list" | "kanban">("list");
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  // Store the date as a Date object.
  const [currentDate, setCurrentDate] = useState(new Date());

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
  });

  useEffect(() => {
    // Fetch tasks on initial load
    fetchTasks();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filters, currentDate]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const formattedDate = format(currentDate, "yyyy-MM-dd");
      const queryParams = {
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== undefined),
        ),
        date: formattedDate,
      };

      const filteredTasks = await getTasks(queryParams);
      setTasks(filteredTasks);
    } catch (err) {
      console.error("TaskManagement - Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      priority: "",
    });
  };

  return (
    <div className="flex flex-col w-full gap-8 p-8">
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-semibold text-gray-800">
              Task Management
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <TaskViewToggle view={currentView} onChange={setCurrentView} />
            <TaskForm />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex flex-row space-x-5 items-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="px-1.5 py-1"
              onClick={() => setCurrentDate(subDays(currentDate, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="px-1.5 py-1"
              onClick={() => setCurrentDate(addDays(currentDate, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-md text-gray-500">
            {format(currentDate, "EEEE, dd MMMM yyyy")}
          </p>
        </div>
        <div className="flex flex-row gap-4 rounded-lg items-center">
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search tasks..."
              className="pl-10"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
          </div>

          <Select
            value={filters.status ?? ""}
            onValueChange={(value) => updateFilter("status", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Assigned">Assigned</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Delayed">Delayed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority ?? ""}
            onValueChange={(value) => updateFilter("priority", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={clearFilters}
            disabled={!filters.search && !filters.status && !filters.priority}
          >
            <X className="w-4 h-4 mr-2" />
            Clear
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
