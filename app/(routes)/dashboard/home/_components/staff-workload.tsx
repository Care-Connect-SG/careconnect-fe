"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllNurses } from "@/app/api/user";
import { getTasks } from "@/app/api/task";
import { User } from "@/types/user";
import { Task } from "@/types/task";

interface NurseWorkload {
  nurse: User;
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  completionRate: number;
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
        console.error("Error fetching staff workload:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateWorkload = (): NurseWorkload[] => {
    return nurses.slice(0, 4).map((nurse) => {
      const nurseTasks = tasks.filter((task) => task.assigned_to === nurse.id);
      const totalTasks = nurseTasks.length;
      const completedTasks = nurseTasks.filter((task) => task.status === "completed").length;
      const pendingTasks = totalTasks - completedTasks;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        nurse,
        totalTasks,
        pendingTasks,
        completedTasks,
        completionRate,
      };
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-lg font-semibold text-gray-800">Staff Workload</p>
          <Button variant="ghost" onClick={() => router.push("/dashboard/staff")}>
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const workloads = calculateWorkload();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-lg font-semibold text-gray-800">Staff Workload</p>
        <Button variant="ghost" onClick={() => router.push("/dashboard/staff")}>
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {workloads.map((workload) => (
          <div key={workload.nurse.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{workload.nurse.name}</p>
                <p className="text-sm text-gray-500">
                  {workload.completedTasks} completed • {workload.pendingTasks} pending
                </p>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {workload.totalTasks} tasks
              </span>
            </div>
            <Progress value={workload.completionRate} className="h-2" />
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StaffWorkload;
