import { z } from "zod";

import type {
  DashboardDatePreset,
  DashboardFilters,
} from "@/src/types/adminDashboard";

/** The backend resolves every analytics date in this zone; the UI must agree. */
export const DASHBOARD_TIME_ZONE = "Asia/Phnom_Penh";

export const DASHBOARD_MAX_RANGE_DAYS = 366;
export const DASHBOARD_MAX_RADIUS_KM = 50;
export const DASHBOARD_DEFAULT_RADIUS_KM = 5;

export const DASHBOARD_PRESET_DAYS: Record<
  Exclude<DashboardDatePreset, "custom">,
  number
> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  preset: "30d",
};

export const DEFAULT_TABLE_PAGE_SIZE = 10;

/* =========================================================
   DATE HELPERS
   ISO date strings are treated as UTC midnight so that arithmetic never
   drifts across a daylight-saving boundary in the browser's own zone.
========================================================= */

function isoToUtcDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function isIsoDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(isoToUtcDate(value).getTime())
  );
}

export function todayInDashboardZone(now: Date = new Date()): string {
  // "en-CA" formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DASHBOARD_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function shiftIsoDate(iso: string, days: number): string {
  const date = isoToUtcDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function inclusiveDayCount(from: string, to: string): number {
  const diff = isoToUtcDate(to).getTime() - isoToUtcDate(from).getTime();
  return Math.round(diff / 86_400_000) + 1;
}

/**
 * Turns the filter state into the concrete `from`/`to` pair sent to the API.
 * Presets are always anchored on "today" in Phnom Penh so a preset dashboard
 * stays current without the user re-picking dates.
 */
export function resolveDateRange(
  filters: DashboardFilters,
  today: string = todayInDashboardZone(),
): { from: string; to: string } {
  if (filters.preset !== "custom") {
    const days = DASHBOARD_PRESET_DAYS[filters.preset] ?? 30;
    return { from: shiftIsoDate(today, -(days - 1)), to: today };
  }

  const to = isIsoDate(filters.to) ? filters.to : today;
  const from = isIsoDate(filters.from) ? filters.from : shiftIsoDate(to, -29);
  return { from, to };
}

/* =========================================================
   URL <-> FILTER STATE
========================================================= */

function readText(params: URLSearchParams, key: string): string | undefined {
  const raw = params.get(key)?.trim();
  return raw ? raw : undefined;
}

function readNumber(
  params: URLSearchParams,
  key: string,
): number | undefined {
  const raw = readText(params, key);
  if (raw === undefined) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readPreset(params: URLSearchParams): DashboardDatePreset {
  const raw = readText(params, "preset");
  return raw === "7d" || raw === "30d" || raw === "90d" || raw === "custom"
    ? raw
    : DEFAULT_DASHBOARD_FILTERS.preset;
}

export function parseDashboardFilters(
  params: URLSearchParams,
): DashboardFilters {
  const from = readText(params, "from");
  const to = readText(params, "to");

  return {
    preset: readPreset(params),
    from: isIsoDate(from) ? from : undefined,
    to: isIsoDate(to) ? to : undefined,
    city: readText(params, "city"),
    province: readText(params, "province"),
    categoryCode: readText(params, "categoryCode")?.toUpperCase(),
    latitude: readNumber(params, "latitude"),
    longitude: readNumber(params, "longitude"),
    radiusKm: readNumber(params, "radiusKm"),
  };
}

/**
 * Serialises filter state for the address bar. Only meaningful values are
 * written, so a default dashboard has a clean URL and a shared URL restores
 * exactly what the sender was looking at.
 */
export function dashboardFiltersToSearchParams(
  filters: DashboardFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.preset !== DEFAULT_DASHBOARD_FILTERS.preset) {
    params.set("preset", filters.preset);
  }

  if (filters.preset === "custom") {
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
  }

  if (filters.city) params.set("city", filters.city);
  if (filters.province) params.set("province", filters.province);
  if (filters.categoryCode) params.set("categoryCode", filters.categoryCode);

  if (filters.latitude !== undefined && filters.longitude !== undefined) {
    params.set("latitude", String(filters.latitude));
    params.set("longitude", String(filters.longitude));
    if (filters.radiusKm !== undefined) {
      params.set("radiusKm", String(filters.radiusKm));
    }
  }

  return params;
}

/* =========================================================
   QUERY SERIALISATION
========================================================= */

export type DashboardQueryParams = Record<string, string | number>;

/**
 * Builds the query object handed to RTK Query. Undefined, null and blank
 * values are dropped so the request never carries `city=undefined`, and
 * coordinates are only sent as a complete pair (the backend rejects a lone
 * latitude with 400).
 */
export function buildDashboardQueryParams(
  filters: DashboardFilters,
  extra: Record<string, string | number | undefined> = {},
  today: string = todayInDashboardZone(),
): DashboardQueryParams {
  const { from, to } = resolveDateRange(filters, today);

  const params: DashboardQueryParams = { from, to };

  const city = filters.city?.trim();
  if (city) params.city = city;

  const province = filters.province?.trim();
  if (province) params.province = province;

  const categoryCode = filters.categoryCode?.trim();
  if (categoryCode) params.categoryCode = categoryCode.toUpperCase();

  const hasCoordinates =
    typeof filters.latitude === "number" &&
    Number.isFinite(filters.latitude) &&
    typeof filters.longitude === "number" &&
    Number.isFinite(filters.longitude);

  if (hasCoordinates) {
    params.latitude = filters.latitude as number;
    params.longitude = filters.longitude as number;
    params.radiusKm =
      typeof filters.radiusKm === "number" && Number.isFinite(filters.radiusKm)
        ? filters.radiusKm
        : DASHBOARD_DEFAULT_RADIUS_KM;
  }

  for (const [key, value] of Object.entries(extra)) {
    if (value === undefined || value === null || value === "") continue;
    params[key] = value;
  }

  return params;
}

export function hasActiveDashboardFilters(filters: DashboardFilters): boolean {
  return Boolean(
    filters.city ||
      filters.province ||
      filters.categoryCode ||
      filters.latitude !== undefined ||
      filters.longitude !== undefined ||
      filters.preset !== DEFAULT_DASHBOARD_FILTERS.preset,
  );
}

/* =========================================================
   VALIDATION
   The filter bar carries enough cross-field rules (coordinate pairing,
   radius bounds, range length) to be worth a schema rather than ad-hoc ifs.
========================================================= */

const optionalTrimmed = z
  .string()
  .trim()
  .max(120, "តម្លៃវែងពេក")
  .optional()
  .or(z.literal(""));

const optionalNumberText = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""));

