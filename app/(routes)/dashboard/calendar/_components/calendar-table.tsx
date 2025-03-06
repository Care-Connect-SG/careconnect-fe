"use client";

import { Clock, MapPin, Users } from "lucide-react";

const CalendarTable = () => (
  <div className="bg-white border border-gray-200 rounded-lg">
    <div className="grid grid-cols-7 gap-px bg-gray-200">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div
          key={day}
          className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-500"
        >
          {day}
        </div>
      ))}
      {Array.from({
        length: 35,
      }).map((_, i) => (
        <div key={i} className="bg-white min-h-[120px] p-2">
          <div className="text-sm text-gray-400 mb-2">{i + 1}</div>
          {i === 15 && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 mb-2">
              <div className="text-sm font-medium text-blue-700">
                Group Activity
              </div>
              <div className="flex items-center text-xs text-blue-600 mt-1">
                <Clock className="w-3 h-3 mr-1" />
                10:00 AM
              </div>
              <div className="flex items-center text-xs text-blue-600 mt-1">
                <Users className="w-3 h-3 mr-1" />
                12 participants
              </div>
            </div>
          )}
          {i === 16 && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-2">
              <div className="text-sm font-medium text-green-700">
                Physical Therapy
              </div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <Clock className="w-3 h-3 mr-1" />
                2:30 PM
              </div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                Room 203
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default CalendarTable;
