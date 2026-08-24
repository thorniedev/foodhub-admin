import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchAdminSessions,
  fetchAdminSessionDetail,
  calculateKpiMetrics,
} from "./adminRecommendationService";
import { AdminSessionSummary } from "@/src/types/adminRecommendation";

describe("adminRecommendationService", () => {
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

  describe("fetchAdminSessions", () => {
    it("should fetch and parse sessions from API successfully", async () => {
      const mockPayload = {
        payload: {
          content: [
            {
              uuid: "test-uuid-1",
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
          totalElements: 1,
          totalPages: 1,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockPayload,
      } as Response);

      const result = await fetchAdminSessions({ page: 0, size: 10, mode: "SINGLE", status: "READY" });

      expect(global.fetch).toHaveBeenCalled();
      expect(result.content.length).toBe(1);
      expect(result.totalElements).toBe(1);
      expect(result.content[0].uuid).toBe("test-uuid-1");
    });
  });

  describe("fetchAdminSessionDetail", () => {
    it("should fetch session metadata, items, and safety checks in parallel", async () => {
      const mockSession = { uuid: "sess-100", requestedByUserId: 10, mode: "GROUP", status: "READY" };
      const mockItems = [{ uuid: "item-1", menuItemId: 5, menuItemName: "Amok", rankPosition: 1, finalScore: 0.95 }];
      const mockSafety = [{ uuid: "check-1", profileId: 10, menuItemId: 5, result: "SAFE", ruleVersion: "v1" }];

      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes("/items")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ payload: mockItems }),
          });
        }
        if (url.includes("/safety-checks")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ payload: mockSafety }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ payload: mockSession }),
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
