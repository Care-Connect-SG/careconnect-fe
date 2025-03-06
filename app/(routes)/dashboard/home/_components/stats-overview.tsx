"use client";

import { UserCheck, Clock, AlertTriangle, Users } from "lucide-react";

const StatsOverview = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {[
      { title: "Active Staff", value: "24", icon: UserCheck, color: "text-blue-500" },
      { title: "Pending Tasks", value: "12", icon: Clock, color: "text-yellow-500" },
      { title: "Critical Alerts", value: "3", icon: AlertTriangle, color: "text-red-500" },
      { title: "Total Residents", value: "86", icon: Users, color: "text-green-500" },
    ].map((stat, i) => (
      <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{stat.title}</p>
            <p className="text-2xl font-semibold mt-1">{stat.value}</p>
          </div>
          <stat.icon className={`w-8 h-8 ${stat.color}`} />
        </div>
      </div>
    ))}
  </div>
);

export default StatsOverview;
