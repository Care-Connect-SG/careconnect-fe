"use client";

import {
  completeTask,
  downloadTask,
  duplicateTask,
  reopenTask,
} from "@/app/api/task";
import { deleteTask } from "@/app/api/task";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { toTitleCase } from "@/lib/utils";
import { Task, TaskStatus } from "@/types/task";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle,
  Circle,
  Copy,
  Download,
  Edit,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import TaskForm from "./task-form";

export default function TaskListView({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Task | null;
    direction: "asc" | "desc" | null;
  }>({ key: null, direction: null });

  const handleTaskUpdate = (
    updater: Task | ((prevTasks: Task[]) => Task[]),
  ) => {
    if (typeof updater === "function") {
      setTaskList(updater);
    } else {
      setTaskList((prevTasks) => {
        const newTasks = prevTasks.map((task) =>
          task.id === updater.id ? updater : task,
        );

        return newTasks;
      });
    }

    setEditingTask(null);
  };

  const handleToggleTaskCompletion = async () => {
    if (!selectedTask) return;

    try {
      const updatedTask =
        selectedTask.status === TaskStatus.COMPLETED
          ? await reopenTask(selectedTask.id)
          : await completeTask(selectedTask.id);

      setTaskList((prevTasks) =>
        prevTasks.map((task) =>
          task.id === selectedTask.id
            ? { ...task, status: updatedTask.status }
            : task,
        ),
      );
    } catch (error) {
      console.error("Error toggling task status:", error);
    }
    setSelectedTask(null);
  };

  const handleDuplicate = async (task: Task) => {
    try {
      const duplicatedTask = await duplicateTask(task.id);
      setTaskList((prev) => [...prev, duplicatedTask]);
      toast({
        title: "Task Duplicated",
        description: "The task has been successfully duplicated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to duplicate the task.",
      });
    }
  };

  const handleDownload = async (task: Task) => {
    try {
      const blob = await downloadTask(task.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `task-${task.id}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Task Downloaded",
        description: "The task has been successfully downloaded.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download the task.",
      });
    }
  };

  const handleDeleteTask = async (
    task: Task,
    deleteSeries: boolean = false,
  ) => {
    try {
      await deleteTask(task.id, deleteSeries);
      setTaskList((prevTasks) =>
        deleteSeries
          ? prevTasks.filter((t) => !t.recurring || t.id !== task.id)
          : prevTasks.filter((t) => t.id !== task.id),
      );
      toast({
        title: "Task Deleted",
        description: `The task has been successfully deleted${
          deleteSeries ? " along with its series" : ""
        }`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete task",
      });
    } finally {
      setOpenDeleteDialog(false);
      setTaskToDelete(null);
    }
  };

  const handleSort = (key: keyof Task) => {
    let direction: "asc" | "desc" = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });

    const sortedTasks = [...taskList].sort((a, b) => {
      if (key === "due_date") {
        return direction === "asc"
          ? new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          : new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
      }

      if (key === "priority") {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        const aPriority = a.priority as keyof typeof priorityOrder;
        const bPriority = b.priority as keyof typeof priorityOrder;
        return direction === "asc"
          ? (priorityOrder[aPriority] || 0) - (priorityOrder[bPriority] || 0)
          : (priorityOrder[bPriority] || 0) - (priorityOrder[aPriority] || 0);
      }

      if (key === "status") {
        const statusOrder = {
          [TaskStatus.ASSIGNED]: 1,
          [TaskStatus.COMPLETED]: 2,
          [TaskStatus.DELAYED]: 3,
          [TaskStatus.REQUEST_REASSIGNMENT]: 4,
        };
        return direction === "asc"
          ? statusOrder[a.status] - statusOrder[b.status]
          : statusOrder[b.status] - statusOrder[a.status];
      }

      const aValue = a[key];
      const bValue = b[key];

      if (aValue === undefined || bValue === undefined) return 0;

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setTaskList(sortedTasks);
  };

  const getSortIcon = (key: keyof Task | null) => {
    if (!key) return <ArrowUpDown className="h-4 w-4" />;
    if (sortConfig.key !== key) return <ArrowUpDown className="h-4 w-4" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const getSortLabel = (key: keyof Task) => {
    switch (key) {
      case "due_date":
        return "Due Date";
      case "priority":
        return "Priority";
      case "status":
        return "Status";
      default:
        return key;
    }
  };

  if (!taskList.length) {
    return <p className="text-center text-gray-500 p-8">No available tasks</p>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {sortConfig.key
                    ? getSortLabel(sortConfig.key)
                    : "Select field"}
                  {getSortIcon(sortConfig.key)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleSort("due_date")}>
                  Due Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("priority")}>
                  Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("status")}>
                  Status
                </DropdownMenuItem>
                {sortConfig.key && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        setSortConfig({ key: null, direction: null })
                      }
                      className="text-red-600"
                    >
                      Clear sorting
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Complete?
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Task
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Resident
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Assigned To
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Priority
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Due Date
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-200">
            {taskList.map((task) => (
              <TableRow
                key={task.id}
                className="hover:bg-muted hover:duration-300 ease-in-out"
              >
                <TableCell className="px-6 py-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-2 hover:bg-transparent z-1 hover:text--600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task);
                        }}
                      >
                        {task.status === TaskStatus.COMPLETED ? (
                          <CheckCircle className="text-green-500" />
                        ) : (
                          <Circle className="text-gray-400" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {task.status === TaskStatus.COMPLETED
                            ? "Mark Task as Incomplete"
                            : "Complete Task"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {task.status === TaskStatus.COMPLETED
                            ? "Are you sure you want to mark this task as incomplete?"
                            : "Are you sure you want to mark this task as completed?"}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleToggleTaskCompletion}>
                          {task.status === TaskStatus.COMPLETED
                            ? "Mark as Incomplete"
                            : "Confirm Completion"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>

                <TableCell
                  className="px-6 py-4 font-medium text-gray-900"
                  onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                >
                  {task.task_title}
                </TableCell>
                <TableCell
                  className="px-6 py-4 text-gray-900"
                  onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                >
                  {toTitleCase(task.resident_name) || "N/A"}
                </TableCell>
                <TableCell
                  className="px-6 py-4 text-gray-900"
                  onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                >
                  {toTitleCase(task.assigned_to_name) || "Unassigned"}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === "High"
                        ? "bg-red-100 text-red-800"
                        : task.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {task.priority || "Low"}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      task.status === "Assigned"
                        ? "bg-blue-100 text-blue-800"
                        : task.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : task.status === "Delayed"
                            ? "bg-red-100 text-red-800"
                            : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {task.status}
                  </span>
                </TableCell>
                <TableCell
                  className="px-6 py-4 text-gray-900"
                  onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                >
                  {new Date(task.due_date).toLocaleDateString()}
                </TableCell>
                <TableCell className="px-6 py-4 flex space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTask(task);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(task);
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(task);
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTaskToDelete(task);
                          setOpenDeleteDialog(true);
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingTask && (
        <TaskForm
          task={editingTask}
          onClose={() => setEditingTask(null)}
          setTasks={handleTaskUpdate}
        />
      )}

      <AlertDialog
        open={openDeleteDialog && taskToDelete !== null}
        onOpenChange={(open) => {
          setOpenDeleteDialog(open);
          if (!open) setTaskToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              {taskToDelete?.recurring
                ? "This is a recurring task. Would you like to delete just this task or all tasks in the series?"
                : "Are you sure you want to delete this task?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {taskToDelete?.recurring ? (
              <>
                <Button
                  variant="destructive"
                  onClick={() =>
                    taskToDelete && handleDeleteTask(taskToDelete, false)
                  }
                >
                  Delete This Task
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    taskToDelete && handleDeleteTask(taskToDelete, true)
                  }
                >
                  Delete Entire Series
                </Button>
              </>
            ) : (
              <AlertDialogAction
                onClick={() => taskToDelete && handleDeleteTask(taskToDelete)}
              >
                Confirm Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
