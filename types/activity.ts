export interface Activity {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  category?: string;
  created_by?: string;
}

export interface ActivityCreate {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  category?: string;
}

export const PREDEFINED_CATEGORIES = ["Outing", "Workshop", "Other"] as const;
export const PREDEFINED_LOCATIONS = [
  "Online",
  "Nursing Home Yard",
  "Common Space",
  "Other",
] as const;

export interface ActivityFilter {
  start_time?: string;
  end_time?: string;
  category?: string;
  tags?: string;
  search?: string;
  sort_by?: "start_time" | "title" | "category";
  sort_order?: "asc" | "desc";
}
