import type {
  AdminBannerPage,
  AdminBannerResponse,
  ApiErrorResponse,
  CreateBannerPayload,
  GetAdminBannersParams,
  UpdateBannerPayload,
} from "../types/banner";
import { normalizeArrayPayload, normalizePageResponse } from "../utils/normalize";
import { resolveFoodHubCatalogImageUrl } from "../lib/resolveFoodHubImageUrl";

/**
 * Resolves full URL for an image path or media UUID.
 */
export function resolveImageUrl(
  imageUrlOrUuid: string | null | undefined,
): string {
  if (!imageUrlOrUuid) return "";

  const trimmed = String(imageUrlOrUuid).trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return "";

  const resolved = resolveFoodHubCatalogImageUrl(trimmed);
  if (resolved) return resolved;

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  return trimmed;
}

/**
 * Spring Boot @RequestPart("request") requires the JSON part to be explicitly typed as application/json.
 * Construct FormData with JSON Blob and binary file part.
 */
export function buildBannerFormData(
  payload: CreateBannerPayload | UpdateBannerPayload,
  imageFile?: File | null,
): FormData {
  const formData = new FormData();
  const jsonBlob = new Blob([JSON.stringify(payload)], {
    type: "application/json",
  });
  formData.append("request", jsonBlob, "request.json");

  if (imageFile) {
    formData.append("image", imageFile);
  }

  return formData;
}

const BASE_PROXY_URL = "/api/admin/banners";

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  let data: any = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const error: ApiErrorResponse = {
      status: res.status,
      errorCode: data?.errorCode || `HTTP_${res.status}`,
      message:
        data?.message ||
        data?.error ||
        `Request failed with status ${res.status}`,
      fieldErrors: data?.fieldErrors || undefined,
    };
    throw error;
  }

  // Unwrap backend envelope if payload is present
  if (data && typeof data === "object") {
    if (data.payload !== undefined) {
      return data.payload as T;
    }
    if (
      data.data !== undefined &&
      !Array.isArray(data) &&
      !("contents" in data)
    ) {
      return data.data as T;
    }
  }

  return data as T;
}

export const adminBannerApi = {
  /**
   * 1. GET /api/v1/admin/banners
   */
  async getBanners(
    params?: GetAdminBannersParams,
    authToken?: string,
  ): Promise<AdminBannerPage> {
    const query = new URLSearchParams();
    if (params?.category) query.append("category", params.category);
    if (params?.isPublished !== undefined)
      query.append("isPublished", String(params.isPublished));
    if (params?.page !== undefined) query.append("page", String(params.page));
    if (params?.size !== undefined) query.append("size", String(params.size));

    const queryString = query.toString();
    const url = queryString ? `${BASE_PROXY_URL}?${queryString}` : BASE_PROXY_URL;

    const headers: HeadersInit = {
      Accept: "application/json",
    };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
      cache: "no-store",
    });

    const data = await handleResponse<any>(res);
    const normalized = normalizePageResponse<AdminBannerResponse>(data, params?.size ?? 10);
    return {
      contents: normalized.items,
      totalElements: normalized.totalElements,
      totalPages: normalized.totalPages,
      pageNumber: normalized.pageNumber,
      pageSize: normalized.pageSize,
      first: normalized.pageNumber === 0,
      last: normalized.pageNumber >= normalized.totalPages - 1,
    };
  },

  /**
   * 2. GET /api/v1/admin/banners/{id}
   */
  async getBannerById(
    id: string,
    authToken?: string,
  ): Promise<AdminBannerResponse> {
    const headers: HeadersInit = {
      Accept: "application/json",
    };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const res = await fetch(`${BASE_PROXY_URL}/${encodeURIComponent(id)}`, {
      method: "GET",
      headers,
      credentials: "include",
      cache: "no-store",
    });

    return handleResponse<AdminBannerResponse>(res);
  },

  /**
   * 3. POST /api/v1/admin/banners
   * Multipart form data with request JSON blob and required image file.
   */
  async createBanner(
    payload: CreateBannerPayload,
    imageFile: File,
    authToken?: string,
  ): Promise<AdminBannerResponse> {
    const formData = buildBannerFormData(payload, imageFile);
    const headers: HeadersInit = {};
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const res = await fetch(BASE_PROXY_URL, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    return handleResponse<AdminBannerResponse>(res);
  },

  /**
   * 4. PUT /api/v1/admin/banners/{id}
   * Multipart form data with request JSON blob and optional image file.
   */
  async updateBanner(
    id: string,
    payload: UpdateBannerPayload,
    imageFile?: File | null,
    authToken?: string,
  ): Promise<AdminBannerResponse> {
    const formData = buildBannerFormData(payload, imageFile);
    const headers: HeadersInit = {};
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const res = await fetch(`${BASE_PROXY_URL}/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers,
      body: formData,
      credentials: "include",
    });

    return handleResponse<AdminBannerResponse>(res);
  },

  /**
   * 5. PATCH /api/v1/admin/banners/{id}/status
   */
  async updateStatus(
    id: string,
    isPublished: boolean,
    authToken?: string,
  ): Promise<AdminBannerResponse> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const res = await fetch(
      `${BASE_PROXY_URL}/${encodeURIComponent(id)}/status`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ isPublished }),
        credentials: "include",
      },
    );

    return handleResponse<AdminBannerResponse>(res);
  },

  /**
   * 6. DELETE /api/v1/admin/banners/{id}
   */
  async deleteBanner(id: string, authToken?: string): Promise<void> {
    const headers: HeadersInit = {
      Accept: "application/json",
    };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const res = await fetch(`${BASE_PROXY_URL}/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
      credentials: "include",
    });

    return handleResponse<void>(res);
  },

  /**
   * 7. resolveImageUrl helper
   */
  resolveImageUrl,
  buildFormData: buildBannerFormData,
};

export default adminBannerApi;
