"use client";

import { Card } from "@/components/ui/card";
import { AlertTriangle, Clock, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getUsers } from "@/app/api/user";
import { getResidents } from "@/app/api/resident";
import { getTasks } from "@/app/api/task";
import { Skeleton } from "@/components/ui/skeleton";

const StatsOverview = () => {
  const [stats, setStats] = useState({
    activeStaff: null,
    pendingTasks: null,
    delayedTasks: null,
    totalResidents: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch users (staff)
        const users = await getUsers();
        const activeStaff = users.filter(user => !user.disabled).length;
        
        // Fetch residents
        const residents = await getResidents();
        const totalResidents = residents.length;
        
        // Fetch tasks
        const tasks = await getTasks();
        const pendingTasks = tasks.filter(task => task.status === "Assigned").length;
        const delayedTasks = tasks.filter(task => task.status === "Delayed").length;
        
        setStats({
          activeStaff,
          pendingTasks,
          delayedTasks,
          totalResidents,
        });
      } catch (error) {
        console.error("Error fetching stats data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    {
      title: "Active Staff",
      value: stats.activeStaff,
      icon: UserCheck,
      color: "text-blue-500",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      title: "Delayed Tasks",
      value: stats.delayedTasks,
      icon: AlertTriangle,
      color: "text-red-500",
    },
    {
      title: "Total Residents",
      value: stats.totalResidents,
      icon: Users,
      color: "text-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statsData.map((stat, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              )}
            </div>
            <stat.icon className={`w-8 h-8 ${stat.color}`} />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;
