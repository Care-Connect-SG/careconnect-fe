"use client";

import { completeTask } from "@/app/api/task";
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
import { convertUTCToLocal, formatDateWithoutSeconds } from "@/lib/utils";
import { Task, TaskStatus } from "@/types/task";
import { CheckCircle, Clock, User } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { TaskReassignmentForm } from "@/components/tasks/TaskReassignmentForm";
import { TaskReassignmentActions } from "@/components/tasks/TaskReassignmentActions";

interface TaskDetailHeaderProps {
  task: Task;
}

export const TaskDetailHeader = ({ task }: TaskDetailHeaderProps) => {
  const { data: session } = useSession();
  const localDueDate = task.due_date ? convertUTCToLocal(task.due_date) : null;
  const localFinishedAt = task.finished_at
    ? convertUTCToLocal(task.finished_at)
    : null;

  const [taskStatus, setTaskStatus] = useState<TaskStatus>(task.status);
  const [finishedAt, setFinishedAt] = useState<Date | null>(localFinishedAt);

  const isDelayed =
    finishedAt && localDueDate ? finishedAt > localDueDate : false;

  const finishedAtFormatted = finishedAt
    ? formatDateWithoutSeconds(finishedAt)
    : "";

  const markTaskCompleted = async () => {
    try {
      await completeTask(task.id);
      const now = new Date();
      setFinishedAt(now);
      setTaskStatus(TaskStatus.COMPLETED);
    } catch (error) {
      console.error("Error marking task as completed", error);
    }
  };

  const showReassignmentForm = 
    taskStatus === TaskStatus.ASSIGNED && 
    task.assigned_to && 
    session?.user?.id && 
    task.assigned_to === session.user.id;

  const showReassignmentActions = 
    taskStatus === TaskStatus.REASSIGNMENT_REQUESTED && 
    task.reassignment_requested_to && 
    session?.user?.id && 
    task.reassignment_requested_to === session.user.id;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end">
        <div className="pr-8 self-start">
          <div className="flex flex-row items-center mb-4 space-x-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              {task.task_title || "Untitled Task"}
            </h1>

            <span
              className={`ml-2 text-sm rounded-full px-2 py-1 ${
                taskStatus === TaskStatus.COMPLETED
                  ? "bg-green-100 text-green-800"
                  : taskStatus === TaskStatus.DELAYED
                    ? "bg-red-100 text-red-800"
                    : taskStatus === TaskStatus.REQUEST_REASSIGNMENT
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
              }`}
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
            
            {showReassignmentForm && task.assigned_to_name && (
              <TaskReassignmentForm
                taskId={task.id}
                currentNurseId={task.assigned_to}
                currentNurseName={task.assigned_to_name}
              />
            )}
            
            {showReassignmentActions && task.assigned_to_name && task.reassignment_requested_by_name && (
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
