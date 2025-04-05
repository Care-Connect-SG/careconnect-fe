export interface MedicationAdministrationLog {
  id: string;
  resident_id: string;
  medication_id: string;
  administered_at: string;
  nurse?: string | null;
}
