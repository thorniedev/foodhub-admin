import { describe, expect, it } from "vitest";

import {
  DASHBOARD_DEFAULT_RADIUS_KM,
  DEFAULT_DASHBOARD_FILTERS,
  buildDashboardQueryParams,
  dashboardFilterFormSchema,
  dashboardFiltersToSearchParams,
  formValuesToFilters,
  filtersToFormValues,
  inclusiveDayCount,
  parseDashboardFilters,
  resolveDateRange,
  shiftIsoDate,
} from "./dashboardFilters";
import type { DashboardFilters } from "@/src/types/adminDashboard";

const TODAY = "2026-08-27";

describe("resolveDateRange", () => {
  it("anchors the 30 day preset on today, inclusive of both ends", () => {
    expect(resolveDateRange({ preset: "30d" }, TODAY)).toEqual({
      from: "2026-07-29",
      to: TODAY,
    });
    expect(inclusiveDayCount("2026-07-29", TODAY)).toBe(30);
  });

  it("supports the 7 and 90 day presets", () => {
    expect(resolveDateRange({ preset: "7d" }, TODAY).from).toBe("2026-08-21");
    expect(resolveDateRange({ preset: "90d" }, TODAY).from).toBe("2026-05-31");
  });

  it("uses the explicit range for the custom preset", () => {
    expect(
      resolveDateRange(
        { preset: "custom", from: "2026-01-01", to: "2026-01-31" },
        TODAY,
      ),
    ).toEqual({ from: "2026-01-01", to: "2026-01-31" });
  });

  it("falls back to the last 30 days when a custom range is incomplete", () => {
    expect(resolveDateRange({ preset: "custom" }, TODAY)).toEqual({
      from: shiftIsoDate(TODAY, -29),
      to: TODAY,
    });
  });
});

describe("buildDashboardQueryParams", () => {
  it("always sends a resolved from/to pair", () => {
    expect(buildDashboardQueryParams({ preset: "7d" }, {}, TODAY)).toEqual({
      from: "2026-08-21",
      to: TODAY,
    });
  });

  it("omits undefined and blank values instead of serialising them", () => {
    const params = buildDashboardQueryParams(
      { preset: "30d", city: "   ", province: undefined },
      { page: undefined, size: 20 },
      TODAY,
    );

    expect(params).not.toHaveProperty("city");
    expect(params).not.toHaveProperty("province");
    expect(params).not.toHaveProperty("page");
    expect(params.size).toBe(20);
  });

  it("upper-cases the category code", () => {
    const params = buildDashboardQueryParams(
      { preset: "30d", categoryCode: "noodles" },
      {},
      TODAY,
    );

    expect(params.categoryCode).toBe("NOODLES");
  });

  it("defaults the radius when coordinates arrive without one", () => {
    const params = buildDashboardQueryParams(
      { preset: "30d", latitude: 11.5564, longitude: 104.9282 },
      {},
      TODAY,
    );

    expect(params.radiusKm).toBe(DASHBOARD_DEFAULT_RADIUS_KM);
  });

  it("drops a lone coordinate so the backend never sees a 400-shaped request", () => {
    const params = buildDashboardQueryParams(
      { preset: "30d", latitude: 11.5564 },
      {},
      TODAY,
    );

    expect(params).not.toHaveProperty("latitude");
    expect(params).not.toHaveProperty("longitude");
    expect(params).not.toHaveProperty("radiusKm");
  });

  it("keeps page 0 — a falsy value that must still be sent", () => {
    const params = buildDashboardQueryParams(
      { preset: "30d" },
      { page: 0, size: 10 },
      TODAY,
    );

    expect(params.page).toBe(0);
  });
});

