import { z } from "zod";

export const reportSectionSchema = z.object({
  form_element_id: z.string(),
  input: z.union([z.string(), z.array(z.string())]),
});

export const residentTagSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const caregiverTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
});

export const reportSchema = z.object({
  report_content: z.array(reportSectionSchema),
  primary_resident: residentTagSchema.nullable(),
  involved_residents: z.array(residentTagSchema),
  involved_caregivers: z.array(caregiverTagSchema),
});

export type ReportSchema = z.infer<typeof reportSchema>;
