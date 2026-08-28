"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AuditLogDto,
  AuditLogFilterParams,
  PageResponse,
} from "../types/audit-log.types";
import { auditLogService, AuditLogApiError } from "../services/audit-log.service";

export interface UseAuditLogsReturn {
  // Data
  logs: AuditLogDto[];
  totalElements: number;
  totalPages: number;
  page: number;
  pageSize: number;
  first: boolean;
  last: boolean;
  loading: boolean;
  error: string | null;
  isForbidden: boolean;

  // Filter state & setters
  filters: AuditLogFilterParams;
  setFilters: (
    updater:
      | Partial<AuditLogFilterParams>
      | ((prev: AuditLogFilterParams) => AuditLogFilterParams),
  ) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  resetFilters: () => void;
  refetch: () => Promise<void>;

  // Inspector Drawer state & actions
  selectedLogUuid: string | null;
  selectedLogDetail: AuditLogDto | null;
  detailLoading: boolean;
  detailError: string | null;
  inspectLog: (uuid: string, preloaded?: AuditLogDto) => Promise<void>;
  closeInspect: () => void;
  refreshDetail: () => Promise<void>;
}

const DEFAULT_FILTERS: AuditLogFilterParams = {
  actorUuid: "",
  entityType: "ALL",
  actionCode: "ALL",
  entityId: undefined,
  from: "",
  to: "",
  page: 0,
  size: 20,
};

export function useAuditLogs(
  initialFilters: Partial<AuditLogFilterParams> = {},
): UseAuditLogsReturn {
  const [filters, setFilterState] = useState<AuditLogFilterParams>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const [pageData, setPageData] = useState<PageResponse<AuditLogDto>>({
    contents: [],
    pageNumber: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 1,
    first: true,
    last: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);

  // Inspector state
  const [selectedLogUuid, setSelectedLogUuid] = useState<string | null>(null);
  const [selectedLogDetail, setSelectedLogDetail] = useState<AuditLogDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Fetch list of audit logs
  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsForbidden(false);

    try {
      const data = await auditLogService.getAuditLogs(filters);
      setPageData(data);
    } catch (err: any) {
      if (err instanceof AuditLogApiError && err.status === 403) {
        setIsForbidden(true);
        setError("Super Admin Access Required");
      } else {
        setError(err?.message || "Failed to load audit logs from server.");
      }
      setPageData((prev) => ({
        ...prev,
        contents: [],
        totalElements: 0,
        totalPages: 1,
      }));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Set filter state
  const setFilters = useCallback(
    (
      updater:
        | Partial<AuditLogFilterParams>
        | ((prev: AuditLogFilterParams) => AuditLogFilterParams),
    ) => {
      setFilterState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
        return {
          ...next,
          // Reset to page 0 whenever filters change unless page is explicitly given
          page: updater && typeof updater !== "function" && updater.page !== undefined ? updater.page : 0,
        };
      });
    },
    [],
  );

  const setPage = useCallback((newPage: number) => {
    setFilterState((prev) => ({ ...prev, page: Math.max(0, newPage) }));
  }, []);

  const setPageSize = useCallback((newSize: number) => {
    setFilterState((prev) => ({ ...prev, size: newSize, page: 0 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilterState({
      ...DEFAULT_FILTERS,
      size: filters.size || 20,
    });
  }, [filters.size]);

  // Single entry inspector
  const inspectLog = useCallback(async (uuid: string, preloaded?: AuditLogDto) => {
    setSelectedLogUuid(uuid);
    setDetailError(null);

    if (preloaded) {
      setSelectedLogDetail(preloaded);
    }

    setDetailLoading(true);
    try {
      const detail = await auditLogService.getAuditLogByUuid(uuid);
      setSelectedLogDetail(detail);
    } catch (err: any) {
      if (!preloaded) {
        setSelectedLogDetail(null);
      }
      setDetailError(err?.message || "Failed to load complete audit log record.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeInspect = useCallback(() => {
    setSelectedLogUuid(null);
    setSelectedLogDetail(null);
    setDetailError(null);
  }, []);

  const refreshDetail = useCallback(async () => {
    if (selectedLogUuid) {
      await inspectLog(selectedLogUuid, selectedLogDetail || undefined);
    }
  }, [selectedLogUuid, selectedLogDetail, inspectLog]);

  return {
    logs: pageData.contents || [],
    totalElements: pageData.totalElements ?? 0,
    totalPages: Math.max(1, pageData.totalPages ?? 1),
    page: filters.page ?? 0,
    pageSize: filters.size ?? 20,
    first: pageData.first ?? (filters.page === 0),
    last: pageData.last ?? (filters.page >= (pageData.totalPages ?? 1) - 1),
    loading,
    error,
    isForbidden,
    filters,
    setFilters,
    setPage,
    setPageSize,
    resetFilters,
    refetch: loadLogs,
    selectedLogUuid,
    selectedLogDetail,
    detailLoading,
    detailError,
    inspectLog,
    closeInspect,
    refreshDetail,
  };
}
