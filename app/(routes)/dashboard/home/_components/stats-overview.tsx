"use client";

import { getResidentsByPage } from "@/app/api/resident";
import { getTasks } from "@/app/api/task";
import { getAllNurses } from "@/app/api/user";
import { Card } from "@/components/ui/card";
import { ResidentRecord } from "@/types/resident";
import { Task, TaskStatus } from "@/types/task";
import { User } from "@/types/user";
import { AlertTriangle, Clock, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";

const StatsOverview = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [nurses, setNurses] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const [tasksData, residentsData, nursesData] = await Promise.all([
          getTasks({ date: today.toISOString().split("T")[0] }),
          getResidentsByPage(1),
          getAllNurses(),
        ]);
        setTasks(tasksData);
        setResidents(residentsData);
        setNurses(nursesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      title: "Active Staff",
      value: nurses.length.toString(),
      icon: UserCheck,
      color: "text-blue-500",
    },
    {
      title: "Pending Tasks",
      value: tasks
        .filter((task) => task.status === TaskStatus.ASSIGNED)
        .length.toString(),
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      title: "Delayed Tasks",
      value: tasks
        .filter((task) => {
          const now = new Date();
          const dueDate = new Date(task.due_date);

          // Check if task is past due time and not completed
          return dueDate < now && task.status !== TaskStatus.COMPLETED;
        })
        .length.toString(),
      icon: AlertTriangle,
      color: "text-red-500",
    },
    {
      title: "Total Residents",
      value: residents.length.toString(),
      icon: Users,
      color: "text-green-500",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-2xl font-semibold mt-1">{stat.value}</p>
            </div>
            <stat.icon className={`w-8 h-8 ${stat.color}`} />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;
