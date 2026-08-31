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
    <header className="sticky top-0 z-40 flex h-[68px] sm:h-[75px] items-center justify-between gap-2.5 sm:gap-4 border-b border-gray-100 bg-white px-3 sm:px-6 md:px-8">
      {/* LEFT: Menu button & Title */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={toggle}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 lg:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5 text-base sm:text-lg font-normal text-primary-800 md:text-2xl">
          {parent && (
            <>
              <span className="hidden text-gray-400 sm:inline">{parent}</span>
              <span className="hidden text-gray-300 sm:inline">›</span>
            </>
          )}

          <span className="truncate max-w-[85px] xs:max-w-[120px] sm:max-w-none font-medium text-primary-800">{title}</span>
        </div>
      </div>

      {/* CENTER: Global Search in the SAME top row */}
      <div className="flex-1 min-w-0 max-w-full sm:max-w-xl md:max-w-2xl lg:min-w-[420px] xl:min-w-[560px]">
        <GlobalAdminSearch />
      </div>

      {/* RIGHT: CURRENT LOGGED-IN ADMIN */}
      <div
        className="hidden shrink-0 items-center gap-3 sm:flex"
        suppressHydrationWarning
      >
        <UserAvatar
          name={adminName}
          avatarMediaUuid={avatarMediaUuid}
          imageUrl={avatarImageUrl}
          containerClassName="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-700 text-sm font-bold uppercase text-white shadow-sm"
          textClassName="text-sm font-bold uppercase text-white"
        />

        <div className="min-w-0" suppressHydrationWarning>
          <p
            className="max-w-[140px] truncate text-sm font-bold text-gray-900"
            suppressHydrationWarning
          >
            {adminLoading ? "..." : adminUsername}
          </p>

          <p
            className="text-[11px] font-bold uppercase tracking-wider text-emerald-700"
            suppressHydrationWarning
          >
            {adminLoading ? "..." : adminRole}
          </p>
        </div>
      </div>
    </header>
  );
}
