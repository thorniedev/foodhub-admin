"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { getPageTitle } from "../../config/pageTitles";
import { useSidebar } from "../../context/SidebarContext";

import { useCurrentAdmin } from "@/src/hooks/useCurrentAdmin";

import {
  getAdminAvatarCandidate,
  getAdminDisplayName,
  getAdminInitials,
  getAdminRole,
  getAdminUsername,
} from "@/src/lib/currentAdminDisplay";
import GlobalAdminSearch from "./GlobalAdminSearch";
import UserAvatar from "../users/UserAvatar";

export default function Topbar() {
  const pathname = usePathname();

  const { title, parent } = getPageTitle(pathname);

  const { toggle } = useSidebar();

  const { admin, isLoading: adminLoading } = useCurrentAdmin();

  const adminName = getAdminDisplayName(admin);
  const adminUsername = getAdminUsername(admin);
  const adminRole = getAdminRole(admin);
  const { mediaUuid: avatarMediaUuid, directUrl: avatarImageUrl } =
    getAdminAvatarCandidate(admin);

  return (
    <header className="sticky top-0 z-40 flex min-h-[75px] flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-white px-4  md:flex-nowrap md:px-8">
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

        <div className="flex min-w-0 items-center overflow-visible  gap-2 text-base font-semibold text-primary-800 md:text-3xl">
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
        <div className="order-3 w-full flex-1 md:order-0 md:mx-4 md:w-auto md:max-w-xl lg:min-w-[420px]">
          <GlobalAdminSearch />
        </div>

        {/* CURRENT LOGGED-IN ADMIN */}
        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          <UserAvatar
            name={adminName}
            userUuid={admin?.uuid}
            avatarMediaUuid={avatarMediaUuid}
            imageUrl={avatarImageUrl}
            containerClassName="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-700 text-sm font-bold uppercase text-white shadow-sm"
            textClassName="text-sm font-bold uppercase text-white"
          />

          <div className="min-w-0">
            <p className="max-w-[160px] truncate text-sm font-bold text-gray-900">
              {adminLoading ? "..." : adminUsername}
            </p>

            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              {adminLoading ? "..." : adminRole}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
