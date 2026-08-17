"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { ArrowUpDown, Check, ChevronDown, Search, X } from "lucide-react";
import { useGetBannersQuery } from "../../app/store/bannerApi";
import { useGetSeasonalFoodsQuery, useDeleteSeasonalFoodMutation } from "../../app/store/seasonalFoodApi";
import { useGetFoodByAreasQuery, useDeleteFoodByAreaMutation } from "../../app/store/foodByAreaApi";

import BannersHeader from "./banners/BannersHeader";
import BannerFormModal from "./banners/BannerFormModal";
import UnifiedContentTable, { UnifiedItem } from "./UnifiedContentTable";
import { Banner } from "../../types/banner";

import SeasonalFoodFormModal from "./seasonal-food/SeasonalFoodFormModal";
import { SeasonalFoodImage } from "../../types/seasonalFood";
import { useAddSeasonalFoodMutation, useUpdateSeasonalFoodMutation } from "../../app/store/seasonalFoodApi";

import FoodByAreaFormModal from "../feedback/FoodByAreaFormModal";
import { FoodByAreaImage } from "../../types/foodByArea";
import { useAddFoodByAreaMutation, useUpdateFoodByAreaMutation } from "../../app/store/foodByAreaApi";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
type SortMode = "A_Z" | "Z_A" | "NEWEST" | "OLDEST";

const sortOptions: Array<{ value: SortMode; label: string }> = [
  { value: "A_Z", label: "A → Z" },
  { value: "Z_A", label: "Z → A" },
  { value: "NEWEST", label: "ថ្មីបំផុត" },
  { value: "OLDEST", label: "ចាស់បំផុត" },
];

