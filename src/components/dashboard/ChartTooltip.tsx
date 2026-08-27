"use client";

import type { ReactNode } from "react";

export interface ChartTooltipRow {
  key: string;
  color: string;
  label: string;
  value: string;
}

/**
 * Shared tooltip shell. Values wear text tokens; the small colour chip beside
 * each row carries series identity, so the numbers stay readable.
 */
export default function ChartTooltip({
  title,
  rows,
  footer,
}: {
  title: string;
  rows: ChartTooltipRow[];
  footer?: ReactNode;
}) {
  if (rows.length === 0) return null;

  return (
    <div className="min-w-48 rounded-2xl border border-gray-200 bg-white/95 px-4 py-3 shadow-[0_16px_30px_rgba(16,24,40,0.12)] backdrop-blur-sm">
      <p className="text-sm font-semibold text-gray-900">{title}</p>

      <ul className="mt-1.5 space-y-1">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <span className="flex items-center gap-1.5 text-gray-600">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: row.color }}
              />
              {row.label}
            </span>
            <span className="font-semibold text-gray-900 tabular-nums">
              {row.value}
            </span>
          </li>
        ))}
      </ul>

      {footer && <div className="mt-1.5 text-sm text-gray-500">{footer}</div>}
    </div>
  );
}
