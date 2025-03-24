export interface ConditionRecord {
  id: string;
  condition_name: string;
  date_of_diagnosis: string;
  treating_physician: string;
  treatment_details: string;
  current_status: string;
  resident_id?: string;
}

export interface AllergyRecord {
  id: string;
  allergen: string;
  reaction_description: string;
  date_first_noted: string;
  severity: string;
  management_notes?: string;
  resident_id?: string;
}

export interface ChronicIllnessRecord {
  id: string;
  illness_name: string;
  date_of_onset: string;
  managing_physician: string;
  current_treatment_plan: string;
  monitoring_parameters: string;
  resident_id?: string;
}

export interface SurgicalHistoryRecord {
  id: string;
  procedure: string;
  date: string;
  surgeon: string;
  hospital: string;
  complications?: string;
  resident_id?: string;
}

export interface ImmunizationRecord {
  id: string;
  vaccine: string;
  date_administered: string;
  administering_facility: string;
  next_due_date?: string;
  resident_id?: string;
}

export type MedicalRecord =
  | ConditionRecord
  | AllergyRecord
  | ChronicIllnessRecord
  | SurgicalHistoryRecord
  | ImmunizationRecord;

export function inferTemplateType(record: MedicalRecord): string {
  if ("condition_name" in record) return "condition";
  if ("allergen" in record) return "allergy";
  if ("illness_name" in record) return "chronic";
  if ("procedure" in record) return "surgical";
  if ("vaccine" in record) return "immunization";
  throw new Error("Unknown medical record type");
}
