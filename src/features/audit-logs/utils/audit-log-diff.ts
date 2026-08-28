export type DiffType = "ADDED" | "REMOVED" | "MODIFIED" | "UNCHANGED";

export interface PropertyDiff {
  key: string;
  path: string;
  beforeValue: any;
  afterValue: any;
  type: DiffType;
}

export interface DiffResult {
  diffs: PropertyDiff[];
  addedCount: number;
  modifiedCount: number;
  removedCount: number;
  unchangedCount: number;
  hasChanges: boolean;
  parsedBefore: any;
  parsedAfter: any;
  isBeforeValidJson: boolean;
  isAfterValidJson: boolean;
}

/**
 * Safely parses a JSON string.
 */
export function parseJsonSafe(jsonStr: string | null | undefined): {
  data: any;
  isValid: boolean;
  error?: string;
} {
  if (jsonStr === null || jsonStr === undefined) {
    return { data: null, isValid: true };
  }

  const trimmed = String(jsonStr).trim();
  if (trimmed === "" || trimmed === "null") {
    return { data: null, isValid: true };
  }

  try {
    const data = JSON.parse(trimmed);
    return { data, isValid: true };
  } catch (err: any) {
    return { data: jsonStr, isValid: false, error: err?.message || "Invalid JSON" };
  }
}

/**
 * Format JSON object into pretty indented string.
 */
export function formatJsonPretty(value: any): string {
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
    }
  }
  return JSON.stringify(value, null, 2);
}

/**
 * Deep equality check for primitives, arrays, and plain objects.
 */
export function isDeepEqual(first: any, second: any): boolean {
  if (first === second) return true;
  if (first === null || second === null) return false;
  if (first === undefined || second === undefined) return false;

  if (typeof first !== typeof second) return false;

  if (typeof first !== "object") return false;

  if (Array.isArray(first) !== Array.isArray(second)) return false;

  if (Array.isArray(first)) {
    if (first.length !== second.length) return false;
    for (let i = 0; i < first.length; i++) {
      if (!isDeepEqual(first[i], second[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(first);
  const keysB = Object.keys(second);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(second, key)) return false;
    if (!isDeepEqual(first[key], second[key])) return false;
  }

  return true;
}

/**
 * Computes top-level and flattened key-by-key differences between before and after states.
 */
export function computeDataDiff(
  beforeRaw: string | null | undefined,
  afterRaw: string | null | undefined,
): DiffResult {
  const { data: before, isValid: isBeforeValidJson } = parseJsonSafe(beforeRaw);
  const { data: after, isValid: isAfterValidJson } = parseJsonSafe(afterRaw);

  const diffs: PropertyDiff[] = [];
  let addedCount = 0;
  let modifiedCount = 0;
  let removedCount = 0;
  let unchangedCount = 0;

  // If either is not an object or both are null
  const isBeforeObj = before !== null && typeof before === "object" && !Array.isArray(before);
  const isAfterObj = after !== null && typeof after === "object" && !Array.isArray(after);

  if (!isBeforeObj && !isAfterObj) {
    if (before === null && after !== null) {
      diffs.push({
        key: "value",
        path: "value",
        beforeValue: null,
        afterValue: after,
        type: "ADDED",
      });
      addedCount++;
    } else if (before !== null && after === null) {
      diffs.push({
        key: "value",
        path: "value",
        beforeValue: before,
        afterValue: null,
        type: "REMOVED",
      });
      removedCount++;
    } else if (!isDeepEqual(before, after)) {
      diffs.push({
        key: "value",
        path: "value",
        beforeValue: before,
        afterValue: after,
        type: "MODIFIED",
      });
      modifiedCount++;
    } else if (before !== null || after !== null) {
      diffs.push({
        key: "value",
        path: "value",
        beforeValue: before,
        afterValue: after,
        type: "UNCHANGED",
      });
      unchangedCount++;
    }

    return {
      diffs,
      addedCount,
      modifiedCount,
      removedCount,
      unchangedCount,
      hasChanges: addedCount > 0 || modifiedCount > 0 || removedCount > 0,
      parsedBefore: before,
      parsedAfter: after,
      isBeforeValidJson,
      isAfterValidJson,
    };
  }

  const allKeys = new Set<string>([
    ...(isBeforeObj ? Object.keys(before) : []),
    ...(isAfterObj ? Object.keys(after) : []),
  ]);

  const sortedKeys = Array.from(allKeys).sort((a, b) => a.localeCompare(b));

  for (const key of sortedKeys) {
    const hasBefore = isBeforeObj && Object.prototype.hasOwnProperty.call(before, key);
    const hasAfter = isAfterObj && Object.prototype.hasOwnProperty.call(after, key);

    const beforeVal = hasBefore ? before[key] : undefined;
    const afterVal = hasAfter ? after[key] : undefined;

    if (!hasBefore && hasAfter) {
      diffs.push({
        key,
        path: key,
        beforeValue: undefined,
        afterValue: afterVal,
        type: "ADDED",
      });
      addedCount++;
    } else if (hasBefore && !hasAfter) {
      diffs.push({
        key,
        path: key,
        beforeValue: beforeVal,
        afterValue: undefined,
        type: "REMOVED",
      });
      removedCount++;
    } else if (!isDeepEqual(beforeVal, afterVal)) {
      diffs.push({
        key,
        path: key,
        beforeValue: beforeVal,
        afterValue: afterVal,
        type: "MODIFIED",
      });
      modifiedCount++;
    } else {
      diffs.push({
        key,
        path: key,
        beforeValue: beforeVal,
        afterValue: afterVal,
        type: "UNCHANGED",
      });
      unchangedCount++;
    }
  }

  return {
    diffs,
    addedCount,
    modifiedCount,
    removedCount,
    unchangedCount,
    hasChanges: addedCount > 0 || modifiedCount > 0 || removedCount > 0,
    parsedBefore: before,
    parsedAfter: after,
    isBeforeValidJson,
    isAfterValidJson,
  };
}
