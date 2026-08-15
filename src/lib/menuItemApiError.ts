
type PossibleError = {
  status?: unknown;
  data?: unknown;
  error?: unknown;
};

function readMessage(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  for (const key of [
    "message",
    "error",
    "error_description",
    "detail",
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

export function getMenuItemApiErrorMessage(
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
