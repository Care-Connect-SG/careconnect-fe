"use client";

import { completeTask, reopenTask } from "@/app/api/task";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toTitleCase } from "@/lib/utils";
import { Task, TaskStatus } from "@/types/task";
import { CheckCircle, Circle, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import TaskForm from "./task-form";

export default function TaskListView({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleTaskUpdate = (
    updater: Task | ((prevTasks: Task[]) => Task[]),
  ) => {
    console.log("handleTaskUpdate called with:", updater);
    if (typeof updater === "function") {
      console.log("Updater is a function, calling it with current taskList");
      setTaskList(updater);
    } else {
      console.log(
        "Updater is a task object, updating task with ID:",
        updater.id,
      );
      setTaskList((prevTasks) => {
        const newTasks = prevTasks.map((task) =>
          task.id === updater.id ? updater : task,
        );
        console.log("New taskList after update:", newTasks);
        return newTasks;
      });
    }
    console.log("Closing edit dialog");
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

  if (!taskList.length) {
    return <p className="text-center text-gray-500 p-8">No available tasks</p>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Complete?
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Task
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Resident
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {taskList.map((task) => (
              <tr
                key={task.id}
                className="hover:bg-muted hover:duration-300 ease-in-out"
              >
                <td className="px-6 py-4">
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
                </td>

                {/* Task Details - Clicking the row navigates */}
                <td
                  className="px-6 py-4 font-medium text-gray-900"
                  onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                >
                  {task.task_title}
                </td>
                <td
                  className="px-6 py-4 text-gray-900"
                  onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                >
                  {toTitleCase(task.resident_name) || "N/A"}
                </td>
                <td
                  className="px-6 py-4 text-gray-900"
                  onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                >
                  {toTitleCase(task.assigned_to_name) || "Unassigned"}
                </td>
                <td className="px-6 py-4">
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
                </td>

                <td className="px-6 py-4">
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
                </td>
                <td className="px-6 py-4 flex space-x-2">
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
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDeleteDialog(true);
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialog
                    open={openDeleteDialog}
                    onOpenChange={setOpenDeleteDialog}
                  >
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Task</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this task?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            try {
                              await deleteTask(task.id);
                              window.location.reload();
                            } catch (error) {
                              alert("Failed to delete task");
                            }
                          }}
                        >
                          Confirm Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Task Form for Editing */}
      {editingTask && (
        <TaskForm
          task={editingTask}
          onClose={() => setEditingTask(null)}
          setTasks={handleTaskUpdate}
        />
      )}
    </div>
  );
}
