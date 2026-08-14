"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, Menu } from "lucide-react";

import { getPageTitle } from "../../config/pageTitles";
import { useSidebar } from "../../context/SidebarContext";

import { useCurrentAdmin } from "@/src/hooks/useCurrentAdmin";

import {
  getAdminDisplayName,
  getAdminInitials,
} from "@/src/lib/currentAdminDisplay";

export default function Topbar() {
  const pathname = usePathname();

  const { title, parent } = getPageTitle(pathname);

  const { toggle } = useSidebar();

  const { admin, isLoading: adminLoading } = useCurrentAdmin();

  const adminName = getAdminDisplayName(admin);

  const adminInitials = getAdminInitials(admin);

  return (
    <header className="sticky top-0 z-40 flex min-h-[84px] flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-white px-4 py-4 md:flex-nowrap md:px-8">
      {/* LEFT */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="flex min-w-0 items-center gap-2 text-base font-semibold text-primary-800 md:text-lg">
          {parent && (
            <>
              <span className="hidden text-gray-400 sm:inline">{parent}</span>

              <span className="hidden text-gray-300 sm:inline">›</span>
            </>
          )}

          <span className="truncate">{title}</span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex w-full flex-wrap items-center justify-between gap-3 md:w-auto md:flex-nowrap md:justify-end md:gap-5">
        {/* Search */}
        <div className="order-3 w-full flex-1 md:order-0 md:mx-4 md:w-auto md:max-w-xl lg:min-w-[320px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="ស្វែងរកម្ហូបអាហារ..."
              className="w-full rounded-full border border-gray-200 py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>
        </div>

        {/* Notifications */}
        {/* <button
          type="button"
          title="Notifications"
          className="relative shrink-0 rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
        </button> */}

        {/* CURRENT LOGGED-IN ADMIN */}
        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold uppercase text-white shadow-sm">
            {adminLoading ? "..." : adminInitials}
          </div>

          <div className="min-w-0">
            <p className="max-w-[160px] truncate text-sm font-semibold text-gray-800">
              {adminLoading ? "Loading..." : adminName}
            </p>

            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
              ADMIN
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
