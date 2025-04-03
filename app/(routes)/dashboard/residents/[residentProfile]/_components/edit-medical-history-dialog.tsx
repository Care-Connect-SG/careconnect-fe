"use client";

import { updateMedicalHistory } from "@/app/api/medical-history";
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
import { MedicalHistory, MedicalHistoryType } from "@/types/medical-history";
import { DialogDescription } from "@radix-ui/react-dialog";
import { format, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { z } from "zod";

interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "date" | "textarea";
  required?: boolean;
}

interface TemplateConfig {
  label: string;
  schema: z.ZodObject<any>;
  fields: FieldConfig[];
}

const templateConfig: Record<MedicalHistoryType, TemplateConfig> = {
  [MedicalHistoryType.CONDITION]: {
    label: "Condition",
    schema: z.object({
      condition_name: z.string().min(1, "Condition name is required"),
      date_of_diagnosis: z.string().min(1, "Date of diagnosis is required"),
      treating_physician: z.string().min(1, "Treating physician is required"),
      treatment_details: z.string().min(1, "Treatment details are required"),
      current_status: z.string().min(1, "Current status is required"),
    }),
    fields: [
      { name: "condition_name", label: "Condition Name", type: "text" },
      { name: "date_of_diagnosis", label: "Date of Diagnosis", type: "date" },
      { name: "treating_physician", label: "Treating Physician", type: "text" },
      {
        name: "treatment_details",
        label: "Treatment Details",
        type: "textarea",
      },
      { name: "current_status", label: "Current Status", type: "text" },
    ],
  },
  [MedicalHistoryType.ALLERGY]: {
    label: "Allergy",
    schema: z.object({
      allergen: z.string().min(1, "Allergen is required"),
      reaction_description: z
        .string()
        .min(1, "Reaction description is required"),
      date_first_noted: z.string().min(1, "Date first noted is required"),
      severity: z.string().min(1, "Severity is required"),
      management_notes: z.string().optional(),
    }),
    fields: [
      { name: "allergen", label: "Allergen", type: "text" },
      {
        name: "reaction_description",
        label: "Reaction Description",
        type: "text",
      },
      { name: "date_first_noted", label: "Date First Noted", type: "date" },
      { name: "severity", label: "Severity", type: "text" },
      { name: "management_notes", label: "Management Notes", type: "textarea" },
    ],
  },
  [MedicalHistoryType.CHRONIC_ILLNESS]: {
    label: "Chronic Illness",
    schema: z.object({
      illness_name: z.string().min(1, "Illness name is required"),
      date_of_onset: z.string().min(1, "Date of onset is required"),
      managing_physician: z.string().min(1, "Managing physician is required"),
      current_treatment_plan: z
        .string()
        .min(1, "Current treatment plan is required"),
      monitoring_parameters: z
        .string()
        .min(1, "Monitoring parameters are required"),
    }),
    fields: [
      { name: "illness_name", label: "Illness Name", type: "text" },
      { name: "date_of_onset", label: "Date of Onset", type: "date" },
      { name: "managing_physician", label: "Managing Physician", type: "text" },
      {
        name: "current_treatment_plan",
        label: "Current Treatment Plan",
        type: "textarea",
      },
      {
        name: "monitoring_parameters",
        label: "Monitoring Parameters",
        type: "text",
      },
    ],
  },
  [MedicalHistoryType.SURGICAL]: {
    label: "Surgical History",
    schema: z.object({
      procedure: z.string().min(1, "Procedure is required"),
      surgery_date: z.string().min(1, "Surgery date is required"),
      surgeon: z.string().min(1, "Surgeon is required"),
      hospital: z.string().min(1, "Hospital is required"),
      complications: z.string().optional(),
    }),
    fields: [
      { name: "procedure", label: "Procedure", type: "text" },
      { name: "surgery_date", label: "Surgery Date", type: "date" },
      { name: "surgeon", label: "Surgeon", type: "text" },
      { name: "hospital", label: "Hospital", type: "text" },
      { name: "complications", label: "Complications", type: "textarea" },
    ],
  },
  [MedicalHistoryType.IMMUNIZATION]: {
    label: "Immunization",
    schema: z.object({
      vaccine: z.string().min(1, "Vaccine is required"),
      date_administered: z.string().min(1, "Date administered is required"),
      administering_facility: z
        .string()
        .min(1, "Administering facility is required"),
      next_due_date: z.string().optional(),
    }),
    fields: [
      { name: "vaccine", label: "Vaccine", type: "text" },
      { name: "date_administered", label: "Date Administered", type: "date" },
      {
        name: "administering_facility",
        label: "Administering Facility",
        type: "text",
      },
      {
        name: "next_due_date",
        label: "Next Due Date (Optional)",
        type: "date",
        required: false,
      },
    ],
  },
};

const formSchema = z.object({
  formData: z.record(z.string().optional()),
});

type FormValues = z.infer<typeof formSchema>;

interface EditMedicalHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  templateType: MedicalHistoryType;
  residentId: string;
  initialData: MedicalHistory;
  onSave: (updatedData: any) => Promise<void>;
}

const EditMedicalHistoryDialog: React.FC<EditMedicalHistoryDialogProps> = ({
  isOpen,
  onClose,
  templateType,
  residentId,
  initialData,
  onSave,
}) => {
  const { residentProfile } = useParams() as { residentProfile: string };
  const { toast } = useToast();

  const currentTemplate = templateType ? templateConfig[templateType] : null;

  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && initialData && currentTemplate) {
      const values: Record<string, string> = {};
      currentTemplate.fields.forEach((field: FieldConfig) => {
        const value = (initialData as any)[field.name];
        values[field.name] = value ?? "";
      });
      setFormValues(values);
    }
  }, [isOpen, initialData, currentTemplate]);

  useEffect(() => {
    if (!isOpen) {
      setFormValues({});
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!currentTemplate || !initialData) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid record type or record data",
        });
        return;
      }

      const currentSchema = currentTemplate.schema;
      const validatedData = currentSchema.parse(formValues);

      await updateMedicalHistory(
        (initialData as any).id || "",
        templateType,
        residentProfile,
        validatedData,
      );

      toast({
        variant: "default",
        title: "Success",
        description: "Medical record updated successfully.",
      });

      onSave(validatedData);
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error: ${error.message}`,
      });
    }
  };

  if (!isOpen || !currentTemplate) return null;

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
      <DialogContent className="max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Medical Record</DialogTitle>
          <DialogDescription>
            Update the medical record details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {currentTemplate?.fields.map((field: FieldConfig) => (
            <div key={field.name}>
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  value={formValues[field.name] || ""}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      [field.name]: e.target.value,
                    })
                  }
                />
              ) : field.type === "date" ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      type="button"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formValues[field.name] &&
                      isValidDate(formValues[field.name])
                        ? formatDate(formValues[field.name])
                        : `Select ${field.label}`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        formValues[field.name] &&
                        isValidDate(formValues[field.name])
                          ? new Date(formValues[field.name])
                          : undefined
                      }
                      onSelect={(date) => {
                        setFormValues({
                          ...formValues,
                          [field.name]: date
                            ? date.toISOString().split("T")[0]
                            : "",
                        });
                      }}
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <Input
                  type={field.type}
                  id={field.name}
                  value={formValues[field.name] || ""}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      [field.name]: e.target.value,
                    })
                  }
                />
              )}
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

export default EditMedicalHistoryDialog;
