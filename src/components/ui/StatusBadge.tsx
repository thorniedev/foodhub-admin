import { cn } from "@/src/lib/utils";
import { TONE_STYLES, type Tone } from "@/src/components/dashboard/dashboard-theme";

interface StatusBadgeProps {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  /** Rendered before the label so state is never carried by colour alone. */
  icon?: React.ReactNode;
}

export default function StatusBadge({
  tone = "gray",
  children,
  className,
  icon,
}: StatusBadgeProps) {
  const styles = TONE_STYLES[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-semibold whitespace-nowrap",
        styles.surface,
        styles.text,
        styles.border,
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
