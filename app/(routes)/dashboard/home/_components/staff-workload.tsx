"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const StaffWorkload = () => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-6">
      <p className="text-lg font-semibold text-gray-800">Staff Workload</p>
      <Button
        variant="link"
        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        View All
      </Button>
    </div>
    <div className="space-y-4">
      {[
        { name: "Emma Thompson", role: "RN", tasks: 8, workload: 75 },
        { name: "Michael Chen", role: "LPN", tasks: 5, workload: 45 },
        { name: "Sarah Williams", role: "CNA", tasks: 10, workload: 90 },
      ].map((staff, i) => (
        <Card
          key={i}
          className="p-4 bg-gray-50 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <p className="text-gray-600 font-medium">
                {staff.name.charAt(0)}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900">{staff.name}</p>
              <p className="text-sm text-gray-500">
                {staff.role} • {staff.tasks} tasks
              </p>
            </div>
          </div>
          <div className="w-32">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className={`h-2 rounded-full ${
                  staff.workload > 80
                    ? "bg-red-500"
                    : staff.workload > 60
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
                style={{ width: `${staff.workload}%` }}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  </Card>
);

export default StaffWorkload;
