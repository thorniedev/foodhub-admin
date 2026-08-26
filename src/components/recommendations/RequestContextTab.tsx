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
    <div className="space-y-5">
      {/* Parameter Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Search Radius */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/70 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
            <Compass className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Search Radius</span>
          </div>
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            {sessionDetail.searchRadiusKm != null ? `${sessionDetail.searchRadiusKm} km` : "Standard (5 km)"}
          </p>
        </div>

        {/* Max Price Cap */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/70 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Max Price Cap</span>
          </div>
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            {sessionDetail.maximumPrice != null
              ? `${sessionDetail.currencyCode || "$"}${sessionDetail.maximumPrice}`
              : "No Limit"}
          </p>
        </div>

        {/* Coordinates */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/70 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Coordinates</span>
          </div>
          <p className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 truncate">
            {lat != null && lng != null ? `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}` : "11.5564, 104.9282"}
          </p>
        </div>

        {/* Request Source */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/70 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
            <User className="w-3.5 h-3.5 text-purple-500" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Request Source</span>
          </div>
          <p className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 truncate">
            {sessionDetail.requestSource || "MOBILE_APP"}
          </p>
        </div>

        {/* Engine Latency */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/70 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Engine Latency</span>
          </div>
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            {sessionDetail.responseTimeMs != null ? `${sessionDetail.responseTimeMs} ms` : "-- ms"}
          </p>
        </div>

        {/* Safety Evaluation */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/70 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Eligible Candidates</span>
          </div>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {sessionDetail.eligibleCount ?? 0} / {sessionDetail.candidateCount ?? 0} safe
          </p>
        </div>
      </div>

      {/* Raw JSON Snapshot View */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="bg-zinc-100 dark:bg-zinc-800/80 px-4 py-2.5 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            <Code2 className="w-4 h-4 text-amber-500" />
            <span>Raw Session & Profile Snapshot JSON</span>
          </div>
          <button
            type="button"
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-600 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-zinc-950 p-4 max-h-96 overflow-y-auto font-mono text-xs text-emerald-400 leading-relaxed [scrollbar-width:thin]">
          <pre>{JSON.stringify(sessionDetail, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
