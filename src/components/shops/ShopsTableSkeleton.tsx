"use client";

import React from "react";
import Skeleton from "@/src/components/ui/skeleton";

interface ShopsTableSkeletonProps {
  rows?: number;
}

export default function ShopsTableSkeleton({ rows = 6 }: ShopsTableSkeletonProps) {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full table-auto border-collapse text-left">
        {/* ================= HEAD ================= */}
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-xl font-medium text-primary-900">
            <th className="whitespace-nowrap px-4 py-4 font-medium min-w-[140px]">
              ហាង
            </th>
            <th className="whitespace-nowrap px-4 py-4 font-medium min-w-[130px]">
              ទីតាំង
            </th>
            <th className="whitespace-nowrap px-2 py-4 text-center font-medium min-w-[95px]">
              ការពិនិត្យ
            </th>
            <th className="whitespace-nowrap px-2 py-4 text-center font-medium min-w-[85px]">
              គណនី
            </th>
            <th className="whitespace-nowrap px-2 py-4 text-center font-medium min-w-[80px]">
              បើកឥឡូវ
            </th>
            <th className="whitespace-nowrap px-3 py-4 text-center font-medium min-w-[110px]">
              សកម្មភាព
            </th>
          </tr>
        </thead>

        {/* ================= SKELETON ROWS ================= */}
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr
              key={index}
              className="border-b border-gray-100 bg-white transition-colors last:border-b-0"
            >
              {/* 1. Store */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 shrink-0 rounded-2xl" />
                  <Skeleton className="h-5 w-32 rounded-lg" />
                </div>
              </td>

              {/* 2. Location */}
              <td className="px-4 py-3">
                <Skeleton className="h-5 w-28 rounded-lg" />
              </td>

              {/* 3. Review status */}
              <td className="whitespace-nowrap px-2 py-3 text-center">
                <Skeleton className="mx-auto h-7 w-20 rounded-full" />
              </td>

              {/* 4. Account status */}
              <td className="whitespace-nowrap px-2 py-3 text-center">
                <Skeleton className="mx-auto h-7 w-16 rounded-full" />
              </td>

              {/* 5. Open Now */}
              <td className="whitespace-nowrap px-2 py-3 text-center">
                <Skeleton className="mx-auto h-7 w-16 rounded-full" />
              </td>

              {/* 6. Actions */}
              <td className="whitespace-nowrap px-3 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <Skeleton className="h-9 w-9 rounded-xl" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Skeleton */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row">
        <Skeleton className="h-5 w-32 rounded-lg" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
