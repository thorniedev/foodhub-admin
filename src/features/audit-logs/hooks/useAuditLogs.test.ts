import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuditLogs } from "./useAuditLogs";
import { auditLogService, AuditLogApiError } from "../services/audit-log.service";
import { AuditLogDto, PageResponse } from "../types/audit-log.types";

vi.mock("../services/audit-log.service", () => ({
  auditLogService: {
    getAuditLogs: vi.fn(),
    getAuditLogByUuid: vi.fn(),
  },
  AuditLogApiError: class extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.name = "AuditLogApiError";
      this.status = status;
    }
  },
}));

describe("useAuditLogs hook", () => {
  const mockLog: AuditLogDto = {
    uuid: "8e3c1532-6a4a-4ff1-88f5-48bcebc3a12a",
    actorUserUuid: "7b6f72c0-8d5f-4a34-b258-9b87b764bb7b",
    actionCode: "STORE_APPROVED",
    entityType: "STORE",
    entityId: 42,
    beforeData: '{"status":"PENDING"}',
    afterData: '{"status":"APPROVED"}',
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0",
    occurredAt: "2026-08-26T14:30:00Z",
  };

  const mockPage: PageResponse<AuditLogDto> = {
    contents: [mockLog],
    pageNumber: 0,
    pageSize: 20,
    totalElements: 1,
    totalPages: 1,
    first: true,
    last: true,
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("loads audit logs on mount successfully", async () => {
    vi.mocked(auditLogService.getAuditLogs).mockResolvedValueOnce(mockPage);

    const { result } = renderHook(() => useAuditLogs());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.logs).toHaveLength(1);
    expect(result.current.logs[0].actionCode).toBe("STORE_APPROVED");
    expect(result.current.totalElements).toBe(1);
    expect(result.current.isForbidden).toBe(false);
  });

  it("handles 403 Forbidden by setting isForbidden to true", async () => {
    vi.mocked(auditLogService.getAuditLogs).mockRejectedValueOnce(
      new AuditLogApiError("Super Admin Access Required", 403),
    );

    const { result } = renderHook(() => useAuditLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isForbidden).toBe(true);
    expect(result.current.error).toBe("Super Admin Access Required");
    expect(result.current.logs).toHaveLength(0);
  });

  it("updates filters and resets page to 0", async () => {
    vi.mocked(auditLogService.getAuditLogs).mockResolvedValue(mockPage);

    const { result } = renderHook(() => useAuditLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.setFilters({ entityType: "FOOD", actionCode: "FOOD_CREATED" });
    });

    expect(result.current.filters.entityType).toBe("FOOD");
    expect(result.current.filters.actionCode).toBe("FOOD_CREATED");
    expect(result.current.filters.page).toBe(0);
  });

  it("opens and loads log detail inspector", async () => {
    vi.mocked(auditLogService.getAuditLogs).mockResolvedValueOnce(mockPage);
    vi.mocked(auditLogService.getAuditLogByUuid).mockResolvedValueOnce(mockLog);

    const { result } = renderHook(() => useAuditLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.inspectLog(mockLog.uuid, mockLog);
    });

    expect(result.current.selectedLogUuid).toBe(mockLog.uuid);
    expect(result.current.selectedLogDetail).toEqual(mockLog);

    await act(async () => {
      result.current.closeInspect();
    });

    expect(result.current.selectedLogUuid).toBeNull();
    expect(result.current.selectedLogDetail).toBeNull();
  });
});
