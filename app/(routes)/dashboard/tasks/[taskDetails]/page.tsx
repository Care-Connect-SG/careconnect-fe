"use client";

import { completeTask, getTaskById } from "@/app/api/task";
import { Button } from "@/components/ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircle, Clock, Home, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useBreadcrumb } from "../../../../../context/breadcrumb-context";

const TaskHeader = ({ task }: { task: any }) => {
  const [showDialog, setShowDialog] = useState(false);

  const markTaskCompleted = async () => {
    try {
      await completeTask(task.id);
      // Optionally update your task state here (e.g. setting a status flag)
      setShowDialog(false);
    } catch (error) {
      console.error("Error marking task as completed", error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            {task.task_title || "Untitled Task"}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <User className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Assigned to: </span>
              <span className="ml-1 text-sm font-medium text-blue-600">
                {task.assigned_to?.join(", ") || "Unassigned"}
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
        <div className="flex space-x-3">
          <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
            <Dialog.Trigger asChild>
              <Button variant="success">
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Completed
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50" />
              <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[400px]">
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  Complete Task
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-gray-600">
                  Are you sure you want to mark this task as completed? This
                  action cannot be undone.
                </Dialog.Description>
                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="success" onClick={markTaskCompleted}>
                    Confirm Completion
                  </Button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <Button variant="secondary">Request Reassignment</Button>
        </div>
      </div>
    </div>
  );
};

const ResidentSnapshot = ({ resident }: { resident: any }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">
      Resident Information
    </h2>
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="flex items-start mb-4">
          <User className="w-5 h-5 text-gray-400 mr-3 mt-1" />
          <div>
            <p className="text-sm text-gray-500">Resident Name</p>
            <p className="font-medium text-gray-900">
              {resident?.full_name || "Unknown"}
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <Home className="w-5 h-5 text-gray-400 mr-3 mt-1" />
          <div>
            <p className="text-sm text-gray-500">Room Number</p>
            <p className="font-medium text-gray-900">
              {resident?.room_number || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TaskDescription = ({ description }: { description: string }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">
      Task Description
    </h2>
    <p className="text-gray-600 leading-relaxed">
      {description || "No description available."}
    </p>
  </div>
);

const TaskDetails = () => {
  const { taskDetails } = useParams();
  const [task, setTask] = useState<any>(null);
  const { setPageName } = useBreadcrumb();

  useEffect(() => {
    if (taskDetails) fetchTask();
  }, [taskDetails]);

  const fetchTask = async () => {
    if (!taskDetails || Array.isArray(taskDetails)) {
      console.error("Invalid task id:", taskDetails);
      return;
    }
    try {
      const data = await getTaskById(taskDetails);
      setTask(data);
      setPageName(data.task_title);
    } catch (error) {
      console.error("Error fetching task details", error);
    }
  };

  if (!task) return <p>Loading...</p>;

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <TaskHeader task={task} />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <TaskDescription description={task.task_details} />
        </div>
        <div className="col-span-1">
          <ResidentSnapshot resident={task.resident || {}} />
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
