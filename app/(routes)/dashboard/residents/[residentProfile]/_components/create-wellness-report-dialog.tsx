"use client";

import { createWellnessReport } from "@/app/api/wellness-report";
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
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Bot, CalendarIcon, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";

interface CreateWellnessReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  residentId: string;
  onReportCreated: () => void;
}

const CreateWellnessReportDialog: React.FC<CreateWellnessReportDialogProps> = ({
  isOpen,
  onClose,
  residentId,
  onReportCreated,
}) => {
  const { toast } = useToast();
  const [isFetchingAI, setIsFetchingAI] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    monthly_summary: "",
    medical_summary: "",
    medication_update: "",
    nutrition_hydration: "",
    mobility_physical: "",
    cognitive_emotional: "",
    social_engagement: "",
  });

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      setSelectedDate(today);
      setFormData({
        date: format(today, "yyyy-MM-dd"),
        monthly_summary: "",
        medical_summary: "",
        medication_update: "",
        nutrition_hydration: "",
        mobility_physical: "",
        cognitive_emotional: "",
        social_engagement: "",
      });
      setAiGenerated(false);
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
      const today = new Date();
      setSelectedDate(today);
      setFormData({
        ...formData,
        date: format(today, "yyyy-MM-dd"),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createWellnessReport(residentId, formData);
      toast({
        variant: "default",
        title: "Success",
        description: "Wellness report created successfully.",
      });
      onReportCreated();
      onClose();
    } catch (error: any) {
      console.error("Error creating wellness report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error: ${error.message}`,
      });
    }
  };

  const handleGenerateAI = async () => {
    setIsFetchingAI(true);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/wellness-reports/generate-suggestion`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const aiData = await response.json();

      let reportDate: Date;
      try {
        if (aiData.date) {
          reportDate = new Date(aiData.date);
          if (isNaN(reportDate.getTime())) {
            reportDate = new Date();
          }
        } else {
          reportDate = new Date();
        }
      } catch (error) {
        reportDate = new Date();
      }

      setSelectedDate(reportDate);

      setFormData({
        date: format(reportDate, "yyyy-MM-dd"),
        monthly_summary: aiData.monthly_summary || "",
        medical_summary: aiData.medical_summary || "",
        medication_update: aiData.medication_update || "",
        nutrition_hydration: aiData.nutrition_hydration || "",
        mobility_physical: aiData.mobility_physical || "",
        cognitive_emotional: aiData.cognitive_emotional || "",
        social_engagement: aiData.social_engagement || "",
      });
      setAiGenerated(true);

      toast({
        variant: "default",
        title: "AI Suggestion Applied",
        description: "The report has been pre-filled with AI-generated data.",
      });
    } catch (error: any) {
      console.error("Error fetching AI suggestion:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to generate AI suggestion: ${error.message}`,
      });
    } finally {
      setIsFetchingAI(false);
    }
  };

  const handleClearAll = () => {
    const today = new Date();
    setSelectedDate(today);
    setFormData({
      date: format(today, "yyyy-MM-dd"),
      monthly_summary: "",
      medical_summary: "",
      medication_update: "",
      nutrition_hydration: "",
      mobility_physical: "",
      cognitive_emotional: "",
      social_engagement: "",
    });
    setAiGenerated(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Create Wellness Report</DialogTitle>
          <div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleGenerateAI}
              disabled={isFetchingAI}
              className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500 hover:text-green-500 transition-all hover:duration-300"
            >
              {isFetchingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                  Getting Suggestion...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 text-green-500" />
                  Get AI Suggestion
                </>
              )}
            </Button>
          </div>
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
            ["monthly_summary", "Monthly Summary"],
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
                value={(formData as any)[field]}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, [field]: e.target.value }))
                }
                rows={3}
                className={aiGenerated ? "bg-green-50 border-green-500" : ""}
              />
            </div>
          ))}

          <DialogFooter>
            <div className="flex justify-between items-center w-full">
              <Button type="button" variant="outline" onClick={handleClearAll}>
                Clear All
              </Button>
              <div className="space-x-2">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Create Report</Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWellnessReportDialog;
