"use client";

import { PlugZap, RotateCcw } from "lucide-react";

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
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-5 text-center ${
        compact ? "py-8" : "py-12"
      }`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
        <PlugZap size={22} aria-hidden="true" />
      </span>

      <div>
        <p className="text-lg font-semibold text-amber-900">
          {reportName
            ? `របាយការណ៍ “${reportName}” មិនទាន់មាននៅលើម៉ាស៊ីនមេទេ`
            : "របាយការណ៍នេះមិនទាន់មាននៅលើម៉ាស៊ីនមេទេ"}
        </p>

        <p className="mt-1 max-w-xl text-base text-amber-800/90">
          ម៉ាស៊ីនមេបានឆ្លើយតប 404 សម្រាប់ endpoint នេះ។ នេះមិនមែនមានន័យថាគ្មានទិន្នន័យទេ —
          backend ដែលកំពុងភ្ជាប់មិនទាន់មានរបាយការណ៍វិភាគនេះ។ សូមដាក់ពង្រាយ backend
          ជំនាន់ថ្មី រួចព្យាយាមម្ដងទៀត។
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-amber-300 bg-white px-5 text-base font-semibold text-amber-900 transition hover:bg-amber-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
        >
          <RotateCcw size={18} aria-hidden="true" />
          ព្យាយាមម្ដងទៀត
        </button>
      )}
    </div>
  );
}
