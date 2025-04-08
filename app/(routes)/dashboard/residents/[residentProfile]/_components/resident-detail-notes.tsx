"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { convertUTCToLocal } from "@/lib/utils";
import { Check, MoreHorizontal, Pencil, Plus, Trash, X } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

interface ResidentDetailsNotesCardProps {
  additionalNotes?: string[];
  initialTimestamps?: string[];
  onSaveNotes?: (note: string) => void;
  onUpdateNote?: (index: number, note: string) => void;
  onDeleteNote?: (index: number) => void;
}

const ResidentDetailsNotesCard: React.FC<ResidentDetailsNotesCardProps> = ({
  additionalNotes = [],
  initialTimestamps = [],
  onSaveNotes,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const notesWithTimestamps = additionalNotes.map((note, index) => ({
    note,
    timestamp: initialTimestamps[index]
      ? new Date(initialTimestamps[index])
      : new Date(0),
    originalIndex: index,
  }));

  const sortedNotes = [...notesWithTimestamps].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  );

  useEffect(() => {
    if (isAddingNew && contentRef.current) {
      contentRef.current.scrollTop = 0;

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isAddingNew]);

  const handleSaveNewNote = () => {
    if (!newNote.trim()) return;
    setIsAddingNew(false);
    if (onSaveNotes) {
      onSaveNotes(newNote.trim());
    }
    setNewNote("");
  };

  const handleStartEdit = (originalIndex: number) => {
    setEditingIndex(originalIndex);
    setEditingText(additionalNotes[originalIndex]);
  };

  const handleUpdateNote = () => {
    if (!editingText.trim() || editingIndex === null) return;
    if (onUpdateNote) {
      onUpdateNote(editingIndex, editingText.trim());
    }
    setEditingIndex(null);
    setEditingText("");
  };

  const handleDeleteNote = (originalIndex: number) => {
    if (onDeleteNote) {
      onDeleteNote(originalIndex);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingText("");
  };

  const handleCancelNewNote = () => {
    setIsAddingNew(false);
    setNewNote("");
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">
          Additional Notes
        </CardTitle>
        <div>
          {!isAddingNew && editingIndex === null && (
            <Button onClick={() => setIsAddingNew(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent
        ref={contentRef}
        className="space-y-4 max-h-[48vh] overflow-y-auto pt-2"
      >
        {isAddingNew && (
          <div className="space-y-2">
            <Textarea
              ref={textareaRef}
              className="w-full border border-gray-200 rounded-md p-2 text-sm"
              rows={3}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter a new note..."
            />
            <div className="flex justify-end space-x-2">
              <Button
                onClick={handleCancelNewNote}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveNewNote}
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        )}
        {sortedNotes.length > 0 ? (
          sortedNotes.map((item, idx) => (
            <div key={idx} className="border-b border-dashed pb-2 relative">
              {editingIndex === item.originalIndex ? (
                <div className="space-y-2">
                  <Textarea
                    className="w-full border border-gray-200 rounded-md p-2 text-sm"
                    rows={3}
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      onClick={handleCancelEdit}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateNote}
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Update
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="absolute top-0 right-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-40" align="end">
                        <DropdownMenuItem
                          onClick={() => handleStartEdit(item.originalIndex)}
                          className="flex items-center cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-2" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteNote(item.originalIndex)}
                          className="flex items-center text-red-500 focus:text-red-500 cursor-pointer"
                        >
                          <Trash className="h-3.5 w-3.5 mr-2" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="pr-6">
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {item.note}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {initialTimestamps[item.originalIndex]
                        ? convertUTCToLocal(
                            new Date(initialTimestamps[item.originalIndex]),
                          ).toLocaleString()
                        : "No timestamp"}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No notes yet</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ResidentDetailsNotesCard;
