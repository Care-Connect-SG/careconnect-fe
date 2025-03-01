import { FormElementData } from "@/hooks/useFormReducer";

export interface FormBase {
  title: string;
  description: string | "";
  creator_id: string;
  json_content: FormElementData[];
  status: "Draft" | "Published";
}

export interface FormComplete extends FormBase {
  _id: string;
  created_date: string;
}
