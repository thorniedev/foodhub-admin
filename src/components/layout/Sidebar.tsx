"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, X } from "lucide-react";

import { dashboardNav } from "../../config/dashboardNav";
import type { NavItem } from "../../config/dashboardNav";
import { useSidebar } from "../../context/SidebarContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };

  // Check whether this item OR one of its children is active
  const isItemActive = (item: NavItem): boolean => {
    if (item.href === pathname) {
      return true;
    }

    if (item.children) {
      return item.children.some((child) => isItemActive(child));
    }

    return false;
  };

  // Recursive sidebar item
  const renderItem = (item: NavItem, level = 0): React.ReactNode => {
    const Icon = item.icon;

    const hasChildren = item.children && item.children.length > 0;

    const active = isItemActive(item);

    // =========================
    // ITEM WITH CHILDREN
    // =========================
    if (hasChildren) {
      const isOpenMenu = openMenus.includes(item.label);

      return (
        <div key={item.label} className={level > 0 ? "ml-4" : ""}>
          <button
            type="button"
            onClick={() => toggleMenu(item.label)}
            className={`
              w-full
              flex
              items-center
              justify-between
              px-3
              py-2.5
              rounded-lg
              transition

              ${
                active
                  ? "text-[#136C34] bg-emerald-50"
                  : "text-gray-700 hover:bg-gray-50"
              }
            `}
          >
            <span
              className={`flex items-center gap-3 font-medium ${
                level === 0 ? "text-lg" : "text-sm"
              }`}
            >
              {Icon && <Icon size={level === 0 ? 22 : 18} />}

              {item.label}
            </span>

            <ChevronDown
              size={16}
              className={`shrink-0 transition-transform duration-200 ${
                isOpenMenu ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {isOpenMenu && (
            <div className={`mt-1 space-y-1 ${level === 0 ? "ml-6" : "ml-3"}`}>
              {item.children?.map((child) => renderItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    // =========================
    // NORMAL LINK ITEM
    // =========================
    const isActive = item.href === pathname;

    return (
      <Link
        key={`${item.label}-${item.href}`}
        href={item.href ?? "#"}
        onClick={close}
        className={`
          flex
          items-center
          gap-3
          px-3
          py-2.5
          transition

          ${
            level === 0
              ? "rounded-full text-lg font-medium"
              : "rounded-lg text-sm"
          }

          ${
            isActive
              ? level === 0
                ? "bg-[#136C34] text-white"
                : "bg-emerald-50 text-[#136C34] font-semibold"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }
        `}
      >
        {Icon && <Icon size={level === 0 ? 18 : 16} />}

        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* ================= MOBILE OVERLAY ================= */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={close}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
    fixed
    left-0
    top-0
    z-50
    flex
    h-screen
    w-64
    flex-col
    overflow-hidden
    border-r
    border-gray-100
    bg-white
          transition-transform
          duration-300
          ease-in-out

          lg:static
          lg:translate-x-0

          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          {/* ================= LOGO ================= */}
          <div className="flex h-20 shrink-0 items-center justify-between px-6">
            <Image src="/Image/logo.png" alt="FoodHub" width={90} height={90} />

            <button
              type="button"
              onClick={close}
              className="text-gray-500 hover:text-gray-700 lg:hidden"
            >
              <X size={22} />
            </button>
          </div>

          {/* ================= NAVIGATION ================= */}
          <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-6 pt-2">
            {dashboardNav.map((item) => renderItem(item))}
          </nav>
        </div>

        {/* ================= ADMIN PROFILE ================= */}
        {/* <div className="shrink-0 space-y-1 border-t border-gray-100 bg-white px-3 pb-4 pt-3">
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white">
              A
            </div>

            <div className="text-sm">
              <p className="font-medium text-gray-800">Admin</p>

              <p className="text-xs text-gray-400">foodhub@gmail.com</p>
            </div>
          </div>
        </div> */}

        <div className="border-t border-gray-100 p-3">
          <form action="/api/auth/logout" method="post" className="w-full">
            <button
              type="submit"
              className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-gray-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition group-hover:bg-red-100 group-hover:text-red-600">
                <LogOut size={19} />
              </div>

              <div className="min-w-0">
                <p className="mt-0.5 text-lg font-normal text-gray-400 group-hover:text-red-400">
                  ចាកចេញ
                </p>
              </div>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
