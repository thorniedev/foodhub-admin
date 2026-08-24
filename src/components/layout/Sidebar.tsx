"use client";

import { useEffect, useState, type ReactNode } from "react";

import Link from "next/link";
import Image from "next/image";

import { usePathname } from "next/navigation";

import { ChevronDown, LogOut, X } from "lucide-react";

import { markLogoutPending } from "../../lib/redirectToAdminLogin";

import { dashboardNav, type NavItem } from "../../config/dashboardNav";

import { useSidebar } from "../../context/SidebarContext";

// =========================================================
// ACTIVE ROUTE
// =========================================================

function isHrefActive(href: string | undefined, pathname: string): boolean {
  if (!href) {
    return false;
  }

  // Dashboard root must only match "/"
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

// =========================================================
// RECURSIVE ITEM ACTIVE CHECK
// =========================================================

function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (isHrefActive(item.href, pathname)) {
    return true;
  }

  if (item.children) {
    return item.children.some((child) => isNavItemActive(child, pathname));
  }

  return false;
}

// =========================================================
// GET ACTIVE PARENT MENUS
// =========================================================

function getActiveParentMenus(items: NavItem[], pathname: string): string[] {
  return items
    .filter((item) =>
      item.children?.some((child) => isNavItemActive(child, pathname)),
    )
    .map((item) => item.label);
}

export default function Sidebar() {
  const pathname = usePathname();

  const { isOpen, close } = useSidebar();

  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // =======================================================
  // AUTO OPEN ACTIVE PARENT
  // =======================================================

  useEffect(() => {
    const activeParents = getActiveParentMenus(dashboardNav, pathname);

    setOpenMenus((previous) => {
      const next = new Set([...previous, ...activeParents]);

      return Array.from(next);
    });
  }, [pathname]);

  // =======================================================
  // TOGGLE MENU
  // =======================================================

  const toggleMenu = (label: string) => {
    setOpenMenus((previous) =>
      previous.includes(label)
        ? previous.filter((item) => item !== label)
        : [...previous, label],
    );
  };

  // =======================================================
  // RENDER ITEM
  // =======================================================

  const renderItem = (item: NavItem, level = 0): ReactNode => {
    const Icon = item.icon;

    const hasChildren = Boolean(item.children && item.children.length > 0);

    const active = isNavItemActive(item, pathname);

    // =====================================================
    // ITEM WITH CHILDREN
    // =====================================================

    if (hasChildren) {
      const isOpenMenu = openMenus.includes(item.label);

      return (
        <div key={item.label} className={level > 0 ? "ml-4" : ""}>
          <button
            type="button"
            onClick={() => toggleMenu(item.label)}
            className={`
              flex
              w-full
              items-center
              justify-between
              rounded-lg
              px-3
              py-2.5
              transition

              ${
                active
                  ? "bg-emerald-50 text-[#136C34]"
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

    // =====================================================
    // NORMAL LINK
    // =====================================================

    const isActive = isHrefActive(item.href, pathname);

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
              : "rounded-lg text-lg"
          }

          ${
            isActive
              ? level === 0
                ? "bg-[#136C34] text-white"
                : "bg-emerald-50 font-semibold text-[#136C34]"
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
      {/* ============================================= */}
      {/* MOBILE OVERLAY */}
      {/* ============================================= */}

      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={close}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      {/* ============================================= */}
      {/* SIDEBAR */}
      {/* ============================================= */}

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
          {/* ========================================= */}
          {/* LOGO */}
          {/* ========================================= */}

          <div className="flex h-20 shrink-0 items-center justify-between px-6">
            <Link href="/" className="flex items-center">
              <Image
                src="/Image/logo.PNG"
                alt="MhouBahar"
                width={200}
                height={80}
                className="h-30 w-auto object-contain"
                priority
                unoptimized
              />
            </Link>

            <button
              type="button"
              onClick={close}
              className="text-gray-500 transition hover:text-gray-700 lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={22} />
            </button>
          </div>

          {/* ========================================= */}
          {/* NAVIGATION */}
          {/* ========================================= */}

          {/* <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-6 pt-2">
            {dashboardNav.map((item) => renderItem(item))}
          </nav> */}
          <nav
            className="
    min-h-0
    flex-1
    space-y-1
    overflow-y-auto
    overscroll-contain
    px-3
    pb-6
    pt-2

    [scrollbar-width:thin]
    [scrollbar-color:#e5e7eb_transparent]
    [&::-webkit-scrollbar]:w-1.5
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:bg-gray-200
    hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
  "
          >
            {dashboardNav.map((item) => renderItem(item))}
          </nav>
        </div>

        {/* ============================================= */}
        {/* LOGOUT */}
        {/* ============================================= */}

        <div className="shrink-0 border-t border-gray-100 bg-white p-3">
          <form
            action="/api/auth/logout"
            method="post"
            className="w-full"
            onSubmit={markLogoutPending}
          >
            <button
              type="submit"
              className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-gray-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition group-hover:bg-red-100 group-hover:text-red-600">
                <LogOut size={19} />
              </div>

              <div className="min-w-0">
                <p className="mt-0.5 text-lg font-normal text-gray-400 transition group-hover:text-red-400">
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
