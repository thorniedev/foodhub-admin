/**
 * Shared visual + formatting vocabulary for the admin analytics dashboard.
 *
 * The categorical series palette was validated for colour-vision deficiency
 * and for >= 3:1 contrast against the white card surface, so series colours
 * must be taken from here rather than picked per chart.
 */

export const DASHBOARD_SURFACE = "#ffffff";

export const CHART_SERIES = {
  /** FoodHub green — the primary/"our users" series. */
  activeUsers: "#16a34a",
  /** Analytics blue. */
  newUsers: "#2563eb",
  /** Amber — recommendation volume. */
  sessions: "#d97706",
  /** Violet — item views. */
  views: "#7c3aed",
  /** Teal — spare slot (clicks, bookmarks). */
  clicks: "#0d9488",
} as const;

export const CHART_GRID = "#e5e7eb";
export const CHART_AXIS_TEXT = "#6b7280";

export type Tone = "green" | "blue" | "amber" | "red" | "violet" | "gray";

export const TONE_STYLES: Record<
  Tone,
  { surface: string; icon: string; text: string; border: string }
> = {
  green: {
    surface: "bg-primary-50",
    icon: "text-primary-700",
    text: "text-primary-800",
    border: "border-primary-100",
  },
  blue: {
    surface: "bg-blue-50",
    icon: "text-blue-700",
    text: "text-blue-800",
    border: "border-blue-100",
  },
  amber: {
    surface: "bg-amber-50",
    icon: "text-amber-700",
    text: "text-amber-800",
    border: "border-amber-100",
  },
  red: {
    surface: "bg-red-50",
    icon: "text-red-700",
    text: "text-red-800",
    border: "border-red-100",
  },
  violet: {
    surface: "bg-violet-50",
    icon: "text-violet-700",
    text: "text-violet-800",
    border: "border-violet-100",
  },
  gray: {
    surface: "bg-gray-100",
    icon: "text-gray-600",
    text: "text-gray-700",
    border: "border-gray-200",
  },
};

/* =========================================================
   NUMBER FORMATTING
========================================================= */

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");
const DECIMAL_FORMAT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const COMPACT_FORMAT = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return NUMBER_FORMAT.format(Math.round(value));
}

export function formatCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return COMPACT_FORMAT.format(value);
}

export function formatDecimal(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return DECIMAL_FORMAT.format(value);
}

/** Backend percentages already arrive on a 0..100 scale. */
export function formatPercentValue(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${DECIMAL_FORMAT.format(value)}%`;
}

/** CTR arrives as a 0..1 ratio. */
export function formatRatio(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${DECIMAL_FORMAT.format(value * 100)}%`;
}

export function formatMilliseconds(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  if (value >= 1000) return `${DECIMAL_FORMAT.format(value / 1000)}s`;
  return `${Math.round(value)}ms`;
}

export function formatChangePercent(value: number | null | undefined): string | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  const sign = value > 0 ? "+" : "";
  return `${sign}${DECIMAL_FORMAT.format(value)}%`;
}

/** Chart axis ticks: 2026-08-27 -> 27/08 */
export function formatShortDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
}

export function formatLongDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || "—";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

/* =========================================================
   STATUS VOCABULARY (Khmer)
========================================================= */

export const OPERATING_STATUS_LABELS: Record<string, string> = {
  OPEN: "បើក",
  CLOSED: "បិទ",
  TEMPORARILY_CLOSED: "បិទបណ្ដោះអាសន្ន",
  PERMANENTLY_CLOSED: "បិទជាអចិន្ត្រៃយ៍",
};

export const REVIEW_STATUS_LABELS: Record<string, string> = {
  APPROVED: "អនុម័ត",
  PENDING: "រង់ចាំ",
  REJECTED: "បដិសេធ",
  DRAFT: "ព្រាង",
};

export const AVAILABILITY_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "មាន",
  UNAVAILABLE: "អស់",
  SEASONAL: "តាមរដូវ",
  DISCONTINUED: "ឈប់លក់",
};

export const SEVERITY_LABELS: Record<string, string> = {
  HIGH: "បន្ទាន់",
  MEDIUM: "មធ្យម",
  LOW: "ទាប",
};

export const ISSUE_TYPE_LABELS: Record<string, string> = {
  INCOMPLETE_MENU_ITEM: "មុខម្ហូបខ្វះព័ត៌មាន",
  STALE_MENU_ITEM: "មុខម្ហូបមិនបានធ្វើបច្ចុប្បន្នភាព",
  PENDING_STORE: "ហាងរង់ចាំអនុម័ត",
};

export function severityTone(severity: string): Tone {
  switch (severity?.toUpperCase()) {
    case "HIGH":
      return "red";
    case "MEDIUM":
      return "amber";
    case "LOW":
      return "blue";
    default:
      return "gray";
  }
}

export function reviewStatusTone(status: string | null | undefined): Tone {
  switch (status?.toUpperCase()) {
    case "APPROVED":
      return "green";
    case "PENDING":
      return "amber";
    case "REJECTED":
      return "red";
    default:
      return "gray";
  }
}

export function operatingStatusTone(status: string | null | undefined): Tone {
  switch (status?.toUpperCase()) {
    case "OPEN":
      return "green";
    case "CLOSED":
      return "gray";
    case "TEMPORARILY_CLOSED":
      return "amber";
    case "PERMANENTLY_CLOSED":
      return "red";
    default:
      return "gray";
  }
}

export function availabilityTone(status: string | null | undefined): Tone {
  switch (status?.toUpperCase()) {
    case "AVAILABLE":
      return "green";
    case "SEASONAL":
      return "blue";
    case "UNAVAILABLE":
      return "amber";
    case "DISCONTINUED":
      return "red";
    default:
      return "gray";
  }
}

export function labelFor(
  dictionary: Record<string, string>,
  value: string | null | undefined,
): string {
  if (!value) return "—";
  return dictionary[value.toUpperCase()] ?? value;
}
