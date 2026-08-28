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
      <span className="font-semibold text-gray-900 tabular-nums">
        {formatDecimal(safe)}
      </span>

      <span
        role="meter"
        aria-valuenow={Math.round(safe)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="ពិន្ទុ"
        className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 md:block"
      >
        <span
          className={`block h-full rounded-full ${barColor}`}
          style={{ width: `${safe}%` }}
        />
      </span>
    </span>
  );
}
