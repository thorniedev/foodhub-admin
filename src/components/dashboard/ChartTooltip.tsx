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
    <div className="min-w-56 rounded-xl border border-border/70 bg-card/95 p-3 shadow-lg backdrop-blur-sm">
      <p className="text-xs font-semibold text-foreground">{title}</p>

      <ul className="mt-2 space-y-1.5">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: row.color }}
              />
              {row.label}
            </span>
            <span className="font-medium text-foreground tabular-nums">
              {row.value}
            </span>
          </li>
        ))}
      </ul>

      {footer && <div className="mt-2 text-xs text-muted-foreground">{footer}</div>}
    </div>
  );
}
