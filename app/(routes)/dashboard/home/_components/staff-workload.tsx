"use client";

import { getTasks } from "@/app/api/task";
import { getAllNurses } from "@/app/api/user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TaskStatus } from "@/types/task";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NurseWorkload {
  id: string;
  name: string;
  pendingTasks: number;
}

const StaffWorkload = () => {
  const [nurses, setNurses] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateWorkload = (nurseId: string): NurseWorkload | null => {
    const nurse = nurses.find((n) => n.id === nurseId);
    if (!nurse) return null;

    // Filter tasks that are assigned to this nurse and are not completed
    const pendingTasks = tasks.filter(
      (task) =>
        task.assigned_to === nurseId && task.status !== TaskStatus.COMPLETED,
    ).length;

    return {
      id: nurse.id,
      name: nurse.name,
      pendingTasks,
    };
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Staff Workload</h2>
        <Button
          variant="outline"
          className="text-sm"
          onClick={() => router.push("/dashboard/nurses")}
        >
          View All
        </Button>
      </div>
      <div className="h-[400px] overflow-y-auto pr-2 -mr-2">
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            nurses.map((nurse) => {
              const workload = calculateWorkload(nurse.id);
              if (!workload) return null;

              return (
                <div
                  key={nurse.id}
                  className="p-4 bg-gray-50 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{nurse.name}</h3>
                    <span className="text-sm text-gray-500">
                      {workload.pendingTasks} pending tasks
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="space-x-4">
                      <span>{workload.pendingTasks} Tasks to Complete</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
};

export default StaffWorkload;
