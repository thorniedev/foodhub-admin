/**
 * Request payload for creating a member profile via `POST /api/profiles`.
 *
 * The scalar fields are validated in the route handler; the reference lists are
 * forwarded to the FoodHub backend as-is. Field types mirror the profile domain
 * modelled in `../userProfile.ts` (the corresponding *Response types).
 */

export type MemberProfileRelationship =
  | "SELF"
  | "CHILD"
  | "PARENT"
  | "SPOUSE"
  | "OTHER";

export type MemberProfileGender = "MALE" | "FEMALE" | "OTHER";

export interface MemberProfileAllergyInput {
  uuid: string;
  severity?: string | null;
  reactionNotes?: string | null;
  avoidCrossContact?: boolean | null;
  medicallyDiagnosed?: boolean | null;
}

export interface MemberProfileDietaryTypeInput {
  uuid: string;
  enforcementLevel?: string | null;
  priority?: number | null;
  notes?: string | null;
}

export interface MemberProfileMedicalConditionInput {
  uuid: string;
  severity?: string | null;
  notes?: string | null;
}

export interface MemberProfileIngredientAvoidInput {
  uuid: string;
  avoidLevel?: string | null;
  reasonCode?: string | null;
  notes?: string | null;
}

export interface MemberProfilePreferenceInput {
  cuisineCodes?: string[] | null;
  tasteCodes?: string[] | null;
  textureCodes?: string[] | null;
  spiceLevel?: string | null;
  minimumBudget?: number | null;
  maximumBudget?: number | null;
  radiusMeters?: number | null;
}

export interface CreateMemberProfileRequest {
  profileName: string;
  relationship: MemberProfileRelationship;
  gender: MemberProfileGender;
  dateOfBirth: string;
  preferredLanguage?: string;
  avatarMediaUuid?: string | null;
  isDefault?: boolean;
  allergies?: MemberProfileAllergyInput[];
  dietaryTypes?: MemberProfileDietaryTypeInput[];
  medicalConditions?: MemberProfileMedicalConditionInput[];
  ingredientAvoids?: MemberProfileIngredientAvoidInput[];
  preferences?: MemberProfilePreferenceInput | null;
}
