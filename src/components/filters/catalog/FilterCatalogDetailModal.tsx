"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Loader2,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { getFilterGroupBySlug } from "@/src/config/filterCatalog";
import type { FilterCatalogOption } from "@/src/types/filterCatalog";

type FilterGroup = NonNullable<ReturnType<typeof getFilterGroupBySlug>>;

interface DetailPayload {
  uuid?: string;
  code?: string;
  name?: string;
  localName?: string | null;
  description?: string | null;
  parentUuid?: string | null;
  isActive?: boolean;
  active?: boolean;
  numericValue?: number | null;
  unit?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
}

interface ApiResponseEnvelope<T> {
  status?: number;
  message?: string;
  payload?: T;
  data?: T;
  timestamp?: string;
}

function resolveApiResource(group: FilterGroup): string {
  switch (group.source) {
    case "SEASON_API":
      return "seasons";
    case "EVENT_API":
      return "events";
    case "CUISINE_API":
      return "cuisines";
    case "FOOD_CATEGORY_API":
      return "food-categories";
    case "MEAL_TYPE_API":
      return "meal-types";
    case "WEATHER_CONDITION_API":
      return "weather-conditions";
    default:
      return group.slug;
  }
}

export default function FilterCatalogDetailModal({
  uuid,
  group,
  initialOption,
  options,
  onToggleStatus,
  onClose,
}: {
  uuid: string | null;
  group: FilterGroup;
  initialOption?: FilterCatalogOption | null;
  options?: FilterCatalogOption[];
  onToggleStatus?: (uuid: string, nextActive: boolean) => Promise<void> | void;
  onClose: () => void;
}) {
  const [data, setData] = useState<DetailPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const resource = resolveApiResource(group);
  const endpointPath = `/api/catalog/${resource}/${encodeURIComponent(uuid ?? "")}`;

  useEffect(() => {
    if (!uuid) {
      setData(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const fetchDetail = async () => {
      try {
        const res = await fetch(endpointPath, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const json = (await res.json()) as
          | ApiResponseEnvelope<DetailPayload>
          | DetailPayload;
        if (!isMounted) return;

        let payload: DetailPayload | null = null;
        if (json && typeof json === "object") {
          if (
            "payload" in json &&
            json.payload &&
            typeof json.payload === "object"
          ) {
            payload = json.payload as DetailPayload;
          } else if (
            "data" in json &&
            json.data &&
            typeof json.data === "object"
          ) {
            payload = json.data as DetailPayload;
          } else {
            payload = json as DetailPayload;
          }
        }

        setData(payload);
      } catch (err) {
        if (!isMounted) return;
        console.warn(
          `[FilterCatalogDetailModal] Could not fetch ${endpointPath}:`,
          err,
        );

        if (initialOption) {
          setData({
            uuid: initialOption.uuid,
            code: initialOption.code,
            name: initialOption.name,
            localName: initialOption.localName,
            description: initialOption.description,
            parentUuid: initialOption.parentUuid,
            isActive: initialOption.active,
            active: initialOption.active,
            numericValue: initialOption.numericValue,
            unit: initialOption.unit,
            startTime: initialOption.startTime,
            endTime: initialOption.endTime,
            createdAt: initialOption.createdAt,
            updatedAt: initialOption.updatedAt,
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [uuid, endpointPath, initialOption]);

  /* Lock background scroll while modal is open */
  useEffect(() => {
    if (!uuid) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [uuid]);

  if (!uuid) {
    return null;
  }

  const displayItem =
    data ||
    (initialOption
      ? {
          uuid: initialOption.uuid,
          code: initialOption.code,
          name: initialOption.name,
          localName: initialOption.localName,
          description: initialOption.description,
          parentUuid: initialOption.parentUuid,
          isActive: initialOption.active,
          active: initialOption.active,
          numericValue: initialOption.numericValue,
          unit: initialOption.unit,
          startTime: initialOption.startTime,
          endTime: initialOption.endTime,
          createdAt: initialOption.createdAt,
          updatedAt: initialOption.updatedAt,
        }
      : null);

  const isActive = displayItem?.isActive ?? displayItem?.active ?? true;

  const parentOption = options?.find(
    (opt) => opt.uuid === displayItem?.parentUuid,
  );
  const parentName = parentOption
    ? parentOption.localName || parentOption.name
    : displayItem?.parentUuid
      ? displayItem.parentUuid
      : "គ្មាន (Top Level)";

  const isMealType = group.source === "MEAL_TYPE_API";
  const hasNumericOrUnit =
    (displayItem?.numericValue !== null &&
      displayItem?.numericValue !== undefined) ||
    Boolean(displayItem?.unit);

  const handleToggleStatus = async () => {
    if (!displayItem || isToggling) return;
    const targetUuid = displayItem.uuid || uuid;
    const nextActive = !isActive;

    // Optimistic local update
    setData((prev) =>
      prev
        ? { ...prev, isActive: nextActive, active: nextActive }
        : {
            uuid: targetUuid,
            isActive: nextActive,
            active: nextActive,
          },
    );

    setIsToggling(true);
    try {
      if (onToggleStatus) {
        await onToggleStatus(targetUuid, nextActive);
      }
    } catch (err) {
      console.error("[FilterCatalogDetailModal] Failed to toggle status:", err);
      // Revert on error
      setData((prev) =>
        prev
          ? { ...prev, isActive: !nextActive, active: !nextActive }
          : null,
      );
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[150]
        flex
        items-center
        justify-center
        bg-black/40
        p-4
        backdrop-blur-[3px]
      "
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal */}
      <div
        className="
          w-full
          max-w-2xl
          overflow-hidden
          rounded-3xl
          border
          border-gray-100
          bg-white
          shadow-2xl
        "
      >
        {/* ================= HEADER ================= */}
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-gray-100
            bg-white
            px-6
            py-5
            sm:px-8
          "
        >
          <div className="flex min-w-0 items-center gap-4">
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-primary-50
                text-primary-800
              "
            >
              <SlidersHorizontal size={24} />
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-3xl
                  font-semibold
                  text-primary-800
                "
              >
                ព័ត៌មានលម្អិត {group.labelKm}
              </p>

              <p
                className="
                  mt-0.5
                  truncate
                  text-lg
                  text-gray-500
                "
              >
                {group.labelEn}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-full
              text-gray-400
              transition
              hover:bg-gray-100
              hover:text-gray-700
              focus:outline-none
              focus:ring-4
              focus:ring-gray-100
            "
          >
            <X size={22} />
          </button>
        </div>

        {/* ================= CONTENT ================= */}
        {isLoading && !displayItem ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 p-8">
            <Loader2 size={34} className="animate-spin text-primary-800" />
            <p className="text-lg font-medium text-gray-500">
              កំពុងទាញយកព័ត៌មានលម្អិត...
            </p>
          </div>
        ) : (
          <div className="space-y-4 p-6 sm:p-7">
            {/* Names */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>ឈ្មោះសម្រាប់បង្ហាញ</FieldLabel>
                <div className="flex min-h-[50px] w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg font-medium text-gray-800">
                  {displayItem?.localName || "—"}
                </div>
              </div>

              <div>
                <FieldLabel>English name</FieldLabel>
                <div className="flex min-h-[50px] w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg font-medium text-gray-800">
                  {displayItem?.name || "—"}
                </div>
              </div>
            </div>

            {/* Parent category */}
            {group.source === "FOOD_CATEGORY_API" && (
              <div>
                <FieldLabel>ប្រភេទមេ (Parent Category)</FieldLabel>
                <div className="flex min-h-[50px] w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg font-medium text-gray-800">
                  {parentName}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <FieldLabel>ការពិពណ៌នា</FieldLabel>
              <div className="min-h-[84px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-lg leading-8 text-gray-800">
                {displayItem?.description || "គ្មានការពិពណ៌នាឡើយ"}
              </div>
            </div>

            {/* Meal type times */}
            {isMealType && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>ម៉ោងចាប់ផ្តើម</FieldLabel>
                  <div className="flex min-h-[50px] w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg font-medium text-gray-800">
                    {displayItem?.startTime || "—"}
                  </div>
                </div>

                <div>
                  <FieldLabel>ម៉ោងបញ្ចប់</FieldLabel>
                  <div className="flex min-h-[50px] w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg font-medium text-gray-800">
                    {displayItem?.endTime || "—"}
                  </div>
                </div>
              </div>
            )}

            {/* Numeric and unit */}
            {hasNumericOrUnit && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Numeric value</FieldLabel>
                  <div className="flex min-h-[50px] w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg font-medium text-gray-800">
                    {displayItem?.numericValue ?? "—"}
                  </div>
                </div>

                <div>
                  <FieldLabel>Unit</FieldLabel>
                  <div className="flex min-h-[50px] w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg font-medium text-gray-800">
                    {displayItem?.unit || "—"}
                  </div>
                </div>
              </div>
            )}

            {/* Status (Clickable toggle badge) */}
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5">
              <div className="min-w-0">
                <p className="text-lg font-medium text-primary-800">
                  ស្ថានភាព
                </p>
                <p className="text-base text-gray-500">
                  {isActive
                    ? "បើកដំណើរការក្នុងប្រព័ន្ធ"
                    : "បិទដំណើរការ"}
                </p>
              </div>

              <button
                type="button"
                disabled={isToggling}
                onClick={handleToggleStatus}
                title={
                  isActive
                    ? "ចុចដើម្បីប្តូរទៅជា អសកម្ម"
                    : "ចុចដើម្បីប្តូរទៅជា សកម្ម"
                }
                className={`
                  inline-flex
                  cursor-pointer
                  items-center
                  gap-2.5
                  whitespace-nowrap
                  rounded-full
                  px-4
                  py-2
                  text-lg
                  font-medium
                  transition-all
                  ring-1
                  ring-inset
                  hover:scale-105
                  active:scale-95
                  focus:outline-none
                  focus:ring-4
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  ${
                    isActive
                      ? "bg-primary-50 text-primary-700 ring-primary-200 hover:bg-primary-100 focus:ring-primary-100"
                      : "bg-gray-100 text-gray-600 ring-gray-300 hover:bg-gray-200 focus:ring-gray-200"
                  }
                `}
              >
                {isToggling ? (
                  <Loader2 size={18} className="animate-spin text-primary-800" />
                ) : (
                  <span
                    className={`
                      h-2.5
                      w-2.5
                      shrink-0
                      rounded-full
                      ${isActive ? "bg-primary-600" : "bg-gray-400"}
                    `}
                  />
                )}
                {isActive ? "សកម្ម" : "អសកម្ម"}
              </button>
            </div>

            {/* ================= FOOTER ================= */}
            <div className="flex items-center justify-end border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="
                  inline-flex
                  min-h-12
                  items-center
                  justify-center
                  rounded-full
                  bg-primary-800
                  px-7
                  text-lg
                  font-medium
                  text-white
                  transition
                  hover:bg-primary-900
                  focus:outline-none
                  focus:ring-4
                  focus:ring-primary-200
                "
              >
                បិទ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span
      className="
        mb-2
        block
        text-lg
        font-medium
        text-primary-800
      "
    >
      {children}
    </span>
  );
}
