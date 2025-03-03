"use client";

import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

interface ViewToggleProps {
  view: "list" | "kanban";
  onChange: (view: "list" | "kanban") => void;
}

export const TaskViewToggle = ({ view, onChange }: ViewToggleProps) => {
  return (
    <div className="flex rounded-lg border border-gray-300 ">
      <Button
        onClick={() => onChange("list")}
        className={`flex-1 flex items-center rounded-l-lg justify-center px-3 py-1.5 focus:ring-0 focus:ring-offset-0 ${
          view === "list"
            ? "bg-gray-200 text-gray-600 shadow-sm hover:bg-white"
            : "bg-white text-gray-800 hover:text-blue-600 hover:bg-blue-50"
        }`}
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => onChange("kanban")}
        className={`flex-1 flex items-center rounded-r-lg justify-center px-3 py-1.5 focus:ring-0 focus:ring-offset-0 ${
          view === "kanban"
            ? "bg-gray-200 text-gray-600 shadow-sm hover:bg-white"
            : "bg-white text-gray-800 hover:text-blue-600 hover:bg-blue-50"
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
    </div>
  );
};
