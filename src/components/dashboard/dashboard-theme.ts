/**
 * Shared visual + formatting vocabulary for the admin analytics dashboard.
 *
 * The categorical series palette was validated for colour-vision deficiency
 * and for >= 3:1 contrast against the white card surface, so series colours
 * must be taken from here rather than picked per chart.
 */

export const DASHBOARD_SURFACE = "#ffffff";

/**
 * Series colours are drawn from the FoodHub brand ramps in `globals.css`
 * (green primary, orange secondary, yellow accent) plus one analytics blue.
 * Each entry is >= 3:1 against the white card surface and stays separable
 * under deuteranopia/protanopia, so no chart should invent its own colour.
 *
 * These stay literal hex rather than `var(--chart-n)` because several call
 * sites derive translucent variants from them with `withAlpha`, and colour
 * arithmetic needs a resolved value.
 */
export const CHART_SERIES = {
  /** FoodHub green (primary-700) — the "our people" series. */
  activeUsers: "#15803d",
  /** Analytics blue — the second people series. */
  newUsers: "#2563eb",
  /** FoodHub orange (secondary-600) — recommendation volume. */
  sessions: "#ea580c",
  /** FoodHub green (primary-600) — discovery/exposure volume. */
  views: "#16a34a",
  /** Teal — the click/engagement series. */
  clicks: "#0d9488",
  /** FoodHub yellow (accent-600) — saves. */
  bookmarks: "#ca8a04",
} as const;

/**
 * Fill opacity for row `index` of a "top N" bar chart.
 *
 * A single flat colour across eight bars gives the eye nothing to rank by
 * except length. Fading down the list restores that cue while keeping the
 * series hue — which is what tells the reader *which* metric they are looking
 * at — intact. Bottoms out at 0.5 so the last bar still clears 3:1.
 */
export function rankOpacity(index: number, total: number): number {
  if (total <= 1) return 1;
  return 1 - (index / (total - 1)) * 0.5;
}

/** Translucent variant of a series colour, for fills and legend chips. */
export function withAlpha(color: string, percent: number): string {
  return `color-mix(in oklab, ${color} ${percent}%, transparent)`;
}

/** Low-emphasis fill for context bars that sit behind a headline series. */
export const CHART_CONTEXT_FILL_OPACITY = 0.22;

export const CHART_GRID = "var(--border)";
export const CHART_AXIS_TEXT = "var(--muted-foreground)";

export type Tone = "green" | "blue" | "amber" | "red" | "orange" | "gray";

/**
 * Tone is carried by the icon and by small accents — never by a tinted card
 * background. Eight pastel-filled cards in a row read as decoration; the same
 * eight on a neutral surface read as data.
 */
export const TONE_STYLES: Record<
  Tone,
  { surface: string; icon: string; text: string; border: string; bar: string }
> = {
  green: {
    surface: "bg-primary-50 dark:bg-primary-950/50",
    icon: "text-primary-700 dark:text-primary-400",
    text: "text-primary-800 dark:text-primary-300",
    border: "border-primary-100 dark:border-primary-900/60",
    bar: "bg-primary-600",
  },
  blue: {
    surface: "bg-blue-50 dark:bg-blue-950/50",
    icon: "text-blue-700 dark:text-blue-400",
    text: "text-blue-800 dark:text-blue-300",
    border: "border-blue-100 dark:border-blue-900/60",
    bar: "bg-blue-600",
  },
  amber: {
    surface: "bg-amber-50 dark:bg-amber-950/50",
    icon: "text-amber-700 dark:text-amber-400",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-100 dark:border-amber-900/60",
    bar: "bg-amber-500",
  },
  red: {
    surface: "bg-red-50 dark:bg-red-950/50",
    icon: "text-red-700 dark:text-red-400",
    text: "text-red-800 dark:text-red-300",
    border: "border-red-100 dark:border-red-900/60",
    bar: "bg-red-600",
  },
  orange: {
    surface: "bg-secondary-50 dark:bg-secondary-950/50",
    icon: "text-secondary-700 dark:text-secondary-400",
    text: "text-secondary-800 dark:text-secondary-300",
    border: "border-secondary-100 dark:border-secondary-900/60",
    bar: "bg-secondary-500",
  },
  gray: {
    surface: "bg-muted",
    icon: "text-muted-foreground",
    text: "text-foreground",
    border: "border-border",
    bar: "bg-muted-foreground",
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

/**
 * Percentage changes off a near-zero base are arithmetically correct and
 * visually meaningless — one active user growing to twelve reported as
 * "+1,100.0%", fourteen sessions to 4,637 as "+33,021.4%". Past this
 * threshold the exact figure tells the reader nothing the arrow does not.
 */
const CHANGE_CLAMP = 999;

export interface ChangeDisplay {
  text: string;
  /** True when the real magnitude was too large to print. */
  clamped: boolean;
}

export function formatChange(
  value: number | null | undefined,
): ChangeDisplay | null {
  if (value === null || value === undefined || !Number.isFinite(value))
    return null;

  if (Math.abs(value) > CHANGE_CLAMP) {
    return { text: value > 0 ? `>+${CHANGE_CLAMP}%` : `<−${CHANGE_CLAMP}%`, clamped: true };
  }

  // Whole percentages below 100 do not need a decimal place; above it the
  // decimal is noise either way.
  const magnitude = Math.abs(value);
  const formatted =
    magnitude >= 100
      ? NUMBER_FORMAT.format(Math.round(value))
      : DECIMAL_FORMAT.format(value);

  const sign = value > 0 ? "+" : "";
  return { text: `${sign}${formatted}%`, clamped: false };
}

export function formatChangePercent(value: number | null | undefined): string | null {
  return formatChange(value)?.text ?? null;
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
