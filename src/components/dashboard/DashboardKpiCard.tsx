import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn } from "@/src/lib/utils";
import InfoTooltip from "@/src/components/ui/InfoTooltip";
import {
  TONE_STYLES,
  formatChangePercent,
  type Tone,
} from "./dashboard-theme";

export interface DashboardKpiCardProps {
  label: string;
  icon: ReactNode;
  tone: Tone;
  /** Already formatted for display. */
  value: string;
  previousValue: string | null;
  changePercent: number | null;
  /** Drives the direction colour: false means a rise is a regression. */
  higherIsBetter?: boolean;
  hint?: string;
}

export default function DashboardKpiCard({
  label,
  icon,
  tone,
  value,
  previousValue,
  changePercent,
  higherIsBetter = true,
  hint,
}: DashboardKpiCardProps) {
  const styles = TONE_STYLES[tone];
  const change = formatChangePercent(changePercent);

  const flat = changePercent !== null && Math.abs(changePercent) < 0.05;
  const rising = changePercent !== null && changePercent > 0;
  const improving = rising === higherIsBetter;

  const changeClassName = flat
    ? "bg-gray-100 text-gray-600"
    : improving
      ? "bg-primary-50 text-primary-800"
      : "bg-red-50 text-red-700";

  const ChangeIcon = flat ? Minus : rising ? ArrowUpRight : ArrowDownRight;

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm",
        styles.border,
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
            {hint && <InfoTooltip label={hint} />}
          </div>

          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums sm:text-3xl">
            {value}
          </p>
        </div>

        <span
          aria-hidden="true"
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
            styles.surface,
            styles.border,
            styles.icon,
          )}
        >
          {icon}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
        {change ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
              changeClassName,
            )}
          >
            <ChangeIcon size={13} aria-hidden="true" />
            {change}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            គ្មានទិន្នន័យប្រៀបធៀប
          </span>
        )}

        <span className="text-xs text-muted-foreground tabular-nums">
          ដំណាក់កាលមុន: {previousValue ?? "—"}
        </span>
      </div>
    </article>
  );
}
