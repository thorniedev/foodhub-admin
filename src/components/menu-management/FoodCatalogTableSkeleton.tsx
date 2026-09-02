"use client";

import React from "react";
import Skeleton from "@/src/components/ui/skeleton";

interface FoodCatalogTableSkeletonProps {
  rows?: number;
  catalogType?: "FOOD" | "DRINK" | "ALL";
}

export default function FoodCatalogTableSkeleton({
  rows = 6,
  catalogType = "ALL",
}: FoodCatalogTableSkeletonProps) {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full table-auto border-collapse text-left">
        {/* ================= HEADER ================= */}
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-xl font-medium text-primary-900">
            <th className="whitespace-nowrap px-4 py-4 font-medium min-w-[150px]">
              {catalogType === "FOOD" ? "មុខម្ហូប" : catalogType === "DRINK" ? "ភេសជ្ជៈ" : "មុខម្ហូប / ភេសជ្ជៈ"}
            </th>
            <th className="whitespace-nowrap px-4 py-4 font-medium min-w-[150px]">
              ឈ្មោះអង់គ្លេស
            </th>
            <th className="whitespace-nowrap px-4 py-4 font-medium min-w-[130px]">
              ប្រភេទ
            </th>
            <th className="whitespace-nowrap px-4 py-4 font-medium min-w-[120px]">
              សញ្ជាតិ
            </th>
            <th className="whitespace-nowrap px-4 py-4 text-center font-medium min-w-[100px]">
              ស្ថានភាព
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
              {/* 1. Food Avatar + Name */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 shrink-0 rounded-2xl" />
                  <Skeleton className="h-5 w-32 rounded-lg" />
                </div>
              </td>

              {/* 2. English Name */}
              <td className="px-4 py-3">
                <Skeleton className="h-5 w-28 rounded-lg" />
              </td>

              {/* 3. Category */}
              <td className="whitespace-nowrap px-4 py-3">
                <Skeleton className="h-7 w-24 rounded-full" />
              </td>

              {/* 4. Cuisine */}
              <td className="whitespace-nowrap px-4 py-3">
                <Skeleton className="h-7 w-20 rounded-full" />
              </td>

              {/* 5. Status */}
              <td className="whitespace-nowrap px-4 py-3 text-center">
                <Skeleton className="mx-auto h-7 w-16 rounded-full" />
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
