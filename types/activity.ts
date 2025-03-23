export interface Activity {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  category: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ActivityCreate {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  category: string;
}

export interface ActivityFilter {
  search?: string;
  location?: string;
  category?: string;
  start_date?: string;
}

export const PREDEFINED_CATEGORIES = [
  "Exercise",
  "Social",
  "Medical",
  "Entertainment",
  "Education",
  "Meal",
  "Therapy",
  "Other"
] as const;

export const PREDEFINED_LOCATIONS = [
  "Common Room",
  "Dining Hall",
  "Garden",
  "Gym",
  "Library",
  "Medical Center",
  "Recreation Room",
  "Therapy Room",
  "Other"
] as const;

export type Category = typeof PREDEFINED_CATEGORIES[number];
export type Location = typeof PREDEFINED_LOCATIONS[number];
