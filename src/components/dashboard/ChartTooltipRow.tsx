"use client";

import type { ReactNode } from "react";

/**
 * Shell + row for the two "top N" bar charts (location, category), whose
 * tooltips deliberately show more metrics than the single series actually
 * plotted. `ChartTooltipContent` in `ui/chart.tsx` only ever renders what's
 * in the hovered point's payload, so a richer tooltip needs a custom
 * `content` renderer — this keeps that renderer visually identical to the
 * standard one (same border/shadow/type scale) instead of inventing another
 * look.
 */
export function ChartTooltipPanel({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-w-48 rounded-lg border bg-popover p-3 text-xs text-popover-foreground shadow-overlay">
      <p className="truncate font-medium" title={title}>
        {title}
      </p>
      <div className="mt-2 grid gap-1.5">{children}</div>
      {footer && (
        <p className="mt-2 border-t pt-2 text-muted-foreground">{footer}</p>
      )}
    </div>
  );
}

export function ChartTooltipRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span
          aria-hidden="true"
          className="size-2 shrink-0 rounded-[2px]"
          style={{ backgroundColor: color }}
        />
        {label}
      </span>
      <span className="font-mono font-medium tabular-nums text-foreground">{value}</span>
    </div>
  );
}
