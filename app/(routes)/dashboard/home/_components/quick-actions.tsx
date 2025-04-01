"use client";

import { Button } from "@/components/ui/button";
<<<<<<< Updated upstream
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Plus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
=======
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Calendar, FileText, Group, Plus, CheckSquare } from "lucide-react";
>>>>>>> Stashed changes

const QuickActions = () => {
  const router = useRouter();

  const actions = [
<<<<<<< Updated upstream
    { 
      title: "Create Tasks", 
      icon: Plus, 
      color: "bg-blue-500",
      onClick: () => router.push("/dashboard/tasks/new")
    },
    { 
      title: "View Tasks", 
      icon: CheckCircle2, 
      color: "bg-green-500",
      onClick: () => router.push("/dashboard/tasks")
    },
    { 
      title: "View Calendar", 
      icon: Calendar, 
      color: "bg-purple-500",
      onClick: () => router.push("/dashboard/calendar")
    },
    {
      title: "Incident Reports",
      icon: AlertTriangle,
      color: "bg-orange-500",
      onClick: () => router.push("/dashboard/incidents")
    },
    { 
      title: "View Residents", 
      icon: Users, 
      color: "bg-indigo-500",
      onClick: () => router.push("/dashboard/residents")
=======
    {
      title: "Create Tasks",
      icon: Plus,
      color: "bg-blue-500",
      onClick: () => router.push("/dashboard/tasks?open=true"),
    },
    {
      title: "View Tasks",
      icon: CheckSquare,
      color: "bg-green-500",
      onClick: () => router.push("/dashboard/tasks"),
    },
    {
      title: "Calendar",
      icon: Calendar,
      color: "bg-purple-500",
      onClick: () => router.push("/dashboard/calendar"),
    },
    {
      title: "Incident Reports",
      icon: FileText,
      color: "bg-red-500",
      onClick: () => router.push("/dashboard/incidents"),
    },
    {
      title: "Groups",
      icon: Group,
      color: "bg-yellow-500",
      onClick: () => router.push("/dashboard/groups"),
>>>>>>> Stashed changes
    },
  ];

  return (
<<<<<<< Updated upstream
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {actions.map((action, i) => (
        <Button
          key={i}
          variant="ghost"
          className="flex items-center w-full h-full p-4 border hover:bg-gray-50 transition-colors"
          onClick={action.onClick}
        >
          <div className={`${action.color} p-2 rounded-lg text-white mr-3`}>
            <action.icon className="w-5 h-5" />
          </div>
          <span className="font-medium text-gray-700">{action.title}</span>
        </Button>
      ))}
    </div>
=======
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-lg font-semibold text-gray-800">Quick Actions</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="flex flex-col items-center justify-center h-32 gap-2 hover:bg-gray-50"
            onClick={action.onClick}
          >
            <div className={`p-3 rounded-full ${action.color} text-white`}>
              <action.icon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-gray-700">{action.title}</span>
          </Button>
        ))}
      </div>
    </Card>
>>>>>>> Stashed changes
  );
};

export default QuickActions;
