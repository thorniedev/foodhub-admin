import { Skeleton } from "@/src/components/ui/skeleton";

export function KpiGridSkeleton({ cards = 8 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: cards }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-gray-200 bg-white p-5"
        >
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-4 h-8 w-24" />
          <Skeleton className="mt-3 h-4 w-36" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return <Skeleton className="w-full" style={{ height }} />;
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}

export default function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">កំពុងផ្ទុកទិន្នន័យវិភាគ</span>

      <Skeleton className="h-28 w-full rounded-3xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />

      <KpiGridSkeleton />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 xl:col-span-2">
          <Skeleton className="h-5 w-40" />
          <ChartSkeleton height={300} />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <Skeleton className="h-5 w-32" />
          <ChartSkeleton height={300} />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <TableSkeleton />
      </div>
    </div>
  );
}
