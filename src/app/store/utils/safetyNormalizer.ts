import type { PagedResponse } from "@/src/types/safetyResource";
import { normalizeArrayPayload } from "@/src/utils/normalize";

export function normalizeSafetyPagedResponse<T>(
  response: unknown,
  fallbackPage = 0,
  fallbackSize = 20
): PagedResponse<T> {
  if (!response) {
    return {
      contents: [],
      pageNumber: fallbackPage,
      pageSize: fallbackSize,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    };
  }

  const rawObj =
    typeof response === "object" && response !== null
      ? (response as Record<string, any>)
      : {};

  const dataObj =
    (rawObj.data && typeof rawObj.data === "object" && !Array.isArray(rawObj.data)
      ? rawObj.data
      : null) ||
    (rawObj.payload && typeof rawObj.payload === "object" && !Array.isArray(rawObj.payload)
      ? rawObj.payload
      : null) ||
    rawObj;

  const contents = normalizeArrayPayload<T>(response);

  const totalElements =
    typeof dataObj.totalElements === "number"
      ? dataObj.totalElements
      : typeof dataObj.total === "number"
        ? dataObj.total
        : contents.length;

  const pageSize =
    typeof dataObj.pageSize === "number"
      ? dataObj.pageSize
      : typeof dataObj.size === "number"
        ? dataObj.size
        : fallbackSize;

  const pageNumber =
    typeof dataObj.pageNumber === "number"
      ? dataObj.pageNumber
      : typeof dataObj.number === "number"
        ? dataObj.number
        : fallbackPage;

  const totalPages =
    typeof dataObj.totalPages === "number"
      ? dataObj.totalPages
      : totalElements
        ? Math.ceil(totalElements / Math.max(1, pageSize))
        : 0;

  return {
    contents,
    pageNumber,
    pageSize,
    totalElements,
    totalPages,
    first: typeof dataObj.isFirst === "boolean" ? dataObj.isFirst : (dataObj.first ?? pageNumber === 0),
    last: typeof dataObj.isLast === "boolean" ? dataObj.isLast : (dataObj.last ?? true),
  };
}

export function normalizeSingleEntity<T>(response: unknown): T {
  if (!response || typeof response !== "object") return response as T;
  const raw = response as Record<string, any>;
  if ("data" in raw && raw.data !== undefined && raw.data !== null) {
    return raw.data as T;
  }
  if ("payload" in raw && raw.payload !== undefined && raw.payload !== null) {
    return raw.payload as T;
  }
  return response as T;
}
