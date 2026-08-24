"use client";

import {
  AlertCircle,
  CheckCircle2,
  Edit,
  Eye,
  Filter,
  ImageIcon,
  Info,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AdminBannerResponse,
  BannerCategory,
  CreateBannerPayload,
  GetAdminBannersParams,
  UpdateBannerPayload,
} from "../../types/banner";
import {
  BANNER_CATEGORIES,
  BANNER_CATEGORY_COLORS,
  BANNER_CATEGORY_LABELS,
} from "../../types/banner";
import { adminBannerApi, resolveImageUrl } from "../../services/adminBannerApi";
import BannerFormModal from "./BannerFormModal";
import BannerDeleteDialog from "./BannerDeleteDialog";

// Simple built-in Toast notification type
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
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination state
  const [selectedCategory, setSelectedCategory] = useState<BannerCategory | "ALL">("ALL");
  const [publishedFilter, setPublishedFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdminBannerResponse | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<AdminBannerResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  // Fetch banners from API
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
      const response = await adminBannerApi.getBanners(params);
      setBanners(response?.contents || []);
      setTotalElements(response?.totalElements || 0);
      setTotalPages(response?.totalPages || 1);
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

  // Client-side search filtering (by title or location)
  const filteredBanners = useMemo(() => {
    if (!searchQuery.trim()) return banners;
    const query = searchQuery.trim().toLowerCase();
    return banners.filter(
      (b) =>
        b.title.toLowerCase().includes(query) ||
        (b.description && b.description.toLowerCase().includes(query)) ||
        (b.location && b.location.toLowerCase().includes(query)),
    );
  }, [banners, searchQuery]);

  // Status toggle handler with optimistic UI
  const handleToggleStatus = async (banner: AdminBannerResponse) => {
    const nextStatus = !banner.isPublished;
    const bannerId = banner.id;

    // Optimistic update
    setBanners((prev) =>
      prev.map((item) =>
        item.id === bannerId ? { ...item, isPublished: nextStatus } : item,
      ),
    );
    setTogglingIds((prev) => ({ ...prev, [bannerId]: true }));

    try {
      await adminBannerApi.updateStatus(bannerId, nextStatus);
      addToast(
        "success",
        nextStatus
          ? `បានផ្សាយបែនណឺ "${banner.title}" ជាជោគជ័យ!`
          : `បានបិទការផ្សាយបែនណឺ "${banner.title}" រួចរាល់!`,
      );
    } catch (err: any) {
      // Rollback on error
      setBanners((prev) =>
        prev.map((item) =>
          item.id === bannerId ? { ...item, isPublished: !nextStatus } : item,
        ),
      );
      addToast("error", err?.message || "បរាជ័យក្នុងការផ្លាស់ប្តូរស្ថានភាពបែនណឺ!");
    } finally {
      setTogglingIds((prev) => {
        const next = { ...prev };
        delete next[bannerId];
        return next;
      });
    }
  };

  // Form submit handler
  const handleFormSave = async (
    payload: CreateBannerPayload | UpdateBannerPayload,
    imageFile?: File | null,
  ): Promise<AdminBannerResponse | void> => {
    if (editingBanner) {
      const updated = await adminBannerApi.updateBanner(
        editingBanner.id,
        payload,
        imageFile,
      );
      addToast("success", `បានកែសម្រួលបែនណឺ "${payload.title}" ជាជោគជ័យ!`);
      void fetchBanners(true);
      return updated;
    } else {
      if (!imageFile) throw new Error("Image file is required for new banner");
      const created = await adminBannerApi.createBanner(
        payload,
        imageFile,
      );
      addToast("success", `បានបង្កើតបែនណឺថ្មី "${payload.title}" ជាជោគជ័យ!`);
      void fetchBanners(true);
      return created;
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!deletingBanner) return;

    setIsDeleting(true);
    try {
      await adminBannerApi.deleteBanner(deletingBanner.id);
      addToast("success", `បានលុបបែនណឺ "${deletingBanner.title}" ជាស្ថាពរ!`);

      // If last item on page > 0, go to previous page
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

  // Format date helper
  const formatDate = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString("km-KH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="relative min-h-screen space-y-8 p-3 pb-12 sm:p-6">
      {/* Toast notifications container */}
      <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-900 shadow-emerald-500/10"
                : toast.type === "error"
                ? "border-red-200 bg-red-50/95 text-red-900 shadow-red-500/10"
                : "border-blue-200 bg-blue-50/95 text-blue-900 shadow-blue-500/10"
            }`}
          >
            {toast.type === "success" && (
              <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
            )}
            {toast.type === "error" && (
              <AlertCircle size={22} className="text-red-600 shrink-0" />
            )}
            {toast.type === "info" && (
              <Info size={22} className="text-blue-600 shrink-0" />
            )}
            <p className="text-lg font-semibold">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-gray-400 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Header Banner & Stats */}
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
                <p className="text-5xl font-bold text-accent-400">
                  រូបបេណឺ
                </p>
                <p className="mt-6 max-w-2xl text-xl text-white/85">
                  គ្រប់គ្រងផ្ទាំងរូបភាពផ្សព្វផ្សាយនៅលើគេហទំព័រ និងកម្មវិធីទូរស័ព្ទ FoodHub។
                </p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/20 px-5 py-4">
                <div className="flex items-center gap-2 text-xl text-white/80">
                  <ImageIcon size={20} />
                  <span>បែនណឺសរុប</span>
                </div>
                <p className="mt-1 text-2xl font-bold">{totalElements}</p>
              </div>

              <div className="rounded-3xl bg-white/20 px-5 py-4">
                <div className="flex items-center gap-2 text-xl text-white/80">
                  <CheckCircle2 size={20} />
                  <span>បានផ្សាយ</span>
                </div>
                <p className="mt-1 text-2xl font-bold">
                  {banners.filter((b) => b.isPublished).length}
                </p>
              </div>

              <div className="rounded-3xl bg-white/20 px-5 py-4">
                <div className="flex items-center gap-2 text-xl text-white/80">
                  <Eye size={20} />
                  <span>មិនទាន់ផ្សាយ</span>
                </div>
                <p className="mt-1 text-2xl font-bold">
                  {banners.filter((b) => !b.isPublished).length}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingBanner(null);
              setIsFormModalOpen(true);
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-lg font-bold text-[#136C34] shadow-sm transition hover:bg-emerald-50 sm:w-fit"
          >
            <Plus size={20} />
            <span>បង្កើតបែនណឺថ្មី</span>
          </button>
        </div>
      </section>

      {/* Filter and Search Controls Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setPublishedFilter("ALL");
              setCurrentPage(0);
            }}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-lg font-medium transition-all duration-200 ${
              publishedFilter === "ALL"
                ? "bg-primary-800 text-white"
                : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span>ទាំងអស់</span>
            <span
              className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-lg font-normal ${
                publishedFilter === "ALL" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {totalElements}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPublishedFilter("PUBLISHED");
              setCurrentPage(0);
            }}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-lg font-medium transition-all duration-200 ${
              publishedFilter === "PUBLISHED"
                ? "bg-primary-800 text-white"
                : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span>បានផ្សាយ</span>
            <span
              className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-lg font-normal ${
                publishedFilter === "PUBLISHED" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {banners.filter((b) => b.isPublished).length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPublishedFilter("DRAFT");
              setCurrentPage(0);
            }}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-lg font-medium transition-all duration-200 ${
              publishedFilter === "DRAFT"
                ? "bg-primary-800 text-white"
                : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span>ព្រាង</span>
            <span
              className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-lg font-normal ${
                publishedFilter === "DRAFT" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {banners.filter((b) => !b.isPublished).length}
            </span>
          </button>
        </div>

        {/* Right filters: Search, Category & Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
            <Search
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកតាមចំណងជើង..."
              className="h-[52px] w-full rounded-full border border-gray-200 bg-white pl-12 pr-10 text-lg font-medium outline-none transition focus:border-primary-600 focus:ring-4 focus:ring-primary-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value as BannerCategory | "ALL");
                setCurrentPage(0);
              }}
              className="h-[52px] appearance-none rounded-full border border-gray-200 bg-white px-5 pr-10 text-lg font-medium text-gray-700 outline-none transition focus:border-primary-600 focus:ring-4 focus:ring-primary-100"
            >
              <option value="ALL">ប្រភេទទាំងអស់</option>
              {BANNER_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {BANNER_CATEGORY_LABELS[cat] || cat}
                </option>
              ))}
            </select>
            <Filter
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={() => void fetchBanners(true)}
            disabled={isLoading || isFetching}
            title="ទាញយកឡើងវិញ"
            className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-[#136C34] disabled:opacity-50"
          >
            <RefreshCw
              size={20}
              className={isFetching ? "animate-spin text-emerald-600" : ""}
            />
          </button>
        </div>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-lg font-semibold text-red-700">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={22} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void fetchBanners()}
            className="rounded-xl border border-red-300 bg-white px-4 py-2 text-lg font-bold text-red-700 hover:bg-red-50"
          >
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <section className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 text-xl font-bold text-[#136C34]">ផ្ទាំងរូបភាព (Thumbnail)</th>
                <th className="px-6 py-4 text-xl font-bold text-[#136C34]">ចំណងជើង និងការពិពណ៌នា</th>
                <th className="px-6 py-4 text-xl font-bold text-[#136C34]">ប្រភេទ (Category)</th>
                <th className="px-6 py-4 text-xl font-bold text-[#136C34]">ទីតាំង (Location)</th>
                <th className="px-6 py-4 text-center text-xl font-bold text-[#136C34]">ស្ថានភាពផ្សាយ (Status)</th>
                <th className="px-6 py-4 text-xl font-bold text-[#136C34]">កាលបរិច្ឆេទ</th>
                <th className="px-6 py-4 text-right text-xl font-bold text-[#136C34]">សកម្មភាព (Actions)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 size={32} className="animate-spin text-emerald-600" />
                      <p className="text-lg font-bold text-gray-500">
                        កំពុងទាញយកទិន្នន័យបែនណឺ...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredBanners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                        <ImageIcon size={28} />
                      </div>
                      <p className="text-xl font-bold text-gray-800">
                        មិនមានទិន្នន័យផ្ទាំងបែនណឺទេ
                      </p>
                      <p className="text-lg text-gray-400">
                        សូមចុចប៊ូតុង &ldquo;បង្កើតបែនណឺថ្មី&rdquo; ដើម្បីចាប់ផ្តើមបន្ថែម។
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBanners.map((banner) => {
                  const categoryStyle =
                    BANNER_CATEGORY_COLORS[banner.category] || {
                      bg: "bg-gray-100 text-gray-700 border-gray-200",
                      dot: "bg-gray-500",
                    };
                  const fullImageUrl = resolveImageUrl(
                    banner.imageUrl || banner.imageMediaUuid,
                  );
                  const isToggling = Boolean(togglingIds[banner.id]);

                  return (
                    <tr
                      key={banner.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition"
                    >
                      {/* Image Thumbnail */}
                      <td className="px-6 py-4">
                        <div
                          onClick={() => fullImageUrl && setPreviewImage(fullImageUrl)}
                          className="group/img relative h-20 w-36 shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-2xs transition hover:scale-105"
                        >
                          {fullImageUrl ? (
                            <img
                              src={fullImageUrl}
                              alt={banner.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                              <ImageIcon size={24} />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover/img:opacity-100">
                            <Eye size={20} className="text-white" />
                          </div>
                        </div>
                      </td>

                      {/* Title & Description */}
                      <td className="max-w-[320px] px-6 py-4">
                        <p className="text-lg font-bold text-gray-900 line-clamp-1">
                          {banner.title}
                        </p>
                        {banner.description ? (
                          <p className="mt-1 text-lg text-gray-500 line-clamp-2">
                            {banner.description}
                          </p>
                        ) : (
                          <span className="text-lg italic text-gray-400">
                            គ្មានការពិពណ៌នា
                          </span>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-lg font-bold ${categoryStyle.bg}`}
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${categoryStyle.dot}`}
                          />
                          {BANNER_CATEGORY_LABELS[banner.category] ||
                            banner.category}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {banner.location ? (
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50/80 px-3.5 py-1.5 text-lg font-bold text-blue-700">
                            <MapPin size={18} className="text-blue-500" />
                            {banner.location}
                          </span>
                        ) : (
                          <span className="text-lg text-gray-400">-</span>
                        )}
                      </td>

                      {/* Status Switch */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => void handleToggleStatus(banner)}
                          className={`group/toggle relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:opacity-60 ${
                            banner.isPublished
                              ? "bg-[#137A3D]"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md transition-transform ${
                              banner.isPublished
                                ? "translate-x-8"
                                : "translate-x-1"
                            }`}
                          >
                            {isToggling ? (
                              <Loader2
                                size={14}
                                className="animate-spin text-gray-600"
                              />
                            ) : null}
                          </span>
                        </button>
                        <p className="mt-1 text-lg font-bold text-gray-600">
                          {banner.isPublished ? "បានផ្សាយ" : "ព្រាង (Draft)"}
                        </p>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-600">
                        {formatDate(banner.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBanner(banner);
                              setIsFormModalOpen(true);
                            }}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-2xs transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                            title="កែសម្រួល (Edit)"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingBanner(banner)}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-red-500 shadow-2xs transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                            title="លុប (Delete)"
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

        {/* Pagination Footer */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/50 px-6 py-4 sm:flex-row">
          <div className="flex flex-wrap items-center gap-3 text-lg font-semibold text-gray-600">
            <span>
              បង្ហាញ {filteredBanners.length} នៃ {totalElements} បែនណឺសរុប
            </span>
            <span>•</span>
            <div className="flex items-center gap-2">
              <span>ទំព័រនីមួយៗ:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-lg font-bold text-gray-700 outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 0 || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-lg font-bold text-gray-700 shadow-2xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ថយក្រោយ (Prev)
            </button>

            <span className="px-3 text-lg font-bold text-gray-700">
              ទំព័រ {currentPage + 1} / {totalPages || 1}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages - 1 || isLoading}
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
              }
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-lg font-bold text-gray-700 shadow-2xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              បន្ទាប់ (Next)
            </button>
          </div>
        </div>
      </section>

      {/* Form Modal (Create / Edit) */}
      {isFormModalOpen && (
        <BannerFormModal
          open={isFormModalOpen}
          editing={editingBanner}
          defaultCategory={
            selectedCategory === "ALL" ? "MAIN" : selectedCategory
          }
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
          className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div className="relative max-h-[85vh] max-w-4xl overflow-hidden rounded-3xl bg-black p-2 shadow-2xl">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white hover:bg-black/90"
            >
              <X size={24} />
            </button>
            <img
              src={previewImage}
              alt="Banner Fullscreen Preview"
              className="max-h-[80vh] w-auto rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
