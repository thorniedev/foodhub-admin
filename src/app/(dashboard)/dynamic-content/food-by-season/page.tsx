"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useGetSeasonalFoodsQuery, useDeleteSeasonalFoodMutation, useAddSeasonalFoodMutation, useUpdateSeasonalFoodMutation } from "../../../store/seasonalFoodApi";
import SeasonalFoodTable from "../../../../components/dynamic-content/seasonal-food/SeasonalFoodTable";
import SeasonalFoodFormModal from "../../../../components/dynamic-content/seasonal-food/SeasonalFoodFormModal";
import SeasonalFoodBanner from "../../../../components/dynamic-content/seasonal-food/SeasonalFoodBanner";
import { SeasonalFoodImage, Season } from "../../../../types/seasonalFood";

const SEASON_LABELS: Record<Season, string> = {
  rainy: "រដូវវស្សា",
  dry: "រដូវប្រាំង",
  hot: "រដូវក្តៅ",
  festival: "ថ្ងៃបុណ្យ",
};

export default function SeasonalFoodPage() {
  const { data: seasonal = [] } = useGetSeasonalFoodsQuery();
  const [deleteSeasonal] = useDeleteSeasonalFoodMutation();
  const [addSeasonal] = useAddSeasonalFoodMutation();
  const [updateSeasonal] = useUpdateSeasonalFoodMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SeasonalFoodImage | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<Season | "all">("all");

  const activeCount = seasonal.filter((s) => s.isdisplay).length;
  const pendingCount = seasonal.length - activeCount;

  // Extract unique seasons from actual data
  const availableSeasons = Array.from(new Set(seasonal.map((s) => s.season)));

  // Filter data based on search and active tab
  const filteredData = seasonal.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "all" || s.season === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = async (values: Omit<SeasonalFoodImage, "id">) => {
    if (editingItem) await updateSeasonal({ id: editingItem.id, changes: values });
    else await addSeasonal(values);
    setIsModalOpen(false);
  };

  return (
    <div className="p-3 sm:p-6 space-y-8">
      <SeasonalFoodBanner
        total={seasonal.length}
        activeCount={activeCount}
        pendingCount={pendingCount}
        onAddNew={() => {
          setEditingItem(null);
          setIsModalOpen(true);
        }}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Dynamic Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 -mx-1 px-1">
          <button
            onClick={() => setActiveFilter("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${activeFilter === "all"
              ? "bg-[#136C34] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            ទាំងអស់ (All)
          </button>

          {availableSeasons.map((season) => (
            <button
              key={season}
              onClick={() => setActiveFilter(season)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${activeFilter === season
                ? "bg-[#136C34] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {SEASON_LABELS[season] || season}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72 shrink-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកតាមចំណងជើង..."
            className="w-full pl-9 pr-3 py-2 text-sm sm:text-base border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
      </div>

      <SeasonalFoodTable
        data={filteredData}
        onEdit={(item) => {
          setEditingItem(item);
          setIsModalOpen(true);
        }}
        onDelete={(item) => deleteSeasonal(item.id)}
      />

      <SeasonalFoodFormModal
        open={isModalOpen}
        initialData={editingItem}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
