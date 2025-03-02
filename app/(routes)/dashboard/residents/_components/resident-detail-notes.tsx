"use client";

import React, { useState } from "react";
import { PlusCircledIcon, CheckIcon } from "@radix-ui/react-icons";

interface ResidentDetailsNotesCardProps {
  additionalNotes?: string;
  onSaveNotes?: (notes: string) => void;
}

const ResidentDetailsNotesCard: React.FC<ResidentDetailsNotesCardProps> = ({
  additionalNotes,
  onSaveNotes,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(additionalNotes || "");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // When clicking "Add", switch to edit mode.
  const handleAddNote = () => {
    setIsEditing(true);
  };

  // When saving, update the timestamp and notify the parent.
  const handleSaveNote = () => {
    setIsEditing(false);
    const now = new Date();
    setLastSaved(now);
    if (onSaveNotes) {
      onSaveNotes(notes);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 p-4 bg-white shadow-md rounded-md">
      {/* Header with Add/Save button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Additional Notes</h3>
        {isEditing ? (
          <button
            onClick={handleSaveNote}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
          >
            <CheckIcon />
            <span>Save</span>
          </button>
        ) : (
          <button
            onClick={handleAddNote}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
          >
            <PlusCircledIcon />
            <span>Add</span>
          </button>
        )}
      </div>

      <div>
        {isEditing ? (
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-600"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        ) : (
          <p className="text-sm text-gray-600">{notes}</p>
        )}
      </div>

      {lastSaved && (
        <p className="text-xs text-gray-500 text-right mt-2">
          Last saved: {lastSaved.toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default ResidentDetailsNotesCard;