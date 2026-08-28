import {
  buildDashboardQueryParams,
  todayInDashboardZone,
} from "@/src/lib/dashboardFilters";
import type {
  DashboardExportFormat,
  DashboardExportReport,
  DashboardFilters,
} from "@/src/types/adminDashboard";

export const DASHBOARD_EXPORT_URL = "/api/admin/analytics/export";

export interface DashboardExportRequest {
  report: DashboardExportReport;
  format: DashboardExportFormat;
  filters: DashboardFilters;
}

/**
 * Builds the export URL. The report and format ride alongside the same
 * filters the dashboard is showing, so an export always matches the screen.
 */
export function buildDashboardExportUrl(
  { report, format, filters }: DashboardExportRequest,
  today: string = todayInDashboardZone(),
): string {
  const params = buildDashboardQueryParams(filters, { report, format }, today);
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    search.set(key, String(value));
  }

  return `${DASHBOARD_EXPORT_URL}?${search.toString()}`;
}

/** Reads the server-provided filename, falling back to a descriptive one. */
export function parseContentDispositionFilename(
  header: string | null,
): string | null {
  if (!header) return null;

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      return utf8Match[1].trim();
    }
  }

  const quoted = /filename="([^"]+)"/i.exec(header);
  if (quoted?.[1]) return quoted[1];

  const bare = /filename=([^;]+)/i.exec(header);
  return bare?.[1]?.trim() ?? null;
}

export function fallbackExportFilename(
  { report, format, filters }: DashboardExportRequest,
  today: string = todayInDashboardZone(),
): string {
  const params = buildDashboardQueryParams(filters, {}, today);
  const extension = format === "PDF" ? "pdf" : "csv";
  return `foodhub-${report}-${params.from}-${params.to}.${extension}`;
}

export interface DownloadDashboardExportOptions extends DashboardExportRequest {
  /** Injectable for tests; defaults to the global fetch. */
  fetchImpl?: typeof fetch;
  today?: string;
}

/**
 * Downloads an analytics export as a file.
 *
 * RTK Query is deliberately not used here: its default response handler
 * parses JSON, which would corrupt a CSV or PDF body.
 */
export async function downloadDashboardExport({
  report,
  format,
  filters,
  fetchImpl,
  today = todayInDashboardZone(),
}: DownloadDashboardExportOptions): Promise<string> {
  const doFetch = fetchImpl ?? fetch;
  const url = buildDashboardExportUrl({ report, format, filters }, today);

  const response = await doFetch(url, {
    method: "GET",
    credentials: "include",
    headers: { Accept: format === "PDF" ? "application/pdf" : "text/csv" },
  });

  if (!response.ok) {
    throw new Error(
      `មិនអាចទាញយករបាយការណ៍បានទេ (កូដ ${response.status})`,
    );
  }

  const blob = await response.blob();
  const filename =
    parseContentDispositionFilename(
      response.headers?.get?.("content-disposition") ?? null,
    ) ?? fallbackExportFilename({ report, format, filters }, today);

  const objectUrl = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = "noopener";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    // Revoking synchronously can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
  }

  return filename;
}
