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
    <section className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#0f7a39,#159447)] p-5 text-white shadow-[0_18px_50px_rgba(19,122,61,0.18)] sm:p-7">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-100">
            FoodHub Catalog & Publishing
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            គ្រប់គ្រង Food និង Menu Items
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-50/90 sm:text-base">
            Food Catalog គឺជា master data ដែល Store អាចជ្រើសយក។ Published Menu Item
            គឺជា Food + Store + តម្លៃ + រូបភាព ដែលបង្ហាញទៅ Website។
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onCreateFood}
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 font-black text-[#137A3D] shadow-sm transition hover:bg-emerald-50"
          >
            <Plus size={18} />
            បន្ថែម Food Catalog
          </button>

          <button
            type="button"
            onClick={onPublishMenuItem}
            className="inline-flex h-12 items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-5 font-black text-white backdrop-blur transition hover:bg-white/20"
          >
            <Globe2 size={18} />
            Publish Menu Item
          </button>
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-emerald-50">{label}</span>
              <Icon size={18} className="text-emerald-100" />
            </div>
            <p className="mt-2 text-3xl font-black">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
