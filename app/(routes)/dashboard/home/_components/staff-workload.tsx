"use client";

import { getTasks } from "@/app/api/task";
import { getAllNurses } from "@/app/api/user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Task, TaskStatus } from "@/types/task";
import { User } from "@/types/user";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NurseWorkload {
  id: string;
  name: string;
  pendingTasks: number;
}

const StaffWorkload = () => {
  const [nurses, setNurses] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const [nursesData, tasksData] = await Promise.all([
          getAllNurses(),
          getTasks({ date: today.toISOString().split("T")[0] }),
        ]);
        setNurses(nursesData);
        setTasks(tasksData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateWorkload = (nurseId: string): NurseWorkload | null => {
    const nurse = nurses.find((n) => n.id === nurseId);
    if (!nurse) return null;

    const pendingTasks = tasks.filter(
      (task) =>
        task.assigned_to === nurseId && task.status !== TaskStatus.COMPLETED
    ).length;

    return {
      id: nurse.id,
      name: nurse.name,
      pendingTasks,
    };
  };

  const nurseWorkloads = nurses
    .map((nurse) => calculateWorkload(nurse.id))
    .filter((workload): workload is NurseWorkload => workload !== null);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Staff Workload</h2>
        <Button
          variant="link"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          onClick={() => router.push("/dashboard/nurses")}
        >
          View All
        </Button>
      </div>
      <div className="h-[400px] overflow-y-auto pr-2 -mr-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        ) : nurseWorkloads.length > 0 ? (
          <div className="space-y-4">
            {nurseWorkloads.map((workload) => (
              <div
                key={workload.id}
                className="p-4 bg-gray-50 rounded-xl space-y-3 border"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{workload.name}</h3>
                  <span className="text-sm text-gray-500">
                    {workload.pendingTasks} pending tasks
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="space-x-4">
                    <span>{workload.pendingTasks} Tasks to Complete Today</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-gray-400 mb-2">
              <CheckCircle size={48} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No staff workload
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
              There are currently no assigned tasks for today or no active staff
              members.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StaffWorkload;
