export interface ResidentRecord {
    id: string;
    full_name: string;
    gender: string;
    date_of_birth: string; // ISO date string
    nric_number: string;
    emergency_contact_name: string;
    emergency_contact_number: string;
    relationship: string;
    room_number: string;
    admission_date: string; // ISO date string
    additional_notes?: string;
    primary_nurse?: string;
  }
  