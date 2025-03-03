"use client";

import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

interface ViewToggleProps {
  view: "list" | "kanban";
  onChange: (view: "list" | "kanban") => void;
}

export const TaskViewToggle = ({ view, onChange }: ViewToggleProps) => {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1 space-x-1">
      <Button
        onClick={() => onChange("list")}
        className={`flex-1 flex items-center justify-center px-3 py-1.5 bg-transparent rounded ${
          view === "list"
            ? "bg-white text-gray-800 shadow-sm hover:bg-white"
            : "text-gray-600 hover:text-gray-800 hover:bg-transparent"
        }`}
      >
        <List className="w-4 h-4 mr-1" />
        <span className="text-sm font-medium">List</span>
      </Button>
      <Button
        onClick={() => onChange("kanban")}
        className={`flex-1 flex items-center justify-center px-3 py-1.5 rounded bg-transparent ${
          view === "kanban"
            ? "bg-white text-gray-800 shadow-sm hover:bg-white"
            : "text-gray-600 hover:text-gray-800 hover:bg-transparent"
        }`}
      >
        <LayoutGrid className="w-4 h-4 mr-1" />
        <span className="text-sm font-medium">Board</span>
      </Button>
    </div>
  );
};
