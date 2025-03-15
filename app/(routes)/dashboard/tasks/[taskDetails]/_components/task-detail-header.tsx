"use client";

import { completeTask } from "@/app/api/task";
import { TaskReassignmentActions } from "@/components/tasks/TaskReassignmentActions";
import { TaskReassignmentForm } from "@/components/tasks/TaskReassignmentForm";
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
import { Spinner } from "@/components/ui/spinner";
import { convertUTCToLocal, formatDateWithoutSeconds } from "@/lib/utils";
import { Task, TaskStatus } from "@/types/task";
import { CheckCircle, Clock, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface TaskDetailHeaderProps {
  task: Task;
}

const getStatusClasses = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.COMPLETED:
      return "bg-green-100 text-green-800";
    case TaskStatus.DELAYED:
      return "bg-red-100 text-red-800";
    case TaskStatus.REQUEST_REASSIGNMENT:
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const TaskDetailHeader = ({ task }: TaskDetailHeaderProps) => {
  const { data: session, status: sessionStatus } = useSession();
  const userId = session?.user?.id;

  const localDueDate = useMemo(
    () => (task.due_date ? convertUTCToLocal(task.due_date) : null),
    [task.due_date],
  );
  const localFinishedAt = useMemo(
    () => (task.finished_at ? convertUTCToLocal(task.finished_at) : null),
    [task.finished_at],
  );

  const [taskStatus, setTaskStatus] = useState<TaskStatus>(task.status);
  const [finishedAt, setFinishedAt] = useState<Date | null>(localFinishedAt);

  const isDelayed = useMemo(
    () => (finishedAt && localDueDate ? finishedAt > localDueDate : false),
    [finishedAt, localDueDate],
  );
  const finishedAtFormatted = useMemo(
    () => (finishedAt ? formatDateWithoutSeconds(finishedAt) : ""),
    [finishedAt],
  );

  const markTaskCompleted = useCallback(async () => {
    try {
      await completeTask(task.id);
      const now = new Date();
      setFinishedAt(now);
      setTaskStatus(TaskStatus.COMPLETED);
    } catch (error) {
      console.error("Error marking task as completed", error);
    }
  }, [task.id]);

  const showReassignmentForm = useMemo(() => {
    return (
      sessionStatus === "authenticated" &&
      taskStatus === TaskStatus.ASSIGNED &&
      task.assigned_to &&
      userId &&
      task.assigned_to === userId
    );
  }, [sessionStatus, taskStatus, task.assigned_to, userId]);

  const showReassignmentActions = useMemo(() => {
    return (
      sessionStatus === "authenticated" &&
      taskStatus === TaskStatus.REASSIGNMENT_REQUESTED &&
      task.reassignment_requested_to &&
      userId &&
      task.reassignment_requested_to === userId
    );
  }, [sessionStatus, taskStatus, task.reassignment_requested_to, userId]);

  if (process.env.NODE_ENV !== "production") {
    useEffect(() => {
      console.log("Session Status:", sessionStatus);
      console.log("Task Status:", taskStatus);
      console.log("Task Assigned To:", task.assigned_to);
      console.log("Session User ID:", userId);
      console.log("Show Reassignment Form:", showReassignmentForm);
      console.log("Conditions:", {
        isAuthenticated: sessionStatus === "authenticated",
        isAssigned: taskStatus === TaskStatus.ASSIGNED,
        hasAssignedTo: Boolean(task.assigned_to),
        hasSessionUser: Boolean(userId),
        isAssignedToCurrentUser: task.assigned_to === userId,
      });
    }, [
      sessionStatus,
      taskStatus,
      task.assigned_to,
      userId,
      showReassignmentForm,
    ]);
  }

  if (sessionStatus === "loading") {
    return (
      <div className="flex justify-center items-center p-6">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end">
        <div className="pr-8 self-start">
          <div className="flex flex-row items-center mb-4 space-x-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              {task.task_title || "Untitled Task"}
            </h1>

            <span
              className={`ml-2 text-sm rounded-full px-2 py-1 ${getStatusClasses(
                taskStatus,
              )}`}
            >
              {taskStatus}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 md:gap-2 lg:gap-3">
            <div className="flex items-center">
              <User className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Assigned to:</span>
              <span className="ml-1 text-sm font-medium text-blue-600">
                {task.assigned_to_name || "Unassigned"}
              </span>
            </div>

            <div className="flex items-center">
              <Clock className="w-4 h-4 text-red-400 mr-2" />
              <span className="text-sm font-medium text-red-600">
                Due{" "}
                {localDueDate ? formatDateWithoutSeconds(localDueDate) : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {taskStatus !== TaskStatus.COMPLETED ? (
          <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-3 mt-4 md:mt-0">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="success">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Completed
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Complete Task</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to mark this task as completed?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={markTaskCompleted}>
                    Confirm Completion
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {showReassignmentForm && (
              <TaskReassignmentForm
                taskId={task.id}
                currentNurseId={task.assigned_to}
                currentNurseName={task.assigned_to_name}
              />
            )}

            {showReassignmentActions && task.reassignment_requested_by_name && (
              <TaskReassignmentActions
                taskId={task.id}
                taskTitle={task.task_title}
                currentNurseId={task.assigned_to}
                currentNurseName={task.assigned_to_name}
                requestingNurseName={task.reassignment_requested_by_name}
                status={task.status}
              />
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            {isDelayed ? (
              <>
                <CheckCircle className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-orange-500 font-semibold">
                  Delayed task completion
                  {finishedAt && ` ${finishedAtFormatted}`}
                </span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500 font-semibold">
                  Task completed
                  {finishedAt && ` ${finishedAtFormatted}`}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailHeader;
