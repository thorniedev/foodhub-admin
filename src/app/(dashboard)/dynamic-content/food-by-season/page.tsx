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

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Dynamic Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-lg font-medium transition-all duration-200 ${
              activeFilter === "all"
                ? "bg-primary-800 text-white"
                : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span>ទាំងអស់</span>
            <span
              className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-lg font-normal ${
                activeFilter === "all" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {seasonal.length}
            </span>
          </button>

          {availableSeasons.map((season) => {
            const count = seasonal.filter((s) => s.season === season).length;
            const active = activeFilter === season;
            return (
              <button
                key={season}
                type="button"
                onClick={() => setActiveFilter(season)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-lg font-medium transition-all duration-200 ${
                  active
                    ? "bg-primary-800 text-white"
                    : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span>{SEASON_LABELS[season] || season}</span>
                <span
                  className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-lg font-normal ${
                    active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-[420px] shrink-0">
          <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកតាមចំណងជើង..."
            className="h-[52px] w-full rounded-full border border-gray-200 bg-white pl-12 pr-4 text-lg font-medium outline-none transition focus:border-primary-600 focus:ring-4 focus:ring-primary-100"
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
