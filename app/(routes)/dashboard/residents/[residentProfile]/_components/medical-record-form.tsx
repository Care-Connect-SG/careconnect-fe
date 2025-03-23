"use client";

import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  allergySchema,
  chronicSchema,
  conditionSchema,
  immunizationSchema,
  surgicalSchema,
} from "@/lib/schema/medicalRecordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createMedicalRecord } from "../../../../../api/medical-record";

const templateConfig = {
  condition: {
    label: "Condition",
    schema: conditionSchema,
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
  allergy: {
    label: "Allergy",
    schema: allergySchema,
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
  chronic: {
    label: "Chronic Illness",
    schema: chronicSchema,
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
  surgical: {
    label: "Surgical History",
    schema: surgicalSchema,
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
    schema: immunizationSchema,
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
  templateType: z.enum(Object.keys(templateConfig) as [string, ...string[]]),
  formData: z.record(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

const CreateMedicalHistoryDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onRecordCreated?: () => void;
}> = ({ isOpen, onClose, onRecordCreated }) => {
  const { residentProfile } = useParams() as { residentProfile: string };
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateType: "condition",
      formData: {},
    },
  });

  const templateType = form.watch("templateType");
  const currentTemplate =
    templateConfig[templateType as keyof typeof templateConfig];

  const onSubmit = async (data: FormValues) => {
    try {
      const currentSchema = currentTemplate.schema;
      const validatedData = currentSchema.parse(data.formData);

      const createdRecord = await createMedicalRecord(
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
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="templateType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("formData", {});
                    }}
                    defaultValue={field.value}
                  >
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
                        <Textarea {...formField} />
                      ) : (
                        <Input type={field.type} {...formField} />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <DialogFooter>
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMedicalHistoryDialog;
