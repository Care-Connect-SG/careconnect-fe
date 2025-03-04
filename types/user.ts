export const enum Role {
    ADMIN = "Admin",
    NURSE = "Nurse",
    FAMILY = "Family"
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: Role;
}

