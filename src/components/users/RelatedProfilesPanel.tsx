import { ChevronLeft, ChevronRight, Loader2, Users } from "lucide-react";

import type {
  AdminPage,
  AdminProfile,
  ProfileStatusFilter,
} from "@/src/types/userProfile";

import ProfileTagCard from "./ProfileTagCard";

interface RelatedProfilesPanelProps {
  data: AdminPage<AdminProfile> | undefined;
  loading: boolean;
  fetching: boolean;
  filter: ProfileStatusFilter;
  selectedProfileUuid: string | null;
  onFilterChange: (filter: ProfileStatusFilter) => void;
  onSelectProfile: (profileUuid: string) => void;
  onPageChange: (page: number) => void;
}

export default function RelatedProfilesPanel({
  data,
  loading,
  fetching,
  filter,
  selectedProfileUuid,
  onFilterChange,
  onSelectProfile,
  onPageChange,
}: RelatedProfilesPanelProps) {
  const profiles = data?.contents ?? [];
  const page = data?.pageNumber ?? 0;
  const totalPages = Math.max(data?.totalPages ?? 0, 1);

  return (
    <section className="rounded-[26px] border border-gray-100 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
      <div className="border-b border-gray-100 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#137A3D]">
            <Users size={20} />
          </div>
          <div>
            <h2 className="font-black text-gray-900">Profiles របស់អ្នកប្រើ</h2>
            <p className="text-xs text-gray-500">
              {data?.totalElements ?? 0} profile(s)
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { value: "ALL" as const, label: "ទាំងអស់" },
            { value: "ACTIVE" as const, label: "សកម្ម" },
            { value: "INACTIVE" as const, label: "Deleted" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onFilterChange(item.value)}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                filter === item.value
                  ? "bg-[#137A3D] text-white"
                  : "bg-gray-50 text-gray-500 hover:bg-emerald-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[640px] space-y-3 overflow-y-auto p-4">
        {loading ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2 size={26} className="animate-spin text-[#137A3D]" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center text-center text-gray-400">
            <Users size={34} />
            <p className="mt-2 text-sm font-bold">មិនមាន Profile</p>
          </div>
        ) : (
          profiles.map((profile) => (
            <ProfileTagCard
              key={profile.uuid}
              profile={profile}
              selected={selectedProfileUuid === profile.uuid}
              onSelect={() => onSelectProfile(profile.uuid)}
            />
          ))
        )}
      </div>

      {!loading && (
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
          <span>
            Page {page + 1} / {totalPages}
          </span>

          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={fetching || page <= 0}
              onClick={() => onPageChange(page - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={fetching || page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
