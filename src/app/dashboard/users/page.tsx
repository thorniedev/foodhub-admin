"use client";

import { useMemo, useState } from "react";
// import { useGetUsersQuery } from "../../../store/userApi";
import UsersTable from "../../../components/users/UsersTable";
import { Search } from "lucide-react";
import { AppUser } from "../../../types/user";
import { useGetUsersQuery } from "../../store/userApi";

type Filter = "all" | AppUser["status"];

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "ទាំងអស់" },
  { key: "active", label: "កំពុងដំណើរការ" },
  { key: "pending", label: "កំពុងរង់ចាំ" },
  { key: "suspended", label: "បានផ្អាក" },
];

export default function UsersPage() {
  const { data, isLoading } = useGetUsersQuery();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const base = { all: 0, active: 0, pending: 0, suspended: 0 };
    data?.forEach((u) => {
      base.all += 1;
      base[u.status] += 1;
    });
    return base;
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data
      .filter((u) => filter === "all" || u.status === filter)
      .filter((u) => u.name.includes(search) || u.phone.includes(search));
  }, [data, filter, search]);

  if (isLoading || !data) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">អ្នកប្រើប្រាស់</h2>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === tab.key
                  ? "bg-emerald-800 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filter === tab.key ? "bg-white/20" : "bg-gray-100 text-gray-500"
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកឈ្មោះ, លេខទូរស័ព្ទ..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      <UsersTable users={filtered} showShop />
    </div>
  );
}