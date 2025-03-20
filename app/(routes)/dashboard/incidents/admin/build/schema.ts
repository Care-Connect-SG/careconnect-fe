import { z } from "zod";

export const formElementSchema = z.object({
  element_id: z.string(),
  type: z.enum(["text", "textarea", "date", "datetime", "radio", "checkbox"]),
  label: z.string().min(1, "Label is required."),
  helptext: z.string().default(""),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
});

export const formSchema = z.object({
  title: z.string().min(1, "Form title is required."),
  description: z.string().default(""),
  elements: z
    .array(formElementSchema)
    .min(1, "A form should have at least a form element."),
});

export type FormElementSchema = z.infer<typeof formElementSchema>;
export type FormElementType = FormElementSchema["type"];
export type FormSchema = z.infer<typeof formSchema>;
