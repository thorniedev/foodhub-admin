import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { getAdminApiErrorMessage } from "./adminApiError";

/** Field names on both CreateBannerFormValues and UpdateBannerFormValues. */
const BANNER_FORM_FIELDS = ["category", "title", "location", "description", "image"] as const;
type BannerFormField = (typeof BANNER_FORM_FIELDS)[number];

interface BackendErrorBody {
  message?: unknown;
  fieldErrors?: unknown;
}

function isBackendErrorBody(value: unknown): value is BackendErrorBody {
  return typeof value === "object" && value !== null;
}

/**
 * Best-effort mapping for BadRequestException messages that don't carry a
 * structured fieldErrors map (e.g. BannerServiceImpl#validateState throws a
 * single message like "Location is required for LOCATION banner").
 * MethodArgumentNotValidException responses already carry fieldErrors keyed
 * by the exact CreateBannerRequest/UpdateBannerRequest field names, which
 * match our Zod schema field names one-to-one, so no mapping is needed there.
 */
function guessFieldFromMessage(message: string): BannerFormField | null {
  const lower = message.toLowerCase();
  if (lower.includes("image")) return "image";
  if (lower.includes("location")) return "location";
  if (lower.includes("title")) return "title";
  if (lower.includes("category")) return "category";
  return null;
}

export interface BannerFormErrorResult {
  /** Message to show as a form-level error near the submit button. */
  formMessage: string;
  /** Field-level errors to apply with react-hook-form's setError. */
  fieldErrors: Partial<Record<BannerFormField, string>>;
}

export function resolveBannerFormError(error: unknown): BannerFormErrorResult {
  const formMessage = getAdminApiErrorMessage(error);
  const fieldErrors: Partial<Record<BannerFormField, string>> = {};

  if (error && typeof error === "object" && "status" in error) {
    const queryError = error as FetchBaseQueryError;
    const data = "data" in queryError ? queryError.data : undefined;

    if (isBackendErrorBody(data)) {
      if (data.fieldErrors && typeof data.fieldErrors === "object") {
        for (const [key, value] of Object.entries(
          data.fieldErrors as Record<string, unknown>,
        )) {
          if (
            typeof value === "string" &&
            (BANNER_FORM_FIELDS as readonly string[]).includes(key)
          ) {
            fieldErrors[key as BannerFormField] = value;
          }
        }
      } else if (typeof data.message === "string") {
        const guessedField = guessFieldFromMessage(data.message);
        if (guessedField) {
          fieldErrors[guessedField] = data.message;
        }
      }
    }
  }

  return { formMessage, fieldErrors };
}
