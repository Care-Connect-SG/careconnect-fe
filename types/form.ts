export type FormElementType =
  | "text"
  | "textarea"
  | "date"
  | "datetime"
  | "radio"
  | "checkbox";

export interface FormElementData {
  element_id: string;
  type: FormElementType;
  label: string;
  helptext: string;
  required: boolean;
  options?: string[];
}

export interface FormCreate {
  title: string;
  description: string | "";
  creator_id: string;
  json_content: FormElementData[];
  status: "Draft" | "Published";
}

export interface FormResponse extends FormCreate {
  id: string;
  created_at: Date;
}
