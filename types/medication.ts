export interface MedicationRecord {
    id: string; // Unique identifier for the medication
    resident_id: string; // The resident this medication belongs to
    medication_name: string;
    dosage: string;
    frequency: string;
    start_date: string; // ISO date string format
    end_date?: string; // Optional, might be null
    instructions?: string; // Optional instructions for usage
  }
  