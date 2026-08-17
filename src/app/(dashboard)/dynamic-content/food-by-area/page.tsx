"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { ArrowUpDown, Check, ChevronDown, Search, X } from "lucide-react";
import { useGetFoodByAreasQuery, useDeleteFoodByAreaMutation, useAddFoodByAreaMutation, useUpdateFoodByAreaMutation } from "../../../store/foodByAreaApi";
import FoodByAreaTable from "../../../../components/feedback/FoodByAreaTable";
import FoodByAreaFormModal from "../../../../components/feedback/FoodByAreaFormModal";
import FoodByAreaBanner from "../../../../components/feedback/FoodByAreaBanner";
import { FoodByAreaImage } from "../../../../types/foodByArea";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
type SortMode = "A_Z" | "Z_A" | "NEWEST" | "OLDEST";

const sortOptions: Array<{ value: SortMode; label: string }> = [
  { value: "A_Z", label: "A → Z" },
  { value: "Z_A", label: "Z → A" },
  { value: "NEWEST", label: "ថ្មីបំផុត" },
  { value: "OLDEST", label: "ចាស់បំផុត" },
];

export default function FoodByAreaPage() {
  const { data: areas = [] } = useGetFoodByAreasQuery();
  const [deleteArea] = useDeleteFoodByAreaMutation();
  const [addArea] = useAddFoodByAreaMutation();
  const [updateArea] = useUpdateFoodByAreaMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodByAreaImage | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
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

  const totalCount = areas.length;
  const activeCount = useMemo(
    () => areas.filter((a) => a.isdisplay !== false).length,
    [areas],
  );
  const inactiveCount = totalCount - activeCount;

  // Filter data based on search and active tab and sort
  const filteredData = useMemo(() => {
    const list = areas.filter((a) => {
      const active = a.isdisplay !== false;
      const statusMatches =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && active) ||
        (statusFilter === "INACTIVE" && !active);

      if (!statusMatches) return false;

      const query = search.trim().toLowerCase();
      if (!query) return true;

      return (
        a.name.toLowerCase().includes(query) ||
        a.location?.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query)
      );
    });

    return list.sort((a, b) => {
      if (sortMode === "A_Z") return (a.name || "").localeCompare(b.name || "", "km");
      if (sortMode === "Z_A") return (b.name || "").localeCompare(a.name || "", "km");
      const timeA = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
      const timeB = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
      return sortMode === "NEWEST" ? timeB - timeA : timeA - timeB;
    });
  }, [areas, search, statusFilter, sortMode]);

  const handleSubmit = async (values: Omit<FoodByAreaImage, "id">) => {
    if (editingItem) await updateArea({ id: editingItem.id, changes: values });
    else await addArea(values);
    setIsModalOpen(false);
  };

  const statusTabs = [
    { value: "ALL" as const, label: "ទាំងអស់", count: totalCount },
    { value: "ACTIVE" as const, label: "សកម្ម", count: activeCount },
    { value: "INACTIVE" as const, label: "អសកម្ម", count: inactiveCount },
  ];

  return (
    <div className="space-y-6">
      <FoodByAreaBanner
        total={areas.length}
        activeCount={activeCount}
        pendingCount={inactiveCount}
        onAddNew={() => {
          setEditingItem(null);
          setIsModalOpen(true);
        }}
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

        {/* Search + Controls */}
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
              placeholder="ស្វែងរក រូបអាហារតាមតំបន់..."
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

      <FoodByAreaTable
        data={filteredData}
        pageSize={size}
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
