import { FormElementData } from "@/hooks/useFormReducer";

export interface FormCreate {
  title: string;
  description: string | "";
  creator_id: string;
  json_content: FormElementData[];
  status: "Draft" | "Published";
}

export interface FormResponse extends FormCreate {
  id: string;
  created_at: string;
}
