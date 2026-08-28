"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Search,
  Clock,
  User,
  Utensils,
  FileCheck,
} from "lucide-react";
import { AdminSafetyCheckItem, SafetyCheckResult } from "@/src/types/adminRecommendation";

interface SafetyAuditLogTabProps {
  safetyChecks?: AdminSafetyCheckItem[];
}

export default function SafetyAuditLogTab({ safetyChecks = [] }: SafetyAuditLogTabProps) {
  const [filter, setFilter] = useState<"ALL" | SafetyCheckResult>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const counts = {
    ALL: safetyChecks.length,
    BLOCKED: safetyChecks.filter((c) => c.result === "BLOCKED").length,
    WARNING: safetyChecks.filter((c) => c.result === "WARNING").length,
    SAFE: safetyChecks.filter((c) => c.result === "SAFE").length,
  };

  const filteredChecks = safetyChecks.filter((check) => {
    if (filter !== "ALL" && check.result !== filter) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const dishMatch = (check.menuItemName || "").toLowerCase().includes(q);
    const profileMatch = String(check.profileId).includes(q) || (check.profileName || "").toLowerCase().includes(q);
    const reasonMatch = typeof check.reasons === "string"
      ? check.reasons.toLowerCase().includes(q)
      : JSON.stringify(check.reasons).toLowerCase().includes(q);

    return dishMatch || profileMatch || reasonMatch;
  });

  return (
    <div className="space-y-5">
      {/* Filters & Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-full">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-full text-lg font-normal transition cursor-pointer ${
              filter === "ALL"
                ? "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100"
            }`}
          >
            All ({counts.ALL})
          </button>
          <button
            type="button"
            onClick={() => setFilter("BLOCKED")}
            className={`px-4 py-2 rounded-full text-lg font-normal flex items-center gap-2 transition cursor-pointer ${
              filter === "BLOCKED"
                ? "bg-rose-500 text-white shadow-sm"
                : "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            }`}
          >
            <ShieldX className="w-5 h-5" />
            <span>Blocked ({counts.BLOCKED})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter("WARNING")}
            className={`px-4 py-2 rounded-full text-lg font-normal flex items-center gap-2 transition cursor-pointer ${
              filter === "WARNING"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span>Warning ({counts.WARNING})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter("SAFE")}
            className={`px-4 py-2 rounded-full text-lg font-normal flex items-center gap-2 transition cursor-pointer ${
              filter === "SAFE"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Safe ({counts.SAFE})</span>
          </button>
        </div>

        {/* Local Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search dish or allergen reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-5 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-full text-lg font-normal focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Safety Audit Log Items */}
      {filteredChecks.length > 0 ? (
        <div className="space-y-4">
          {filteredChecks.map((check) => {
            const isBlocked = check.result === "BLOCKED";
            const isWarning = check.result === "WARNING";
            const isSafe = check.result === "SAFE";

            let reasonFormatted = "";
            const rawReasons = check.reasons as any;
            if (typeof rawReasons === "string") {
              reasonFormatted = rawReasons;
            } else if (Array.isArray(rawReasons)) {
              reasonFormatted = rawReasons.join(", ");
            } else if (rawReasons && typeof rawReasons === "object") {
              reasonFormatted = JSON.stringify(rawReasons);
            } else {
              reasonFormatted = isSafe
                ? "Compliant with all allergen, dietary, and medical safety rules."
                : "Safety constraint violated.";
            }

            return (
              <div
                key={check.uuid || `${check.menuItemId}-${check.profileId}-${check.checkedAt}`}
                className={`p-6 rounded-3xl border transition duration-200 ${
                  isBlocked
                    ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/90 dark:border-rose-900/60 hover:border-rose-300"
                    : isWarning
                    ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/90 dark:border-amber-900/60 hover:border-amber-300"
                    : "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/90 dark:border-emerald-900/60 hover:border-emerald-300"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-medium text-2xl text-zinc-800 dark:text-zinc-100 flex items-center gap-2 truncate">
                        <Utensils className="w-5 h-5 text-zinc-400" />
                        {check.menuItemName || `Dish #${check.menuItemId}`}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-lg font-normal text-zinc-500 dark:text-zinc-400 bg-white/80 dark:bg-zinc-800/80 px-3 py-0.5 rounded-full border border-zinc-200/60 dark:border-zinc-700/60">
                        <User className="w-4 h-4" />
                        {check.profileName ? check.profileName : `Profile #${check.profileId}`}
                      </span>
                    </div>

                    {/* Reason Text */}
                    <p className={`text-lg font-normal leading-relaxed ${
                      isBlocked
                        ? "text-rose-900 dark:text-rose-200"
                        : isWarning
                        ? "text-amber-900 dark:text-amber-200"
                        : "text-emerald-900 dark:text-emerald-200"
                    }`}>
                      {isBlocked && "🚫 "}
                      {isWarning && "⚠️ "}
                      {isSafe && "✅ "}
                      {reasonFormatted}
                    </p>

                    {/* Rule version & metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-lg font-normal text-zinc-500 dark:text-zinc-400 pt-1">
                      {check.ruleVersion && (
                        <span className="inline-flex items-center gap-1.5 font-mono bg-white/70 dark:bg-zinc-800/60 px-2.5 py-0.5 rounded-full border border-zinc-200/50 dark:border-zinc-700/50">
                          <FileCheck className="w-4 h-4 text-zinc-400" />
                          <span>Rule: {check.ruleVersion}</span>
                        </span>
                      )}
                      {check.checkDurationMs !== undefined && check.checkDurationMs !== null && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-zinc-400" />
                          <span>{Number(check.checkDurationMs).toFixed(1)} ms</span>
                        </span>
                      )}
                      {check.checkedAt && (
                        <span>
                          {new Date(check.checkedAt).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-2 font-normal text-lg px-4 py-1.5 rounded-full uppercase tracking-wider shadow-xs flex-shrink-0 ${
                      isBlocked
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                        : isWarning
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                    }`}
                  >
                    {isBlocked ? <ShieldX className="w-4 h-4" /> : isWarning ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>{check.result}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <ShieldCheck className="w-10 h-10 text-zinc-400 mx-auto mb-3 opacity-50" />
          <p className="text-2xl font-medium text-zinc-700 dark:text-zinc-300">
            No Safety Check Records
          </p>
          <p className="text-lg font-normal text-zinc-500 mt-1.5 max-w-md mx-auto">
            {searchQuery
              ? `No records matching "${searchQuery}" in ${filter.toLowerCase()} checks.`
              : `No ${filter !== "ALL" ? filter.toLowerCase() : ""} safety checks logged for this session.`}
          </p>
        </div>
      )}
    </div>
  );
}
