"use client";

import React from "react";
import {
  Sparkles,
  MapPin,
  Store,
  DollarSign,
  Compass,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { AdminRecommendedItem } from "@/src/types/adminRecommendation";

interface RecommendedItemsTabProps {
  items?: AdminRecommendedItem[];
}

const STRATEGY_LABELS: Record<string, { label: string; color: string; barColor: string }> = {
  CONTENT_BASED: {
    label: "Content-Based",
    color: "text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300",
    barColor: "bg-blue-500",
  },
  BEHAVIOR: {
    label: "User Behavior",
    color: "text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300",
    barColor: "bg-purple-500",
  },
  POPULARITY: {
    label: "Popularity",
    color: "text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300",
    barColor: "bg-amber-500",
  },
  TRENDING: {
    label: "Trending Velocity",
    color: "text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300",
    barColor: "bg-rose-500",
  },
  AI_JUDGMENT: {
    label: "AI Neural Judgment",
    color: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300",
    barColor: "bg-emerald-500",
  },
};

export default function RecommendedItemsTab({ items = [] }: RecommendedItemsTabProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
        <Sparkles className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-50" />
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          No Recommended Dishes
        </p>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
          No candidate items satisfied the safety filters and score threshold for this session.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
        <span>
          Showing <strong>{items.length}</strong> ranked dish recommendations
        </span>
        <span className="text-[11px] text-zinc-400">
          Ranked by final composite score
        </span>
      </div>

      {items.map((item) => {
        const matchPercent = Math.min(100, Math.max(0, Math.round((item.finalScore || 0) * 100)));
        const isHighMatch = matchPercent >= 80;
        const isMedMatch = matchPercent >= 50;

        return (
          <div
            key={item.uuid || `${item.menuItemId}-${item.rankPosition}`}
            className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-xs hover:border-amber-300 dark:hover:border-amber-700/60 transition duration-200 space-y-3"
          >
            {/* Header / Main Details */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                {/* Rank Badge */}
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-bold text-xs shadow-xs border border-amber-200 dark:border-amber-800/60">
                  #{item.rankPosition}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {item.menuItemName || `Menu Item #${item.menuItemId}`}
                    </h4>
                    {item.isExploration && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                        <Compass className="w-3 h-3" /> Exploration
                      </span>
                    )}
                    {item.candidateSource && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        {item.candidateSource}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="inline-flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-zinc-400" />
                      {item.storeName || `Store #${item.storeId}`}
                    </span>
                    {item.priceSnapshot !== undefined && item.priceSnapshot !== null && (
                      <span className="inline-flex items-center gap-0.5 font-medium text-zinc-700 dark:text-zinc-300">
                        <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                        {item.currencyCode || "$"}
                        {Number(item.priceSnapshot).toFixed(2)}
                      </span>
                    )}
                    {item.distanceKm !== undefined && item.distanceKm !== null && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        {Number(item.distanceKm).toFixed(1)} km away
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Match Score Badge */}
              <div className="flex flex-col items-end flex-shrink-0">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full shadow-xs ${
                    isHighMatch
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      : isMedMatch
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {matchPercent}% Match
                </span>
                {item.groupScore !== undefined && item.groupScore !== null && (
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium mt-1">
                    Group Consensus: {Math.round(item.groupScore * 100)}%
                  </span>
                )}
              </div>
            </div>

            {/* AI Reasoning Text */}
            {item.reasonText && (
              <div className="text-xs text-amber-900 dark:text-amber-200 bg-amber-50/90 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200/80 dark:border-amber-800/40 flex items-start gap-2">
                <span className="text-sm">💡</span>
                <div className="flex-1">
                  <p className="leading-relaxed font-medium">{item.reasonText}</p>
                  {item.reasonCodes && item.reasonCodes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {item.reasonCodes.map((code) => (
                        <span
                          key={code}
                          className="inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.2 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 rounded"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {code}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Strategy Score Breakdown */}
            {item.scoreBreakdown && Object.keys(item.scoreBreakdown).length > 0 && (
              <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-zinc-500 uppercase tracking-wider">
                    Score Strategy Breakdown
                  </span>
                  <span className="text-zinc-400 font-mono text-[10px]">
                    Raw Score: {(item.finalScore || 0).toFixed(3)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(item.scoreBreakdown).map(([strategy, score]) => {
                    const stratInfo = STRATEGY_LABELS[strategy] || {
                      label: strategy,
                      color: "text-zinc-700 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300",
                      barColor: "bg-zinc-500",
                    };
                    const numScore = score != null ? Math.round(score * 100) : null;

                    return (
                      <div
                        key={strategy}
                        className="bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-medium text-zinc-600 dark:text-zinc-400 truncate pr-1">
                            {stratInfo.label}
                          </span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                            {numScore != null ? `${numScore}%` : "—"}
                          </span>
                        </div>
                        {numScore != null && (
                          <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`${stratInfo.barColor} h-full rounded-full transition-all duration-300`}
                              style={{ width: `${Math.min(100, Math.max(0, numScore))}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
