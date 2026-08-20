"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw } from "lucide-react";
import {
  useDeleteBannerMutation,
  useGetAdminBannersQuery,
} from "../../app/store/bannerApi";
import {
  AdminBannerResponse,
  BannerCategory,
  bannerCategories,
  GetAdminBannersParams,
} from "../../types/banner";
import { getAdminApiErrorMessage } from "../../lib/adminApiError";

import BannersHeader from "./banners/BannersHeader";
import BannersFilters, { PublishedFilter } from "./banners/BannersFilters";
import BannersTable from "./banners/BannersTable";
import BannersPagination from "./banners/BannersPagination";
import BannerFormModal from "./banners/BannerFormModal";
import DeleteBannerConfirmModal from "./banners/DeleteBannerConfirmModal";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = 10;

function parseCategory(value: string | null): BannerCategory | "ALL" {
  if (value && (bannerCategories as readonly string[]).includes(value)) {
    return value as BannerCategory;
  }
  return "ALL";
}

function parsePublished(value: string | null): PublishedFilter {
  return value === "PUBLISHED" || value === "UNPUBLISHED" ? value : "ALL";
}

function parsePage(value: string | null): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function parseSize(value: string | null): number {
  const parsed = Number(value);
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(parsed)
    ? parsed
    : DEFAULT_PAGE_SIZE;
}

export default function BannersManager() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = parseCategory(searchParams.get("category"));
  const published = parsePublished(searchParams.get("published"));
  const search = searchParams.get("q") ?? "";
  const page = parsePage(searchParams.get("page"));
  const size = parseSize(searchParams.get("size"));

  const updateParams = useCallback(
    (patch: Record<string, string | number | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === "" || value === "ALL") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdminBannerResponse | null>(
    null,
  );
  const [deletingBanner, setDeletingBanner] =
    useState<AdminBannerResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [deleteBanner] = useDeleteBannerMutation();

  const isPublished =
    published === "ALL" ? undefined : published === "PUBLISHED";

  const listArgs: GetAdminBannersParams = useMemo(
    () => ({
      category: category === "ALL" ? undefined : category,
      isPublished,
      page,
      size,
    }),
    [category, isPublished, page, size],
  );

  const { data, isLoading, isFetching, error, refetch } =
    useGetAdminBannersQuery(listArgs);

  const { data: publishedStats } = useGetAdminBannersQuery({
    isPublished: true,
    page: 0,
    size: 1,
  });

  const banners = useMemo(() => {
    const contents = data?.contents ?? [];
    if (!search.trim()) return contents;
    const term = search.trim().toLowerCase();
    return contents.filter((b) => b.title.toLowerCase().includes(term));
  }, [data, search]);

  const handleConfirmDelete = async () => {
    if (!deletingBanner) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteBanner(deletingBanner.id).unwrap();

      // Deleting the last row on a page beyond the first leaves an empty
      // page — step back so the admin doesn't land on a blank table.
      if ((data?.contents.length ?? 0) === 1 && page > 0) {
        updateParams({ page: page - 1 });
      }

      setDeletingBanner(null);
    } catch (deleteRequestError) {
      setDeleteError(getAdminApiErrorMessage(deleteRequestError));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-6">
      <BannersHeader
        totalBanners={data?.totalElements ?? 0}
        publishedCount={publishedStats?.totalElements ?? 0}
        onAddNew={() => {
          setEditingBanner(null);
          setIsModalOpen(true);
        }}
      />

      <BannersFilters
        category={category}
        onCategoryChange={(value) => updateParams({ category: value, page: 0 })}
        published={published}
        onPublishedChange={(value) => updateParams({ published: value, page: 0 })}
        search={search}
        onSearchChange={(value) => updateParams({ q: value })}
      />

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          <span>{getAdminApiErrorMessage(error)}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-red-700 hover:bg-red-100"
          >
            <RotateCcw size={14} />
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      )}

      <BannersTable
        banners={banners}
        isLoading={isLoading || isFetching}
        listArgs={listArgs}
        onEdit={(banner) => {
          setEditingBanner(banner);
          setIsModalOpen(true);
        }}
        onDeleteRequest={(banner) => {
          setDeleteError(null);
          setDeletingBanner(banner);
        }}
      />

      {deleteError && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {deleteError}
        </p>
      )}

      {data && (
        <BannersPagination
          page={data.pageNumber}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          pageSize={size}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageChange={(nextPage) => updateParams({ page: nextPage })}
          onPageSizeChange={(nextSize) =>
            updateParams({ size: nextSize, page: 0 })
          }
        />
      )}

      {isModalOpen && (
        <BannerFormModal
          onClose={() => setIsModalOpen(false)}
          editing={editingBanner}
          defaultCategory={category === "ALL" ? "MAIN" : category}
        />
      )}

      <DeleteBannerConfirmModal
        banner={deletingBanner}
        loading={isDeleting}
        onClose={() => {
          setDeletingBanner(null);
          setDeleteError(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
