"use client";

import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Plus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

const QuickActions = () => {
  const router = useRouter();

  const actions = [
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
    },
  ];

  return (
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
  );
};

export default QuickActions;
