import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchAdminSessions,
  fetchAdminSessionDetail,
  calculateKpiMetrics,
  getSessionLatency,
} from "./adminRecommendationService";
import { AdminSessionSummary } from "@/src/types/adminRecommendation";

describe("adminRecommendationService with Standardized Backend Envelopes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("calculateKpiMetrics", () => {
    it("should calculate correct KPIs from sessions", () => {
      const mockSessions: AdminSessionSummary[] = [
        {
          uuid: "sess-1",
          requestedByUserId: 1,
          mode: "SINGLE",
          status: "READY",
          requestSource: "APP",
          candidateCount: 50,
          eligibleCount: 40,
          responseTimeMs: 150,
          startedAt: "2026-08-24T00:00:00Z",
          createdAt: "2026-08-24T00:00:00Z",
        },
        {
          uuid: "sess-2",
          requestedByUserId: 2,
          mode: "GROUP",
          status: "READY",
          requestSource: "APP",
          candidateCount: 50,
          eligibleCount: 30,
          responseTimeMs: 250,
          startedAt: "2026-08-24T00:00:00Z",
          createdAt: "2026-08-24T00:00:00Z",
        },
      ];

      const kpis = calculateKpiMetrics(mockSessions, 2);

      expect(kpis.totalSessions).toBe(2);
      expect(kpis.avgLatencyMs).toBe(200);
      expect(kpis.totalCandidatesEvaluated).toBe(100);
      expect(kpis.totalCandidatesBlocked).toBe(30);
      expect(kpis.safetyBlockRate).toBe(30);
      expect(kpis.soloModeCount).toBe(1);
      expect(kpis.groupModeCount).toBe(1);
    });

    it("should return neutral values when sessions array is empty", () => {
      const kpis = calculateKpiMetrics([], 0);
      expect(kpis.totalSessions).toBe(0);
      expect(kpis.avgLatencyMs).toBe(0);
      expect(kpis.safetyBlockRate).toBe(0);
      expect(kpis.aiStrategyHealthRate).toBe(0);
    });

    it("should not synthesize latency when backend timing fields are absent", () => {
      const session = {
        uuid: "sess-no-latency",
        requestedByUserId: 1,
        mode: "SINGLE",
        status: "READY",
        requestSource: "APP",
        candidateCount: 50,
        eligibleCount: 40,
        startedAt: "2026-08-24T00:00:00Z",
        createdAt: "2026-08-24T00:00:00Z",
      } satisfies AdminSessionSummary;

      expect(getSessionLatency(session)).toBe(0);
    });
  });

  describe("fetchAdminSessions with Standard PageResponse Envelope", () => {
    it("should parse standard ApiResponse<PageResponse<T>> (data.items)", async () => {
      const standardizedResponse = {
        status: 200,
        message: "Sessions retrieved successfully",
        data: {
          items: [
            {
              uuid: "test-uuid-standard",
              requestedByUserId: 99,
              mode: "SINGLE",
              status: "READY",
              requestSource: "MOBILE_APP",
              candidateCount: 20,
              eligibleCount: 15,
              startedAt: "2026-08-24T00:00:00Z",
              createdAt: "2026-08-24T00:00:00Z",
            },
          ],
          pageNumber: 0,
          pageSize: 15,
          totalElements: 1,
          totalPages: 1,
          isFirst: true,
          isLast: true,
          hasNext: false,
          hasPrevious: false,
        },
        timestamp: "2026-08-24T08:00:00Z",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => standardizedResponse,
      } as Response);

      const result = await fetchAdminSessions({ page: 0, size: 15, mode: "SINGLE", status: "READY" });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/recommendations/sessions?page=0&size=15&mode=SINGLE&status=READY",
        expect.objectContaining({
          credentials: "include",
        }),
      );
      expect(result.content.length).toBe(1);
      expect(result.totalElements).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.content[0].uuid).toBe("test-uuid-standard");
    });
  });

  describe("fetchAdminSessionDetail with Standard ApiResponse<T> Envelope", () => {
    it("should parse standard ApiResponse<T> (data object and data.items)", async () => {
      const mockSession = {
        status: 200,
        message: "OK",
        data: { uuid: "sess-100", requestedByUserId: 10, mode: "GROUP", status: "READY" },
        timestamp: "2026-08-24T08:00:00Z",
      };
      const mockItems = {
        status: 200,
        message: "OK",
        data: {
          items: [{ uuid: "item-1", menuItemId: 5, menuItemName: "Amok", rankPosition: 1, finalScore: 0.95 }],
        },
        timestamp: "2026-08-24T08:00:00Z",
      };
      const mockSafety = {
        status: 200,
        message: "OK",
        data: {
          items: [{ uuid: "check-1", profileId: 10, menuItemId: 5, result: "SAFE", ruleVersion: "v1" }],
        },
        timestamp: "2026-08-24T08:00:00Z",
      };

      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes("/items")) {
          return Promise.resolve({
            ok: true,
            json: async () => mockItems,
          });
        }
        if (url.includes("/safety-checks")) {
          return Promise.resolve({
            ok: true,
            json: async () => mockSafety,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockSession,
        });
      });

      const detail = await fetchAdminSessionDetail("sess-100");
      const requestedUrls = vi.mocked(global.fetch).mock.calls.map(([url]) => String(url));

      expect(detail.uuid).toBe("sess-100");
      expect(requestedUrls).toContain("/api/admin/recommendations/sessions/sess-100");
      expect(requestedUrls).toContain("/api/admin/recommendations/sessions/sess-100/items?limit=50");
      expect(requestedUrls).toContain("/api/admin/recommendations/sessions/sess-100/safety-checks");
      expect(detail.items.length).toBe(1);
      expect(detail.safetyChecks.length).toBe(1);
      expect(detail.items[0].menuItemName).toBe("Amok");
      expect(detail.safetyChecks[0].result).toBe("SAFE");
    });

    it("falls back to the session row when metadata is missing", async () => {
      const fallbackSession: AdminSessionSummary = {
        uuid: "sess-404",
        requestedByUserId: 10,
        mode: "GROUP",
        status: "READY",
        requestSource: "MOBILE_APP",
        candidateCount: 12,
        eligibleCount: 10,
        startedAt: "2026-08-24T08:00:00Z",
        createdAt: "2026-08-24T08:00:00Z",
      };

      const mockItems = {
        status: 200,
        message: "OK",
        data: {
          items: [{ uuid: "item-2", menuItemId: 7, menuItemName: "Lok Lak", rankPosition: 1, finalScore: 0.88 }],
        },
      };

      const mockSafety = {
        status: 200,
        message: "OK",
        data: {
          items: [{ uuid: "check-2", profileId: 10, menuItemId: 7, result: "BLOCKED", ruleVersion: "v1" }],
        },
      };

      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes("/items")) {
          return Promise.resolve({
            ok: true,
            json: async () => mockItems,
          });
        }
        if (url.includes("/safety-checks")) {
          return Promise.resolve({
            ok: true,
            json: async () => mockSafety,
          });
        }
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: "Not Found",
          json: async () => ({ message: "Not Found" }),
        });
      });

      const detail = await fetchAdminSessionDetail("sess-404", undefined, fallbackSession);

      expect(detail.uuid).toBe("sess-404");
      expect(detail.mode).toBe("GROUP");
      expect(detail.status).toBe("READY");
      expect(detail.items).toHaveLength(1);
      expect(detail.safetyChecks).toHaveLength(1);
    });
  });
});
