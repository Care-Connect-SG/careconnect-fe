"use client";

import { completeTask } from "@/app/api/task";
import { Button } from "@/components/ui/button";
import { Task, TaskStatus } from "@/types/task";
import { CheckCircle, Clock, User } from "lucide-react";
import { useState } from "react";

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

export const TaskDetailHeader = ({ task }: { task: Task }) => {
  const [isTaskCompleted, setIsTaskCompleted] = useState(task.status);
  const markTaskCompleted = async () => {
    try {
      await completeTask(task.id);
      setIsTaskCompleted(TaskStatus.COMPLETED);
    } catch (error) {
      console.error("Error marking task as completed", error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end">
        <div className="pr-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            {task.task_title || "Untitled Task"}
          </h1>
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
                Due on{" "}
                {task.due_date
                  ? new Date(task.due_date).toLocaleString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
        {isTaskCompleted !== TaskStatus.COMPLETED && (
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
                    Are you sure you want to mark this task as completed? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => markTaskCompleted()}>
                    Confirm Completion
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="secondary">Request Reassignment</Button>
          </div>
        )}
        {isTaskCompleted === TaskStatus.COMPLETED && (
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-500 font-semibold">
              Task Completed on{" "}
              {task.finished_at
                ? new Date(task.finished_at).toLocaleString()
                : "N/A"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailHeader;
