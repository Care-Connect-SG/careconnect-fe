"use client";

import { Card } from "@/components/ui/card";
import { AlertTriangle, Clock, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
<<<<<<< Updated upstream
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
=======
import { getTasks } from "@/app/api/task";
import { Task, TaskStatus } from "@/types/task";
import { getResidentsByPage } from "@/app/api/resident";
import { ResidentRecord } from "@/types/resident";
import { getAllNurses } from "@/app/api/user";
import { User } from "@/types/user";

const StatsOverview = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [nurses, setNurses] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, residentsData, nursesData] = await Promise.all([
          getTasks(),
          getResidentsByPage(1),
          getAllNurses()
        ]);
        setTasks(tasksData);
        setResidents(residentsData);
        setNurses(nursesData);
      } catch (error) {
        console.error("Error fetching data:", error);
>>>>>>> Stashed changes
      } finally {
        setLoading(false);
      }
    };

<<<<<<< Updated upstream
    fetchStats();
  }, []);

  const statsData = [
    {
      title: "Active Staff",
      value: stats.activeStaff,
=======
    fetchData();
  }, []);

  const stats = [
    {
      title: "Active Staff",
      value: nurses.length.toString(),
>>>>>>> Stashed changes
      icon: UserCheck,
      color: "text-blue-500",
    },
    {
      title: "Pending Tasks",
<<<<<<< Updated upstream
      value: stats.pendingTasks,
=======
      value: tasks.filter(task => task.status === TaskStatus.ASSIGNED).length.toString(),
>>>>>>> Stashed changes
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      title: "Delayed Tasks",
<<<<<<< Updated upstream
      value: stats.delayedTasks,
=======
      value: tasks.filter(task => new Date(task.due_date) < new Date() && task.status !== TaskStatus.COMPLETED).length.toString(),
>>>>>>> Stashed changes
      icon: AlertTriangle,
      color: "text-red-500",
    },
    {
      title: "Total Residents",
<<<<<<< Updated upstream
      value: stats.totalResidents,
=======
      value: residents.length.toString(),
>>>>>>> Stashed changes
      icon: Users,
      color: "text-green-500",
    },
  ];

<<<<<<< Updated upstream
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statsData.map((stat, i) => (
=======
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
>>>>>>> Stashed changes
        <Card key={i} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
<<<<<<< Updated upstream
              {loading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              )}
=======
              <p className="text-2xl font-semibold mt-1">{stat.value}</p>
>>>>>>> Stashed changes
            </div>
            <stat.icon className={`w-8 h-8 ${stat.color}`} />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;
