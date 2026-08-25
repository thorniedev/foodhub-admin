"use client";

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
  onClose,
}: {
  uuid: string | null;
  onClose: () => void;
}) {
  const {
    data,
    isLoading,
    isError,
  } =
    useGetWeatherConditionByUuidQuery(
      uuid ?? "",
      {
        skip:
          !uuid,
      },
    );

  if (!uuid) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[160] overflow-y-auto bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="mx-auto my-8 w-full max-w-xl rounded-[30px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-primary-800">
              <CloudRain
                size={22}
              />
            </div>

            <div>
              <p className="text-3xl font-black text-primary-800">
                Weather Detail
              </p>

              <p className="mt-1 text-lg text-gray-500">
                Get Weather Condition by UUID
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

<<<<<<< HEAD
        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2
              size={28}
              className="animate-spin text-primary-800"
            />
=======
        {/* ─── BODY ─── */}
        <div className="space-y-6 p-6 sm:p-8">
          {isLoading ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3">
              <Loader2 size={36} className="animate-spin text-primary-700" />
              <p className="text-lg font-medium text-gray-500">
                កំពុងទាញយកព័ត៌មានលម្អិត...
              </p>
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-lg font-medium text-red-600">
              មិនអាចទាញយកព័ត៌មានលម្អិតស្ថានភាពអាកាសធាតុបានទេ។
            </div>
          ) : data ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Code */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-lg font-medium text-primary-800">
                      <Tag size={18} />
                      កូដ (Code)
                    </span>
                    {data.code && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(data.code, "code")}
                        className="rounded-lg p-1 text-gray-400 transition hover:bg-white hover:text-primary-700"
                        title="Copy"
                      >
                        {copiedKey === "code" ? (
                          <Check size={16} className="text-emerald-600" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    )}
                  </div>
                  <p className="mt-2 font-mono text-xl font-bold text-gray-800">
                    {data.code || "—"}
                  </p>
                </div>

                {/* Status */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <span className="block text-lg font-medium text-primary-800">
                    ស្ថានភាព
                  </span>
                  <div className="mt-2">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-lg font-medium ${isActive
                      ? "bg-primary-50 text-primary-700"
                      : "bg-gray-200 text-gray-600"
                      }`}>
                      <span className={`h-2 w-2 rounded-full ${isActive ? "bg-primary-600" : "bg-gray-400"}`} />
                      {isActive ? "សកម្ម (Active)" : "អសកម្ម (Inactive)"}
                    </span>
                  </div>
                </div>

                {/* Local Name */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <span className="flex items-center gap-1.5 text-lg font-medium text-primary-800">
                    <Languages size={18} />
                    ឈ្មោះខ្មែរ
                  </span>
                  <p className="mt-2 text-xl font-bold text-gray-800">
                    {data.localName || <span className="text-gray-400 font-normal">—</span>}
                  </p>
                </div>

                {/* English Name */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <span className="flex items-center gap-1.5 text-lg font-medium text-primary-800">
                    <Globe2 size={18} />
                    English name
                  </span>
                  <p className="mt-2 text-xl font-bold text-gray-800">
                    {data.name || <span className="text-gray-400 font-normal">—</span>}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <span className="flex items-center gap-1.5 text-lg font-medium text-primary-800">
                  <FileText size={18} />
                  ការពិពណ៌នា
                </span>
                <p className="mt-2 text-lg leading-8 text-gray-700">
                  {data.description || (
                    <span className="italic text-gray-400">គ្មានការពិពណ៌នាឡើយ</span>
                  )}
                </p>
              </div>
            </div>
          ) : null}

          {/* ─── FOOTER ─── */}
          <div className="flex justify-end border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary-800 px-8 text-lg font-medium text-white transition hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-200"
            >
              បិទ
            </button>
>>>>>>> origin/mingyeak
          </div>
        ) : isError ? (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-lg text-red-600">
            មិនអាចទាញយក Weather Condition detail បានទេ។
          </div>
        ) : data ? (
          <div className="mt-6 space-y-4">
            <Row
              label="Code"
              value={
                data.code
              }
            />

            <Row
              label="Name"
              value={
                data.name
              }
            />

            <Row
              label="Local name"
              value={
                data.localName ||
                "—"
              }
            />

            <Row
              label="Description"
              value={
                data.description ||
                "—"
              }
            />

            <Row
              label="Status"
              value={
                data.isActive ??
                data.active ??
                true
                  ? "ACTIVE"
                  : "INACTIVE"
              }
            />

            <Row
              label="UUID"
              value={
                data.uuid
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-sm font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-lg font-bold text-gray-800">
        {value}
      </p>
    </div>
  );
}