describe("URL serialisation", () => {
  it("round-trips a fully populated filter set", () => {
    const filters: DashboardFilters = {
      preset: "custom",
      from: "2026-08-01",
      to: "2026-08-20",
      city: "Phnom Penh",
      province: "Phnom Penh",
      categoryCode: "SOUP",
      latitude: 11.5564,
      longitude: 104.9282,
      radiusKm: 12,
    };

    const parsed = parseDashboardFilters(
      dashboardFiltersToSearchParams(filters),
    );

    expect(parsed).toEqual(filters);
  });

  it("writes an empty query string for the default filters", () => {
    expect(
      dashboardFiltersToSearchParams(DEFAULT_DASHBOARD_FILTERS).toString(),
    ).toBe("");
  });

  it("never writes a coordinate without its pair", () => {
    const params = dashboardFiltersToSearchParams({
      preset: "30d",
      latitude: 11.5,
    });

    expect(params.has("latitude")).toBe(false);
  });

  it("ignores a malformed date in the URL rather than sending it on", () => {
    const parsed = parseDashboardFilters(
      new URLSearchParams("preset=custom&from=not-a-date&to=2026-08-20"),
    );

    expect(parsed.from).toBeUndefined();
    expect(parsed.to).toBe("2026-08-20");
  });
});

describe("apply and reset", () => {
  it("turns form values into filters, trimming and normalising", () => {
    const filters = formValuesToFilters({
      preset: "custom",
      from: "2026-08-01",
      to: "2026-08-20",
      city: "  Phnom Penh  ",
      province: "",
      categoryCode: "soup",
      latitude: "11.5564",
      longitude: "104.9282",
      radiusKm: "12",
    });

    expect(filters).toEqual({
      preset: "custom",
      from: "2026-08-01",
      to: "2026-08-20",
      city: "Phnom Penh",
      province: undefined,
      categoryCode: "SOUP",
      latitude: 11.5564,
      longitude: 104.9282,
      radiusKm: 12,
    });
  });

  it("drops the radius when the coordinates were not supplied", () => {
    const filters = formValuesToFilters({
      preset: "30d",
      from: "",
      to: "",
      city: "",
      province: "",
      categoryCode: "",
      latitude: "",
      longitude: "",
      radiusKm: "20",
    });

    expect(filters.radiusKm).toBeUndefined();
  });

  it("resets to a clean 30 day form", () => {
    expect(filtersToFormValues(DEFAULT_DASHBOARD_FILTERS, TODAY)).toEqual({
      preset: "30d",
      from: "",
      to: "",
      city: "",
      province: "",
      categoryCode: "",
      latitude: "",
      longitude: "",
      radiusKm: "",
    });
  });
});

describe("dashboardFilterFormSchema", () => {
  const base = {
    preset: "30d" as const,
    from: "",
    to: "",
    city: "",
    province: "",
    categoryCode: "",
    latitude: "",
    longitude: "",
    radiusKm: "",
  };

  it("accepts the default form", () => {
    expect(dashboardFilterFormSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a latitude without a longitude", () => {
    const result = dashboardFilterFormSchema.safeParse({
      ...base,
      latitude: "11.5",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.path[0] === "longitude")).toBe(
      true,
    );
  });

  it("rejects an out-of-range latitude", () => {
    const result = dashboardFilterFormSchema.safeParse({
      ...base,
      latitude: "120",
      longitude: "104",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a radius above 50 km and a radius without coordinates", () => {
    expect(
      dashboardFilterFormSchema.safeParse({
        ...base,
        latitude: "11.5",
        longitude: "104.9",
        radiusKm: "51",
      }).success,
    ).toBe(false);

    expect(
      dashboardFilterFormSchema.safeParse({ ...base, radiusKm: "10" }).success,
    ).toBe(false);
  });

  it("rejects a from date after the to date", () => {
    const result = dashboardFilterFormSchema.safeParse({
      ...base,
      preset: "custom",
      from: "2026-08-20",
      to: "2026-08-01",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.path[0] === "from")).toBe(
      true,
    );
  });

  it("rejects a range longer than 366 days", () => {
    const result = dashboardFilterFormSchema.safeParse({
      ...base,
      preset: "custom",
      from: "2025-01-01",
      to: "2026-08-27",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a range of exactly 366 days", () => {
    const result = dashboardFilterFormSchema.safeParse({
      ...base,
      preset: "custom",
      from: "2026-01-01",
      to: "2027-01-01",
    });

    expect(inclusiveDayCount("2026-01-01", "2027-01-01")).toBe(366);
    expect(result.success).toBe(true);
  });
});
