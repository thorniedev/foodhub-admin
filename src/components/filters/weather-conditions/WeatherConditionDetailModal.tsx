"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  CloudRain,
  Loader2,
  X,
} from "lucide-react";
import {
  useGetWeatherConditionByUuidQuery,
} from "@/src/app/store/weatherConditionApi";

export default function WeatherConditionDetailModal({
  uuid,
  onToggleStatus,
  onClose,
}: {
  uuid: string | null;
  onToggleStatus?: (uuid: string, nextActive: boolean) => Promise<void> | void;
  onClose: () => void;
}) {
  const {
    data,
    isLoading,
    isError,
  } = useGetWeatherConditionByUuidQuery(
    uuid ?? "",
    {
      skip: !uuid,
    },
  );

  const [localActive, setLocalActive] = useState<boolean | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (data) {
      setLocalActive(data.isActive ?? data.active ?? true);
    }
  }, [data]);

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

  const isActive = localActive ?? (data?.isActive ?? data?.active ?? true);

  const handleToggleStatus = async () => {
    if (!data || isToggling) return;
    const targetUuid = data.uuid || uuid;
    const nextActive = !isActive;

    setLocalActive(nextActive);
    setIsToggling(true);
    try {
      if (onToggleStatus) {
        await onToggleStatus(targetUuid, nextActive);
      }
    } catch (err) {
      console.error("[WeatherConditionDetailModal] Failed to toggle status:", err);
      setLocalActive(!nextActive);
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
      {/* Modal Container */}
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
              <CloudRain size={24} />
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-3xl
                  font-semibold
                  text-primary-800
                "
              >
                ព័ត៌មានលម្អិត ស្ថានភាពអាកាសធាតុ
              </p>

              <p
                className="
                  mt-0.5
                  truncate
                  text-lg
                  text-gray-500
                "
              >
                Weather conditions
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
        {isLoading ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 p-8">
            <Loader2 size={34} className="animate-spin text-primary-800" />
            <p className="text-lg font-medium text-gray-500">
              កំពុងទាញយកព័ត៌មានលម្អិត...
            </p>
          </div>
        ) : isError ? (
          <div className="p-8">
            <div className="rounded-2xl bg-red-50 p-4 text-lg text-red-600">
              មិនអាចទាញយកព័ត៌មានលម្អិត Weather Condition បានទេ។
            </div>
          </div>
        ) : data ? (
          <div className="space-y-4 p-6 sm:p-7">
            {/* Names */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>ឈ្មោះសម្រាប់បង្ហាញ</FieldLabel>
                <div className="flex min-h-[50px] w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg font-medium text-gray-800">
                  {data.localName || "—"}
                </div>
              </div>

              <div>
                <FieldLabel>English name</FieldLabel>
                <div className="flex min-h-[50px] w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg font-medium text-gray-800">
                  {data.name || "—"}
                </div>
              </div>
            </div>

            {/* Code */}
            <div>
              <FieldLabel>កូដ (Code)</FieldLabel>
              <div className="flex min-h-[50px] w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-4 font-mono text-lg font-medium text-gray-800">
                {data.code || "—"}
              </div>
            </div>

            {/* Description */}
            <div>
              <FieldLabel>ការពិពណ៌នា</FieldLabel>
              <div className="min-h-[84px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-lg leading-8 text-gray-800">
                {data.description || "គ្មានការពិពណ៌នាឡើយ"}
              </div>
            </div>

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
        ) : null}
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
