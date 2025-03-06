"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { toTitleCase } from "@/lib/utils";
import { Task } from "@/types/task";
import { useRouter } from "next/navigation";
import TaskForm from "./task-form";
import { deleteTask } from "@/app/api/task";

export default function TaskListView({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-blue-50">
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
                <td className="px-6 py-4 text-gray-900">{task.priority || "Low"}</td>
                <td className="px-6 py-4 text-gray-900">{task.status}</td>
                <td className="px-6 py-4 flex space-x-2">
                  {/* Edit Task Button */}
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTask(task);
                    }}
                  >
                    Edit
                  </button>
                  
                  {/* Delete Task Button */}
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to delete this task?")) {
                        try {
                          await deleteTask(task.id);
                          window.location.reload();
                        } catch (error) {
                          alert("Failed to delete task");
                        }
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Task Form for Editing */}
      {editingTask && (
        <TaskForm task={editingTask} onClose={() => setEditingTask(null)} />
      )}
    </div>
  );
}