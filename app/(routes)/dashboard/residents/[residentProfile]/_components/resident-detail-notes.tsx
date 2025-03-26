"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, PlusCircle } from "lucide-react";
import React, { useState, useEffect } from "react";

interface ResidentDetailsNotesCardProps {
  additionalNotes?: string;
  initialLastSaved?: string;
  onSaveNotes?: (notes: string) => void;
}

const ResidentDetailsNotesCard: React.FC<ResidentDetailsNotesCardProps> = ({
  additionalNotes,
  initialLastSaved,
  onSaveNotes,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(additionalNotes || "");
  const [lastModified, setLastModified] = useState<Date | null>(
    initialLastSaved ? new Date(initialLastSaved) : null,
  );

  useEffect(() => {
    setNotes(additionalNotes || "");
  }, [additionalNotes]);

  const handleAddNote = () => {
    setIsEditing(true);
  };

  const handleSaveNote = () => {
    setIsEditing(false);
    const now = new Date();
    setLastModified(now);
    if (onSaveNotes) {
      onSaveNotes(notes);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 p-4 bg-white shadow-md rounded-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Additional Notes</h3>
        {isEditing ? (
          <Button
            onClick={handleSaveNote}
            className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Check className="h-4 w-4" />
            <span>Save</span>
          </Button>
        ) : (
          <Button
            onClick={handleAddNote}
            className="flex items-center gap-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add</span>
          </Button>
        )}
      </div>

      <div>
        {isEditing ? (
          <Textarea
            className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-600"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        ) : (
          <p className="text-sm text-gray-600">{notes || "None"}</p>
        )}
      </div>

      <p className="text-xs text-gray-500 text-right mt-2">
        Last Modified:{" "}
        {lastModified ? lastModified.toLocaleString() : "Not modified yet"}
      </p>
    </div>
  );
};

export default ResidentDetailsNotesCard;