export const dashboardFilterFormSchema = z
  .object({
    preset: z.enum(["7d", "30d", "90d", "custom"]),
    from: optionalNumberText,
    to: optionalNumberText,
    city: optionalTrimmed,
    province: optionalTrimmed,
    categoryCode: optionalTrimmed,
    latitude: optionalNumberText,
    longitude: optionalNumberText,
    radiusKm: optionalNumberText,
  })
  .superRefine((value, ctx) => {
    const hasLatitude = Boolean(value.latitude);
    const hasLongitude = Boolean(value.longitude);

    if (hasLatitude !== hasLongitude) {
      ctx.addIssue({
        code: "custom",
        path: [hasLatitude ? "longitude" : "latitude"],
        message: "ត្រូវបំពេញរយៈទទឹង និងរយៈបណ្ដោយជាមួយគ្នា",
      });
    }

    if (hasLatitude) {
      const latitude = Number(value.latitude);
      if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
        ctx.addIssue({
          code: "custom",
          path: ["latitude"],
          message: "រយៈទទឹងត្រូវនៅចន្លោះ -90 និង 90",
        });
      }
    }

    if (hasLongitude) {
      const longitude = Number(value.longitude);
      if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        ctx.addIssue({
          code: "custom",
          path: ["longitude"],
          message: "រយៈបណ្ដោយត្រូវនៅចន្លោះ -180 និង 180",
        });
      }
    }

    if (value.radiusKm) {
      const radiusKm = Number(value.radiusKm);
      if (
        !Number.isFinite(radiusKm) ||
        radiusKm <= 0 ||
        radiusKm > DASHBOARD_MAX_RADIUS_KM
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["radiusKm"],
          message: `កាំត្រូវធំជាង 0 និងមិនលើស ${DASHBOARD_MAX_RADIUS_KM} គ.ម`,
        });
      }

      if (!hasLatitude) {
        ctx.addIssue({
          code: "custom",
          path: ["radiusKm"],
          message: "កាំត្រូវការទីតាំង (រយៈទទឹង និងរយៈបណ្ដោយ)",
        });
      }
    }

    if (value.preset !== "custom") return;

    if (value.from && !isIsoDate(value.from)) {
      ctx.addIssue({
        code: "custom",
        path: ["from"],
        message: "ទម្រង់កាលបរិច្ឆេទមិនត្រឹមត្រូវ",
      });
    }

    if (value.to && !isIsoDate(value.to)) {
      ctx.addIssue({
        code: "custom",
        path: ["to"],
        message: "ទម្រង់កាលបរិច្ឆេទមិនត្រឹមត្រូវ",
      });
    }

    if (!isIsoDate(value.from) || !isIsoDate(value.to)) return;

    if (value.from > value.to) {
      ctx.addIssue({
        code: "custom",
        path: ["from"],
        message: "ថ្ងៃចាប់ផ្ដើមមិនអាចនៅក្រោយថ្ងៃបញ្ចប់",
      });
    } else if (inclusiveDayCount(value.from, value.to) > DASHBOARD_MAX_RANGE_DAYS) {
      ctx.addIssue({
        code: "custom",
        path: ["to"],
        message: `ចន្លោះកាលបរិច្ឆេទមិនអាចលើស ${DASHBOARD_MAX_RANGE_DAYS} ថ្ងៃ`,
      });
    }
  });

