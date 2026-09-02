"use client";

import { Globe2, LibraryBig, Plus, Store } from "lucide-react";

export default function MenuItemsHeader({
  foodCount,
  menuItemCount,
  availableCount,
  onCreateFood,
  onPublishMenuItem,
}: {
  foodCount: number;
  menuItemCount: number;
  availableCount: number;
  onCreateFood: () => void;
  onPublishMenuItem: () => void;
}) {
  const stats = [
    {
      label: "Food Catalog",
      value: foodCount,
      icon: LibraryBig,
    },
    {
      label: "Published Menu Items",
      value: menuItemCount,
      icon: Globe2,
    },
    {
      label: "Available",
      value: availableCount,
      icon: Store,
    },
  ];

  return (
    <section className="overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#0f7a39,#159447)] p-4 sm:p-7 text-white shadow-[0_18px_50px_rgba(19,122,61,0.18)]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-base sm:text-lg font-bold uppercase tracking-[0.16em] text-emerald-100">
            MhouBahar Catalog & Publishing
          </p>
          <h1 className="mt-1.5 sm:mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold">
            គ្រប់គ្រង Food និង Menu Items
          </h1>
          <p className="mt-2 sm:mt-3 max-w-3xl text-lg sm:text-xl leading-relaxed text-emerald-50/90">
            Food Catalog គឺជា master data ដែល Store អាចជ្រើសយក។ Published Menu Item
            គឺជា Food + Store + តម្លៃ + រូបភាព ដែលបង្ហាញទៅ Website។
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onCreateFood}
            className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-white px-5 font-normal text-lg text-[#137A3D] shadow-sm transition hover:bg-emerald-50"
          >
            <Plus size={20} />
            បន្ថែមមុខម្ហូបថ្មី
          </button>

          <button
            type="button"
            onClick={onPublishMenuItem}
            className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-5 font-normal text-lg text-white backdrop-blur transition hover:bg-white/20"
          >
            <Globe2 size={20} />
            Publish Menu Item
          </button>
        </div>
      </div>

      <div className="mt-5 sm:mt-7 grid grid-cols-3 gap-2 sm:gap-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/10 p-3 sm:p-4 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-base sm:text-xl font-semibold text-emerald-50 truncate">{label}</span>
              <Icon size={20} className="text-emerald-100 shrink-0" />
            </div>
            <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-black tabular-nums">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
