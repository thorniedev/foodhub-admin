"use client";

import React from "react";
import Skeleton from "@/src/components/ui/skeleton";

interface CatalogTableSkeletonProps {
  rows?: number;
  groupLabel?: string;
  hasValueColumn?: boolean;
  hasDescriptionColumn?: boolean;
}

export default function CatalogTableSkeleton({
  rows = 6,
  groupLabel = "ទិន្នន័យ",
  hasValueColumn = false,
  hasDescriptionColumn = true,
}: CatalogTableSkeletonProps) {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full min-w-[700px] table-auto border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-xl font-medium text-primary-900">
            <th className="whitespace-nowrap px-4 py-4 font-medium min-w-[150px]">
              {groupLabel}
            </th>
            <th className="whitespace-nowrap px-4 py-4 font-medium min-w-[120px]">
              កូដ
            </th>
            {hasValueColumn && (
              <th className="whitespace-nowrap px-4 py-4 font-medium min-w-[120px]">
                តម្លៃ / ឯកតា
              </th>
            )}
            {hasDescriptionColumn && (
              <th className="whitespace-nowrap px-4 py-4 font-medium min-w-[180px]">
                ការពិពណ៌នា
              </th>
            )}
            <th className="whitespace-nowrap px-4 py-4 text-center font-medium min-w-[100px]">
              ស្ថានភាព
            </th>
            <th className="whitespace-nowrap px-4 py-4 text-center font-medium min-w-[120px]">
              សកម្មភាព
            </th>
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr
              key={index}
              className="border-b border-gray-100 bg-white transition-colors last:border-b-0"
            >
              {/* 1. Name */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-5 w-32 rounded-lg" />
                </div>
              </td>

              {/* 2. Code */}
              <td className="px-4 py-3">
                <Skeleton className="h-6 w-20 rounded-md" />
              </td>

              {/* 3. Value/Unit if applicable */}
              {hasValueColumn && (
                <td className="px-4 py-3">
                  <Skeleton className="h-5 w-24 rounded-lg" />
                </td>
              )}

              {/* 4. Description if applicable */}
              {hasDescriptionColumn && (
                <td className="px-4 py-3">
                  <Skeleton className="h-5 w-44 rounded-lg" />
                </td>
              )}

              {/* 5. Status Badge */}
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
