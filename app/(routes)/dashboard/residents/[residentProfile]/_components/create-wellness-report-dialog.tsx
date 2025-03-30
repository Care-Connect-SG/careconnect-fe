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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { useState } from "react";

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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      return dateString;
    }
  };

  const isValidDate = (dateString: string | undefined) => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      return isValid(date);
    } catch (error) {
      return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Wellness Report</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  type="button"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date && isValidDate(formData.date)
                    ? formatDate(formData.date)
                    : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date ? new Date(formData.date) : undefined}
                  onSelect={(date) => {
                    setFormData({
                      ...formData,
                      date: date ? date.toISOString().split("T")[0] : "",
                    });
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="monthly_summary">Monthly Summary</Label>
            <Textarea
              id="monthly_summary"
              value={formData.monthly_summary}
              onChange={(e) =>
                setFormData({ ...formData, monthly_summary: e.target.value })
              }
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="medical_summary">Medical Summary</Label>
            <Textarea
              id="medical_summary"
              value={formData.medical_summary}
              onChange={(e) =>
                setFormData({ ...formData, medical_summary: e.target.value })
              }
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="medication_update">Medication Update</Label>
            <Textarea
              id="medication_update"
              value={formData.medication_update}
              onChange={(e) =>
                setFormData({ ...formData, medication_update: e.target.value })
              }
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="nutrition_hydration">Nutrition & Hydration</Label>
            <Textarea
              id="nutrition_hydration"
              value={formData.nutrition_hydration}
              onChange={(e) =>
                setFormData({ ...formData, nutrition_hydration: e.target.value })
              }
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="mobility_physical">Mobility & Physical</Label>
            <Textarea
              id="mobility_physical"
              value={formData.mobility_physical}
              onChange={(e) =>
                setFormData({ ...formData, mobility_physical: e.target.value })
              }
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="cognitive_emotional">Cognitive & Emotional</Label>
            <Textarea
              id="cognitive_emotional"
              value={formData.cognitive_emotional}
              onChange={(e) =>
                setFormData({ ...formData, cognitive_emotional: e.target.value })
              }
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="social_engagement">Social Engagement</Label>
            <Textarea
              id="social_engagement"
              value={formData.social_engagement}
              onChange={(e) =>
                setFormData({ ...formData, social_engagement: e.target.value })
              }
              rows={3}
            />
          </div>

          <DialogFooter>
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Create Report</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWellnessReportDialog; 