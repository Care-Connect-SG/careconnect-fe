export enum MedicalHistoryType {
  CONDITION = "condition",
  ALLERGY = "allergy",
  CHRONIC_ILLNESS = "chronic",
  SURGICAL = "surgical",
  IMMUNIZATION = "immunization",
}

export interface ConditionRecord {
  id: string;
  condition_name: string;
  date_of_diagnosis: string;
  treating_physician: string;
  treatment_details: string;
  current_status: string;
  resident_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AllergyRecord {
  id: string;
  allergen: string;
  reaction_description: string;
  date_first_noted: string;
  severity: string;
  management_notes?: string;
  resident_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChronicIllnessRecord {
  id: string;
  illness_name: string;
  date_of_onset: string;
  managing_physician: string;
  current_treatment_plan: string;
  monitoring_parameters: string;
  resident_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SurgicalHistoryRecord {
  id: string;
  procedure: string;
  surgery_date: string;
  surgeon: string;
  hospital: string;
  complications?: string;
  resident_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ImmunizationRecord {
  id: string;
  vaccine: string;
  date_administered: string;
  administering_facility: string;
  next_due_date?: string;
  resident_id?: string;
  created_at?: string;
  updated_at?: string;
}

export type MedicalHistory =
  | ConditionRecord
  | AllergyRecord
  | ChronicIllnessRecord
  | SurgicalHistoryRecord
  | ImmunizationRecord;

export function inferTemplateType(record: MedicalHistory): MedicalHistoryType {
  if ("condition_name" in record) return MedicalHistoryType.CONDITION;
  if ("allergen" in record) return MedicalHistoryType.ALLERGY;
  if ("illness_name" in record) return MedicalHistoryType.CHRONIC_ILLNESS;
  if ("procedure" in record) return MedicalHistoryType.SURGICAL;
  if ("vaccine" in record) return MedicalHistoryType.IMMUNIZATION;
  throw new Error("Unknown medical record type");
}
