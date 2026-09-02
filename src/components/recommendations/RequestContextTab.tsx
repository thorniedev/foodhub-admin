"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  MapPin,
  DollarSign,
  Compass,
  User,
  Clock,
  ShieldCheck,
  Code2,
} from "lucide-react";
import { AdminSessionDetail } from "@/src/types/adminRecommendation";

interface RequestContextTabProps {
  sessionDetail: AdminSessionDetail;
}

export default function RequestContextTab({ sessionDetail }: RequestContextTabProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(sessionDetail, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const contextData = (sessionDetail.contextData || {}) as any;
  const lat = contextData.latitude ?? contextData.lat ?? contextData.userLat;
  const lng = contextData.longitude ?? contextData.lng ?? contextData.userLng;

  return (
    <div className="space-y-6">
      {/* Parameter Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search Radius */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
          <div className="flex items-center gap-2 text-zinc-500">
            <Compass className="w-5 h-5 text-blue-500" />
            <span className="font-normal uppercase tracking-wider text-lg">Search Radius</span>
          </div>
          <p className="text-2xl font-medium text-zinc-800 dark:text-zinc-200">
            {sessionDetail.searchRadiusKm != null ? `${sessionDetail.searchRadiusKm} km` : "Standard (5 km)"}
          </p>
        </div>

        {/* Max Price Cap */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
          <div className="flex items-center gap-2 text-zinc-500">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <span className="font-normal uppercase tracking-wider text-lg">Max Price Cap</span>
          </div>
          <p className="text-2xl font-medium text-zinc-800 dark:text-zinc-200">
            {sessionDetail.maximumPrice != null
              ? `${sessionDetail.currencyCode || "$"}${sessionDetail.maximumPrice}`
              : "No Limit"}
          </p>
        </div>

        {/* Coordinates */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
          <div className="flex items-center gap-2 text-zinc-500">
            <MapPin className="w-5 h-5 text-rose-500" />
            <span className="font-normal uppercase tracking-wider text-lg">Coordinates</span>
          </div>
          <p className="text-xl font-mono font-medium text-zinc-800 dark:text-zinc-200 truncate">
            {lat != null && lng != null ? `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}` : "11.5564, 104.9282"}
          </p>
        </div>

        {/* Request Source */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
          <div className="flex items-center gap-2 text-zinc-500">
            <User className="w-5 h-5 text-purple-500" />
            <span className="font-normal uppercase tracking-wider text-lg">Request Source</span>
          </div>
          <p className="text-xl font-mono font-medium text-zinc-800 dark:text-zinc-200 truncate">
            {sessionDetail.requestSource || "MOBILE_APP"}
          </p>
        </div>

        {/* Engine Latency */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
          <div className="flex items-center gap-2 text-zinc-500">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="font-normal uppercase tracking-wider text-lg">Engine Latency</span>
          </div>
          <p className="text-2xl font-medium text-zinc-800 dark:text-zinc-200">
            {sessionDetail.responseTimeMs != null ? `${sessionDetail.responseTimeMs} ms` : "-- ms"}
          </p>
        </div>

        {/* Safety Evaluation */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
          <div className="flex items-center gap-2 text-zinc-500">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="font-normal uppercase tracking-wider text-lg">Eligible Candidates</span>
          </div>
          <p className="text-2xl font-medium text-emerald-700 dark:text-emerald-400">
            {sessionDetail.eligibleCount ?? 0} / {sessionDetail.candidateCount ?? 0} safe
          </p>
        </div>
      </div>

      {/* Raw JSON Snapshot View */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="bg-zinc-100 dark:bg-zinc-800/80 px-6 py-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 text-lg font-medium text-zinc-700 dark:text-zinc-300">
            <Code2 className="w-5 h-5 text-amber-500" />
            <span>Raw Session & Profile Snapshot JSON</span>
          </div>
          <button
            type="button"
            onClick={handleCopyJson}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 text-lg font-normal text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-zinc-950 p-6 max-h-96 overflow-y-auto font-mono text-lg text-emerald-400 leading-relaxed no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <pre>{JSON.stringify(sessionDetail, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
