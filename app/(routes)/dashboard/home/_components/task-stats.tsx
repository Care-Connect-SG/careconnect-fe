"use client";

import { getTasks } from "@/app/api/task";
import { Task, TaskStatus } from "@/types/task";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const TaskStats = () => {
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

export default TaskStats;
