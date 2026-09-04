import { formatDecimal } from "./dashboard-theme";

/**
 * A 0..100 score shown as a number plus a short bar. The number is the
 * accessible value; the bar is a secondary cue, never the only one.
 */
export default function ScoreMeter({ value }: { value: number }) {
  const safe = Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0;

  const barColor =
    safe >= 70 ? "bg-primary-600" : safe >= 40 ? "bg-amber-500" : "bg-red-500";

  return (
    <span className="flex items-center justify-end gap-2">
      <span className="text-[0.8125rem] font-semibold text-foreground tabular-nums">
        {formatDecimal(safe)}
      </span>

      <span
        role="meter"
        aria-valuenow={Math.round(safe)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="ពិន្ទុ"
        className="hidden h-1.5 w-14 overflow-hidden rounded-full bg-muted md:block"
      >
        <span
          className={`block h-full rounded-full ${barColor}`}
          style={{ width: `${safe}%` }}
        />
      </span>
    </span>
  );
}
