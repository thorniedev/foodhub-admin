"use client";

import React from "react";
import Skeleton from "@/src/components/ui/skeleton";

interface MenuItemsTableSkeletonProps {
  rows?: number;
}

export default function MenuItemsTableSkeleton({ rows = 6 }: MenuItemsTableSkeletonProps) {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <table className="min-w-[1150px] w-full text-left">
        {/* ================= HEAD ================= */}
        <thead className="bg-gray-50/70 text-left text-lg font-normal text-primary-800">
          <tr className="border-b border-gray-100">
            <th className="px-5 py-4 font-normal">Menu Item</th>
            <th className="px-5 py-4 font-normal">Store</th>
            <th className="px-5 py-4 font-normal">Food master</th>
            <th className="px-5 py-4 font-normal">Price</th>
            <th className="px-5 py-4 font-normal">Availability</th>
            <th className="px-5 py-4 font-normal">Prep time</th>
            <th className="px-5 py-4 font-normal">Source</th>
            <th className="px-5 py-4 font-normal">Published</th>
          </tr>
        </thead>

        {/* ================= SKELETON ROWS ================= */}
        <tbody className="divide-y divide-gray-100 bg-white">
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index} className="transition">
              {/* 1. Item Image + Name */}
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
                  <div className="space-y-1.5 min-w-0">
                    <Skeleton className="h-5 w-36 rounded-lg" />
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </div>
                </div>
              </td>

              {/* 2. Store */}
              <td className="px-5 py-4">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-28 rounded-lg" />
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
              </td>

              {/* 3. Food Master */}
              <td className="px-5 py-4">
                <Skeleton className="h-5 w-28 rounded-lg" />
              </td>

              {/* 4. Price */}
              <td className="px-5 py-4">
                <Skeleton className="h-5 w-20 rounded-lg" />
              </td>

              {/* 5. Availability */}
              <td className="px-5 py-4">
                <Skeleton className="h-7 w-20 rounded-full" />
              </td>

              {/* 6. Prep time */}
              <td className="px-5 py-4">
                <Skeleton className="h-5 w-16 rounded-lg" />
              </td>

              {/* 7. Source */}
              <td className="px-5 py-4">
                <Skeleton className="h-7 w-16 rounded-full" />
              </td>

              {/* 8. Published */}
              <td className="px-5 py-4">
                <Skeleton className="h-5 w-24 rounded-lg" />
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
