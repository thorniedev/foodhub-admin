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
              {areas.length}
            </span>
          </button>

          {availableAreas.map((area) => {
            const count = areas.filter((a) => a.location === area).length;
            const active = activeFilter === area;
            return (
              <button
                key={area}
                type="button"
                onClick={() => setActiveFilter(area as Area)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-lg font-medium transition-all duration-200 ${
                  active
                    ? "bg-primary-800 text-white"
                    : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span>{AREA_LABELS[area as Area] || area}</span>
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
