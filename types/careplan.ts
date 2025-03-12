export interface CarePlanRecord {
  id: string;
  resident_id: string;
  created_date: string;
  medical_conditions: string;
  doctor_appointments: string;
  dietary_restrictions: string;
  daily_meal_plan: string;
  hydration: string;
  nutritional_supplements: string;
  bathing_assistance: boolean;
  dressing_assistance: boolean;
  required_assistance: string;
  hobbies_interests: string;
  social_interaction_plan: string;
}
