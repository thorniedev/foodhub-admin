import {
  ApiResponse,
  AuditLogDto,
  AuditLogFilterParams,
  PageResponse,
} from "../types/audit-log.types";

export class AuditLogApiError extends Error {
  status: number;
  errorCode?: string;

  constructor(message: string, status: number, errorCode?: string) {
    super(message);
    this.name = "AuditLogApiError";
    this.status = status;
    this.errorCode = errorCode;
  }
}

/**
 * Resolves appropriate endpoint path for browser or server.
 */
function resolveEndpoint(path: string): string {
  // Normalize /api/v1/admin/... to /api/admin/... for Next.js internal proxy
  let normalized = path;
  if (normalized.startsWith("/api/v1/admin/")) {
    normalized = `/api/admin/${normalized.slice("/api/v1/admin/".length)}`;
  } else if (normalized.startsWith("api/v1/admin/")) {
    normalized = `/api/admin/${normalized.slice("api/v1/admin/".length)}`;
  }

  if (typeof window !== "undefined") {
    return normalized;
  }

  const backendBase =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://api.mhoubahar.store";
  const cleanBase = backendBase.replace(/\/+$/, "");
  const apiBase = /\/api\/v1$/i.test(cleanBase) ? cleanBase : `${cleanBase}/api/v1`;

  if (normalized.startsWith("/api/admin/")) {
    return `${apiBase}/admin/${normalized.slice("/api/admin/".length)}`;
  }

  return `${apiBase}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
}

/**
 * Lightweight project-compatible HTTP client wrapper.
 */
export const api = {
  async get<T>(url: string, init?: RequestInit): Promise<{ data: T }> {
    const resolvedUrl = resolveEndpoint(url);

    const headers: HeadersInit = {
      Accept: "application/json",
      ...(init?.headers || {}),
    };

    const res = await fetch(resolvedUrl, {
      method: "GET",
      headers,
      credentials: "include",
      cache: "no-store",
      ...init,
    });

    let rawData: any = null;
    const text = await res.text();
    if (text) {
      try {
        rawData = JSON.parse(text);
      } catch {
        rawData = { message: text };
      }
    }

    if (!res.ok) {
      const message =
        rawData?.message ||
        rawData?.error ||
        (res.status === 403
          ? "Super Admin Access Required: You do not have permission to view audit logs."
          : res.status === 401
          ? "Session expired. Please log in again."
          : `Request failed with status ${res.status}`);

      throw new AuditLogApiError(message, res.status, rawData?.errorCode || `HTTP_${res.status}`);
    }

    return { data: rawData as T };
  },
};

export const auditLogService = {
  /**
   * Search & Filter Audit Logs with server-side pagination.
   * `GET /api/v1/admin/audit-logs`
   */
  async getAuditLogs(
    params: AuditLogFilterParams = {},
  ): Promise<PageResponse<AuditLogDto>> {
    const cleanParams: Record<string, string> = {};
    if (params.actorUuid && params.actorUuid.trim()) {
      cleanParams.actorUuid = params.actorUuid.trim();
    }
    if (params.entityType && params.entityType !== "ALL") {
      cleanParams.entityType = params.entityType;
    }
    if (params.actionCode && params.actionCode !== "ALL") {
      cleanParams.actionCode = params.actionCode;
    }
    if (params.entityId !== undefined && params.entityId !== null && !isNaN(params.entityId)) {
      cleanParams.entityId = String(params.entityId);
    }
    if (params.from && params.from.trim()) {
      cleanParams.from = params.from.trim();
    }
    if (params.to && params.to.trim()) {
      cleanParams.to = params.to.trim();
    }

    cleanParams.page = String(params.page ?? 0);
    cleanParams.size = String(params.size ?? 20);

    const query = new URLSearchParams(cleanParams).toString();
    const response = await api.get<ApiResponse<PageResponse<AuditLogDto>>>(
      `/api/v1/admin/audit-logs?${query}`,
    );

    // Normalize envelope if backend returns payload or standard envelope
    const payload = response.data?.payload ?? (response.data as unknown as PageResponse<AuditLogDto>);

    if (!payload || !Array.isArray(payload.contents)) {
      return {
        contents: (payload as any)?.content || (payload as any)?.contents || [],
        pageNumber: payload?.pageNumber ?? (payload as any)?.number ?? Number(cleanParams.page),
        pageSize: payload?.pageSize ?? (payload as any)?.size ?? Number(cleanParams.size),
        totalElements: payload?.totalElements ?? 0,
        totalPages: payload?.totalPages ?? 1,
        first: payload?.first ?? true,
        last: payload?.last ?? true,
      };
    }

    return payload;
  },

  /**
   * Get Single Audit Log Details by UUID.
   * `GET /api/v1/admin/audit-logs/{uuid}`
   */
  async getAuditLogByUuid(uuid: string): Promise<AuditLogDto> {
    const cleanUuid = encodeURIComponent(uuid.trim());
    const response = await api.get<ApiResponse<AuditLogDto>>(
      `/api/v1/admin/audit-logs/${cleanUuid}`,
    );

    return response.data?.payload ?? (response.data as unknown as AuditLogDto);
  },
};
