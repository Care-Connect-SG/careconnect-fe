"use client";

import { useBreadcrumb } from "@/context/breadcrumb-context";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import { Spinner } from "@/components/ui/spinner";
import ResidentInfo from "./_components/resident-info";
import TaskDetailHeader from "./_components/task-detail-header";

import { getTaskById } from "@/app/api/task";
import { Task } from "@/types/task";

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
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<Task>();
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
    } finally {
      setLoading(false);
    }
  };

  if (!task) return;

  return (
    <div className="flex p-1 md:p-4 lg:p-8 gap-4 flex-col md:flex-1">
      {loading ? (
        <div className="p-8">
          <Spinner />
        </div>
      ) : !task ? (
        <p className="text-center">Task not found</p>
      ) : (
        <>
          <TaskDetailHeader task={task} />
          <div className="grid md:grid-cols-3 gap-4">
            {task.task_details && (
              <div className="md:col-span-2">
                <TaskDescription description={task.task_details} />
              </div>
            )}
            <div className="md:col-span-1">
              <ResidentInfo taskResidentInfo={task} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskDetailsPage;
