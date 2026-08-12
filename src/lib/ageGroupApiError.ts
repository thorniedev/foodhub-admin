type UnknownRecord =
  Record<
    string,
    unknown
  >;

function asRecord(
  value: unknown,
): UnknownRecord | null {
  if (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(value)
  ) {
    return value as UnknownRecord;
  }

  return null;
}

function readString(
  object:
    | UnknownRecord
    | null,
  keys: string[],
): string | null {
  if (!object) {
    return null;
  }

  for (
    const key of keys
  ) {
    const value =
      object[key];

    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      return value;
    }
  }

  return null;
}

export function getAgeGroupApiErrorMessage(
  error: unknown,
): string {
  const root =
    asRecord(error);

  const direct =
    readString(
      root,
      [
        "message",
        "error",
      ],
    );

  if (direct) {
    return direct;
  }

  if (
    typeof root?.data ===
    "string"
  ) {
    return root.data;
  }

  const data =
    asRecord(
      root?.data,
    );

  const nested =
    readString(
      data,
      [
        "message",
        "error",
        "error_description",
      ],
    );

  if (nested) {
    return nested;
  }

  return "មានបញ្ហាក្នុងការទាញយកទិន្នន័យក្រុមអាយុ។";
}