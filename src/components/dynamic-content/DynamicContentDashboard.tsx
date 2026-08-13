"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { useGetBannersQuery } from "../../app/store/bannerApi";
import { useGetSeasonalFoodsQuery, useDeleteSeasonalFoodMutation } from "../../app/store/seasonalFoodApi";
import { useGetFoodByAreasQuery, useDeleteFoodByAreaMutation } from "../../app/store/foodByAreaApi";

import BannersHeader from "./banners/BannersHeader";
import BannersTable from "./banners/BannersTable";
import BannerFormModal from "./banners/BannerFormModal";
import UnifiedContentTable, { UnifiedItem } from "./UnifiedContentTable";
import { Banner } from "../../types/banner";

import SeasonalFoodTable from "./seasonal-food/SeasonalFoodTable";
import SeasonalFoodFormModal from "./seasonal-food/SeasonalFoodFormModal";
import SeasonalFoodBanner from "./seasonal-food/SeasonalFoodBanner";
import { SeasonalFoodImage } from "../../types/seasonalFood";
import { useAddSeasonalFoodMutation, useUpdateSeasonalFoodMutation } from "../../app/store/seasonalFoodApi";

import FoodByAreaTable from "../feedback/FoodByAreaTable";
import FoodByAreaFormModal from "../feedback/FoodByAreaFormModal";
import FoodByAreaBanner from "../feedback/FoodByAreaBanner";
import { FoodByAreaImage } from "../../types/foodByArea";
import { useAddFoodByAreaMutation, useUpdateFoodByAreaMutation } from "../../app/store/foodByAreaApi";

export default function DynamicContentDashboard() {
  const [activeTab, setActiveTab] = useState<"banners" | "seasonal" | "area">("banners");
  const { data: banners = [], isLoading: isBannersLoading } = useGetBannersQuery();
  const { data: seasonal = [], isLoading: isSeasonalLoading } = useGetSeasonalFoodsQuery();
  const { data: areas = [], isLoading: isAreasLoading } = useGetFoodByAreasQuery();

  const [deleteSeasonal] = useDeleteSeasonalFoodMutation();
  const [deleteArea] = useDeleteFoodByAreaMutation();
  const [addSeasonal] = useAddSeasonalFoodMutation();
  const [updateSeasonal] = useUpdateSeasonalFoodMutation();
  const [addArea] = useAddFoodByAreaMutation();
  const [updateArea] = useUpdateFoodByAreaMutation();

  const [search, setSearch] = useState("");

  // Modals state
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [isSeasonalModalOpen, setIsSeasonalModalOpen] = useState(false);
  const [editingSeasonal, setEditingSeasonal] = useState<SeasonalFoodImage | null>(null);

  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<FoodByAreaImage | null>(null);

  // Filter only active items and search
  const activeBanners = useMemo(() => {
    return banners
      .filter((b) => b.isdisplay === true)
      .filter((b) => b.name?.toLowerCase().includes(search.toLowerCase()));
  }, [banners, search]);

  const activeSeasonal = useMemo(() => {
    return seasonal
      .filter((b) => b.isdisplay === true)
      .filter((b) => b.name?.toLowerCase().includes(search.toLowerCase()));
  }, [seasonal, search]);

  const activeAreas = useMemo(() => {
    return areas
      .filter((b) => b.isdisplay === true)
      .filter((b) => b.name?.toLowerCase().includes(search.toLowerCase()));
  }, [areas, search]);

  // Displayed items for the tables (includes inactive for seasonal and area)
  const displayedSeasonal = useMemo(() => {
    return seasonal.filter((b) => b.name?.toLowerCase().includes(search.toLowerCase()));
  }, [seasonal, search]);

  const displayedAreas = useMemo(() => {
    return areas.filter((b) => b.name?.toLowerCase().includes(search.toLowerCase()));
  }, [areas, search]);

  const unifiedActiveItems = useMemo(() => {
    const unified: UnifiedItem[] = [];
    
    activeSeasonal.forEach((s) => unified.push({
      id: s.id,
      type: "seasonal",
      name: s.name,
      image_url: s.image_url,
      isdisplay: s.isdisplay,
      extraInfo: s.season,
      originalItem: s,
    }));

    activeAreas.forEach((a) => unified.push({
      id: a.id,
      type: "area",
      name: a.name,
      image_url: a.image_url,
      isdisplay: a.isdisplay,
      extraInfo: a.location,
      description: a.description,
      originalItem: a,
    }));

    // Search filtering is already handled in the active* variables
    return unified;
  }, [activeBanners, activeSeasonal, activeAreas]);

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

  return (
    <div className="p-3 sm:p-6 space-y-8">
      {activeTab === "banners" && (
        <BannersHeader
          totalBanners={unifiedActiveItems.length}
          totalSeasonal={activeSeasonal.length}
          totalArea={activeAreas.length}
        />
      )}

      {activeTab === "seasonal" && (
        <SeasonalFoodBanner
          total={seasonal.length}
          activeCount={activeSeasonal.length}
          pendingCount={seasonal.length - activeSeasonal.length}
          onAddNew={() => {
            setEditingSeasonal(null);
            setIsSeasonalModalOpen(true);
          }}
        />
      )}

      {activeTab === "area" && (
        <FoodByAreaBanner
          total={areas.length}
          activeCount={activeAreas.length}
          pendingCount={areas.length - activeAreas.length}
          onAddNew={() => {
            setEditingArea(null);
            setIsAreaModalOpen(true);
          }}
        />
      )}

      {/* Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 -mx-1 px-1">
          <button
            onClick={() => setActiveTab("banners")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === "banners"
                ? "bg-[#136C34] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            រូបភាពផ្សព្វផ្សាយ
            <span
              className={`text-xs rounded-full px-1.5 py-0.5 ${
                activeTab === "banners"
                  ? "bg-white/20 text-white"
                  : "bg-white text-gray-500"
              }`}
            >
              {unifiedActiveItems.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab("seasonal")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === "seasonal"
                ? "bg-[#136C34] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            អាហារតាមរដូវកាល
            <span
              className={`text-xs rounded-full px-1.5 py-0.5 ${
                activeTab === "seasonal"
                  ? "bg-white/20 text-white"
                  : "bg-white text-gray-500"
              }`}
            >
              {activeSeasonal.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("area")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === "area"
                ? "bg-[#136C34] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            អាហារតាមតំបន់
            <span
              className={`text-xs rounded-full px-1.5 py-0.5 ${
                activeTab === "area"
                  ? "bg-white/20 text-white"
                  : "bg-white text-gray-500"
              }`}
            >
              {activeAreas.length}
            </span>
          </button>
        </div>

        <div className="relative w-full lg:w-72 shrink-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកខ្លឹមសារ..."
            className="w-full pl-9 pr-3 py-2 text-sm sm:text-base border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Tables Section */}
      {activeTab === "banners" && (
        <UnifiedContentTable
          data={unifiedActiveItems}
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
      )}

      {activeTab === "seasonal" && (
        <SeasonalFoodTable
          data={displayedSeasonal}
          onEdit={(item) => {
            setEditingSeasonal(item);
            setIsSeasonalModalOpen(true);
          }}
          onDelete={(item) => deleteSeasonal(item.id)}
        />
      )}

      {activeTab === "area" && (
        <FoodByAreaTable
          data={displayedAreas}
          onEdit={(item) => {
            setEditingArea(item);
            setIsAreaModalOpen(true);
          }}
          onDelete={(item) => deleteArea(item.id)}
        />
      )}

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
