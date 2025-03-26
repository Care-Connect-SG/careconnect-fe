"use client";

import { createMedicalHistory } from "@/app/api/medical-history";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MedicalHistoryType } from "@/types/medical-history";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription } from "@radix-ui/react-dialog";
import { format, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const templateConfig = {
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
  templateType: z.nativeEnum(MedicalHistoryType),
  formData: z.record(z.string().optional()),
});

type FormValues = z.infer<typeof formSchema>;

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (!isValid(date)) return "";
    return format(date, "PPP");
  } catch (error) {
    return "";
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

const CreateMedicalHistoryDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onRecordCreated?: () => void;
}> = ({ isOpen, onClose, onRecordCreated }) => {
  const { residentProfile } = useParams() as { residentProfile: string };
  const { toast } = useToast();

  const getDefaultFormData = (templateType: MedicalHistoryType) => {
    const template = templateConfig[templateType];
    const defaultData: Record<string, string> = {};
    template.fields.forEach((field) => {
      defaultData[field.name] = "";
    });
    return defaultData;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateType: MedicalHistoryType.CONDITION,
      formData: {},
    },
  });

  const templateType = form.watch("templateType");
  const currentTemplate = templateType ? templateConfig[templateType] : null;

  useEffect(() => {
    if (templateType) {
      form.setValue("formData", getDefaultFormData(templateType));
    }
  }, [templateType, form]);

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        templateType: MedicalHistoryType.CONDITION,
        formData: {},
      });
    }
  }, [isOpen, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (!currentTemplate) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a template type",
        });
        return;
      }

      const currentSchema = currentTemplate.schema;
      const validatedData = currentSchema.parse(data.formData);

      await createMedicalHistory(
        data.templateType,
        residentProfile,
        validatedData,
      );

      toast({
        variant: "default",
        title: "Success",
        description: "Medical record created successfully.",
      });

      if (onRecordCreated) onRecordCreated();
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error: ${error.message}`,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Medical Record</DialogTitle>
          <DialogDescription>
            Select medical record type and fill in the details
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="templateType"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(templateConfig).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {currentTemplate && (
              <>
                {currentTemplate.fields.map((field) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={`formData.${field.name}`}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          {field.type === "textarea" ? (
                            <Textarea
                              {...formField}
                              value={formField.value || ""}
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
                                  {formField.value &&
                                  isValidDate(formField.value)
                                    ? formatDate(formField.value)
                                    : `Select ${field.label}`}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={
                                    formField.value &&
                                    isValidDate(formField.value)
                                      ? new Date(formField.value)
                                      : undefined
                                  }
                                  onSelect={(date) => {
                                    formField.onChange(
                                      date
                                        ? date.toISOString().split("T")[0]
                                        : "",
                                    );
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Input
                              type={field.type}
                              {...formField}
                              value={formField.value || ""}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </>
            )}

            <DialogFooter>
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!templateType}>
                  Save
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMedicalHistoryDialog;
