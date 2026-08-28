import { cn } from "@/src/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-xl bg-gray-200/80", className)}
      {...props}
    />
  );
}

export default Skeleton;
