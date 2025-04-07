// Updated ResidentDetailsNotesCard to handle list-based additional notes properly
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Check, Pencil } from "lucide-react";
import React, { useState } from "react";

interface ResidentDetailsNotesCardProps {
  additionalNotes?: string[];
  initialTimestamps?: string[];
  onSaveNotes?: (note: string) => void;
}

const ResidentDetailsNotesCard: React.FC<ResidentDetailsNotesCardProps> = ({
  additionalNotes = [],
  initialTimestamps = [],
  onSaveNotes,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState("");

  const handleSaveNote = () => {
    if (!newNote.trim()) return;
    setIsEditing(false);
    if (onSaveNotes) {
      onSaveNotes(newNote.trim());
    }
    setNewNote("");
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Additional Notes</CardTitle>
        <div>
          {isEditing ? (
            <Button
              onClick={handleSaveNote}
              variant="ghost"
              size="sm"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="ghost" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {additionalNotes.length > 0 ? (
          additionalNotes.map((note, idx) => (
            <div key={idx} className="border-b border-dashed pb-2">
              <p className="text-sm whitespace-pre-wrap break-words">{note}</p>
              <p className="text-xs text-gray-500">
                {initialTimestamps[idx]
                  ? new Date(initialTimestamps[idx]).toLocaleString()
                  : "No timestamp"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No notes yet.</p>
        )}

        {isEditing && (
          <Textarea
            className="w-full border border-gray-200 rounded-md p-2 text-sm"
            rows={3}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter a new note..."
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ResidentDetailsNotesCard;
