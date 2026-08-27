"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Filter,
  ImageIcon,
  Info,
  Loader2,
  MapPin,
  Maximize2,
  Pencil,
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
import BannerMediaImage from "./BannerMediaImage";

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
      const pageData =
        (response as any)?.payload || (response as any)?.data || response;
      const contents: AdminBannerResponse[] =
        pageData?.contents ||
        pageData?.content ||
        (Array.isArray(pageData) ? pageData : []);

      setBanners(contents);
      setTotalElements(
        pageData?.totalElements ?? pageData?.total ?? contents.length,
      );
      setTotalPages(pageData?.totalPages ?? 1);
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

  // Client-side search filter
  const filteredBanners = useMemo(() => {
    if (!searchQuery.trim()) return banners;
    const q = searchQuery.toLowerCase().trim();
    return banners.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q) ||
        b.location?.toLowerCase().includes(q),
    );
  }, [banners, searchQuery]);

  // Published / Draft Counts
  const publishedCount = useMemo(() => banners.filter((b) => b.isPublished).length, [banners]);
  const draftCount = useMemo(() => banners.filter((b) => !b.isPublished).length, [banners]);

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
    <div className="space-y-5">
      {/* Toast notifications container */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200 ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-900 shadow-emerald-500/10"
                : toast.type === "error"
                  ? "border-red-200 bg-red-50/95 text-red-900 shadow-red-500/10"
                  : "border-blue-200 bg-blue-50/95 text-blue-900 shadow-blue-500/10"
            }`}
          >
            {toast.type === "success" && (
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            )}
            {toast.type === "error" && (
              <AlertCircle size={20} className="text-red-600 shrink-0" />
            )}
            {toast.type === "info" && (
              <Info size={20} className="text-blue-600 shrink-0" />
            )}
            <p className="text-sm font-bold">{toast.message}</p>
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
                <p className="text-5xl font-bold text-accent-400">គ្រប់គ្រងរូបបេណឺ</p>
                <p className="mt-6 max-w-2xl text-xl text-white/85">
                  គ្រប់គ្រង ផ្ទាំងរូបភាពផ្សព្វផ្សាយពាណិជ្ជកម្ម ព័ត៌មានប្រូម៉ូសិន{" "}
                  <br className="md:block max-md:hidden" />
                  និងមាតិកាដែលប្រែប្រួលលើគេហទំព័រ និងកម្មវិធី FoodHub។
                </p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                <p className="mt-1 text-2xl font-bold">{publishedCount}</p>
              </div>

              <div className="rounded-3xl bg-white/20 px-5 py-4">
                <div className="flex items-center gap-2 text-xl text-white/80">
                  <EyeOff size={20} />
                  <span>ព្រាង (Drafts)</span>
                </div>
                <p className="mt-1 text-2xl font-bold">{draftCount}</p>
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
            បង្កើតបែនណឺថ្មី
          </button>
        </div>
      </section>

      {/* ============================================================
          2. TABS + TOOLBAR (MATCHING USERSTABS & USERSMANAGER)
      ============================================================ */}
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        {/* Left Status Tabs */}
        <div className="flex max-w-full items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Tab: ALL */}
          <button
            type="button"
            onClick={() => {
              setPublishedFilter("ALL");
              setCurrentPage(0);
            }}
            className={`group inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              publishedFilter === "ALL"
                ? "bg-primary-800 text-white shadow-md shadow-primary-900/20"
                : "bg-white text-gray-500 shadow-sm ring-1 ring-gray-100 hover:bg-gray-50 hover:text-gray-700 hover:shadow-md"
            }`}
          >
            <span>ទាំងអស់</span>
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold transition-all duration-200 ${
                publishedFilter === "ALL"
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {totalElements}
            </span>
          </button>

          {/* Tab: PUBLISHED */}
          <button
            type="button"
            onClick={() => {
              setPublishedFilter("PUBLISHED");
              setCurrentPage(0);
            }}
            className={`group inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              publishedFilter === "PUBLISHED"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20"
                : "bg-white text-gray-500 shadow-sm ring-1 ring-gray-100 hover:bg-gray-50 hover:text-gray-700 hover:shadow-md"
            }`}
          >
            <span>បានផ្សាយ</span>
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold transition-all duration-200 ${
                publishedFilter === "PUBLISHED"
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {publishedCount}
            </span>
          </button>

          {/* Tab: DRAFT */}
          <button
            type="button"
            onClick={() => {
              setPublishedFilter("DRAFT");
              setCurrentPage(0);
            }}
            className={`group inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              publishedFilter === "DRAFT"
                ? "bg-amber-500 text-white shadow-md shadow-amber-900/20"
                : "bg-white text-gray-500 shadow-sm ring-1 ring-gray-100 hover:bg-gray-50 hover:text-gray-700 hover:shadow-md"
            }`}
          >
            <span>ព្រាង</span>
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold transition-all duration-200 ${
                publishedFilter === "DRAFT"
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {draftCount}
            </span>
          </button>
        </div>

        {/* Right Search + Category + Refresh */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកតាមចំណងជើង ឬការពិពណ៌នា..."
              className="h-11 w-[260px] sm:w-[320px] lg:w-[360px] rounded-2xl border border-gray-200 bg-white py-2 pl-11 pr-10 text-base text-gray-700 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
              >
                <X size={16} />
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
              className="h-11 appearance-none rounded-2xl border border-gray-200 bg-white pl-4 pr-10 text-base font-semibold text-gray-700 outline-none transition hover:bg-gray-50 focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
            >
              <option value="ALL">ប្រភេទទាំងអស់</option>
              {BANNER_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {BANNER_CATEGORY_LABELS[cat] || cat}
                </option>
              ))}
            </select>
            <Filter
              size={15}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => void fetchBanners(true)}
            disabled={isLoading || isFetching}
            title="ទាញយកឡើងវិញ"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-2xs transition hover:bg-gray-50 hover:text-[#136C34] disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={isFetching ? "animate-spin text-emerald-600" : ""}
            />
          </button>
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
          3. TABLE (MATCHING SHOPS TABLE STYLES)
      ============================================================ */}
      <div className="w-full min-w-0 max-w-full overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-sm [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full table-auto border-collapse text-left">
          {/* ================= HEAD ================= */}
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <th className="whitespace-nowrap px-4 py-3.5 text-lg font-semibold text-primary-800 min-w-[260px]">
                ផ្ទាំងរូបភាព & ចំណងជើង
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 text-lg font-semibold text-primary-800 min-w-[140px]">
                ប្រភេទ
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 text-lg font-semibold text-primary-800 min-w-[130px]">
                ទីតាំង
              </th>
         
              <th className="whitespace-nowrap px-4 py-3.5 text-center text-lg font-semibold text-primary-800 min-w-[130px]">
                ស្ថានភាពផ្សាយ
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 text-center text-lg font-semibold text-primary-800 min-w-[120px]">
                សកម្មភាព
              </th>
            </tr>
          </thead>

          {/* ================= BODY ================= */}
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 size={32} className="animate-spin text-emerald-600" />
                    <p className="text-lg font-medium text-gray-500">
                      កំពុងទាញយកទិន្នន័យបែនណឺ...
                    </p>
                  </div>
                </td>
              </tr>
            ) : filteredBanners.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <p className="text-lg font-medium text-gray-500">
                    មិនមានទិន្នន័យផ្ទាំងបែនណឺ
                  </p>
                  <p className="mt-1 text-base text-gray-400">
                    ទិន្នន័យផ្ទាំងរូបភាពផ្សព្វផ្សាយនឹងបង្ហាញនៅទីនេះ
                  </p>
                </td>
              </tr>
            ) : (
              filteredBanners.map((banner) => {
                const fullImageUrl = resolveImageUrl(
                  banner.imageUrl || banner.imageMediaUuid,
                );
                const isToggling = Boolean(togglingIds[banner.id]);

                return (
                  <tr
                    key={banner.id}
                    className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70"
                  >
                    {/* 1. Thumbnail + Title & Description */}
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
                          <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition group-hover:opacity-100">
                            <Maximize2 size={14} className="text-white" />
                          </div>
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[240px] truncate text-base font-semibold text-gray-800 transition group-hover:text-primary-800">
                            {banner.title}
                          </p>
                          {banner.description ? (
                            <p className="max-w-[240px] truncate text-base font-normal text-gray-500">
                              {banner.description}
                            </p>
                          ) : (
                            <span className="text-base italic text-gray-400">
                              គ្មានការពិពណ៌នា
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 2. Category Badge */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-1 text-base font-semibold text-emerald-700">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                        {BANNER_CATEGORY_LABELS[banner.category] || banner.category}
                      </span>
                    </td>

                    {/* 3. Location */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-1.5 text-base font-normal text-gray-500">
                        <MapPin size={16} className="text-primary-700 shrink-0" />
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
                          className={`group/toggle relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50 ${
                            banner.isPublished ? "bg-[#137A3D]" : "bg-gray-300 hover:bg-gray-400"
                          }`}
                          title={banner.isPublished ? "ចុចដើម្បីបិទមិនបង្ហាញ (Hide / Draft)" : "ចុចដើម្បីបង្ហាញផ្សាយ (Show / Publish)"}
                          aria-label="Toggle banner status"
                        >
                          <span
                            className={`inline-flex h-4 w-4 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 ${
                              banner.isPublished ? "translate-x-6" : "translate-x-1"
                            }`}
                          >
                            {isToggling && (
                              <Loader2 size={10} className="animate-spin text-gray-600" />
                            )}
                          </span>
                        </button>
                        <span
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-base font-semibold border ${
                            banner.isPublished
                              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                              : "border-gray-200 bg-gray-50 text-gray-600"
                          }`}
                        >
                          <span className={`h-2 w-2 shrink-0 rounded-full ${banner.isPublished ? "bg-emerald-500" : "bg-gray-400"}`} />
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
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-100"
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
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-100"
                          title="កែប្រែ"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingBanner(banner)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-100"
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

        {/* ================= PAGINATION (EXACT SHOPS PAGINATION STYLE) ================= */}
        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base text-gray-500">
            សរុប <span className="font-semibold text-gray-700">{totalElements}</span> ផ្ទាំងបែនណឺ
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 0 || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-[#136C34] hover:bg-emerald-50 hover:text-[#136C34] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#136C34] px-3 text-base font-semibold text-white">
              {currentPage + 1} / {Math.max(totalPages, 1)}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages - 1 || isLoading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-[#136C34] hover:bg-emerald-50 hover:text-[#136C34] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

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
          className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
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
