"use client";

import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Plus,
  Users,
} from "lucide-react";

const QuickActions = () => (
  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
    {[
      { title: "Create Tasks", icon: Plus, color: "bg-blue-500" },
      { title: "View Tasks", icon: CheckCircle2, color: "bg-green-500" },
      { title: "View Calendar", icon: Calendar, color: "bg-purple-500" },
      {
        title: "Incident Reports",
        icon: AlertTriangle,
        color: "bg-orange-500",
      },
      { title: "View Groups", icon: Users, color: "bg-indigo-500" },
    ].map((action, i) => (
      <Button
        key={i}
        variant="ghost"
        className="flex items-center w-full h-full p-4 border"
      >
        <div className={`${action.color} p-2 rounded-lg text-white mr-3`}>
          <action.icon className="w-5 h-5" />
        </div>
        <span className="font-medium text-gray-700">{action.title}</span>
      </Button>
    ))}
  </div>
);

export default QuickActions;
