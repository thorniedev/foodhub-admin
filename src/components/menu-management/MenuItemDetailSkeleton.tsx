"use client";

import React from "react";
import Skeleton from "@/src/components/ui/skeleton";

export default function MenuItemDetailSkeleton() {
  return (
    <div className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8" aria-busy="true">
      {/* Top Header Row */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Skeleton className="h-44 w-44 shrink-0 rounded-3xl" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-8 w-60 rounded-xl" />
            <Skeleton className="h-5 w-40 rounded-lg" />
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-4 w-72 rounded-md" />
          </div>
        </div>

        <div className="flex flex-col gap-2.5 sm:items-end">
          <Skeleton className="h-8 w-32 rounded-xl" />
          <Skeleton className="h-5 w-24 rounded-lg" />
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-4 border-t border-gray-100">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-2xl border border-gray-100 p-4 space-y-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-6 w-32 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Tags Section */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <Skeleton className="h-6 w-36 rounded-lg" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
