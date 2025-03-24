"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import React, { useState, useEffect } from "react";

interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "date" | "textarea";
  required?: boolean;
}

interface TemplateConfig {
  label: string;
  fields: FieldConfig[];
}

const templateConfig: Record<string, TemplateConfig> = {
  condition: {
    label: "Condition",
    fields: [
      { name: "condition_name", label: "Condition Name", type: "text" },
      { name: "date_of_diagnosis", label: "Date of Diagnosis", type: "date" },
      { name: "treating_physician", label: "Treating Physician", type: "text" },
      { name: "treatment_details", label: "Treatment Details", type: "textarea" },
      { name: "current_status", label: "Current Status", type: "text" },
    ],
  },
  allergy: {
    label: "Allergy",
    fields: [
      { name: "allergen", label: "Allergen", type: "text" },
      { name: "reaction_description", label: "Reaction Description", type: "text" },
      { name: "date_first_noted", label: "Date First Noted", type: "date" },
      { name: "severity", label: "Severity", type: "text" },
      { name: "management_notes", label: "Management Notes", type: "textarea" },
    ],
  },
  chronic: {
    label: "Chronic Illness",
    fields: [
      { name: "illness_name", label: "Illness Name", type: "text" },
      { name: "date_of_onset", label: "Date of Onset", type: "date" },
      { name: "managing_physician", label: "Managing Physician", type: "text" },
      { name: "current_treatment_plan", label: "Current Treatment Plan", type: "textarea" },
      { name: "monitoring_parameters", label: "Monitoring Parameters", type: "text" },
    ],
  },
  surgical: {
    label: "Surgical History",
    fields: [
      { name: "procedure", label: "Procedure", type: "text" },
      { name: "date", label: "Date", type: "date" },
      { name: "surgeon", label: "Surgeon", type: "text" },
      { name: "hospital", label: "Hospital", type: "text" },
      { name: "complications", label: "Complications", type: "textarea" },
    ],
  },
  immunization: {
    label: "Immunization",
    fields: [
      { name: "vaccine", label: "Vaccine", type: "text" },
      { name: "date_administered", label: "Date Administered", type: "date" },
      { name: "administering_facility", label: "Administering Facility", type: "text" },
      { name: "next_due_date", label: "Next Due Date (Optional)", type: "date", required: false },
    ],
  },
};

interface EditMedicalRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  templateType: string;
  residentId: string;
  initialData: any;
  onSave: (updatedData: any) => Promise<void>;
}

const EditMedicalRecordDialog: React.FC<EditMedicalRecordDialogProps> = ({
  isOpen,
  onClose,
  templateType,
  residentId,
  initialData,
  onSave,
}) => {
  const [formData, setFormData] = useState<any>(initialData);
  const { toast } = useToast();

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
      toast({
        title: "Record updated",
        description: "Medical record updated successfully.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update medical record.",
      });
    }
  };

  if (!isOpen) return null;

  const currentTemplate = templateConfig[templateType as keyof typeof templateConfig];
  if (!currentTemplate) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-6">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle>Edit {currentTemplate.label}</DialogTitle>
          
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {currentTemplate.fields.map((field) => (
            <div key={field.name}>
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleInputChange}
                  required={field.required !== false}
                />
              ) : (
                <Input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleInputChange}
                  required={field.required !== false}
                />
              )}
            </div>
          ))}
          <DialogFooter>
            <div className="flex justify-end">
              <Button type="submit">Save</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMedicalRecordDialog;
