"use client";

import { Home, User } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useBreadcrumb } from "../../../../../context/breadcrumb-context";

import TaskDetailHeader from "./_components/task-detail-header";

import { getTaskById } from "@/app/api/task";

const ResidentSnapshot = ({ resident }: { resident: any }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">
      Resident Information
    </h2>
    <div className="grid grid-cols-1 gap-6">
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
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">
      Task Description
    </h2>
    <p className="text-gray-600 leading-relaxed">
      {description || "No description available."}
    </p>
  </div>
);

const TaskDetailsPage = () => {
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
    <div className="flex p-1 md:p-4 lg:p-8 gap-4 flex-col md:flex-1">
      <TaskDetailHeader task={task} />
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <TaskDescription description={task.task_details} />
        </div>
        <div className="md:col-span-1">
          <ResidentSnapshot resident={task.resident || {}} />
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;
