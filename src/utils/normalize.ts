// src/utils/normalize.ts

/**
 * Normalizes single entity responses from standardized ApiResponse or legacy wrappers
 */
export function normalizePayload<T>(response: unknown, fallback: T): T {
  if (response === null || response === undefined) {
    return fallback;
  }
  if (typeof response === "object") {
    const raw = response as Record<string, unknown>;
    // 1. Check standardized ApiResponse 'data'
    if (raw.data !== undefined && raw.data !== null) {
      return raw.data as T;
    }
    // 2. Backward compatibility for 'payload'
    if (raw.payload !== undefined && raw.payload !== null) {
      return raw.payload as T;
    }
  }
  return response as T;
}

/**
 * Normalizes array collections from PageResponse, ApiResponse, or legacy wrappers
 */
export function normalizeArrayPayload<T>(response: unknown): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response as T[];

  if (typeof response === "object") {
    const raw = response as Record<string, unknown>;

    // Case 1: Standard ApiResponse with PageResponse or Array in .data
    if (raw.data) {
      if (Array.isArray(raw.data)) return raw.data as T[];
      if (typeof raw.data === "object") {
        const dObj = raw.data as Record<string, unknown>;
        if (Array.isArray(dObj.items)) return dObj.items as T[]; // Standard PageResponse
        if (Array.isArray(dObj.content)) return dObj.content as T[]; // Spring Page
        if (Array.isArray(dObj.contents)) return dObj.contents as T[];
      }
    }

    // Case 2: Legacy .payload
    if (raw.payload) {
      if (Array.isArray(raw.payload)) return raw.payload as T[];
      if (typeof raw.payload === "object") {
        const pObj = raw.payload as Record<string, unknown>;
        if (Array.isArray(pObj.items)) return pObj.items as T[];
        if (Array.isArray(pObj.content)) return pObj.content as T[];
        if (Array.isArray(pObj.contents)) return pObj.contents as T[];
      }
    }

    // Case 3: Direct page format
    if (Array.isArray(raw.items)) return raw.items as T[];
    if (Array.isArray(raw.content)) return raw.content as T[];
    if (Array.isArray(raw.contents)) return raw.contents as T[];
  }

  return [];
}

/**
 * Extracts pagination metadata & items array from PageResponse or Spring Data Page
 */
export function normalizePageResponse<T>(
  response: unknown,
  fallbackPageSize = 15
): {
  items: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
} {
  const items = normalizeArrayPayload<T>(response);

  if (response && typeof response === "object") {
    const raw = response as Record<string, any>;
    const dataObj = (raw.data && typeof raw.data === "object" && !Array.isArray(raw.data) ? raw.data : null) ||
                    (raw.payload && typeof raw.payload === "object" && !Array.isArray(raw.payload) ? raw.payload : null) ||
                    raw;

    const totalElements =
      dataObj.totalElements ??
      dataObj.total ??
      dataObj.totalCount ??
      items.length;

    const pageSize =
      dataObj.pageSize ??
      dataObj.size ??
      fallbackPageSize;

    const pageNumber =
      dataObj.pageNumber ??
      dataObj.number ??
      0;

    const totalPages =
      dataObj.totalPages ??
      Math.max(1, Math.ceil(totalElements / Math.max(1, pageSize)));

    return {
      items,
      totalElements,
      totalPages,
      pageNumber,
      pageSize,
    };
  }

  return {
    items,
    totalElements: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / fallbackPageSize)),
    pageNumber: 0,
    pageSize: fallbackPageSize,
  };
}

/**
 * Extracts error message from standardized ApiErrorResponse or generic exceptions
 */
export function extractErrorMessage(error: unknown, fallback = "An unexpected error occurred"): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;

  if (typeof error === "object") {
    const errObj = error as Record<string, any>;
    if (errObj.data) {
      if (typeof errObj.data === "string") return errObj.data;
      if (typeof errObj.data === "object") {
        return errObj.data.message || errObj.data.error || fallback;
      }
    }
    return errObj.message || errObj.error || fallback;
  }

  return fallback;
}
