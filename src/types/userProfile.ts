export type Relationship = "SELF" | "CHILD" | "PARENT" | "SPOUSE" | "OTHER";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type Severity = "MILD" | "MODERATE" | "SEVERE";
export type EnforcementLevel = "REQUIRED" | "PREFERRED";
export type AvoidLevel = "STRICT_BLOCK" | "PREFERRED_AVOID";
export type DietaryCategory = "RELIGIOUS" | "MEDICAL" | "LIFESTYLE";

export interface AgeGroup {
  uuid: string;
  code: string;
  name: string;
  minAge: number;
  maxAge: number;
}

export interface Allergy {
  uuid: string;
  code: string;
  name: string;
  severity: Severity;
  reactionNotes: string;
  avoidCrossContact: boolean;
  medicallyDiagnosed: boolean;
}

export interface DietaryType {
  uuid: string;
  code: string;
  name: string;
  category: DietaryCategory;
  enforcementLevel: EnforcementLevel;
  priority: number;
  notes: string;
}

export interface MedicalCondition {
  uuid: string;
  code: string;
  name: string;
  severity: Severity;
  notes: string;
}

export interface IngredientAvoid {
  uuid: string;
  code: string;
  name: string;
  avoidLevel: AvoidLevel;
  reasonCode: string;
  notes: string;
}

export interface UserProfile {
  uuid: string;
  profileName: string;
  relationship: Relationship;
  gender: Gender;
  dateOfBirth: string;
  preferredLanguage: string;
  avatarMediaUuid: string | null;
  ageGroup: AgeGroup;
  isDefault: boolean;
  isActive: boolean;
  allergies: Allergy[];
  dietaryTypes: DietaryType[];
  medicalConditions: MedicalCondition[];
  ingredientAvoids: IngredientAvoid[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfilesResponse {
  userProfiles: UserProfile[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}