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
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { ResidentRecord } from "@/types/resident";
import { Task, TaskStatus } from "@/types/task";
import { Clock, Copy, Download, Plus, Trash, User } from "lucide-react";
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
      className="bg-white rounded-lg border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow"
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
    <div className="flex-none w-96 bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {resident.full_name}
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
          onClose={() => setShowTaskForm(false)}
          setTasks={(updater) => {
            if (typeof updater === "function") {
              setTasks(updater);
            } else {
              setTasks((prev) => [...prev, updater]);
            }
            setShowTaskForm(false);
          }}
          defaultResident={resident.id}
          open={showTaskForm}
        />
      )}
    </div>
  );
};

export default function TaskKanbanView({ tasks }: { tasks: Task[] }) {
  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [taskList, setTaskList] = useState<Task[]>(tasks);

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const data = await getResidents();
        setResidents(data);
      } catch (err) {
        setError("Failed to fetch residents");
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
  if (error) return <p className="text-red-500">{error}</p>;

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
