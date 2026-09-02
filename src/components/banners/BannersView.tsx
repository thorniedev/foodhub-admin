"use client";

import {
  AlertCircle,
  ArrowUpDown,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  ImageIcon,
  Info,
  Loader2,
  MapPin,
  Maximize2,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Pagination from "@/src/components/ui/Pagination";
import type {
  AdminBannerResponse,
  BannerCategory,
  CreateBannerPayload,
  GetAdminBannersParams,
  UpdateBannerPayload,
} from "../../types/banner";
import {
  BANNER_CATEGORIES,
  BANNER_CATEGORY_LABELS,
} from "../../types/banner";
import { adminBannerApi, resolveImageUrl } from "../../services/adminBannerApi";
import BannerFormModal from "./BannerFormModal";
import BannerDeleteDialog from "./BannerDeleteDialog";
import BannerMediaImage from "./BannerMediaImage";
import BannersTableSkeleton from "./BannersTableSkeleton";

interface ToastItem {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export default function BannersView() {
  // State for data
  const [banners, setBanners] = useState<AdminBannerResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting state
  const [selectedCategory, setSelectedCategory] = useState<BannerCategory | "ALL">("ALL");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryContainerRef = useRef<HTMLDivElement>(null);

  const [publishedFilter, setPublishedFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdminBannerResponse | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<AdminBannerResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Toggling state tracking per ID
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({});

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: "success" | "error" | "info", message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryContainerRef.current &&
        !categoryContainerRef.current.contains(event.target as Node)
      ) {
        setCategoryOpen(false);
      }
    };

    if (categoryOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [categoryOpen]);

  // Fetch banners from API with backend pagination & accurate global counts
  const fetchBanners = useCallback(async (isBackground = false) => {
    if (isBackground) {
      setIsFetching(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    const params: GetAdminBannersParams = {
      page: currentPage,
      size: pageSize,
      category: selectedCategory === "ALL" ? undefined : selectedCategory,
      isPublished:
        publishedFilter === "ALL"
          ? undefined
          : publishedFilter === "PUBLISHED",
    };

    try {
      const [pageRes, allRes, pubRes, draftRes] = await Promise.all([
        adminBannerApi.getBanners(params),
        adminBannerApi.getBanners({ page: 0, size: 1 }),
        adminBannerApi.getBanners({ page: 0, size: 1, isPublished: true }),
        adminBannerApi.getBanners({ page: 0, size: 1, isPublished: false }),
      ]);

      const contents: AdminBannerResponse[] = pageRes?.contents || [];
      setBanners(contents);
      setTotalElements(pageRes?.totalElements ?? contents.length);
      setTotalPages(pageRes?.totalPages ?? 1);

      setTotalCount(allRes?.totalElements ?? contents.length);
      setPublishedCount(pubRes?.totalElements ?? 0);
      setDraftCount(draftRes?.totalElements ?? 0);
    } catch (err: any) {
      setError(
        err?.message || "មិនអាចទាញយកទិន្នន័យផ្ទាំងបែនណឺបានទេ សូមព្យាយាមម្តងទៀត។",
      );
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [currentPage, pageSize, selectedCategory, publishedFilter]);

  useEffect(() => {
    void fetchBanners();
  }, [fetchBanners]);

  // Client-side search on current page items
  const displayedBanners = useMemo(() => {
    if (!searchQuery.trim()) return banners;
    const q = searchQuery.toLowerCase().trim();
    return banners.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q) ||
        b.location?.toLowerCase().includes(q),
    );
  }, [banners, searchQuery]);

  const hasActiveFilters =
    publishedFilter !== "ALL" ||
    selectedCategory !== "ALL" ||
    searchQuery.trim() !== "" ||
    pageSize !== 20;

  const handleResetFilters = () => {
    setPublishedFilter("ALL");
    setSelectedCategory("ALL");
    setSearchQuery("");
    setPageSize(20);
    setCurrentPage(0);
    setCategoryOpen(false);
    setPageSizeOpen(false);
  };

  // Handle Create / Edit save
  const handleFormSave = async (
    payload: CreateBannerPayload | UpdateBannerPayload,
    imageFile?: File | null,
  ) => {
    try {
      if (editingBanner) {
        await adminBannerApi.updateBanner(editingBanner.id, payload, imageFile);
        addToast("success", `បានកែប្រែបែនណឺ "${payload.title}" ដោយជោគជ័យ!`);
      } else {
        await adminBannerApi.createBanner(
          payload as CreateBannerPayload,
          imageFile,
        );
        addToast("success", `បានបង្កើតបែនណឺ "${payload.title}" ដោយជោគជ័យ!`);
      }
      setIsFormModalOpen(false);
      setEditingBanner(null);
      void fetchBanners(true);
    } catch (err: any) {
      throw err;
    }
  };

  // Handle toggle published status
  const handleToggleStatus = async (banner: AdminBannerResponse) => {
    const nextStatus = !banner.isPublished;
    setTogglingIds((prev) => ({ ...prev, [banner.id]: true }));

    try {
      await adminBannerApi.updateStatus(banner.id, nextStatus);
      setBanners((prev) =>
        prev.map((b) =>
          b.id === banner.id ? { ...b, isPublished: nextStatus } : b,
        ),
      );
      setPublishedCount((prev) => (nextStatus ? prev + 1 : Math.max(0, prev - 1)));
      setDraftCount((prev) => (nextStatus ? Math.max(0, prev - 1) : prev + 1));
      addToast(
        "success",
        `បានប្តូរស្ថានភាពបែនណឺទៅជា "${nextStatus ? "បានផ្សាយ" : "ព្រាង"}"!`,
      );
    } catch (err: any) {
      addToast("error", err?.message || "បរាជ័យក្នុងការប្តូរស្ថានភាពបែនណឺ!");
    } finally {
      setTogglingIds((prev) => ({ ...prev, [banner.id]: false }));
    }
  };

  // Handle delete banner
  const handleConfirmDelete = async () => {
    if (!deletingBanner) return;

    setIsDeleting(true);
    try {
      await adminBannerApi.deleteBanner(deletingBanner.id);
      addToast("success", `បានលុបបែនណឺ "${deletingBanner.title}" ជាស្ថាពរ!`);

      if (banners.length === 1 && currentPage > 0) {
        setCurrentPage((p) => p - 1);
      } else {
        void fetchBanners(true);
      }
      setDeletingBanner(null);
    } catch (err: any) {
      addToast("error", err?.message || "បរាជ័យក្នុងការលុបបែនណឺ!");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast notifications container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3.5 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-5 duration-200 ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-900 shadow-emerald-500/10"
                : toast.type === "error"
                  ? "border-red-200 bg-red-50/95 text-red-900 shadow-red-500/10"
                  : "border-blue-200 bg-blue-50/95 text-blue-900 shadow-blue-500/10"
            }`}
          >
            {toast.type === "success" && (
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
            )}
            {toast.type === "error" && (
              <AlertCircle size={24} className="text-red-600 shrink-0" />
            )}
            {toast.type === "info" && (
              <Info size={24} className="text-blue-600 shrink-0" />
            )}
            <p className="text-lg font-medium leading-relaxed">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-gray-400 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* ============================================================
          1. HEADER BANNER (EXACT USER & SHOP HEADER STYLE)
      ============================================================ */}
      <section className="relative overflow-hidden rounded-[30px] bg-[#14833E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <Sparkles size={25} />
              </div>

              <div>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent-400">គ្រប់គ្រងរូបបេណឺ</p>
                <p className="mt-6 max-w-2xl text-xl text-white/85">
                  គ្រប់គ្រង ផ្ទាំងរូបភាពផ្សព្វផ្សាយពាណិជ្ជកម្ម ព័ត៌មានប្រូម៉ូសិន{" "}
                  <br className="md:block max-md:hidden" />
                  និងមាតិកាដែលប្រែប្រួលលើគេហទំព័រ និងកម្មវិធី FoodHub។
                </p>
              </div>
            </div>

            <div className="mt-5 sm:mt-7 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl sm:rounded-3xl bg-white/20 px-3 py-2.5 sm:px-5 sm:py-4">
                <div className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-xl text-white/80">
                  <ImageIcon size={20} className="shrink-0" />
                  <span className="truncate">បែនណឺសរុប</span>
                </div>
                {isLoading ? (
                  <div className="mt-1 h-8 w-14 rounded-lg bg-white/30 animate-pulse" />
                ) : (
                  <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold tabular-nums">{totalCount}</p>
                )}
              </div>

              <div className="rounded-2xl sm:rounded-3xl bg-white/20 px-3 py-2.5 sm:px-5 sm:py-4">
                <div className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-xl text-white/80">
                  <CheckCircle2 size={20} className="shrink-0" />
                  <span className="truncate">បានផ្សាយ</span>
                </div>
                {isLoading ? (
                  <div className="mt-1 h-8 w-14 rounded-lg bg-white/30 animate-pulse" />
                ) : (
                  <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold tabular-nums">{publishedCount}</p>
                )}
              </div>

              <div className="rounded-2xl sm:rounded-3xl bg-white/20 px-3 py-2.5 sm:px-5 sm:py-4">
                <div className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-xl text-white/80">
                  <EyeOff size={20} className="shrink-0" />
                  <span className="truncate">ព្រាង</span>
                </div>
                {isLoading ? (
                  <div className="mt-1 h-8 w-14 rounded-lg bg-white/30 animate-pulse" />
                ) : (
                  <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold tabular-nums">{draftCount}</p>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingBanner(null);
              setIsFormModalOpen(true);
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-lg font-normal text-[#136C34] shadow-sm transition hover:bg-emerald-50 sm:w-fit"
          >
            <Plus size={20} />
            បង្កើតបែនណឺថ្មី
          </button>
        </div>
      </section>

      {/* ============================================================
          2. TABS + TOOLBAR (CATALOG & SHOPS STANDARD STYLE)
      ============================================================ */}
      <div className="space-y-3">
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          {/* Mobile Status Tabs + Category + Refresh */}
          <div className="space-y-2 sm:hidden w-full">
            {/* Row 1: Tab 1 & Tab 2 */}
            <div className="grid grid-cols-2 gap-2 w-full">
              {[
                { id: "ALL", label: "ទាំងអស់", count: totalCount },
                { id: "PUBLISHED", label: "បានផ្សាយ", count: publishedCount },
              ].map((tab) => {
                const active = publishedFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setPublishedFilter(tab.id as any);
                      setCurrentPage(0);
                    }}
                    className={`group relative flex w-full h-12 cursor-pointer items-center justify-between gap-2 rounded-full px-4 text-lg font-normal transition-all duration-200 ease-out active:scale-95 ${active
                        ? "border border-primary-800 bg-primary-800 text-white shadow-md shadow-primary-900/15"
                        : "border border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-gray-50/80 hover:text-gray-900"
                      }`}
                  >
                    <span className="truncate">{tab.label}</span>
                    <span
                      className={`flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-2 text-base font-normal transition-colors duration-200 ${active
                          ? "bg-white/20 text-white backdrop-blur-xs"
                          : "bg-gray-100 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-800"
                        }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Row 2: Tab 3 (Compact) + Category Dropdown (Wide Flex) + Refresh */}
            <div className="flex items-center gap-1.5 w-full">
              {/* Tab 3: ព្រាង */}
              <button
                type="button"
                onClick={() => {
                  setPublishedFilter("DRAFT");
                  setCurrentPage(0);
                }}
                className={`group relative flex h-12 shrink-0 cursor-pointer items-center justify-between gap-2 rounded-full px-4 text-lg font-normal transition-all duration-200 ease-out active:scale-95 ${publishedFilter === "DRAFT"
                    ? "border border-primary-800 bg-primary-800 text-white shadow-md shadow-primary-900/15"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-gray-50/80 hover:text-gray-900"
                  }`}
              >
                <span>ព្រាង</span>
                <span
                  className={`flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-2 text-base font-normal transition-colors duration-200 ${publishedFilter === "DRAFT"
                      ? "bg-white/20 text-white backdrop-blur-xs"
                      : "bg-gray-100 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-800"
                    }`}
                >
                  {draftCount}
                </span>
              </button>

              {/* Category Dropdown (Flex-1) */}
              <div ref={categoryContainerRef} className="relative flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => setCategoryOpen((prev) => !prev)}
                  className={`flex h-12 w-full cursor-pointer items-center justify-between gap-1.5 rounded-full border bg-white px-3.5 text-lg font-normal transition outline-none ${categoryOpen
                      ? "border-primary-600 ring-2 ring-primary-100"
                      : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <span className="truncate text-gray-700">
                    {selectedCategory === "ALL"
                      ? "ប្រភេទទាំងអស់"
                      : BANNER_CATEGORY_LABELS[selectedCategory] || selectedCategory}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-gray-400 transition-transform duration-200 ${categoryOpen ? "rotate-180 text-primary-700" : ""
                      }`}
                  />
                </button>

                {categoryOpen && (
                  <div className="absolute right-0 top-[52px] z-[110] w-[210px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                    <p className="px-3 pb-2 pt-1 text-base font-normal text-secondary-600">
                      ប្រភេទ
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("ALL");
                        setCurrentPage(0);
                        setCategoryOpen(false);
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-lg font-normal transition ${selectedCategory === "ALL"
                          ? "bg-primary-50 text-primary-800"
                          : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <span>ប្រភេទទាំងអស់</span>
                      {selectedCategory === "ALL" && (
                        <Check size={18} className="text-primary-800" />
                      )}
                    </button>
                    {BANNER_CATEGORIES.map((cat) => {
                      const selected = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat);
                            setCurrentPage(0);
                            setCategoryOpen(false);
                          }}
                          className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-lg font-normal transition ${selected
                              ? "bg-primary-50 text-primary-800"
                              : "text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                          <span>{BANNER_CATEGORY_LABELS[cat] || cat}</span>
                          {selected && (
                            <Check size={18} className="text-primary-800" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={() => void fetchBanners(true)}
                disabled={isLoading || isFetching}
                title="ទាញយកឡើងវិញ"
                className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-primary-800 hover:bg-primary-50 hover:text-primary-800 disabled:opacity-50"
              >
                <RefreshCw
                  size={18}
                  className={isFetching ? "animate-spin text-emerald-600" : ""}
                />
              </button>
            </div>
          </div>

          {/* Desktop Status Tabs (sm: and up) */}
          <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-2">
            {[
              { id: "ALL", label: "ទាំងអស់", count: totalCount },
              { id: "PUBLISHED", label: "បានផ្សាយ", count: publishedCount },
              { id: "DRAFT", label: "ព្រាង", count: draftCount },
            ].map((tab) => {
              const active = publishedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setPublishedFilter(tab.id as any);
                    setCurrentPage(0);
                  }}
                  className={`group relative flex h-12 cursor-pointer items-center gap-2.5 rounded-full px-5 text-lg font-normal transition-all duration-200 ease-out active:scale-95 ${active
                      ? "border border-primary-800 bg-primary-800 text-white shadow-md shadow-primary-900/15"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-gray-50/80 hover:text-gray-900"
                    }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-2.5 text-lg font-normal transition-colors duration-200 ${active
                        ? "bg-white/20 text-white backdrop-blur-xs"
                        : "bg-gray-100 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-800"
                      }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Desktop Controls (Right): Search + Category + Page Size + Reset + Refresh */}
          <div className="hidden sm:flex sm:min-w-[320px] sm:flex-1 sm:items-center sm:justify-end sm:gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[200px] max-w-[320px] flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ស្វែងរកតាមចំណងជើង ឬការពិពណ៌នា..."
                className="h-12 w-full rounded-full border border-gray-200 bg-white py-2 pl-11 pr-10 text-lg font-normal text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition hover:text-gray-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setCategoryOpen((prev) => !prev);
                  setPageSizeOpen(false);
                }}
                className={`flex h-12 min-w-[150px] cursor-pointer items-center justify-between gap-2.5 rounded-full border bg-white px-4 text-lg font-normal transition outline-none ${categoryOpen
                    ? "border-primary-600 ring-2 ring-primary-100"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <span className="truncate text-gray-700">
                  {selectedCategory === "ALL"
                    ? "ប្រភេទទាំងអស់"
                    : BANNER_CATEGORY_LABELS[selectedCategory] || selectedCategory}
                </span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-gray-400 transition-transform duration-200 ${categoryOpen ? "rotate-180 text-primary-700" : ""
                    }`}
                />
              </button>

              {categoryOpen && (
                <div className="absolute right-0 top-[52px] z-[110] w-[210px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                  <p className="px-3 pb-2 pt-1 text-base font-normal text-secondary-600">
                    ប្រភេទ
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("ALL");
                      setCurrentPage(0);
                      setCategoryOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-lg font-normal transition ${selectedCategory === "ALL"
                        ? "bg-primary-50 text-primary-800"
                        : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <span>ប្រភេទទាំងអស់</span>
                    {selectedCategory === "ALL" && (
                      <Check size={18} className="text-primary-800" />
                    )}
                  </button>
                  {BANNER_CATEGORIES.map((cat) => {
                    const selected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setCurrentPage(0);
                          setCategoryOpen(false);
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-lg font-normal transition ${selected
                            ? "bg-primary-50 text-primary-800"
                            : "text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        <span>{BANNER_CATEGORY_LABELS[cat] || cat}</span>
                        {selected && (
                          <Check size={18} className="text-primary-800" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Page Size Select */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setPageSizeOpen((prev) => !prev);
                  setCategoryOpen(false);
                }}
                className={`flex h-12 min-w-[130px] items-center justify-between gap-2 rounded-full border bg-white px-4 text-lg font-normal transition ${pageSizeOpen
                    ? "border-primary-600 ring-2 ring-primary-100"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <span className="text-gray-700">{pageSize} / ទំព័រ</span>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-200 ${pageSizeOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {pageSizeOpen && (
                <div className="absolute right-0 top-[52px] z-[110] w-[170px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                  <p className="px-3 pb-2 pt-1 text-base text-secondary-600">
                    ទំហំទំព័រ
                  </p>
                  {[10, 20, 50, 100].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setPageSize(size);
                        setCurrentPage(0);
                        setPageSizeOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-lg font-normal transition ${pageSize === size
                          ? "bg-primary-50 text-primary-800"
                          : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <span>{size} / ទំព័រ</span>
                      {pageSize === size && (
                        <Check size={18} className="text-primary-800" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95 cursor-pointer"
                title="កំណត់ឡើងវិញ"
              >
                <RotateCcw size={18} />
              </button>
            )}

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => void fetchBanners(true)}
              disabled={isLoading || isFetching}
              title="ទាញយកឡើងវិញ"
              className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-primary-800 hover:bg-primary-50 hover:text-primary-800 disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={isFetching ? "animate-spin text-emerald-600" : ""}
              />
            </button>
          </div>
        </div>

        {/* Mobile Full Width Search Input (Row 3) */}
        <div className="relative sm:hidden w-full">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរកតាមចំណងជើង ឬការពិពណ៌នា..."
            className="h-12 w-full rounded-full border border-gray-200 bg-white py-2 pl-11 pr-10 text-lg font-normal text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition hover:text-gray-700 cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-base font-semibold text-red-700">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void fetchBanners()}
            className="rounded-xl border border-red-300 bg-white px-3.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50"
          >
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      )}

      {/* ============================================================
          3. TABLE & PAGINATION CONTAINER (MATCHING CATALOG PAGE)
      ============================================================ */}
      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <BannersTableSkeleton rows={pageSize === 10 ? 5 : 7} />
        ) : (
          <>
            <div className="w-full min-w-0 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <table className="w-full table-auto border-collapse text-left">
                {/* ================= TABLE HEAD ================= */}
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

                {/* ================= TABLE BODY ================= */}
                <tbody>
                  {displayedBanners.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <p className="text-xl font-medium text-gray-500">
                          មិនមានទិន្នន័យផ្ទាំងបែនណឺ
                        </p>
                        <p className="mt-1 text-lg text-gray-400">
                          សូមសាកល្បងស្វែងរក ឬជ្រើស filter ផ្សេងទៀត។
                        </p>
                      </td>
                    </tr>
                  ) : (
                    displayedBanners.map((banner) => {
                      const fullImageUrl = resolveImageUrl(
                        banner.imageUrl || banner.imageMediaUuid,
                      );
                      const isToggling = Boolean(togglingIds[banner.id]);

                      return (
                        <tr
                          key={banner.id}
                          className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70"
                        >
                          {/* 1. Thumbnail + Title */}
                          <td className="px-4 py-3">
                            <div className="group flex items-center gap-3">
                              <div
                                onClick={() => fullImageUrl && setPreviewImage({ url: fullImageUrl, title: banner.title })}
                                className="relative flex h-11 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-primary-100 bg-primary-50 text-primary-800 transition group-hover:border-primary-200 group-hover:bg-primary-100"
                                title="ចុចដើម្បីមើលរូបភាពពេញ"
                              >
                                <BannerMediaImage
                                  mediaUrlOrUuid={banner.imageUrl || banner.imageMediaUuid}
                                  alt={banner.title}
                                  className="h-full w-full object-cover"
                                  fallbackIcon={<ImageIcon size={22} className="text-primary-800 shrink-0" />}
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 transition group-hover:opacity-100">
                                  <Maximize2 size={14} className="text-white" />
                                </div>
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[240px] truncate text-lg font-normal text-gray-800 transition group-hover:text-primary-800">
                                  {banner.title}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* 2. Description */}
                          <td className="px-4 py-3">
                            {banner.description ? (
                              <p className="max-w-[280px] truncate text-lg font-normal text-gray-600" title={banner.description}>
                                {banner.description}
                              </p>
                            ) : (
                              <span className="text-lg italic font-normal text-gray-400">
                                គ្មានការពិពណ៌នា
                              </span>
                            )}
                          </td>

                          {/* 3. Category Badge */}
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-1 text-lg font-normal text-emerald-700">
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                              {BANNER_CATEGORY_LABELS[banner.category] || banner.category}
                            </span>
                          </td>

                          {/* 4. Location */}
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="flex items-center gap-1.5 text-lg font-normal text-gray-500">
                              <MapPin size={18} className="text-primary-700 shrink-0" />
                              <span>{banner.location || "—"}</span>
                            </div>
                          </td>

                          {/* 5. Published Status Toggle Switch & Badge */}
                          <td className="whitespace-nowrap px-4 py-3 text-center">
                            <div className="inline-flex items-center justify-center gap-2">
                              <button
                                type="button"
                                disabled={isToggling}
                                onClick={() => void handleToggleStatus(banner)}
                                className={`group/toggle relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50 ${banner.isPublished ? "bg-[#137A3D]" : "bg-gray-300 hover:bg-gray-400"
                                  }`}
                                title={banner.isPublished ? "ចុចដើម្បីបិទមិនបង្ហាញ (Hide / Draft)" : "ចុចដើម្បីបង្ហាញផ្សាយ (Show / Publish)"}
                                aria-label="Toggle banner status"
                              >
                                <span
                                  className={`inline-flex h-4 w-4 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 ${banner.isPublished ? "translate-x-6" : "translate-x-1"
                                    }`}
                                >
                                  {isToggling && (
                                    <Loader2 size={10} className="animate-spin text-gray-600" />
                                  )}
                                </span>
                              </button>
                              <span
                                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-lg font-normal border ${banner.isPublished
                                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                    : "border-gray-200 bg-gray-50 text-gray-600"
                                  }`}
                              >
                                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${banner.isPublished ? "bg-emerald-500" : "bg-gray-400"}`} />
                                {banner.isPublished ? "បានផ្សាយ" : "ព្រាង"}
                              </span>
                            </div>
                          </td>

                          {/* 6. Actions */}
                          <td className="whitespace-nowrap px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {fullImageUrl && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage({ url: fullImageUrl, title: banner.title })}
                                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                  title="មើលរូបភាពពេញ"
                                >
                                  <Eye size={18} />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingBanner(banner);
                                  setIsFormModalOpen(true);
                                }}
                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                title="កែប្រែ"
                              >
                                <Pencil size={18} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeletingBanner(banner)}
                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-100"
                                title="លុប"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ================= FOOTER PAGINATION (EXACT MATCH TO REFERENCE PAGE) ================= */}
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              unit="ទិន្នន័យ"
              zeroIndexed={true}
              onPageChange={(p) => setCurrentPage(p)}
              className="border-t border-gray-100"
            />
          </>
        )}
      </section>

      {/* Form Modal (Create / Edit) */}
      {isFormModalOpen && (
        <BannerFormModal
          open={isFormModalOpen}
          editing={editingBanner}
          defaultCategory={selectedCategory === "ALL" ? "MAIN" : selectedCategory}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingBanner(null);
          }}
          onSaveSubmit={handleFormSave}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <BannerDeleteDialog
        banner={deletingBanner}
        loading={isDeleting}
        onClose={() => setDeletingBanner(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] max-w-4xl overflow-hidden rounded-3xl bg-white p-3 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 px-2">
              <p className="text-base font-bold text-gray-900 truncate max-w-md">{previewImage.title}</p>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="rounded-full bg-gray-100 p-1.5 text-gray-500 hover:bg-gray-200 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-2.5 overflow-hidden rounded-2xl bg-gray-50">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[72vh] w-auto mx-auto rounded-2xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
