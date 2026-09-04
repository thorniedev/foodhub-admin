"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";

import { cn } from "@/src/lib/utils";
import { downloadDashboardExport } from "@/src/lib/dashboardExport";
import type {
  DashboardExportFormat,
  DashboardExportReport,
  DashboardFilters,
} from "@/src/types/adminDashboard";

const REPORTS: { value: DashboardExportReport; label: string }[] = [
  { value: "overview", label: "ទិដ្ឋភាពរួម" },
  { value: "stores", label: "សមិទ្ធកម្មហាង" },
  { value: "items", label: "មុខម្ហូបពេញនិយម" },
  { value: "locations", label: "តាមទីតាំង" },
  { value: "categories", label: "តាមប្រភេទ" },
];

const FORMATS: {
  value: DashboardExportFormat;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "CSV", label: "CSV", icon: <FileSpreadsheet size={16} aria-hidden="true" /> },
  { value: "PDF", label: "PDF", icon: <FileText size={16} aria-hidden="true" /> },
];

interface DashboardExportMenuProps {
  filters: DashboardFilters;
  disabled?: boolean;
}

export default function DashboardExportMenu({
  filters,
  disabled = false,
}: DashboardExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState<DashboardExportReport>("overview");
  const [busyFormat, setBusyFormat] = useState<DashboardExportFormat | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleDownload = async (format: DashboardExportFormat) => {
    setBusyFormat(format);
    setErrorMessage(null);
    setMessage(null);

    try {
      const filename = await downloadDashboardExport({ report, format, filters });
      setMessage(`បានទាញយក ${filename}`);
      setOpen(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "មិនអាចទាញយករបាយការណ៍បានទេ",
      );
    } finally {
      setBusyFormat(null);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border bg-background px-3 text-xs font-medium text-foreground shadow-card transition hover:border-primary/40 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-55"
      >
        <Download size={14} aria-hidden="true" />
        <span>នាំចេញ</span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="ជម្រើសនាំចេញរបាយការណ៍"
          className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-xl border bg-popover p-2.5 text-popover-foreground shadow-overlay"
        >
          <p className="px-1 pb-1.5 text-xs font-semibold text-foreground">
            របាយការណ៍
          </p>

          <div className="space-y-0.5">
            {REPORTS.map((option) => {
              const selected = report === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => setReport(option.value)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    selected
                      ? "bg-primary-50 text-primary-800 dark:bg-primary-950/60 dark:text-primary-300"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <span>{option.label}</span>
                  {selected && <Check size={14} aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <p className="px-1 pb-1.5 pt-2.5 text-xs font-semibold text-foreground">
            ទម្រង់ឯកសារ
          </p>

          <div className="grid grid-cols-2 gap-1.5">
            {FORMATS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="menuitem"
                disabled={busyFormat !== null}
                onClick={() => void handleDownload(option.value)}
                className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border/80 px-2.5 text-xs font-medium text-foreground transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyFormat === option.value ? (
                  <Loader2 size={14} aria-hidden="true" className="animate-spin" />
                ) : (
                  option.icon
                )}
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          <p className="mt-2.5 px-1 text-[0.6875rem] leading-4 text-muted-foreground">
            របាយការណ៍ប្រើតម្រងដូចនឹងផ្ទាំងនេះ។
          </p>
        </div>
      )}

      <p aria-live="polite" className="sr-only">
        {message ?? errorMessage ?? ""}
      </p>

      {errorMessage && (
        <p role="alert" className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-red-200 bg-red-50 p-2 text-[0.6875rem] text-red-700 shadow-overlay dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
