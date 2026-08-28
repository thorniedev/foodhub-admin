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
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-5 text-base font-bold text-primary-800 transition hover:bg-primary-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Download size={18} aria-hidden="true" />
        នាំចេញ
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="ជម្រើសនាំចេញរបាយការណ៍"
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl"
        >
          <p className="px-1 pb-2 text-sm font-semibold text-gray-500">
            របាយការណ៍
          </p>

          <div className="space-y-1">
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
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-base transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                    selected
                      ? "bg-primary-50 font-semibold text-primary-800"
                      : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  {option.label}
                  {selected && <Check size={16} aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <p className="px-1 pb-2 pt-3 text-sm font-semibold text-gray-500">
            ទម្រង់ឯកសារ
          </p>

          <div className="grid grid-cols-2 gap-2">
            {FORMATS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="menuitem"
                disabled={busyFormat !== null}
                onClick={() => void handleDownload(option.value)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 text-base font-semibold text-gray-800 transition hover:border-primary-300 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyFormat === option.value ? (
                  <Loader2 size={16} aria-hidden="true" className="animate-spin" />
                ) : (
                  option.icon
                )}
                {option.label}
              </button>
            ))}
          </div>

          <p className="mt-3 px-1 text-sm leading-relaxed text-gray-500">
            របាយការណ៍ប្រើតម្រងដូចនឹងផ្ទាំងនេះ។
          </p>
        </div>
      )}

      <p aria-live="polite" className="sr-only">
        {message ?? errorMessage ?? ""}
      </p>

      {errorMessage && (
        <p role="alert" className="absolute right-0 top-full mt-1 w-72 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
