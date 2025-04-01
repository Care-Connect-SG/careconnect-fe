"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { getUsers } from "@/app/api/user";
import { getTasks } from "@/app/api/task";
import { useRouter } from "next/navigation";

const StaffWorkload = () => {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStaffWorkload = async () => {
      try {
        setLoading(true);
        
        // Fetch all nurses
        const users = await getUsers();
        const nurses = users.filter(user => user.role === "Nurse" && !user.disabled);
        
        // Fetch all tasks
        const tasks = await getTasks();
        
        // Calculate workload for each nurse
        const nurseWorkloads = nurses.map(nurse => {
          const nurseId = nurse.id;
          const nurseTasks = tasks.filter(task => task.assigned_to === nurseId && task.status !== "Completed");
          
          // Calculate workload percentage (based on number of tasks)
          // A nurse with 10+ tasks is considered at 100% workload
          const workloadPercentage = Math.min(nurseTasks.length * 10, 100);
          
          return {
            id: nurseId,
            name: nurse.name || `${nurse.first_name || ''} ${nurse.last_name || ''}`.trim() || nurse.email,
            role: nurse.role,
            tasks: nurseTasks.length,
            workload: workloadPercentage
          };
        });
        
        // Sort by workload (highest first) and take top 3
        const topNurses = nurseWorkloads
          .sort((a, b) => b.workload - a.workload)
          .slice(0, 3);
        
        setStaffData(topNurses);
      } catch (error) {
        console.error("Error fetching staff workload:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffWorkload();
  }, []);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-lg font-semibold text-gray-800">Staff Workload</p>
        <Button
          variant="link"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          onClick={() => router.push('/dashboard/nurses')}
        >
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {loading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="w-32 h-2 rounded-full" />
              </div>
            </Card>
          ))
        ) : staffData.length > 0 ? (
          staffData.map((staff, i) => (
            <Card
              key={i}
              className="p-4 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => router.push(`/dashboard/nurses/${staff.id}`)}
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-600 font-medium">
                    {staff.name.charAt(0)}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{staff.name}</p>
                  <p className="text-sm text-gray-500">
                    {staff.role} • {staff.tasks} tasks
                  </p>
                </div>
              </div>
              <div className="w-32">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className={`h-2 rounded-full ${
                      staff.workload > 80
                        ? "bg-red-500"
                        : staff.workload > 60
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${staff.workload}%` }}
                  />
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No staff data available</p>
        )}
      </div>
    </Card>
  );
};

export default StaffWorkload;
