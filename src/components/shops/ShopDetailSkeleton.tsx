"use client";

import React from "react";
import Skeleton from "@/src/components/ui/skeleton";

export default function ShopDetailSkeleton() {
  return (
    <div className="w-full min-w-0 max-w-full space-y-6" aria-busy="true">
      {/* Top Banner Skeleton */}
      <div className="relative overflow-hidden rounded-3xl bg-[#14833E]/90 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 rounded-2xl bg-white/20 animate-pulse" />
            <div className="space-y-2">
              <div className="h-7 w-52 rounded-lg bg-white/30 animate-pulse" />
              <div className="h-5 w-36 rounded-lg bg-white/20 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-11 w-28 rounded-full bg-white/20 animate-pulse" />
            <div className="h-11 w-28 rounded-full bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Info Cards Grid Skeleton */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-3">
            <Skeleton className="h-5 w-28 rounded-md" />
            <Skeleton className="h-7 w-40 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-md" />
          </div>
        ))}
      </div>

      {/* Store Menu Items Section Skeleton */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-40 rounded-lg" />
          <Skeleton className="h-11 w-32 rounded-full" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="flex gap-3.5 rounded-2xl border border-gray-100 p-4">
              <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-28 rounded-lg" />
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
