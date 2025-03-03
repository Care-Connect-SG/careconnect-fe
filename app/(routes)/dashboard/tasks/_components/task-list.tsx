"use client";

import { getTasks } from "@/app/api/task";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Task, TaskStatus } from "@/types/task";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

const TasksHeader = () => {
  return (
    <div className="mb-8">
      <div className="flex justify-end">
        <Button>
          <Plus className="w-4 h-4 mr-2" /> New Task
        </Button>
      </div>
    </div>
  );
};

const TaskStats = ({ tasks }: { tasks: Task[] }) => {
  const stats = {
    total: tasks.length,
    pending: tasks.filter((task) => task.status === TaskStatus.ASSIGNED).length,
    delayed: tasks.filter((task) => new Date(task.due_date) < new Date())
      .length,
    completed: tasks.filter((task) => task.status === "Completed").length,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Object.entries(stats).map(([key, value]) => (
        <div
          key={key}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <p className="text-sm text-gray-500 capitalize">{key}</p>
          <p className="text-2xl font-semibold text-blue-600">{value}</p>
        </div>
      ))}
    </div>
  );
};

const TaskTable = ({ tasks }: { tasks: Task[] }) => {
  if (!tasks.length) {
    return <p className="text-center text-gray-500">No tasks available</p>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                <Checkbox className="h-4 w-4 border border-gray-300 bg-white" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Task
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Resident
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Checkbox className="h-4 w-4 border border-gray-300 bg-white" />
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {task.task_title}
                </td>
                <td className="px-6 py-4 text-gray-900">
                  {task.resident || "N/A"}
                </td>
                <td className="px-6 py-4 text-gray-900">
                  {task.assigned_to || "Unassigned"}
                </td>
                <td className="px-6 py-4 text-gray-900">
                  {task.priority || "Low"}
                </td>
                <td className="px-6 py-4 text-gray-900">{task.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function TaskListView() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.email) return;
    const userEmail = session.user.email as string;

    const fetchTasks = async () => {
      try {
        const data: Task[] = await getTasks(userEmail);
        setTasks(data);
      } catch (err) {
        setError("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [session?.user?.email]);

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <TasksHeader />
      <TaskStats tasks={tasks} />
      <TaskTable tasks={tasks} />
    </div>
  );
}
