"use client";

import React from "react";
import Skeleton from "@/src/components/ui/skeleton";

interface BannersTableSkeletonProps {
  rows?: number;
}

export default function BannersTableSkeleton({ rows = 5 }: BannersTableSkeletonProps) {
  return (
    <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full table-auto border-collapse text-left">
        {/* ================= HEAD ================= */}
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-xl font-medium text-primary-900">
            <th className="whitespace-nowrap px-4 py-4 font-medium min-w-[240px]">
              ផ្ទាំងរូបភាព & ចំណងជើង
            </th>
            <th className="whitespace-nowrap px-4 py-4 font-medium min-w-[200px]">
              ការពិពណ៌នា
            </th>
            <th className="whitespace-nowrap px-4 py-4 font-medium min-w-[140px]">
              ប្រភេទ
            </th>
            <th className="whitespace-nowrap px-4 py-4 font-medium min-w-[130px]">
              ទីតាំង
            </th>
            <th className="whitespace-nowrap px-4 py-4 text-center font-medium min-w-[130px]">
              ស្ថានភាពផ្សាយ
            </th>
            <th className="whitespace-nowrap px-4 py-4 text-center font-medium min-w-[120px]">
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
              {/* 1. Thumbnail + Title */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-20 shrink-0 rounded-2xl" />
                  <Skeleton className="h-5 w-36 rounded-lg" />
                </div>
              </td>

              {/* 2. Description */}
              <td className="px-4 py-3">
                <Skeleton className="h-5 w-48 rounded-lg" />
              </td>

              {/* 3. Category */}
              <td className="whitespace-nowrap px-4 py-3">
                <Skeleton className="h-7 w-28 rounded-full" />
              </td>

              {/* 4. Location */}
              <td className="whitespace-nowrap px-4 py-3">
                <Skeleton className="h-5 w-20 rounded-lg" />
              </td>

              {/* 5. Status Toggle */}
              <td className="whitespace-nowrap px-4 py-3 text-center">
                <div className="inline-flex items-center justify-center gap-2">
                  <Skeleton className="h-6 w-11 rounded-full" />
                  <Skeleton className="h-7 w-20 rounded-full" />
                </div>
              </td>

              {/* 6. Actions */}
              <td className="whitespace-nowrap px-4 py-3 text-center">
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
