"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { dashboardNav } from "../../config/dashboardNav";
import type { NavItem } from "../../config/dashboardNav";
import { useSidebar } from "../../context/SidebarContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const [openMenus, setOpenMenus] = useState<string[]>(["ប្រភេទអាហារ"]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;

    if (item.children) {
      const isOpenMenu = openMenus.includes(item.label);
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
              className={`transition-transform ${
                isOpenMenu ? "rotate-180" : ""
              }`}
            />
          </button>
          {isOpenMenu && (
            <div className="ml-9 mt-1 space-y-1">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={close}
                  className={`block px-3 py-2 rounded-lg text-sm transition ${
                    pathname === child.href
                      ? "text-[#136C34] font-medium"
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
        onClick={close}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-lg font-medium transition ${
          isActive ? "bg-[#136C34] text-white" : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        <Icon size={18} />
        {item.label}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          onClick={close}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div>
          <div className="h-20 flex items-center justify-between px-6">
            <Image
              src="/Image/logo.png"
              alt="FoodHub"
              width={90}
              height={90}
            />
            <button
              onClick={close}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X size={22} />
            </button>
          </div>

          <nav className="px-3 mt-2 space-y-1">
            {dashboardNav.map(renderItem)}
          </nav>
        </div>

        <div className="px-3 pb-4 space-y-1">
          {/* <Link
            href="/settings"
            onClick={close}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <Settings size={18} />
            ការកំណត់
          </Link> */}
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
    </>
  );
}