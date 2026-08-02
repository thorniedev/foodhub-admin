"use client";

import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { getPageTitle } from "../../config/pageTitles";

export default function Topbar() {
  const pathname = usePathname();
  const { title, parent } = getPageTitle(pathname);

  return (
    <header className="h-20 flex items-center justify-between px-8 border-b border-gray-100 bg-white">
      <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
        {parent && (
          <>
            <span className="text-gray-400">{parent}</span>
            <span className="text-gray-300">›</span>
          </>
        )}
        <span>{title}</span>
      </div>

      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="ស្វែងរកម្ហូបអាហារ និង ភៅជនីយដ្ឋាន..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell size={20} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-orange-500" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-semibold">
            A
          </div>
          <span className="text-sm font-medium text-gray-700">Admin</span>
        </div>
      </div>
    </header>
  );
}