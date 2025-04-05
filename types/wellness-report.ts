export interface WellnessReportRecord {
  id?: string;
  resident_id: string;
  date: string;
  summary?: string;
  medical_summary?: string;
  medication_update?: string;
  nutrition_hydration?: string;
  mobility_physical?: string;
  cognitive_emotional?: string;
  social_engagement?: string;
  created_at?: string;
  updated_at?: string;
}
