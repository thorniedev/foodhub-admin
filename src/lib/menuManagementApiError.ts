type PossibleError = {
  status?: unknown;
  data?: unknown;
  error?: unknown;
};

function extractFieldErrors(data: Record<string, unknown>): string[] {
  const messages: string[] = [];

  // 1. fieldErrors as Map or Array
  if (data.fieldErrors && typeof data.fieldErrors === "object") {
    if (Array.isArray(data.fieldErrors)) {
      for (const item of data.fieldErrors) {
        if (typeof item === "string" && item.trim()) {
          messages.push(item.trim());
        } else if (item && typeof item === "object") {
          const f = item as { field?: string; message?: string; error?: string };
          const text = f.message || f.error;
          if (text) {
            messages.push(f.field ? `${f.field}: ${text}` : text);
          }
        }
      }
    } else {
      for (const [field, error] of Object.entries(data.fieldErrors)) {
        if (typeof error === "string" && error.trim()) {
          messages.push(`${field}: ${error.trim()}`);
        } else if (Array.isArray(error)) {
          const text = error.filter(Boolean).join(", ");
          if (text) messages.push(`${field}: ${text}`);
        }
      }
    }
  }

  // 2. errors as Map or Array
  if (data.errors && typeof data.errors === "object") {
    if (Array.isArray(data.errors)) {
      for (const item of data.errors) {
        if (typeof item === "string" && item.trim()) {
          messages.push(item.trim());
        } else if (item && typeof item === "object") {
          const f = item as { field?: string; message?: string; defaultMessage?: string };
          const text = f.message || f.defaultMessage;
          if (text) {
            messages.push(f.field ? `${f.field}: ${text}` : text);
          }
        }
      }
    } else {
      for (const [field, error] of Object.entries(data.errors)) {
        if (typeof error === "string" && error.trim()) {
          messages.push(`${field}: ${error.trim()}`);
        }
      }
    }
  }

  // 3. violations as Array
  if (Array.isArray(data.violations)) {
    for (const v of data.violations) {
      if (v && typeof v === "object") {
        const item = v as { propertyPath?: string; message?: string };
        if (item.message) {
          messages.push(item.propertyPath ? `${item.propertyPath}: ${item.message}` : item.message);
        }
      }
    }
  }

  return messages;
}

function readMessage(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  const fieldErrors = extractFieldErrors(record);
  if (fieldErrors.length > 0) {
    return fieldErrors.join(" | ");
  }

  for (const key of [
    "message",
    "error",
    "error_description",
    "detail",
    "description",
    "errorCode",
  ]) {
    const candidate = record[key];

    if (
      typeof candidate === "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  return null;
}

export function getMenuManagementApiError(
  error: unknown,
): string {
  if (!error) {
    return "មានបញ្ហាមិនស្គាល់។";
  }

  const candidate =
    error as PossibleError;

  const fromData =
    readMessage(candidate.data);

  if (fromData) {
    return fromData;
  }

  const fromError =
    readMessage(candidate.error);

  if (fromError) {
    return fromError;
  }

  if (
    typeof candidate.status === "number"
  ) {
    return `Request failed (${candidate.status}).`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "មិនអាចភ្ជាប់ទៅ FoodHub API បានទេ។";
}
