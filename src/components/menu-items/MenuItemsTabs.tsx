"use client";

import { Globe2, LibraryBig } from "lucide-react";

import type { MenuItemsPageTab } from "@/src/types/menuItem";

export default function MenuItemsTabs({
  value,
  foodCount,
  menuItemCount,
  onChange,
}: {
  value: MenuItemsPageTab;
  foodCount: number;
  menuItemCount: number;
  onChange: (value: MenuItemsPageTab) => void;
}) {
  const tabs = [
    {
      value: "CATALOG" as const,
      label: "Food Catalog សម្រាប់ Store",
      count: foodCount,
      icon: LibraryBig,
    },
    {
      value: "PUBLISHED" as const,
      label: "Published on Website",
      count: menuItemCount,
      icon: Globe2,
    },
  ];

  return (
    <div className="flex min-w-max items-center gap-2 rounded-2xl bg-gray-100 p-1.5">
      {tabs.map((tab) => {
        const active = tab.value === value;
        const Icon = tab.icon;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-black transition ${active
                ? "bg-[#137A3D] text-white shadow-sm"
                : "text-gray-500 hover:bg-white hover:text-gray-800"
              }`}
          >
            <Icon size={17} />
            {tab.label}
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/20 text-white" : "bg-white text-gray-500"
                }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
