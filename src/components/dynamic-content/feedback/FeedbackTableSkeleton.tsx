"use client";

import React from "react";
import Skeleton from "@/src/components/ui/skeleton";

interface FeedbackTableSkeletonProps {
  rows?: number;
}

export default function FeedbackTableSkeleton({ rows = 5 }: FeedbackTableSkeletonProps) {
  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-lg font-normal min-w-[800px] text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-xl font-medium text-primary-900">
            <th className="px-5 py-4 font-medium min-w-[200px]">អ្នកផ្ដល់មតិ</th>
            <th className="px-5 py-4 font-medium min-w-[130px]">ប្រភេទ</th>
            <th className="px-5 py-4 font-medium min-w-[130px]">ការវាយតម្លៃ</th>
            <th className="px-5 py-4 font-medium min-w-[200px]">មតិកែលម្អ</th>
            <th className="px-5 py-4 font-medium min-w-[130px]">កាលបរិច្ឆេទ</th>
            <th className="px-5 py-4 text-center font-medium min-w-[110px]">ស្ថានភាព</th>
            <th className="px-5 py-4 text-center font-medium min-w-[110px]">សកម្មភាព</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: rows }).map((_, idx) => (
            <tr key={idx} className="transition">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-28 rounded-lg" />
                    <Skeleton className="h-4 w-20 rounded-md" />
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                <Skeleton className="h-7 w-20 rounded-full" />
              </td>
              <td className="px-5 py-4">
                <Skeleton className="h-5 w-24 rounded-lg" />
              </td>
              <td className="px-5 py-4">
                <Skeleton className="h-5 w-44 rounded-lg" />
              </td>
              <td className="px-5 py-4">
                <Skeleton className="h-5 w-28 rounded-lg" />
              </td>
              <td className="px-5 py-4 text-center">
                <Skeleton className="mx-auto h-7 w-18 rounded-full" />
              </td>
              <td className="px-5 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-xl" />
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
