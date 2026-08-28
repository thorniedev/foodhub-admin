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
    <article className={cn(
      "group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-gray-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-[0_8px_24px_rgba(16,24,40,0.06)]",
      styles.border,
    )}>
      <div className={cn("absolute inset-x-0 top-0 h-1.5", styles.surface)} />

      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
            styles.surface,
            styles.border,
            styles.icon,
          )}
        >
          {icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-gray-600">{label}</p>
            {hint && <InfoTooltip label={hint} />}
          </div>

          <p className={cn("mt-2 text-3xl font-bold tabular-nums", styles.text)}>
            {value}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {change ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold tabular-nums",
              changeClassName,
            )}
          >
            <ChangeIcon size={14} aria-hidden="true" />
            {change}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-500">
            គ្មានទិន្នន័យប្រៀបធៀប
          </span>
        )}

        <span className="text-sm text-gray-500 tabular-nums">
          ដំណាក់កាលមុន: {previousValue ?? "—"}
        </span>
      </div>
    </article>
  );
}
