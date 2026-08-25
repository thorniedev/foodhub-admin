import type { AdminProfile } from "./userProfile";

export interface CurrentAdmin {
  uuid: string;

  username: string;
  preferredUsername?: string | null;
  preferred_username?: string | null;

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

  role?: string | null;
  roles?: string[];
  userType?: string | null;

  avatarMediaUuid?: string | null;
  avatarUrl?: string | null;
  profileImageUrl?: string | null;
  profileImage?: string | null;
  profilePicture?: string | null;
  profilePictureMediaUuid?: string | null;
  picture?: string | null;
  photoUrl?: string | null;
  image?: string | null;
  imageUrl?: string | null;
  avatar?: string | null;

  defaultProfile?: AdminProfile | null;
  profiles?: AdminProfile[] | null;
}
