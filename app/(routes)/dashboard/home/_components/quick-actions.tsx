"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, CheckSquare, FileText, Group, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

const QuickActions = () => {
  const router = useRouter();

  const actions = [
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
    },
  ];

  return (
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
            <span className="text-sm font-medium text-gray-700">
              {action.title}
            </span>
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;
