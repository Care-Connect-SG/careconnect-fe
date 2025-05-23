"use client";

import { TaskReassignmentActions } from "@/app/(routes)/dashboard/tasks/[taskDetails]/_components/task-reassignment-actions";
import { TaskReassignmentForm } from "@/app/(routes)/dashboard/tasks/[taskDetails]/_components/task-reassignment-form";
import { getResidents } from "@/app/api/resident";
import { deleteTask, downloadTask, duplicateTask } from "@/app/api/task";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { toTitleCase } from "@/lib/utils";
import { ResidentRecord } from "@/types/resident";
import { Task, TaskStatus } from "@/types/task";
import { useQueryClient } from "@tanstack/react-query";
import { Clock, Copy, Download, Plus, Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, Dispatch, SetStateAction } from "react";
import TaskForm from "./task-form";

const TaskCard = ({
  task,
  setTasks,
}: {
  task: Task;
  setTasks: Dispatch<SetStateAction<Task[]>>;
}) => {
  const { toast } = useToast();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const handleDuplicate = async () => {
    try {
      const duplicatedTask = await duplicateTask(task.id);
      setTasks((prev) => [...prev, duplicatedTask]);
      toast({
        title: "Task Duplicated",
        description: "The task has been successfully duplicated.",
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to duplicate the task.",
      });
    }
  };

  const handleDownload = async () => {
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

  const handleDeleteTask = async (deleteSeries: boolean = false) => {
    try {
      await deleteTask(task.id, deleteSeries);
      setTasks((prevTasks) =>
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
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete task",
      });
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 mb-3 hover:bg-blue-50 transition-all"
      onClick={(e) => {
        if (
          e.target === e.currentTarget ||
          (e.target instanceof Element &&
            e.currentTarget.contains(e.target) &&
            !e.target.closest('button, [role="button"], a, select, input'))
        ) {
          router.push(`/dashboard/tasks/${task.id}`);
        }
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-sm font-medium text-gray-900">
            {task.task_title}
          </h4>
          <p className="text-xs text-gray-500">{task.category}</p>
        </div>
        <div className="flex space-x-1">
          {task.status === TaskStatus.REASSIGNMENT_REQUESTED &&
            task.reassignment_requested_to &&
            session?.user?.id &&
            task.reassignment_requested_to === session.user.id &&
            task.assigned_to_name &&
            task.reassignment_requested_by_name && (
              <div onClick={(e) => e.stopPropagation()}>
                <TaskReassignmentActions
                  taskId={task.id}
                  taskTitle={task.task_title}
                  currentNurseId={task.assigned_to}
                  currentNurseName={task.assigned_to_name}
                  requestingNurseName={task.reassignment_requested_by_name}
                  status={task.status}
                />
              </div>
            )}
          {(task.status === TaskStatus.ASSIGNED ||
            task.status === TaskStatus.DELAYED ||
            task.status === TaskStatus.REASSIGNMENT_REJECTED) &&
            task.assigned_to &&
            session?.user?.id &&
            task.assigned_to === session.user.id && (
              <div onClick={(e) => e.stopPropagation()}>
                <TaskReassignmentForm
                  taskId={task.id}
                  currentNurseId={task.assigned_to}
                  currentNurseName={task.assigned_to_name || ""}
                  type="icon"
                />
              </div>
            )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicate();
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              setOpenDeleteDialog(true);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        </div>
        {task.priority && (
          <span
            className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(
              task.priority,
            )}`}
          >
            {task.priority}
          </span>
        )}
      </div>

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              {task.recurring
                ? "This is a recurring task. Would you like to delete just this task or all tasks in the series?"
                : "Are you sure you want to delete this task?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {task.recurring ? (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteTask(false)}
                >
                  Delete This Task
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteTask(true)}
                >
                  Delete Entire Series
                </Button>
              </>
            ) : (
              <AlertDialogAction onClick={() => handleDeleteTask()}>
                Confirm Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const ResidentRow = ({
  resident,
  tasks,
  setTasks,
}: {
  resident: ResidentRecord;
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
}) => {
  const residentTasks = tasks.filter((task) => task.resident === resident.id);
  const [showTaskForm, setShowTaskForm] = useState(false);

  return (
    <div className="flex-1 w-[calc(33.333% - 1rem)] bg-slate-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 rounded-lg cursor-pointer flex-shrink-0">
            <AvatarImage src={resident.photograph!} alt={resident.full_name} />
            <AvatarFallback className="rounded-lg text-sm">
              {resident.full_name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {toTitleCase(resident.full_name)}
            </h3>
            <p className="text-xs text-gray-500">Room {resident.room_number}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowTaskForm(true)}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-3">
        {residentTasks.map((task) => (
          <TaskCard key={task.id} task={task} setTasks={setTasks} />
        ))}
      </div>
      {showTaskForm && (
        <TaskForm
          onClose={() => {
            setShowTaskForm(false);
          }}
          setTasks={(updater) => {
            if (typeof updater === "function") {
              setTasks(updater);
            } else {
              setTasks((prevTasks) => [...prevTasks, updater]);
            }
          }}
          defaultResident={resident.id}
          open={showTaskForm}
        />
      )}
    </div>
  );
};

export default function TaskKanbanView({ tasks }: { tasks: Task[] }) {
  const { toast } = useToast();
  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [taskList, setTaskList] = useState<Task[]>(tasks);

  useEffect(() => {
    setTaskList(tasks);
  }, [tasks]);

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const data = await getResidents();
        setResidents(data);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch residents",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchResidents();
  }, []);

  if (loading)
    return (
      <div className="p-8">
        <Spinner />
      </div>
    );

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tasks found for the selected date
      </div>
    );
  }

  const residentRows = [];
  for (let i = 0; i < residents.length; i += 3) {
    residentRows.push(residents.slice(i, i + 3));
  }

  return (
    <div className="flex-1 pt-0">
      <div className="flex flex-col gap-4">
        {residentRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {row.map((resident) => (
              <ResidentRow
                key={resident.id}
                resident={resident}
                tasks={taskList}
                setTasks={setTaskList}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