export type DashboardFilterFormValues = z.infer<typeof dashboardFilterFormSchema>;

export function filtersToFormValues(
  filters: DashboardFilters,
  today: string = todayInDashboardZone(),
): DashboardFilterFormValues {
  const range = resolveDateRange(filters, today);

  return {
    preset: filters.preset,
    from: filters.preset === "custom" ? range.from : "",
    to: filters.preset === "custom" ? range.to : "",
    city: filters.city ?? "",
    province: filters.province ?? "",
    categoryCode: filters.categoryCode ?? "",
    latitude: filters.latitude === undefined ? "" : String(filters.latitude),
    longitude: filters.longitude === undefined ? "" : String(filters.longitude),
    radiusKm: filters.radiusKm === undefined ? "" : String(filters.radiusKm),
  };
}

function toOptionalNumber(value: string | undefined): number | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function formValuesToFilters(
  values: DashboardFilterFormValues,
): DashboardFilters {
  const latitude = toOptionalNumber(values.latitude);
  const longitude = toOptionalNumber(values.longitude);
  const hasCoordinates = latitude !== undefined && longitude !== undefined;

  return {
    preset: values.preset,
    from: values.preset === "custom" && isIsoDate(values.from) ? values.from : undefined,
    to: values.preset === "custom" && isIsoDate(values.to) ? values.to : undefined,
    city: values.city?.trim() || undefined,
    province: values.province?.trim() || undefined,
    categoryCode: values.categoryCode?.trim().toUpperCase() || undefined,
    latitude: hasCoordinates ? latitude : undefined,
    longitude: hasCoordinates ? longitude : undefined,
    radiusKm: hasCoordinates ? toOptionalNumber(values.radiusKm) : undefined,
  };
}
