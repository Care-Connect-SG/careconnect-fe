"use client";

import { TaskReassignmentActions } from "@/app/(routes)/dashboard/tasks/_components/TaskReassignmentActions";
import { TaskReassignmentForm } from "@/app/(routes)/dashboard/tasks/_components/TaskReassignmentForm";
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
  CheckCircle,
  Circle,
  Copy,
  Download,
  Edit,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import TaskForm from "./task-form";

export default function TaskListView({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

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

  if (!taskList.length) {
    return <p className="text-center text-gray-500 p-8">No available tasks</p>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                      {task.status === TaskStatus.ASSIGNED &&
                        task.assigned_to &&
                        session?.user?.id &&
                        task.assigned_to === session.user.id &&
                        task.assigned_to_name && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <TaskReassignmentForm
                              taskId={task.id}
                              currentNurseId={task.assigned_to}
                              currentNurseName={task.assigned_to_name}
                            />
                          </DropdownMenuItem>
                        )}
                      {task.status === TaskStatus.REASSIGNMENT_REQUESTED &&
                        task.reassignment_requested_to &&
                        session?.user?.id &&
                        task.reassignment_requested_to === session.user.id &&
                        task.assigned_to_name &&
                        task.reassignment_requested_by_name && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <TaskReassignmentActions
                              taskId={task.id}
                              taskTitle={task.task_title}
                              currentNurseId={task.assigned_to}
                              currentNurseName={task.assigned_to_name}
                              requestingNurseName={
                                task.reassignment_requested_by_name
                              }
                              status={task.status}
                            />
                          </DropdownMenuItem>
                        )}
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
                              setTaskList((prevTasks) =>
                                prevTasks.filter((t) => t.id !== task.id),
                              );
                              toast({
                                title: "Task Deleted",
                                description:
                                  "The task has been successfully deleted",
                              });
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
    </div>
  );
}
