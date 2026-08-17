// export type Relationship = "SELF" | "CHILD" | "PARENT" | "SPOUSE" | "OTHER";
// export type Gender = "MALE" | "FEMALE" | "OTHER";
// export type Severity = "MILD" | "MODERATE" | "SEVERE";
// export type EnforcementLevel = "REQUIRED" | "PREFERRED";
// export type AvoidLevel = "STRICT_BLOCK" | "PREFERRED_AVOID";
// export type DietaryCategory = "RELIGIOUS" | "MEDICAL" | "LIFESTYLE";

// export interface AgeGroup {
//   uuid: string;
//   code: string;
//   name: string;
//   minAge: number;
//   maxAge: number;
// }

// export interface Allergy {
//   uuid: string;
//   code: string;
//   name: string;
//   severity: Severity;
//   reactionNotes: string;
//   avoidCrossContact: boolean;
//   medicallyDiagnosed: boolean;
// }

// export interface DietaryType {
//   uuid: string;
//   code: string;
//   name: string;
//   category: DietaryCategory;
//   enforcementLevel: EnforcementLevel;
//   priority: number;
//   notes: string;
// }

// export interface MedicalCondition {
//   uuid: string;
//   code: string;
//   name: string;
//   severity: Severity;
//   notes: string;
// }

// export interface IngredientAvoid {
//   uuid: string;
//   code: string;
//   name: string;
//   avoidLevel: AvoidLevel;
//   reasonCode: string;
//   notes: string;
// }

// export interface UserProfile {
//   uuid: string;
//   profileName: string;
//   relationship: Relationship;
//   gender: Gender;
//   dateOfBirth: string;
//   preferredLanguage: string;
//   avatarMediaUuid: string | null;
//   ageGroup: AgeGroup;
//   isDefault: boolean;
//   isActive: boolean;
//   allergies: Allergy[];
//   dietaryTypes: DietaryType[];
//   medicalConditions: MedicalCondition[];
//   ingredientAvoids: IngredientAvoid[];
//   createdAt: string;
//   updatedAt: string;
// }

// export interface UserProfilesResponse {
//   userProfiles: UserProfile[];
//   pageNumber: number;
//   pageSize: number;
//   totalElements: number;
//   totalPages: number;
//   first: boolean;
//   last: boolean;
// }


export type AdminUserStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "DISABLED"
  | "DELETED"
  | string;

export interface AdminUser {
  uuid: string;
  username: string;
  primaryEmail: string | null;
  firstName: string | null;
  lastName: string | null;
  emailVerified: boolean;
  status: AdminUserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  avatarMediaUuid?: string | null;
  avatarUrl?: string | null;
  profileImage?: string | null;
  profilePicture?: string | null;
  picture?: string | null;
  image?: string | null;
  imageUrl?: string | null;
  avatar?: string | null;
  defaultProfile?: AdminProfile | null;
  profiles?: AdminProfile[] | null;
}

export interface CreateAdminUserPayload {
  username: string;
  password: string;
  confirmedPassword: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export type MutableAdminUserStatus = "ACTIVE" | "SUSPENDED";

export interface UpdateAdminUserStatusPayload {
  status: MutableAdminUserStatus;
}

export interface AgeGroupResponse {
  uuid: string;
  code: string;
  name: string;
  minAge: number | null;
  maxAge: number | null;
}

export interface AllergyResponse {
  uuid: string;
  code: string;
  name: string;
  severity: string | null;
  reactionNotes: string | null;
  avoidCrossContact: boolean | null;
  medicallyDiagnosed: boolean | null;
}

export interface DietaryTypeResponse {
  uuid: string;
  code: string;
  name: string;
  category: string | null;
  enforcementLevel: string | null;
  priority: number | null;
  notes: string | null;
}

export interface MedicalConditionResponse {
  uuid: string;
  code: string;
  name: string;
  severity: string | null;
  notes: string | null;
}

export interface IngredientAvoidResponse {
  uuid: string;
  code: string;
  name: string;
  avoidLevel: string | null;
  reasonCode: string | null;
  notes: string | null;
}

export interface ProfilePreferenceResponse {
  cuisineCodes: string[] | null;
  tasteCodes: string[] | null;
  textureCodes: string[] | null;
  spiceLevel: string | null;
  minimumBudget: number | null;
  maximumBudget: number | null;
  radiusMeters: number | null;
}

export interface AdminProfile {
  uuid: string;
  profileName: string;
  relationship: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  preferredLanguage: string | null;
  avatarMediaUuid: string | null;
  ageGroup: AgeGroupResponse | null;
  isDefault: boolean | null;
  isActive: boolean | null;
  allergies: AllergyResponse[];
  dietaryTypes: DietaryTypeResponse[];
  medicalConditions: MedicalConditionResponse[];
  ingredientAvoids: IngredientAvoidResponse[];
  preferences: ProfilePreferenceResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPage<T> {
  contents: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AdminPageQuery {
  page?: number;
  size?: number;
  sort?: string;
  query?: string;
}

export interface AdminUserProfilesQuery extends AdminPageQuery {
  userUuid: string;
  active?: boolean;
}

export type UserStatusFilter = "ALL" | "ACTIVE" | "SUSPENDED" | "DISABLED";
export type ProfileStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
