export interface User {
  id: string;
  email: string;
  name: string;
  contact_number?: string;
  role: Role;
  organisation_rank?: string;
  gender: Gender;
  created_at: string;
}

export enum Role {
  ADMIN = "Admin",
  NURSE = "Nurse",
  FAMILY = "Family"
}

export enum Gender {
  MALE = "Male",
  FEMALE = "Female"
}

