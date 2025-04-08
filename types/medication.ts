export interface MedicationRecord {
  id: string;
  resident_id: string;
  medication_name: string;
  dosage: string;
  repeat: number;
  schedule_type: "day" | "week" | "custom";
  days_of_week?: string[];
  times_of_day?: { hour: number; minute: number }[];
  start_date: string;
  end_date?: string;
  instructions?: string;
}
