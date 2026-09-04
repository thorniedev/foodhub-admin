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
 *
 * Sizes are deliberately small — this floats over the chart it describes. It
 * previously rendered its title at `text-xl` and every row at `text-lg`, which
 * made the tooltip larger than the plot area it was annotating.
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
    <div className="min-w-52 rounded-lg border bg-popover/95 p-3 text-popover-foreground shadow-overlay backdrop-blur-sm">
      <p className="text-xs font-semibold">{title}</p>

      <ul className="mt-2 space-y-1">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex items-center justify-between gap-4 text-[0.6875rem]"
          >
            <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: row.color }}
              />
              <span className="truncate">{row.label}</span>
            </span>
            <span className="font-semibold tabular-nums">{row.value}</span>
          </li>
        ))}
      </ul>

      {footer && (
        <div className="mt-2 border-t pt-2 text-[0.6875rem] text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  );
}
