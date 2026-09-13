"use client";

import { CircleCheck, TriangleAlert, X } from "lucide-react";

import { cn } from "@/src/lib/utils";
import type { ApiMessage } from "@/src/types/safetyResource";

/**
 * Shared success/error feedback banner for the settings page's two
 * independently-acting sections (system settings, AI provider keys). Each
 * section keeps its own `message` state — a save on one shouldn't claim
 * credit or blame for the other — but both render it identically.
 */
export default function SettingsMessageBanner({
  message,
  onDismiss,
}: {
  message: ApiMessage;
  onDismiss: () => void;
}) {
  const isSuccess = message.type === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={cn(
        "flex items-start justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-xs leading-5",
        isSuccess
          ? "border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-900 dark:bg-primary-950/40 dark:text-primary-300"
          : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
      )}
    >
      <span className="flex min-w-0 items-start gap-2">
        {isSuccess ? (
          <CircleCheck size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
        ) : (
          <TriangleAlert size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
        )}
        <span className="min-w-0">{message.text}</span>
      </span>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="បិទសារនេះ"
        className="shrink-0 cursor-pointer rounded p-0.5 opacity-70 transition hover:opacity-100"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
