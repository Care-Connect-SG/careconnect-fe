"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@/types/task";
import { useRouter } from "next/navigation";
import { toTitleCase } from "@/lib/utils";

export default function TaskListView({ tasks }: { tasks: Task[] }) {
  const router = useRouter();

  if (!tasks.length) {
    return (
      <p className="text-center text-gray-500">No available tasks, Hooray!</p>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {/* <Checkbox className="h-4 w-4 border border-gray-300 bg-white" /> */}
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
              <tr
                key={task.id}
                className="hover:bg-blue-50 hover:cursor-pointer hover:duration-300 ease-in-out"
                onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
              >
                <td className="px-6 py-4">
                  <Checkbox className="h-4 w-4 border border-gray-300 bg-white" />
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {task.task_title}
                </td>
                <td className="px-6 py-4 text-gray-900">
                  {toTitleCase(task.resident_name) || "N/A"}
                </td>
                <td className="px-6 py-4 text-gray-900">
                  {toTitleCase(task.assigned_to_name) || "Unassigned"}
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
}
