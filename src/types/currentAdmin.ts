export interface CurrentAdmin {
  uuid: string;

  username: string;

  // Your backend examples use `email`.
  email?: string | null;

  // Keep this too in case another current-user DTO uses primaryEmail.
  primaryEmail?: string | null;

  firstName: string | null;
  lastName: string | null;

  emailVerified: boolean;

  status:
    | "ACTIVE"
    | "INACTIVE"
    | "SUSPENDED"
    | string;

  lastLoginAt: string | null;

  createdAt: string;
  updatedAt: string;

  deletedAt?: string | null;
}