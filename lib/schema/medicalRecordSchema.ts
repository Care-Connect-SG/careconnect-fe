import { z } from "zod";

export const conditionSchema = z.object({
  condition_name: z.string(),
  date_of_diagnosis: z.string(),
  treating_physician: z.string(),
  treatment_details: z.string(),
  current_status: z.string(),
});

export const allergySchema = z.object({
  allergen: z.string(),
  reaction_description: z.string(),
  date_first_noted: z.string(),
  severity: z.string(),
  management_notes: z.string(),
});

export const chronicSchema = z.object({
  illness_name: z.string(),
  date_of_onset: z.string(),
  managing_physician: z.string(),
  current_treatment_plan: z.string(),
  monitoring_parameters: z.string(),
});

export const surgicalSchema = z.object({
  procedure: z.string(),
  date: z.string(),
  surgeon: z.string(),
  hospital: z.string(),
  complications: z.string(),
});

export const immunizationSchema = z.object({
  vaccine: z.string(),
  date_administered: z.string(),
  administering_facility: z.string(),
  next_due_date: z.string().optional(),
});

export type MedicalRecord =
  | z.infer<typeof conditionSchema>
  | z.infer<typeof allergySchema>
  | z.infer<typeof chronicSchema>
  | z.infer<typeof surgicalSchema>
  | z.infer<typeof immunizationSchema>;
