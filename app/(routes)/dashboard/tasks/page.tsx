"use client";

import { addDays, format, parse, subDays } from "date-fns";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getTasks } from "@/app/api/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Task } from "@/types/task";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import TaskForm from "./_components/task-form";
import TaskKanbanView from "./_components/task-kanban";
import TaskListView from "./_components/task-list";
import { TaskViewToggle } from "./_components/task-viewtoggle";

const TaskManagement = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [currentView, setCurrentView] = useState<"list" | "kanban">("list");
  const [selectedNurses, setSelectedNurses] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState(true);

  const initDate = () => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      try {
        return parse(dateParam, "yyyy-MM-dd", new Date());
      } catch (e) {
        console.error("Invalid date in URL, defaulting to today");
        return new Date();
      }
    }
    return new Date();
  };

  const [selectedDate, setSelectedDate] = useState(initDate);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    date: format(initDate(), "yyyy-MM-dd"),
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const open = searchParams.get("open");
    if (open === "true") {
      setIsOpen(true);

      const params = new URLSearchParams(Array.from(searchParams.entries()));

      params.delete("open");

      const queryString = params.toString();
      const newPath = queryString ? `${pathname}?${queryString}` : pathname;

      router.replace(newPath, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  const {
    data: allTasks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "tasks",
      filters.search,
      filters.status,
      filters.priority,
      format(selectedDate, "yyyy-MM-dd"),
    ],
    queryFn: () => {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const queryParams: Record<string, string> = {
        date: formattedDate,
      };

      if (filters.search) queryParams.search = filters.search;
      if (filters.status) queryParams.status = filters.status;
      if (filters.priority) queryParams.priority = filters.priority;

      return getTasks(queryParams);
    },
    enabled: true,
  });

  const uniqueNurseIds = useMemo(() => {
    if (!allTasks || allTasks.length === 0) return [];
    return Array.from(
      new Set(
        allTasks
          .filter((task) => task.assigned_to)
          .map((task) => task.assigned_to),
      ),
    );
  }, [allTasks]);

  useEffect(() => {
    if (
      uniqueNurseIds.length > 0 &&
      selectedNurses.length === 0 &&
      allSelected
    ) {
      setSelectedNurses(uniqueNurseIds);
    }
  }, [uniqueNurseIds, selectedNurses.length, allSelected]);

  const filteredTasks = useMemo(() => {
    if (!allTasks || allTasks.length === 0) return [];

    if (selectedNurses.length === 0) {
      return [];
    }

    return allTasks.filter(
      (task) => task.assigned_to && selectedNurses.includes(task.assigned_to),
    );
  }, [allTasks, selectedNurses]);

  const uniqueNurses = useMemo(() => {
    return allTasks
      ? Array.from(
          new Map(
            allTasks
              .filter((task) => task.assigned_to && task.assigned_to_name)
              .map((task) => [task.assigned_to, task.assigned_to_name]),
          ),
        )
      : [];
  }, [allTasks]);

  const handleToggleNurse = (nurseId: string) => {
    setSelectedNurses((prev) => {
      if (prev.includes(nurseId)) {
        const newSelection = prev.filter((id) => id !== nurseId);
        setAllSelected(false);
        return newSelection;
      } else {
        const newSelection = [...prev, nurseId];
        setAllSelected(newSelection.length === uniqueNurses.length);
        return newSelection;
      }
    });
  };

  const handleToggleAllNurses = () => {
    if (allSelected) {
      setSelectedNurses([]);
      setAllSelected(false);
    } else {
      setSelectedNurses(uniqueNurses.map(([id]) => id));
      setAllSelected(true);
    }
  };

  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: Task) => {},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Failed to update task", error);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Failed to delete task", error);
    },
  });

  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    const newDate = format(selectedDate, "yyyy-MM-dd");

    if (current.get("date") !== newDate) {
      current.set("date", newDate);
      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.push(`${pathname}${query}`, { scroll: false });
    }
  }, [selectedDate, router, searchParams, pathname]);

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      priority: "",
      date: format(selectedDate, "yyyy-MM-dd"),
    });
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate =
      direction === "prev"
        ? subDays(selectedDate, 1)
        : addDays(selectedDate, 1);

    setSelectedDate(newDate);
    updateFilter("date", format(newDate, "yyyy-MM-dd"));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem("taskView") as "list" | "kanban";
      if (savedView) {
        setCurrentView(savedView);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("taskView", currentView);
    }
  }, [currentView]);

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
            <TaskViewToggle
              view={currentView}
              onChange={(view) => setCurrentView(view)}
            />
            <TaskForm open={isOpen} onClose={() => setIsOpen(false)} />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex flex-row space-x-5 items-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="px-1.5 py-1"
              onClick={() => navigateDate("prev")}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="px-1.5 py-1"
              onClick={() => navigateDate("next")}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-md text-gray-500">
            {format(selectedDate, "EEEE, dd MMMM yyyy")}
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

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {selectedNurses.length === 0
                  ? "No Nurses"
                  : allSelected
                    ? "All Nurses"
                    : `${selectedNurses.length} nurse${
                        selectedNurses.length > 1 ? "s" : ""
                      }`}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2">
              <div className="max-h-60 overflow-auto">
                {uniqueNurses.length > 0 && (
                  <div
                    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 rounded-md mb-1 border-b"
                    onClick={handleToggleAllNurses}
                  >
                    <div
                      className={`w-5 h-5 border rounded-md flex items-center justify-center ${
                        allSelected ? "bg-blue-500" : "bg-white"
                      }`}
                    >
                      {allSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-sm font-medium">Toggle All</span>
                  </div>
                )}

                {uniqueNurses.length > 0 ? (
                  uniqueNurses.map(([nurseId, nurseName], index) => (
                    <div
                      key={nurseId || index}
                      className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 rounded-md"
                      onClick={() => handleToggleNurse(nurseId)}
                    >
                      <div
                        className={`w-5 h-5 border rounded-md flex items-center justify-center ${
                          selectedNurses.includes(nurseId)
                            ? "bg-blue-500"
                            : "bg-white"
                        }`}
                      >
                        {selectedNurses.includes(nurseId) && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="text-sm">{nurseName}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">
                    No nurses found
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="transparentHover"
            onClick={clearFilters}
            disabled={!filters.search && !filters.status && !filters.priority}
            className="px-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8">
          <Spinner />
        </div>
      ) : error ? (
        <div className="text-red-500">Error loading tasks: {error.message}</div>
      ) : currentView === "list" ? (
        <TaskListView tasks={filteredTasks} />
      ) : (
        <TaskKanbanView tasks={filteredTasks} />
      )}
    </div>
  );
};

export default TaskManagement;
