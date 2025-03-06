"use client";

import { format } from "date-fns";
import { Plus, X } from "lucide-react";
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

import TaskKanbanView from "./_components/task-kanban";
import TaskListView from "./_components/task-list";
import { TaskViewToggle } from "./_components/task-viewtoggle";

const TaskManagement = () => {
  const [currentView, setCurrentView] = useState<"list" | "kanban">("list");
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [date, setDate] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    status: undefined as string | undefined,
    priority: undefined as string | undefined,
  });

  useEffect(() => {
    const todayFormatted = format(new Date(), "EEEE, dd MMMM yyyy");
    setDate(todayFormatted);

    fetchTasks();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const filteredTasks = await getTasks(
        Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== undefined),
        ),
      );
      setTasks(filteredTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: undefined,
      priority: undefined,
    });
  };

  return (
    <div className="flex flex-col w-full gap-8 p-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-semibold text-gray-800">
              Task Management
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <TaskViewToggle view={currentView} onChange={setCurrentView} />
            <Button>
              <Plus className="w-4 h-4 mr-2" /> New Task
            </Button>
          </div>
        </div>
        <p className="text-md text-gray-500">{date}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 bg-gray-100 p-4 rounded-lg">
        {/* Search Bar */}
        <div className="relative w-full md:w-1/3">
          <Input
            type="text"
            placeholder="Search tasks..."
            className="pl-10"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status ?? ""} // ✅ Fix: Prevent undefined errors
          onValueChange={(value) => updateFilter("status", value || undefined)}
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

        {/* Priority Filter */}
        <Select
          value={filters.priority ?? ""} // ✅ Fix: Ensure value is never undefined
          onValueChange={(value) =>
            updateFilter("priority", value || undefined)
          }
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

        {/* Clear Filters Button */}
        <Button variant="outline" onClick={clearFilters}>
          <X className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
      </div>

      {/* Task List / Kanban View */}
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
