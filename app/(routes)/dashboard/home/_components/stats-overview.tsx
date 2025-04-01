"use client";

import { getResidents } from "@/app/api/resident";
import { getTasks } from "@/app/api/task";
import { getAllNurses } from "@/app/api/user";
import { Card } from "@/components/ui/card";
import { TaskStatus } from "@/types/task";
import { useEffect, useState } from "react";

const StatsOverview = () => {
  const [nurses, setNurses] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const [nursesData, tasksData, residentsData] = await Promise.all([
          getAllNurses(),
          getTasks({ date: today.toISOString().split("T")[0] }),
          getResidents(),
        ]);
        setNurses(nursesData);
        setTasks(tasksData);
        setResidents(residentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      name: "Active Staff",
      value: nurses.length,
      change: "+4.75%",
      changeType: "positive" as const,
    },
    {
      name: "Pending Tasks",
      value: tasks.filter((task) => task.status !== TaskStatus.COMPLETED)
        .length,
      change: "+54.02%",
      changeType: "negative" as const,
    },
    {
      name: "Total Residents",
      value: residents.length,
      change: "+12.05%",
      changeType: "positive" as const,
    },
  ];

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="space-y-1">
            <p className="text-sm font-medium text-gray-500">{stat.name}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
              <span
                className={`text-sm font-medium ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StatsOverview;
