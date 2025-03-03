"use client";

import { Home, User } from "lucide-react";

const ResidentInfo = ({ resident }: { resident: any }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">
      Resident Information
    </h2>
    <div className="grid grid-cols-1 gap-6">
      <div>
        <div className="flex items-start mb-4">
          <User className="w-5 h-5 text-gray-400 mr-3 mt-1" />
          <div>
            <p className="text-sm text-gray-500">Resident Name</p>
            <p className="font-medium text-gray-900">
              {resident?.full_name || "Unknown"}
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <Home className="w-5 h-5 text-gray-400 mr-3 mt-1" />
          <div>
            <p className="text-sm text-gray-500">Room Number</p>
            <p className="font-medium text-gray-900">
              {resident?.room_number || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ResidentInfo;
