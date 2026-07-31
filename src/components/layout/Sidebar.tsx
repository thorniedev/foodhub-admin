"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Settings } from "lucide-react";
import { dashboardNav } from "../../config/dashboardNav";
import type { NavItem } from "../../config/dashboardNav";

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(["ប្រភេទអាហារ"]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;

    if (item.children) {
      const isOpen = openMenus.includes(item.label);
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleMenu(item.label)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            <span className="flex items-center gap-3 text-lg font-medium">
              <Icon size={22} />
              {item.label}
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
          {isOpen && (
            <div className="ml-9 mt-1 space-y-1">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`block px-3 py-2 rounded-lg text-sm transition ${
                    pathname === child.href
                      ? "text-emerald-700 font-medium"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    const isActive = item.href === pathname;
    return (
      <Link
        key={item.label}
        href={item.href ?? "#"}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-lg font-medium transition ${
          isActive
            ? "bg-yellow-400 text-gray-900"
            : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        <Icon size={18} />
        {item.label}
      </Link>
    );
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col justify-between">
      <div>
        <div className="h-20 flex items-center px-6">
          <Image src="/Image/logo.png" alt="FoodHub" width={90} height={90} />
        </div>

        <nav className="px-3 mt-2 space-y-1">
          {dashboardNav.map(renderItem)}
        </nav>
      </div>

      <div className="px-3 pb-4 space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <Settings size={18} />
          ការកំណត់
        </Link>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50">
          <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-semibold">
            A
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-800">Admin</p>
            <p className="text-xs text-gray-400">foodhub@gmail.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
