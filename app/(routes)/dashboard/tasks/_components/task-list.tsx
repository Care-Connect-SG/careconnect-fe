"use client";

import { getTasks } from "@/app/api/task";
import { Spinner } from "@/components/ui/spinner";
import { Task } from "@/types/task";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import TaskTable from "./task-table";

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

  if (loading)
    return (
      <div className="p-8">
        <Spinner />
      </div>
    );
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex-1 p-8">
      <TaskTable tasks={tasks} />
    </div>
  );
}
