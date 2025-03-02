import React from "react";
import { LayoutGrid, List } from "lucide-react";
interface ViewToggleProps {
  view: "list" | "kanban";
  onChange: (view: "list" | "kanban") => void;
}
export const ViewToggle = ({ view, onChange }: ViewToggleProps) => {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onChange("list")}
        className={`flex items-center px-3 py-1.5 rounded ${view === "list" ? "bg-white text-gray-800 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
      >
        <List className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">List</span>
      </button>
      <button
        onClick={() => onChange("kanban")}
        className={`flex items-center px-3 py-1.5 rounded ${view === "kanban" ? "bg-white text-gray-800 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
      >
        <LayoutGrid className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">Board</span>
      </button>
    </div>
  );
};
