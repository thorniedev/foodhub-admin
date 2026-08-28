import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { auditLogService, AuditLogApiError } from "./audit-log.service";
import { AuditLogDto, PageResponse } from "../types/audit-log.types";

describe("auditLogService", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("fetches audit logs with clean query parameters and unwraps payload", async () => {
    const mockLog: AuditLogDto = {
      uuid: "8e3c1532-6a4a-4ff1-88f5-48bcebc3a12a",
      actorUserUuid: "7b6f72c0-8d5f-4a34-b258-9b87b764bb7b",
      actionCode: "STORE_APPROVED",
      entityType: "STORE",
      entityId: 42,
      beforeData: '{"reviewStatus":"PENDING"}',
      afterData: '{"reviewStatus":"APPROVED"}',
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

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          code: 200,
          message: "Audit logs fetched successfully",
          payload: mockPage,
        }),
    });

    const result = await auditLogService.getAuditLogs({
      entityType: "STORE",
      actionCode: "STORE_APPROVED",
      page: 0,
      size: 20,
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain("entityType=STORE");
    expect(calledUrl).toContain("actionCode=STORE_APPROVED");
    expect(calledUrl).toContain("page=0");
    expect(calledUrl).toContain("size=20");

    expect(result.contents).toHaveLength(1);
    expect(result.contents[0].actionCode).toBe("STORE_APPROVED");
    expect(result.totalElements).toBe(1);
  });

  it("fetches a single audit log entry by UUID", async () => {
    const mockLog: AuditLogDto = {
      uuid: "8e3c1532-6a4a-4ff1-88f5-48bcebc3a12a",
      actorUserUuid: "7b6f72c0-8d5f-4a34-b258-9b87b764bb7b",
      actionCode: "FOOD_UPDATED",
      entityType: "FOOD",
      entityId: 18,
      beforeData: '{"name":"Khmer Amok Curry"}',
      afterData: '{"name":"Royal Fish Amok"}',
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0",
      occurredAt: "2026-08-26T14:30:00Z",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          code: 200,
          message: "Audit log fetched successfully",
          payload: mockLog,
        }),
    });

    const result = await auditLogService.getAuditLogByUuid(
      "8e3c1532-6a4a-4ff1-88f5-48bcebc3a12a",
    );

    expect(result.uuid).toBe("8e3c1532-6a4a-4ff1-88f5-48bcebc3a12a");
    expect(result.entityType).toBe("FOOD");
  });

  it("throws AuditLogApiError with 403 status when access is forbidden", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () =>
        JSON.stringify({
          code: 403,
          message: "Super Admin Access Required",
        }),
    });

    await expect(auditLogService.getAuditLogs()).rejects.toThrow(
      AuditLogApiError,
    );
  });
});
