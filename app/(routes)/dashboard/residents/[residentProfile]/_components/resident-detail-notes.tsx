"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Check, Pencil } from "lucide-react";
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

  const handleEdit = () => {
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

  const formatDate = (date: Date | null) => {
    if (!date) return "Not modified yet";
    return date.toLocaleString();
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">
          Additional Notes
        </CardTitle>
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
            <Button onClick={handleEdit} variant="ghost" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            className="w-full border border-gray-200 rounded-md p-2 text-sm"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter additional notes here..."
          />
        ) : (
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Notes</p>
            <p className="text-sm">
              {notes || <span className="text-gray-400">N/A</span>}
            </p>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-4">
          Last Modified: {formatDate(lastModified)}
        </p>
      </CardContent>
    </Card>
  );
};

export default ResidentDetailsNotesCard;
