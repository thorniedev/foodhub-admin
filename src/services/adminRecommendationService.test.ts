import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchAdminSessions,
  fetchAdminSessionDetail,
  calculateKpiMetrics,
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

    it("should return defaults when sessions array is empty", () => {
      const kpis = calculateKpiMetrics([], 0);
      expect(kpis.totalSessions).toBe(0);
      expect(kpis.avgLatencyMs).toBe(185);
      expect(kpis.safetyBlockRate).toBe(24.8);
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

      expect(global.fetch).toHaveBeenCalled();
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

      expect(detail.uuid).toBe("sess-100");
      expect(detail.items.length).toBe(1);
      expect(detail.safetyChecks.length).toBe(1);
      expect(detail.items[0].menuItemName).toBe("Amok");
      expect(detail.safetyChecks[0].result).toBe("SAFE");
    });
  });
});
