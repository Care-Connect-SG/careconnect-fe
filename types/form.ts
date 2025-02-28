export interface FormBase {
  title: string;
  description: string | "";
  creator_id: string;
  json_content: Record<string, any>;
}

export interface FormComplete extends FormBase {
  _id: string;
  created_date: string;
  status: "Draft" | "Published";
}
