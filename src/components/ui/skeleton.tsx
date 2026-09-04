import { cn } from "@/src/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      // `bg-gray-200` was hardcoded, so every skeleton stayed light grey on a
      // dark background. `bg-muted` follows the theme.
      className={cn("animate-pulse rounded-lg bg-muted", className)}
      {...props}
    />
  );
}

export default Skeleton;
