export interface ResidentRecord {
  id: string;
  full_name: string;
  gender: string;
  date_of_birth: string;
  nric_number: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
  relationship: string;
  room_number: string;
  admission_date: string;
  additional_notes?: string;
  additional_notes_timestamp?: string;
  primary_nurse?: string;
  photograph?: string | null;
}

export interface RegistrationCreate {
  full_name: string;
  gender: string;
  date_of_birth: string;
  nric_number: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
  relationship: string;
  room_number: string;
  admission_date: string;
  additional_notes?: string;
  primary_nurse?: string;
}
