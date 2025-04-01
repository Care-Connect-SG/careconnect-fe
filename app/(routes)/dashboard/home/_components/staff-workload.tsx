"use client";

import { getTasks } from "@/app/api/task";
import { getAllNurses } from "@/app/api/user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Task, TaskStatus } from "@/types/task";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NurseWorkload {
  nurse: User;
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
}

const StaffWorkload = () => {
  const router = useRouter();
  const [nurses, setNurses] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nursesData, tasksData] = await Promise.all([
          getAllNurses(),
          getTasks(),
        ]);
        setNurses(nursesData);
        setTasks(tasksData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateWorkload = (): NurseWorkload[] => {
    return nurses.map((nurse) => {
      const nurseTasks = tasks.filter((task) => task.assigned_to === nurse.id);
      return {
        nurse,
        totalTasks: nurseTasks.length,
        pendingTasks: nurseTasks.filter(
          (task) => task.status === TaskStatus.ASSIGNED,
        ).length,
        completedTasks: nurseTasks.filter(
          (task) => task.status === TaskStatus.COMPLETED,
        ).length,
      };
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              <div className="h-2 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const workloads = calculateWorkload().slice(0, 4);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-lg font-semibold text-gray-800">Staff Workload</p>
        <Button
          variant="link"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          onClick={() => router.push("/dashboard/staff")}
        >
          View All
        </Button>
      </div>
      <div className="space-y-6">
        {workloads.map((workload) => {
          const progress =
            workload.totalTasks > 0
              ? (workload.completedTasks / workload.totalTasks) * 100
              : 0;

          return (
            <div key={workload.nurse.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {workload.nurse.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {workload.pendingTasks} pending • {workload.completedTasks}{" "}
                    completed
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {workload.totalTasks} tasks
                </p>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default StaffWorkload;
