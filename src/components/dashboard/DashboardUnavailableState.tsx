"use client";

import { PlugZap, RotateCcw } from "lucide-react";

import { cn } from "@/src/lib/utils";

interface DashboardUnavailableStateProps {
  /** Which report is missing, e.g. "សមិទ្ធកម្មហាង". */
  reportName?: string;
  onRetry?: () => void;
  compact?: boolean;
}

/**
 * Shown when the backend returned 404 for a report endpoint.
 *
 * This is deliberately distinct from the empty state: "no rows matched your
 * filter" and "this server build does not expose this report" are different
 * facts, and showing the first when the second is true hides a real outage.
 */
export default function DashboardUnavailableState({
  reportName,
  onRetry,
  compact = false,
}: DashboardUnavailableStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 px-5 text-center dark:border-amber-900/60 dark:bg-amber-950/30",
        compact ? "py-8" : "py-12",
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
        <PlugZap size={18} aria-hidden="true" />
      </span>

      <div>
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          {reportName
            ? `របាយការណ៍ “${reportName}” មិនទាន់មាននៅលើម៉ាស៊ីនមេទេ`
            : "របាយការណ៍នេះមិនទាន់មាននៅលើម៉ាស៊ីនមេទេ"}
        </p>

        <p className="mt-1 max-w-xl text-xs leading-5 text-amber-800/90 dark:text-amber-300/90">
          ម៉ាស៊ីនមេបានឆ្លើយតប 404 សម្រាប់ endpoint នេះ។ នេះមិនមែនមានន័យថាគ្មានទិន្នន័យទេ —
          backend ដែលកំពុងភ្ជាប់មិនទាន់មានរបាយការណ៍វិភាគនេះ។ សូមដាក់ពង្រាយ backend
          ជំនាន់ថ្មី រួចព្យាយាមម្ដងទៀត។
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-amber-300 bg-background px-3.5 text-xs font-medium text-amber-900 transition hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-950/60"
        >
          <RotateCcw size={14} aria-hidden="true" />
          <span>ព្យាយាមម្ដងទៀត</span>
        </button>
      )}
    </div>
  );
}
