"use client";

import {
  createWellnessReport,
  generateAIWellnessReport,
} from "@/app/api/wellness-report";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { format } from "date-fns";
import {
  AlertCircle,
  Bot,
  CalendarIcon,
  CheckCircle2,
  Loader2,
} from "lucide-react";
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
  const [step, setStep] = useState<"input" | "form">("input");

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  const [aiContext, setAIContext] = useState("");
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    summary: "",
    medical_summary: "",
    medication_update: "",
    nutrition_hydration: "",
    mobility_physical: "",
    cognitive_emotional: "",
    social_engagement: "",
  });

  const hasContent = Object.entries(formData).some(
    ([key, value]) => key !== "date" && value !== "",
  );

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      setSelectedDate(today);
      setFormData({
        date: format(today, "yyyy-MM-dd"),
        summary: "",
        medical_summary: "",
        medication_update: "",
        nutrition_hydration: "",
        mobility_physical: "",
        cognitive_emotional: "",
        social_engagement: "",
      });
      setAIContext("");
      setAiGenerated(false);
      setStep("input");
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
      const aiData = await generateAIWellnessReport(residentId, {
        context: aiContext,
      });

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
        summary: aiData.summary || "",
        medical_summary: aiData.medical_summary || "",
        medication_update: aiData.medication_update || "",
        nutrition_hydration: aiData.nutrition_hydration || "",
        mobility_physical: aiData.mobility_physical || "",
        cognitive_emotional: aiData.cognitive_emotional || "",
        social_engagement: aiData.social_engagement || "",
      });
      setAiGenerated(true);
      setStep("form");

      toast({
        variant: "default",
        title: "AI Report Generated",
        description: "Review and edit the report before submitting.",
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

  const handleManualEntry = () => {
    setStep("form");
  };

  const handleClearAll = () => {
    const today = new Date();
    setSelectedDate(today);
    setFormData({
      date: format(today, "yyyy-MM-dd"),
      summary: "",
      medical_summary: "",
      medication_update: "",
      nutrition_hydration: "",
      mobility_physical: "",
      cognitive_emotional: "",
      social_engagement: "",
    });
    setAIContext("");
    setAiGenerated(false);
  };

  const reportFields = [
    ["summary", "Summary"],
    ["medical_summary", "Medical Summary"],
    ["medication_update", "Medication Update"],
    ["nutrition_hydration", "Nutrition & Hydration"],
    ["mobility_physical", "Mobility & Physical"],
    ["cognitive_emotional", "Cognitive & Emotional"],
    ["social_engagement", "Social Engagement"],
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader className="flex flex-row items-center justify-between mb-4">
          <DialogTitle className="text-xl font-semibold">
            {step === "input"
              ? "Create Wellness Report"
              : "Edit Wellness Report"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="max-h-[60vh] overflow-y-auto px-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Report Date</Label>
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
                  />
                </PopoverContent>
              </Popover>
            </div>

            {step === "input" ? (
              <div className="space-y-6 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="aiContext">Context Information</Label>
                  <Textarea
                    id="aiContext"
                    value={aiContext}
                    onChange={(e) => setAIContext(e.target.value)}
                    placeholder="Enter relevant information about the resident's recent activities, health changes, social interactions, or specific areas to focus on..."
                    rows={5}
                    className="resize-none"
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <Card className="border border-green-200 bg-green-50">
                    <CardContent className="p-4 flex items-start gap-3">
                      <Bot className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-green-800 mb-1">
                          Generate with AI
                        </h3>
                        <p className="text-sm text-green-700">
                          Let AI generate a complete wellness report based on
                          your context. You'll be able to review and edit all
                          sections before submitting.
                        </p>
                        <Button
                          type="button"
                          onClick={handleGenerateAI}
                          disabled={isFetchingAI}
                          variant="outline"
                          className="mt-2 flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500 hover:text-green-500 transition-all hover:duration-300"
                        >
                          {isFetchingAI ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin text-green-500" />
                              Generating Report...
                            </>
                          ) : (
                            "Generate AI Report"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border">
                    <CardContent className="p-4 flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium mb-1">Manual Entry</h3>
                        <p className="text-sm text-gray-600">
                          Create the wellness report manually by filling out
                          each section yourself.
                        </p>
                        <Button
                          type="button"
                          onClick={handleManualEntry}
                          variant="outline"
                          className="mt-3"
                        >
                          Create Manually
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <>
                {reportFields.map(([field, label]) => (
                  <div key={field} className="space-y-1.5">
                    <Label htmlFor={field}>{label}</Label>
                    <Textarea
                      id={field}
                      value={(formData as any)[field]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                      rows={3}
                      className={cn(
                        "h-[100px]",
                        aiGenerated ? "bg-green-50 border-green-200" : "",
                      )}
                    />
                  </div>
                ))}

                <div className="flex items-center text-sm text-amber-600 gap-1 mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    All fields are required. Please fill in all sections before
                    submitting.
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <div className="flex justify-between items-center w-full">
              <div>
                {step === "form" && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep("input")}
                    className="text-gray-500"
                  >
                    Back
                  </Button>
                )}
              </div>
              <div className="space-x-2">
                {step === "form" && hasContent && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearAll}
                  >
                    Clear All
                  </Button>
                )}

                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>

                {step === "form" && (
                  <Button
                    type="submit"
                    disabled={
                      !Object.entries(formData).some(
                        ([key, value]) => key !== "date" && value !== "",
                      ) ||
                      Object.entries(formData).some(
                        ([key, value]) => key !== "date" && value === "",
                      )
                    }
                  >
                    Create Report
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWellnessReportDialog;
