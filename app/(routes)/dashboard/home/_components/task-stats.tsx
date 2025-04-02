"use client";

import { getTasks } from "@/app/api/task";
import { Card } from "@/components/ui/card";
import { Task, TaskStatus } from "@/types/task";
import { useEffect, useState } from "react";

const TaskStats = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data: Task[] = await getTasks();
        setTasks(data);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      }
    };

    fetchTasks();
  }, []);

  const stats = {
    total: tasks.length,
    pending: tasks.filter((task) => task.status === TaskStatus.ASSIGNED).length,
    delayed: tasks.filter((task) => new Date(task.due_date) < new Date())
      .length,
    completed: tasks.filter((task) => task.status === "Completed").length,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(stats).map(([key, value]) => (
        <Card key={key} className="p-4">
          <p className="text-sm text-gray-500 capitalize">{key}</p>
          <p className="text-2xl font-semibold text-blue-600">{value}</p>
        </Card>
      ))}
    </div>
  );
};

export default TaskStats;
