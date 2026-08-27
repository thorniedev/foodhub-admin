"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

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
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50/60 px-5 text-center ${
        compact ? "py-8" : "py-12"
      }`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <AlertTriangle size={22} aria-hidden="true" />
      </span>

      <div>
        <p className="text-lg font-semibold text-red-800">{title}</p>
        <p className="mt-1 max-w-xl text-base text-red-700/90">{message}</p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-red-600 px-5 text-base font-semibold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
        >
          <RotateCcw size={18} aria-hidden="true" />
          ព្យាយាមម្ដងទៀត
        </button>
      )}
    </div>
  );
}
