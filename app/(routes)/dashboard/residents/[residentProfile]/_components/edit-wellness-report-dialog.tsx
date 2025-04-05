"use client";

import { updateWellnessReport } from "@/app/api/wellness-report";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { WellnessReportRecord } from "@/types/wellness-report";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

interface EditWellnessReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  residentId: string;
  initialData: WellnessReportRecord;
  onReportUpdated: () => void;
}

const EditWellnessReportDialog: React.FC<EditWellnessReportDialogProps> = ({
  isOpen,
  onClose,
  residentId,
  initialData,
  onReportUpdated,
}) => {
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const [formData, setFormData] = useState<Partial<WellnessReportRecord>>({
    date: "",
    summary: "",
    medical_summary: "",
    medication_update: "",
    nutrition_hydration: "",
    mobility_physical: "",
    cognitive_emotional: "",
    social_engagement: "",
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        date: initialData.date,
        summary: initialData.summary || "",
        medical_summary: initialData.medical_summary || "",
        medication_update: initialData.medication_update || "",
        nutrition_hydration: initialData.nutrition_hydration || "",
        mobility_physical: initialData.mobility_physical || "",
        cognitive_emotional: initialData.cognitive_emotional || "",
        social_engagement: initialData.social_engagement || "",
      });

      try {
        if (initialData.date) {
          const dateObj = new Date(initialData.date);
          if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
            setSelectedDate(dateObj);
          }
        }
      } catch (error) {
        console.error("Error parsing date:", error);
      }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(undefined);
    }
  }, [isOpen]);

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setFormData({
        ...formData,
        date: format(date, "yyyy-MM-dd"),
      });
    } else {
      setFormData({
        ...formData,
        date: "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!initialData?.id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Cannot edit report: Missing report ID",
        });
        return;
      }

      await updateWellnessReport(residentId, initialData.id, formData);
      toast({
        variant: "default",
        title: "Success",
        description: "Wellness report updated successfully.",
      });
      onReportUpdated();
      onClose();
    } catch (error: any) {
      console.error("Error updating wellness report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error: ${error.message}`,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Wellness Report</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground",
                  )}
                  type="button"
                >
                  {selectedDate ? (
                    format(selectedDate, "MMMM d, yyyy")
                  ) : (
                    <span>Select date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {[
            ["summary", "Summary"],
            ["medical_summary", "Medical Summary"],
            ["medication_update", "Medication Update"],
            ["nutrition_hydration", "Nutrition & Hydration"],
            ["mobility_physical", "Mobility & Physical"],
            ["cognitive_emotional", "Cognitive & Emotional"],
            ["social_engagement", "Social Engagement"],
          ].map(([field, label]) => (
            <div key={field} className="space-y-1.5">
              <Label htmlFor={field}>{label}</Label>
              <Textarea
                id={field}
                value={(formData as any)[field] || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, [field]: e.target.value }))
                }
                rows={3}
              />
            </div>
          ))}

          <DialogFooter>
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditWellnessReportDialog;
