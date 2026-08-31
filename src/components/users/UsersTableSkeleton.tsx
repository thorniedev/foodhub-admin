"use client";

import React from "react";
import Skeleton from "@/src/components/ui/skeleton";

interface UsersTableSkeletonProps {
  rows?: number;
}

export default function UsersTableSkeleton({ rows = 6 }: UsersTableSkeletonProps) {
  return (
    <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full border-collapse text-left">
        {/* ================= HEAD ================= */}
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-xl font-medium text-primary-900">
            <th className="whitespace-nowrap px-6 py-4 font-medium min-w-[280px]">
              គណនីអ្នកប្រើប្រាស់
            </th>
            <th className="whitespace-nowrap px-6 py-4 font-medium min-w-[240px]">
              អ៊ីមែល
            </th>
            <th className="whitespace-nowrap px-6 py-4 font-medium min-w-[170px]">
              កាលបរិច្ឆេទបង្កើត
            </th>
            <th className="whitespace-nowrap px-6 py-4 font-medium min-w-[140px]">
              ផ្ទៀងផ្ទាត់
            </th>
            <th className="whitespace-nowrap px-6 py-4 font-medium min-w-[140px]">
              ស្ថានភាព
            </th>
            <th className="whitespace-nowrap px-6 py-4 text-end font-medium min-w-[180px] pr-6">
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
              {/* 1. User Column */}
              <td className="px-6 py-3.5">
                <div className="flex items-center gap-3.5">
                  <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
                  <div className="space-y-1.5 min-w-0">
                    <Skeleton className="h-5 w-32 sm:w-40 rounded-lg" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                </div>
              </td>

              {/* 2. Email Column */}
              <td className="px-6 py-3.5">
                <Skeleton className="h-5 w-44 rounded-lg" />
              </td>

              {/* 3. Created Date Column */}
              <td className="px-6 py-3.5">
                <Skeleton className="h-5 w-28 rounded-lg" />
              </td>

              {/* 4. Verification Column */}
              <td className="px-6 py-3.5">
                <Skeleton className="h-7 w-24 rounded-full" />
              </td>

              {/* 5. Status Column */}
              <td className="px-6 py-3.5">
                <Skeleton className="h-7 w-20 rounded-full" />
              </td>

              {/* 6. Actions Column */}
              <td className="px-6 py-3.5">
                <div className="flex items-center justify-end gap-1.5 pr-2">
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
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
