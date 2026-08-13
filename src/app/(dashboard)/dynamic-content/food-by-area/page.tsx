"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useGetFoodByAreasQuery, useDeleteFoodByAreaMutation, useAddFoodByAreaMutation, useUpdateFoodByAreaMutation } from "../../../store/foodByAreaApi";
import FoodByAreaTable from "../../../../components/feedback/FoodByAreaTable";
import FoodByAreaFormModal from "../../../../components/feedback/FoodByAreaFormModal";
import FoodByAreaBanner from "../../../../components/feedback/FoodByAreaBanner";
import { FoodByAreaImage, Area } from "../../../../types/foodByArea";

const AREA_LABELS: Record<Area, string> = {
  phnom_penh: "ភ្នំពេញ",
  siem_reap: "សៀមរាប",
  battambang: "បាត់ដំបង",
  kampot: "កំពត",
  kratie: "ក្រចេះ",
};

export default function FoodByAreaPage() {
  const { data: areas = [] } = useGetFoodByAreasQuery();
  const [deleteArea] = useDeleteFoodByAreaMutation();
  const [addArea] = useAddFoodByAreaMutation();
  const [updateArea] = useUpdateFoodByAreaMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodByAreaImage | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<Area | "all">("all");

  const activeCount = areas.filter((a) => a.isdisplay).length;
  const pendingCount = areas.length - activeCount;

  // Extract unique areas from actual data
  const availableAreas = Array.from(new Set(areas.map((a) => a.location)));

  // Filter data based on search and active tab
  const filteredData = areas.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "all" || a.location === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = async (values: Omit<FoodByAreaImage, "id">) => {
    if (editingItem) await updateArea({ id: editingItem.id, changes: values });
    else await addArea(values);
    setIsModalOpen(false);
  };

  return (
    <div className="p-3 sm:p-6 space-y-8">
      <FoodByAreaBanner
        total={areas.length}
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

          {availableAreas.map((area) => (
            <button
              key={area}
              onClick={() => setActiveFilter(area as Area)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${activeFilter === area
                ? "bg-[#136C34] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {AREA_LABELS[area as Area] || area}
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

      <FoodByAreaTable
        data={filteredData}
        onEdit={(item) => {
          setEditingItem(item);
          setIsModalOpen(true);
        }}
        onDelete={(item) => deleteArea(item.id)}
      />

      <FoodByAreaFormModal
        open={isModalOpen}
        initialData={editingItem}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
