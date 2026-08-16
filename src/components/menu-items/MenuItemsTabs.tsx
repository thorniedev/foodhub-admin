"use client";

import {
  Globe2,
  LibraryBig,
} from "lucide-react";

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
  onChange: (
    value: MenuItemsPageTab,
  ) => void;
}) {
  const tabs = [
    {
      value: "CATALOG" as const,
      label: "Food Catalog",
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
    <div className="flex items-center gap-2">
      {tabs.map((tab) => {
        const active =
          tab.value === value;

        const Icon = tab.icon;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() =>
              onChange(tab.value)
            }
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-lg font-medium transition ${
              active
                ? "bg-primary-800 text-white"
                : "bg-white text-gray-500 hover:bg-primary-50 hover:text-primary-800"
            }`}
          >
            <Icon size={19} />

            {tab.label}

            <span
              className={`flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-lg ${
                active
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-500"
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
