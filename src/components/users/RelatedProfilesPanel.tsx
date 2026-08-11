import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
} from "lucide-react";

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
    <section className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#137A3D]">
            <Users size={20} />
          </div>

          <div>
            <p className="text-2xl font-bold text-[#136C34]">
              Profiles របស់អ្នកប្រើ
            </p>

            <p className="mt-1 text-base text-gray-500">
              {data?.totalElements ?? 0} profile(s)
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {[
            { value: "ALL" as const, label: "ទាំងអស់" },
            { value: "ACTIVE" as const, label: "សកម្ម" },
            { value: "INACTIVE" as const, label: "Deleted" },
          ].map((item) => {
            const selected = filter === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onFilterChange(item.value)}
                className={`rounded-full px-3 py-2 text-base transition ${
                  selected
                    ? "bg-[#136C34] text-white"
                    : "bg-gray-50 text-gray-500 hover:bg-emerald-50 hover:text-[#136C34]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
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
            <p className="mt-2 text-base">មិនមាន Profile</p>
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
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-base text-gray-500">
          <span>
            Page {page + 1} / {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={fetching || page <= 0}
              onClick={() => onPageChange(page - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-[#136C34] hover:bg-emerald-50 hover:text-[#136C34] disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              disabled={fetching || page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-[#136C34] hover:bg-emerald-50 hover:text-[#136C34] disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
