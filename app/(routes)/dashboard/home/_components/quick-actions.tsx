"use client";

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
      <button
        key={i}
        className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
      >
        <div className={`${action.color} p-2 rounded-lg text-white mr-3`}>
          <action.icon className="w-5 h-5" />
        </div>
        <span className="font-medium text-gray-700">{action.title}</span>
      </button>
    ))}
  </div>
);

export default QuickActions;
