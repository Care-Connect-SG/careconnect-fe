"use client";

import { completeTask } from "@/app/api/task";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/task";
import { CheckCircle, Clock, User } from "lucide-react";

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

const TaskDetailHeader = ({ task }: { task: Task }) => {
  const markTaskCompleted = async () => {
    try {
      await completeTask(task.id);
    } catch (error) {
      console.error("Error marking task as completed", error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start lg:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            {task.task_title || "Untitled Task"}
          </h1>
          <div className="flex flex-wrap items-center gap-4 md:gap-2 lg:gap-3">
            <div className="flex items-center">
              <User className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Assigned:</span>
              <span className="ml-1 text-sm font-medium text-blue-600">
                {task.assigned_to || "Unassigned"}
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
                <AlertDialogAction onClick={markTaskCompleted}>
                  Confirm Completion
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="secondary">Request Reassignment</Button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailHeader;
