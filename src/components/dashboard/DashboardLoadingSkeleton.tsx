import { Skeleton } from "@/src/components/ui/skeleton";
import { Card } from "@/src/components/ui/card";

/** Mirrors DashboardKpiGrid's two tiers so nothing jumps when data lands. */
export function KpiGridSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="gap-0 p-5">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-9 rounded-lg" />
            </div>
            <Skeleton className="mt-3 h-8 w-28" />
            <Skeleton className="mt-4 h-3 w-32" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="gap-0 p-3.5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="mt-3 h-6 w-16" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return <Skeleton className="w-full rounded-lg" style={{ height }} />;
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-9 w-full rounded-lg" />
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-11 w-full rounded-lg" />
      ))}
    </div>
  );
}

function SectionCardSkeleton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <div className="flex items-start gap-3 border-b px-5 py-4">
        <Skeleton className="size-8 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>
      <div className="px-5 pt-4 pb-5">{children}</div>
    </Card>
  );
}

export default function DashboardLoadingSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 pb-12"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">កំពុងផ្ទុកទិន្នន័យវិភាគ</span>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-3 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
      </div>

      {/* Filter toolbar */}
      <Skeleton className="h-[9.5rem] w-full rounded-xl" />

      <KpiGridSkeleton />

      <SectionCardSkeleton>
        <ChartSkeleton height={320} />
      </SectionCardSkeleton>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCardSkeleton>
          <ChartSkeleton height={340} />
        </SectionCardSkeleton>
        <SectionCardSkeleton>
          <ChartSkeleton height={340} />
        </SectionCardSkeleton>
      </div>

      <SectionCardSkeleton>
        <TableSkeleton />
      </SectionCardSkeleton>
    </div>
  );
}
