import { baseApi } from "./baseApi";

import type {
  AllergyResponse,
  DietaryTypeResponse,
  IngredientAvoidResponse,
  MedicalConditionResponse,
} from "@/src/types/userProfile";

type SafetyListKey =
  | "allergies"
  | "dietaryTypes"
  | "medicalConditions"
  | "ingredientAvoids";

const domainKeyAliases: Record<SafetyListKey, string[]> = {
  allergies: ["allergies", "allergens"],
  dietaryTypes: ["dietaryTypes", "dietary_types"],
  medicalConditions: ["medicalConditions", "medical_conditions"],
  ingredientAvoids: ["ingredientAvoids", "ingredient_avoids"],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function findList(
  response: unknown,
  domainKey: SafetyListKey,
  depth = 0,
): unknown[] | null {
  if (Array.isArray(response)) {
    return response;
  }

  if (!isRecord(response) || depth > 2) {
    return null;
  }

  for (const key of [
    ...domainKeyAliases[domainKey],
    "content",
    "contents",
    "items",
    "assignments",
    "data",
    "payload",
    "result",
  ]) {
    if (!(key in response)) {
      continue;
    }

    const value = response[key];

    if (value === null && domainKeyAliases[domainKey].includes(key)) {
      return [];
    }

    const list = findList(value, domainKey, depth + 1);

    if (list) {
      return list;
    }
  }

  return null;
}

export function normalizeProfileSafetyList<T>(
  response: unknown,
  domainKey: SafetyListKey,
): T[] {
  if (response === null) {
    return [];
  }

  const list = findList(response, domainKey);

  if (!list) {
    throw new Error(`Unexpected ${domainKey} response from the profile API.`);
  }

  return list as T[];
}

function profileSafetyUrl(profileUuid: string, resource: string) {
  return `/api/profiles/${encodeURIComponent(profileUuid)}/safety/${resource}`;
}

export const profileSafetyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfileAllergies: builder.query<AllergyResponse[], string>({
      query: (profileUuid) => profileSafetyUrl(profileUuid, "allergies"),
      transformResponse: (response: unknown) =>
        normalizeProfileSafetyList<AllergyResponse>(response, "allergies"),
    }),

    getProfileDietaryTypes: builder.query<DietaryTypeResponse[], string>({
      query: (profileUuid) => profileSafetyUrl(profileUuid, "dietary-types"),
      transformResponse: (response: unknown) =>
        normalizeProfileSafetyList<DietaryTypeResponse>(
          response,
          "dietaryTypes",
        ),
    }),

    getProfileMedicalConditions: builder.query<
      MedicalConditionResponse[],
      string
    >({
      query: (profileUuid) =>
        profileSafetyUrl(profileUuid, "medical-conditions"),
      transformResponse: (response: unknown) =>
        normalizeProfileSafetyList<MedicalConditionResponse>(
          response,
          "medicalConditions",
        ),
    }),

    getProfileIngredientAvoids: builder.query<
      IngredientAvoidResponse[],
      string
    >({
      query: (profileUuid) =>
        profileSafetyUrl(profileUuid, "ingredient-avoids"),
      transformResponse: (response: unknown) =>
        normalizeProfileSafetyList<IngredientAvoidResponse>(
          response,
          "ingredientAvoids",
        ),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetProfileAllergiesQuery,
  useGetProfileDietaryTypesQuery,
  useGetProfileMedicalConditionsQuery,
  useGetProfileIngredientAvoidsQuery,
} = profileSafetyApi;
