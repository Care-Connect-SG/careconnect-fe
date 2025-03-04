"use client";

import { Task } from "@/types/task";
import TaskTable from "./task-table";

export default function TaskListView({ tasks }: { tasks: Task[] }) {
  return (
    <div className="flex-1 p-8">
      <TaskTable tasks={tasks} />
    </div>
  );
}
