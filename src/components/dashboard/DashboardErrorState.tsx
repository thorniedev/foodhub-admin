"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

import { cn } from "@/src/lib/utils";
import { getAdminApiErrorMessage } from "@/src/lib/adminApiError";

interface DashboardErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  compact?: boolean;
}

export default function DashboardErrorState({
  error,
  onRetry,
  title = "មិនអាចផ្ទុកទិន្នន័យវិភាគបានទេ",
  compact = false,
}: DashboardErrorStateProps) {
  const message = getAdminApiErrorMessage(error);

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-2.5 rounded-xl border border-red-200 bg-red-50/70 px-5 text-center dark:border-red-900/60 dark:bg-red-950/30",
        compact ? "py-8" : "py-12",
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
        <AlertTriangle size={18} aria-hidden="true" />
      </span>

      <div>
        <p className="text-sm font-semibold text-red-900 dark:text-red-200">
          {title}
        </p>
        <p className="mt-1 max-w-xl text-xs leading-5 text-red-800/90 dark:text-red-300/90">
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-red-600 px-3.5 text-xs font-medium text-white shadow-card transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
        >
          <RotateCcw size={14} aria-hidden="true" />
          <span>ព្យាយាមម្ដងទៀត</span>
        </button>
      )}
    </div>
  );
}
