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
    <div className="min-w-64 rounded-3xl border border-gray-100 bg-white/95 p-4 shadow-xl backdrop-blur-sm">
      <p className="text-xl font-medium text-gray-800">{title}</p>

      <ul className="mt-2 space-y-1.5">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex items-center justify-between gap-4 text-lg font-normal"
          >
            <span className="flex items-center gap-2 text-gray-600">
              <span
                aria-hidden="true"
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: row.color }}
              />
              {row.label}
            </span>
            <span className="font-medium text-gray-800 tabular-nums">
              {row.value}
            </span>
          </li>
        ))}
      </ul>

      {footer && <div className="mt-2 text-lg font-normal text-gray-500">{footer}</div>}
    </div>
  );
}
