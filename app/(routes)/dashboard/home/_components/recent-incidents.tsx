"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";

const RecentIncidents = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold text-gray-800">Recent Incidents</h2>
      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
        View All
      </button>
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
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {incident.title}
              </span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${incident.severity === "High" ? "bg-red-100 text-red-800" : incident.severity === "Medium" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}
              >
                {incident.severity}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {incident.resident} • {incident.time}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">{incident.status}</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default RecentIncidents;
