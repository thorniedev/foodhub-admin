import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildDashboardExportUrl,
  downloadDashboardExport,
  fallbackExportFilename,
  parseContentDispositionFilename,
} from "./dashboardExport";
import type { DashboardFilters } from "@/src/types/adminDashboard";

const TODAY = "2026-08-27";

const filters: DashboardFilters = {
  preset: "custom",
  from: "2026-08-01",
  to: "2026-08-20",
  city: "Phnom Penh",
  latitude: 11.5564,
  longitude: 104.9282,
  radiusKm: 12,
};

describe("buildDashboardExportUrl", () => {
  it("carries the report, format and the dashboard filters", () => {
    const url = new URL(
      buildDashboardExportUrl({ report: "stores", format: "CSV", filters }, TODAY),
      "http://localhost",
    );

    expect(url.pathname).toBe("/api/admin/analytics/export");
    expect(url.searchParams.get("report")).toBe("stores");
    expect(url.searchParams.get("format")).toBe("CSV");
    expect(url.searchParams.get("from")).toBe("2026-08-01");
    expect(url.searchParams.get("to")).toBe("2026-08-20");
    expect(url.searchParams.get("city")).toBe("Phnom Penh");
    expect(url.searchParams.get("radiusKm")).toBe("12");
    expect(url.searchParams.get("province")).toBeNull();
  });
});

describe("parseContentDispositionFilename", () => {
  it("reads a quoted filename", () => {
    expect(
      parseContentDispositionFilename(
        'attachment; filename="foodhub-stores-2026-08-01-2026-08-20.csv"',
      ),
    ).toBe("foodhub-stores-2026-08-01-2026-08-20.csv");
  });

  it("reads an RFC 5987 filename", () => {
    expect(
      parseContentDispositionFilename(
        "attachment; filename*=UTF-8''foodhub%20report.pdf",
      ),
    ).toBe("foodhub report.pdf");
  });

  it("returns null when the header is absent", () => {
    expect(parseContentDispositionFilename(null)).toBeNull();
  });
});

describe("fallbackExportFilename", () => {
  it("uses the resolved period and the format extension", () => {
    expect(
      fallbackExportFilename({ report: "items", format: "PDF", filters }, TODAY),
    ).toBe("foodhub-items-2026-08-01-2026-08-20.pdf");
  });
});

describe("downloadDashboardExport", () => {
  const createObjectURL = vi.fn(() => "blob:mock-url");
  const revokeObjectURL = vi.fn();
  let clickSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });

    clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    clickSpy.mockRestore();
    vi.useRealTimers();
  });

  it("fetches the blob, triggers an anchor download and revokes the object URL", async () => {
    const blob = new Blob(["a,b,c"], { type: "text/csv" });
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: async () => blob,
      headers: {
        get: (name: string) =>
          name.toLowerCase() === "content-disposition"
            ? 'attachment; filename="foodhub-overview.csv"'
            : null,
      },
    });

    const filename = await downloadDashboardExport({
      report: "overview",
      format: "CSV",
      filters,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      today: TODAY,
    });

    expect(filename).toBe("foodhub-overview.csv");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(document.querySelector("a[download]")).toBeNull();

    // Revocation is deferred so the browser can start the download first.
    expect(revokeObjectURL).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("falls back to a generated filename when the header is missing", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: async () => new Blob([new Uint8Array([1, 2])], { type: "application/pdf" }),
      headers: { get: () => null },
    });

    const filename = await downloadDashboardExport({
      report: "categories",
      format: "PDF",
      filters,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      today: TODAY,
    });

    expect(filename).toBe("foodhub-categories-2026-08-01-2026-08-20.pdf");
  });

  it("throws with the status code and never opens a download on failure", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      blob: async () => new Blob([]),
      headers: { get: () => null },
    });

    await expect(
      downloadDashboardExport({
        report: "overview",
        format: "CSV",
        filters,
        fetchImpl: fetchImpl as unknown as typeof fetch,
        today: TODAY,
      }),
    ).rejects.toThrow("403");

    expect(clickSpy).not.toHaveBeenCalled();
    expect(createObjectURL).not.toHaveBeenCalled();
  });
});
