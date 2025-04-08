import { z } from "zod";

export const TimeSchema = z.object({
  hour: z.number(),
  minute: z.number(),
});

export const medicationFormSchema = z.object({
  medication_name: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  schedule_type: z.enum(["day", "week", "custom"]),
  repeat: z.number().optional().default(1),
  days_of_week: z.array(z.string()).optional(),
  times_of_day: z.array(TimeSchema).optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  instructions: z.string().optional(),
});

export type MedicationFormSchema = z.infer<typeof medicationFormSchema>;
