"use client";

import React from "react";
import Skeleton from "@/src/components/ui/skeleton";

export default function UserDetailSkeleton() {
  return (
    <div className="w-full min-w-0 max-w-full space-y-5" aria-busy="true">
      {/* Header Banner Skeleton */}
      <div className="relative overflow-hidden rounded-3xl bg-[#14833E]/90 px-6 py-8 text-white shadow-sm sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 rounded-2xl bg-white/20 animate-pulse" />
            <div className="space-y-2">
              <div className="h-7 w-48 rounded-lg bg-white/30 animate-pulse" />
              <div className="h-5 w-32 rounded-lg bg-white/20 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-11 w-32 rounded-full bg-white/20 animate-pulse" />
            <div className="h-11 w-28 rounded-full bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left Column - Profiles List */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <Skeleton className="h-6 w-36 rounded-lg" />
          <Skeleton className="h-11 w-full rounded-full" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 p-4"
              >
                <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-28 rounded-lg" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Profile Detail Panel */}
        <div className="lg:col-span-2 rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-gray-100 p-4 space-y-2"
              >
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-6 w-36 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
