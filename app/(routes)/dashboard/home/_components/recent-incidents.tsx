"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, ArrowRight } from "lucide-react";

const RecentIncidents = () => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-6">
      <p className="text-lg font-semibold text-gray-800">Recent Incidents</p>
      <Button
        variant="link"
        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        View All
      </Button>
    </div>
    <div className="space-y-4">
      {[
        {
          title: "Fall Incident",
          resident: "John Smith",
          time: "30 min ago",
          severity: "High",
          status: "Under Review",
        },
        {
          title: "Medication Error",
          resident: "Mary Johnson",
          time: "2 hours ago",
          severity: "Medium",
          status: "Resolved",
        },
        {
          title: "Behavioral Issue",
          resident: "Robert Davis",
          time: "4 hours ago",
          severity: "Low",
          status: "Documented",
        },
      ].map((incident, i) => (
        <Card
          key={i}
          className="p-4 bg-gray-50 flex items-center justify-between"
        >
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium text-gray-900">{incident.title}</p>
              <Badge
                className={`${
                  incident.severity === "High"
                    ? "bg-red-100 text-red-800"
                    : incident.severity === "Medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                } px-2 py-1 text-xs rounded-full`}
              >
                {incident.severity}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {incident.resident} • {incident.time}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <p className="text-sm text-gray-500">{incident.status}</p>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
        </Card>
      ))}
    </div>
  </Card>
);

export default RecentIncidents;
