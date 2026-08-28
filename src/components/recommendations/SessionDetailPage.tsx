"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Layers,
  RefreshCw,
  Copy,
  Check,
  User,
  Users,
  AlertCircle,
  Clock,
  Zap,
} from "lucide-react";
import { AdminSessionDetail, AdminSessionSummary } from "@/src/types/adminRecommendation";
import { fetchAdminSessionDetail } from "@/src/services/adminRecommendationService";
import RecommendedItemsTab from "./RecommendedItemsTab";
import SafetyAuditLogTab from "./SafetyAuditLogTab";
import RequestContextTab from "./RequestContextTab";

interface SessionDetailPageProps {
  uuid: string;
}

export default function SessionDetailPage({ uuid }: SessionDetailPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ITEMS" | "SAFETY" | "CONTEXT">("ITEMS");
  const [sessionDetail, setSessionDetail] = useState<AdminSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!uuid) return;
    setLoading(true);
    setError(null);
    try {
      const detail = await fetchAdminSessionDetail(uuid);
      setSessionDetail(detail);
    } catch (err: any) {
      console.warn("Backend detail fetch failed:", err?.message);
      setError(err?.message || "Could not load live session audit details.");
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleCopyUuid = () => {
    navigator.clipboard.writeText(uuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isGroup = sessionDetail?.mode === "GROUP";
  const itemsCount = sessionDetail?.items?.length || 0;
  const safetyCount = sessionDetail?.safetyChecks?.length || 0;

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* Top Navigation Bar with Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/recommendations"
            className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-5 text-lg font-normal text-gray-700 shadow-sm transition hover:border-primary-300 hover:bg-primary-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-zinc-300" />
            <span>ត្រឡប់ក្រោយ</span>
          </Link>

          <div>
            <h1 className="text-3xl font-medium flex items-center gap-3 text-zinc-800 dark:text-zinc-100">
              <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shadow-sm flex items-center justify-center">
                <Image
                  src="/Image/ai-recommendation.png"
                  alt="AI Recommendation"
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain dark:invert"
                  priority
                />
              </div>
              Session Audit Inspector
            </h1>
            <p className="text-lg font-normal text-zinc-500 dark:text-zinc-400 mt-1">
              Full algorithmic trace, multi-strategy scoring breakdown, and zero-tolerance allergen safety audit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadDetail}
            disabled={loading}
            className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-6 text-lg font-normal transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Audit</span>
          </button>
        </div>
      </div>

      {/* Session Metadata Banner Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 text-lg font-normal px-4 py-1 rounded-full border shadow-xs ${
                  isGroup
                    ? "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                    : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                }`}
              >
                {isGroup ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
                <span>{isGroup ? "Group Dining" : "Solo Recommendation"}</span>
              </span>

              {sessionDetail?.status && (
                <span
                  className={`inline-flex items-center gap-2 text-lg font-normal px-4 py-1 rounded-full border shadow-xs ${
                    sessionDetail.status === "READY" || sessionDetail.status === "COMPLETED"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      : sessionDetail.status === "FAILED"
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      sessionDetail.status === "READY" || sessionDetail.status === "COMPLETED"
                        ? "bg-emerald-500 animate-pulse"
                        : sessionDetail.status === "FAILED"
                        ? "bg-rose-500"
                        : "bg-amber-500 animate-pulse"
                    }`}
                  />
                  <span>{sessionDetail.status}</span>
                </span>
              )}

              {sessionDetail?.responseTimeMs != null && (
                <span className="inline-flex items-center gap-1.5 font-normal text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 px-4 py-1 rounded-full text-lg font-mono">
                  <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                  <span>{sessionDetail.responseTimeMs} ms</span>
                </span>
              )}
            </div>


            
          </div>
        </div>
      </div>

      {/* Main Full-Page Content Card with Tabs */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 px-6 gap-8 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("ITEMS")}
            className={`py-4 text-lg font-normal border-b-2 flex items-center gap-2.5 transition cursor-pointer shrink-0 ${
              activeTab === "ITEMS"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>Recommended Dishes</span>
            <span className="ml-1 px-3 py-0.5 rounded-full text-lg font-normal bg-zinc-200/70 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
              {itemsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("SAFETY")}
            className={`py-4 text-lg font-normal border-b-2 flex items-center gap-2.5 transition cursor-pointer shrink-0 ${
              activeTab === "SAFETY"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Safety Audit Log</span>
            <span className="ml-1 px-3 py-0.5 rounded-full text-lg font-normal bg-zinc-200/70 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
              {safetyCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("CONTEXT")}
            className={`py-4 text-lg font-normal border-b-2 flex items-center gap-2.5 transition cursor-pointer shrink-0 ${
              activeTab === "CONTEXT"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <Layers className="w-5 h-5" />
            <span>Request Context</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-xl font-medium text-zinc-600 dark:text-zinc-300">Loading session audit details & safety checks...</p>
            </div>
          ) : error ? (
            <div className="p-8 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-3xl text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <p className="text-2xl font-medium text-rose-900 dark:text-rose-200">
                Failed to Load Session Audit
              </p>
              <p className="text-lg font-normal text-rose-700 dark:text-rose-300 max-w-md mx-auto">
                {error}
              </p>
              <button
                type="button"
                onClick={loadDetail}
                className="mt-3 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-rose-600 px-6 text-lg font-normal text-white shadow-sm transition hover:bg-rose-700"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Retry</span>
              </button>
            </div>
          ) : (
            <div>
              {activeTab === "ITEMS" && (
                <RecommendedItemsTab items={sessionDetail?.items || []} />
              )}
              {activeTab === "SAFETY" && (
                <SafetyAuditLogTab safetyChecks={sessionDetail?.safetyChecks || []} />
              )}
              {activeTab === "CONTEXT" && sessionDetail && (
                <RequestContextTab sessionDetail={sessionDetail} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
