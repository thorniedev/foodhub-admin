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
    <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xs">
      <div className="border-b border-gray-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-800">
            <Users size={22} />
          </div>

          <div>
            <p className="text-2xl font-medium text-primary-800">
              បញ្ជីប្រវត្តិរូប
            </p>

            <p className="mt-0.5 text-lg font-normal text-gray-500">
              {data?.totalElements ?? 0} ប្រវត្តិរូប
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {[
            { value: "ALL" as const, label: "ទាំងអស់" },
            { value: "ACTIVE" as const, label: "សកម្ម" },
            { value: "INACTIVE" as const, label: "ផ្អាកដំណើរការ" },
          ].map((item) => {
            const selected = filter === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onFilterChange(item.value)}
                className={`cursor-pointer rounded-full px-4 py-2 text-lg font-normal transition ${
                  selected
                    ? "bg-primary-800 text-white shadow-xs"
                    : "bg-gray-50 text-gray-600 hover:bg-primary-50 hover:text-primary-800"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-h-[640px] space-y-3 overflow-y-auto p-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {loading ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2 size={32} className="animate-spin text-primary-800" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center text-center text-gray-400">
            <Users size={36} />
            <p className="mt-2 text-lg font-normal">មិនមានប្រវត្តិរូប</p>
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
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 text-lg font-normal text-gray-500">
          <span>
            ទំព័រ {page + 1} / {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={fetching || page <= 0}
              onClick={() => onPageChange(page - 1)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous profile page"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              disabled={fetching || page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next profile page"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
