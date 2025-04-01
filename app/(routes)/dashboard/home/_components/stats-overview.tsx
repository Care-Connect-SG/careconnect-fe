"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getTasks } from "@/app/api/task";
import { Task, TaskStatus } from "@/types/task";
import { getResidentsByPage } from "@/app/api/resident";
import { getAllNurses } from "@/app/api/user";
import { User } from "@/types/user";
import { Resident } from "@/types/resident";

const StatsOverview = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [nurses, setNurses] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, residentsData, nursesData] = await Promise.all([
          getTasks(),
          getResidentsByPage(1, 100),
          getAllNurses(),
        ]);
        setTasks(tasksData);
        setResidents(residentsData);
        setNurses(nursesData);
      } catch (error) {
        console.error("Error fetching stats data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      title: "Active Staff",
      value: nurses.length,
      description: "Currently working nurses",
      icon: "👥",
    },
    {
      title: "Total Residents",
      value: residents.length,
      description: "Registered residents",
      icon: "🏥",
    },
    {
      title: "Pending Tasks",
      value: tasks.filter((task) => task.status === TaskStatus.ASSIGNED).length,
      description: "Tasks awaiting completion",
      icon: "📋",
    },
    {
      title: "Completed Tasks",
      value: tasks.filter((task) => task.status === TaskStatus.COMPLETED).length,
      description: "Tasks completed today",
      icon: "✅",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="space-y-2">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6">
          <div className="space-y-2">
            <div className="text-2xl">{stat.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;
