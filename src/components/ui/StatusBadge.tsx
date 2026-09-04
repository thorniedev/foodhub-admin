import { cn } from "@/src/lib/utils";
import { Badge, type BadgeProps } from "@/src/components/ui/badge";
import type { Tone } from "@/src/components/dashboard/dashboard-theme";

/** `Tone` is the dashboard's vocabulary; `Badge` speaks its own. */
const TONE_TO_BADGE: Record<Tone, NonNullable<BadgeProps["tone"]>> = {
  green: "green",
  blue: "blue",
  amber: "amber",
  red: "red",
  orange: "orange",
  gray: "neutral",
};

interface StatusBadgeProps {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  /** Rendered before the label so state is never carried by colour alone. */
  icon?: React.ReactNode;
  size?: BadgeProps["size"];
}

/**
 * Status pill used across tables and detail headers.
 *
 * This used to render at `text-lg`, which made a status chip taller than the
 * row it labelled; it now sits on the shared `Badge` scale.
 */
export default function StatusBadge({
  tone = "gray",
  children,
  className,
  icon,
  size,
}: StatusBadgeProps) {
  return (
    <Badge tone={TONE_TO_BADGE[tone]} size={size} className={cn(className)}>
      {icon}
      {children}
    </Badge>
  );
}
