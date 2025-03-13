export enum Role {
  ADMIN = "Admin",
  NURSE = "Nurse",
  FAMILY = "Family",
}

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
}

export interface UserEdit {
  email: string;
  name: string;
  contact_number?: string;
  role: string;
  organisation_rank?: string;
  gender: string;
  created_at: string;
}

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

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: Role;
}
