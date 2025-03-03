"use client";

import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

interface ViewToggleProps {
  view: "list" | "kanban";
  onChange: (view: "list" | "kanban") => void;
}

export const TaskViewToggle = ({ view, onChange }: ViewToggleProps) => {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <Button
        onClick={() => onChange("list")}
        className={`flex items-center px-3 py-1.5 rounded ${
          view === "list"
            ? "bg-white text-gray-800 shadow-sm"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        <List className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">List</span>
      </Button>
      <Button
        onClick={() => onChange("kanban")}
        className={`flex items-center px-3 py-1.5 rounded ${
          view === "kanban"
            ? "bg-white text-gray-800 shadow-sm"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        <LayoutGrid className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">Board</span>
      </Button>
    </div>
  );
};
