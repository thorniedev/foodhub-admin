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
    <article className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-gray-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-base font-medium text-gray-600">{label}</p>
          {hint && <InfoTooltip label={hint} />}
        </div>

        <span
          aria-hidden="true"
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            styles.surface,
            styles.icon,
          )}
        >
          {icon}
        </span>
      </div>

      <p className="mt-3 text-3xl font-bold text-gray-900 tabular-nums">
        {value}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {change ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-semibold tabular-nums",
              changeClassName,
            )}
          >
            <ChangeIcon size={14} aria-hidden="true" />
            {change}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-sm font-medium text-gray-500">
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
