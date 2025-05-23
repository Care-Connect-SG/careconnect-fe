export enum Role {
  ADMIN = "Admin",
  NURSE = "Nurse",
}

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
}

export interface UserEdit {
  name: string;
  contact_number?: string;
  organisation_rank?: string;
  profile_picture?: string | null;
  gender: string;
  telegram_handle?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  contact_number?: string;
  role: Role;
  organisation_rank?: string;
  telegram_handle?: string;
  gender: Gender;
  profile_picture?: string | null;
  created_at: string;
}
