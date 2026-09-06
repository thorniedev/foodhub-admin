import { describe, expect, it } from "vitest";

import {
  normalizeOverview,
  unwrapAdminList,
  unwrapAdminPage,
  unwrapAdminPayload,
} from "./adminDashboardApi";
import type { StorePerformance } from "@/src/types/adminDashboard";

describe("unwrapAdminPayload", () => {
  it("reads the ApiResponse payload key", () => {
    expect(
      unwrapAdminPayload({ status: 200, message: "ok", payload: { a: 1 } }, null),
    ).toEqual({ a: 1 });
  });

  it("falls back to a legacy data key", () => {
    expect(
      unwrapAdminPayload({ status: 200, message: "ok", data: { a: 1 } }, null),
    ).toEqual({ a: 1 });
  });

  it("returns a bare (unwrapped) body untouched", () => {
    expect(unwrapAdminPayload({ totalUsers: 4 }, null)).toEqual({ totalUsers: 4 });
  });

  it("returns the fallback for an envelope with no payload", () => {
    expect(
      unwrapAdminPayload({ status: 204, message: "no content" }, "fallback"),
    ).toBe("fallback");
  });

  it("returns the fallback for null", () => {
    expect(unwrapAdminPayload(null, "fallback")).toBe("fallback");
  });
});

describe("unwrapAdminList", () => {
  it("reads a list out of the payload", () => {
    expect(unwrapAdminList({ payload: [{ location: "Phnom Penh" }] })).toEqual([
      { location: "Phnom Penh" },
    ]);
  });

  it("accepts a paged payload and returns its contents", () => {
    expect(unwrapAdminList({ payload: { contents: [1, 2] } })).toEqual([1, 2]);
  });

  it("returns an empty array rather than throwing on an unexpected shape", () => {
    expect(unwrapAdminList({ payload: { nope: true } })).toEqual([]);
    expect(unwrapAdminList(undefined)).toEqual([]);
  });
});

describe("unwrapAdminPage", () => {
  const store: StorePerformance = {
    storeUuid: "3c2a0c2e-1c6b-4b4a-9f6f-7bb0f5e3a111",
    storeName: "Hok Masterchef",
    city: "Phnom Penh",
    address: "St. 271",
    rating: 4.6,
    totalMenuItems: 24,
    storeViews: 180,
    uniqueViewers: 96,
    clicks: 32,
    likes: 12,
    bookmarks: 8,
    clickThroughRate: 0.1777,
    incompleteMenuItems: 3,
    performanceScore: 61.25,
    operatingStatus: "OPEN",
    reviewStatus: "APPROVED",
  };

  it("preserves the backend pagination metadata", () => {
    const page = unwrapAdminPage<StorePerformance>({
      status: 200,
      message: "ok",
      payload: {
        contents: [store],
        pageNumber: 2,
        pageSize: 10,
        totalElements: 34,
        totalPages: 4,
        first: false,
        last: false,
      },
    });

    expect(page.contents).toHaveLength(1);
    expect(page.pageNumber).toBe(2);
    expect(page.totalElements).toBe(34);
    expect(page.totalPages).toBe(4);
    expect(page.first).toBe(false);
    expect(page.last).toBe(false);
  });

  it("derives totalPages and last when the backend omits them", () => {
    const page = unwrapAdminPage<StorePerformance>({
      payload: { contents: [store], pageNumber: 0, pageSize: 10, totalElements: 25 },
    });

    expect(page.totalPages).toBe(3);
    expect(page.first).toBe(true);
    expect(page.last).toBe(false);
  });

  it("wraps a plain array response as a single page", () => {
    const page = unwrapAdminPage<StorePerformance>({ payload: [store] });

    expect(page.contents).toEqual([store]);
    expect(page.totalElements).toBe(1);
    expect(page.totalPages).toBe(1);
  });

  it("returns an empty page for an unusable body", () => {
    const page = unwrapAdminPage<StorePerformance>({ payload: null });

    expect(page.contents).toEqual([]);
    expect(page.totalElements).toBe(0);
  });
});

describe("normalizeOverview", () => {
  it("fills in every collection so the UI never reads undefined", () => {
    const overview = normalizeOverview({
      status: 200,
      message: "ok",
      payload: {
        totalUsers: 12,
        period: { from: "2026-08-01", to: "2026-08-27" },
        kpis: { activeUsers: { value: 5, previousValue: 4, changePercent: 25 } },
      },
    });

    expect(overview.totalUsers).toBe(12);
    expect(overview.period.previousFrom).toBe("");
    expect(overview.kpis.activeUsers?.value).toBe(5);
    expect(overview.activityTrend).toEqual([]);
    expect(overview.topStores).toEqual([]);
    expect(overview.actionItems).toEqual([]);
    expect(overview.locationSummary).toEqual([]);
    expect(overview.categorySummary).toEqual([]);
  });

  it("returns a zeroed overview when the payload is missing", () => {
    const overview = normalizeOverview({ status: 200, message: "empty" });

    expect(overview.totalUsers).toBe(0);
    expect(overview.kpis).toEqual({});
    expect(overview.activityTrend).toEqual([]);
  });

  it("backfills a kpi from its top-level twin when the backend omits kpis entirely", () => {
    const overview = normalizeOverview({
      payload: {
        totalActiveStores: 1051,
        totalPendingStores: 231,
        totalMenuItems: 190,
        totalRecommendationsServed: 5121,
        totalBookmarks: 3,
      },
    });

    expect(overview.kpis.activeStores?.value).toBe(1051);
    expect(overview.kpis.pendingStores?.value).toBe(231);
    expect(overview.kpis.liveMenuItems?.value).toBe(190);
    expect(overview.kpis.recommendationSessions?.value).toBe(5121);
    expect(overview.kpis.bookmarks?.value).toBe(3);
  });

  it("leaves a kpi unknown rather than fabricating it when no real source exists", () => {
    // Regression guard: this used to default `recommendationSuccessRate` to
    // 100 whenever any session had run, and `openDataIssues` to
    // `totalPendingStores + totalSafetyBlocks` — reporting a perfect safety
    // score and a wildly inflated issue count respectively, neither backed by
    // a real number in the payload.
    const overview = normalizeOverview({
      payload: {
        totalRecommendationsServed: 5121,
        totalPendingStores: 231,
        totalSafetyBlocks: 48686,
      },
    });

    expect(overview.kpis.recommendationSuccessRate?.value).toBeNull();
    expect(overview.kpis.openDataIssues?.value).toBeNull();
    expect(overview.kpis.activeUsers?.value).toBeNull();
  });

  it("prefers the backend's own kpis entry over any derived fallback", () => {
    const overview = normalizeOverview({
      payload: {
        totalRecommendationsServed: 5121,
        kpis: {
          recommendationSuccessRate: { value: 99.98, previousValue: 100, changePercent: -0.02 },
        },
      },
    });

    expect(overview.kpis.recommendationSuccessRate?.value).toBe(99.98);
  });
});