export default function DynamicContentDashboard() {
  const { data: banners = [] } = useGetBannersQuery();
  const { data: seasonal = [] } = useGetSeasonalFoodsQuery();
  const { data: areas = [] } = useGetFoodByAreasQuery();

  const [deleteSeasonal] = useDeleteSeasonalFoodMutation();
  const [deleteArea] = useDeleteFoodByAreaMutation();
  const [addSeasonal] = useAddSeasonalFoodMutation();
  const [updateSeasonal] = useUpdateSeasonalFoodMutation();
  const [addArea] = useAddFoodByAreaMutation();
  const [updateArea] = useUpdateFoodByAreaMutation();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [size, setSize] = useState(20);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("NEWEST");
  const [sortOpen, setSortOpen] = useState(false);

  const sizeRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (sizeRef.current && !sizeRef.current.contains(target)) {
        setSizeOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(target)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Modals state
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [isSeasonalModalOpen, setIsSeasonalModalOpen] = useState(false);
  const [editingSeasonal, setEditingSeasonal] = useState<SeasonalFoodImage | null>(null);

  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<FoodByAreaImage | null>(null);

  const allItems = useMemo(() => {
    const unified: UnifiedItem[] = [];

    banners.forEach((b) =>
      unified.push({
        id: b.id,
        type: "banner",
        name: b.name,
        image_url: b.image_url,
        isdisplay: b.isdisplay ?? true,
        extraInfo: b.location || "banner",
        description: b.description,
        originalItem: b,
      }),
    );

    seasonal.forEach((s) =>
      unified.push({
        id: s.id,
        type: "seasonal",
        name: s.name,
        image_url: s.image_url,
        isdisplay: s.isdisplay ?? true,
        extraInfo: s.season,
        description: "",
        originalItem: s,
      }),
    );

    areas.forEach((a) =>
      unified.push({
        id: a.id,
        type: "area",
        name: a.name,
        image_url: a.image_url,
        isdisplay: a.isdisplay ?? true,
        extraInfo: a.location,
        description: a.description,
        originalItem: a,
      }),
    );

    return unified;
  }, [banners, seasonal, areas]);

  const totalCount = allItems.length;
  const activeCount = useMemo(
    () => allItems.filter((item) => item.isdisplay !== false).length,
    [allItems],
  );
  const inactiveCount = totalCount - activeCount;

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const active = item.isdisplay !== false;
      const statusMatches =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && active) ||
        (statusFilter === "INACTIVE" && !active);

      if (!statusMatches) return false;

      const query = search.trim().toLowerCase();
      if (!query) return true;

      return (
        item.name.toLowerCase().includes(query) ||
        item.extraInfo?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    });
  }, [allItems, statusFilter, search]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (sortMode === "A_Z") return a.name.localeCompare(b.name, "km");
      if (sortMode === "Z_A") return b.name.localeCompare(a.name, "km");
      const timeA = (a.originalItem as any)?.createdAt
        ? new Date((a.originalItem as any).createdAt).getTime()
        : 0;
      const timeB = (b.originalItem as any)?.createdAt
        ? new Date((b.originalItem as any).createdAt).getTime()
        : 0;
      return sortMode === "NEWEST" ? timeB - timeA : timeA - timeB;
    });
  }, [filteredItems, sortMode]);

  // Modals Handlers
  const handleBannerSubmit = () => setIsBannerModalOpen(false);
  const handleSeasonalSubmit = async (values: Omit<SeasonalFoodImage, "id">) => {
    if (editingSeasonal) await updateSeasonal({ id: editingSeasonal.id, changes: values });
    else await addSeasonal(values);
    setIsSeasonalModalOpen(false);
  };
  const handleAreaSubmit = async (values: Omit<FoodByAreaImage, "id">) => {
    if (editingArea) await updateArea({ id: editingArea.id, changes: values });
    else await addArea(values);
    setIsAreaModalOpen(false);
  };

  const statusTabs = [
    { value: "ALL" as const, label: "ទាំងអស់", count: totalCount },
    { value: "ACTIVE" as const, label: "សកម្ម", count: activeCount },
    { value: "INACTIVE" as const, label: "អសកម្ម", count: inactiveCount },
  ];

  return (
    <div className="space-y-6">
      <BannersHeader
        totalBanners={banners.length}
        totalSeasonal={seasonal.length}
        totalArea={areas.length}
      />

      {/* Tabs + Controls Toolbar */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/* Status Tabs */}
        <div className="flex w-full min-w-0 gap-2 overflow-x-auto pb-1 xl:w-auto">
          {statusTabs.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-lg font-medium transition ${
                  active
                    ? "bg-primary-800 text-white"
                    : "bg-white text-gray-500 hover:bg-emerald-50 hover:text-[#136C34]"
                }`}
              >
                {tab.label}
                <span
                  className={`flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-lg font-medium ${
                    active ? "bg-white/20 text-white" : "bg-white text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + Size + Sort */}
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center xl:w-auto">
          {/* Search Input */}
          <div className="relative min-w-0 flex-1 sm:min-w-[340px]">
            <Search
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ស្វែងរក រូបបេណឺ..."
              className="h-[52px] w-full rounded-full border border-gray-200 bg-gray-50 pl-12 pr-11 text-lg text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Page size */}
          <div ref={sizeRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setSizeOpen((prev) => !prev);
                setSortOpen(false);
              }}
              className="flex h-[52px] min-w-[150px] items-center justify-between gap-3 rounded-full border border-gray-200 bg-white px-4 text-lg font-medium text-gray-700 transition hover:border-primary-200 hover:bg-primary-50"
            >
              {size} / ទំព័រ
              <ChevronDown size={18} />
            </button>

            {sizeOpen && (
              <div className="absolute right-0 top-[60px] z-[100] w-[180px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                {[10, 20, 50].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setSize(value);
                      setSizeOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-lg transition ${
                      size === value
                        ? "bg-primary-50 font-medium text-primary-800"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {value} / ទំព័រ
                    {size === value && <Check size={18} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          <div ref={sortRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setSortOpen((prev) => !prev);
                setSizeOpen(false);
              }}
              aria-label="Sort"
              title="Sort"
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800"
            >
              <ArrowUpDown size={20} />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-[60px] z-[100] w-[210px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSortMode(option.value);
                      setSortOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-lg transition ${
                      sortMode === option.value
                        ? "bg-primary-50 font-medium text-primary-800"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                    {sortMode === option.value && <Check size={18} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <UnifiedContentTable
        data={sortedItems}
        pageSize={size}
        onEdit={(item) => {
          if (item.type === "banner") {
            setEditingBanner(item.originalItem);
            setIsBannerModalOpen(true);
          } else if (item.type === "seasonal") {
            setEditingSeasonal(item.originalItem);
            setIsSeasonalModalOpen(true);
          } else if (item.type === "area") {
            setEditingArea(item.originalItem);
            setIsAreaModalOpen(true);
          }
        }}
        onDelete={(item) => {
          if (item.type === "seasonal") deleteSeasonal(item.id);
          else if (item.type === "area") deleteArea(item.id);
        }}
      />

      <BannerFormModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        editing={editingBanner}
      />

      <SeasonalFoodFormModal
        open={isSeasonalModalOpen}
        initialData={editingSeasonal}
        onClose={() => setIsSeasonalModalOpen(false)}
        onSubmit={handleSeasonalSubmit}
      />

      <FoodByAreaFormModal
        open={isAreaModalOpen}
        initialData={editingArea}
        onClose={() => setIsAreaModalOpen(false)}
        onSubmit={handleAreaSubmit}
      />
    </div>
  );
}
