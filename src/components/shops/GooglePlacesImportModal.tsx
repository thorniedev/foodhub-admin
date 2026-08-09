"use client";
import { useState } from "react";
import { Loader2, MapPinned, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCreateStoreFromGoogleMutation,
  useLazyGetGooglePlacePreviewQuery,
  useLazySearchGooglePlacesQuery,
} from "@/src/app/store/shopApi";
import type { GooglePlacePreview, GooglePlaceResult } from "@/src/types/shop";
import { extractGooglePlaceId, googleResultTitle } from "@/src/lib/shopFormat";
import { getShopApiErrorMessage } from "@/src/lib/shopApiError";

export default function GooglePlacesImportModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(""),
    [results, setResults] = useState<GooglePlaceResult[]>([]);
  const [placeId, setPlaceId] = useState<string | null>(null),
    [preview, setPreview] = useState<GooglePlacePreview | null>(null);
  const [timezone, setTimezone] = useState("Asia/Phnom_Penh"),
    [logo, setLogo] = useState(""),
    [cover, setCover] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [search, { isFetching: searching }] = useLazySearchGooglePlacesQuery();
  const [getPreview, { isFetching: previewing }] =
    useLazyGetGooglePlacePreviewQuery();
  const [create, { isLoading: creating }] = useCreateStoreFromGoogleMutation();
  if (!open) return null;

  const runSearch = async () => {
    if (!query.trim()) return;
    try {
      setError(null);
      setResults(await search(query.trim()).unwrap());
      setPlaceId(null);
      setPreview(null);
    } catch (e) {
      setError(getShopApiErrorMessage(e));
    }
  };
  const select = async (result: GooglePlaceResult) => {
    const id = extractGooglePlaceId(result);
    if (!id)
      return setError(
        "Result មិនមាន placeId ដែលអាច detect បាន។ Collection មិនមាន response DTO។",
      );
    try {
      setPlaceId(id);
      setPreview(await getPreview(id).unwrap());
    } catch (e) {
      setError(getShopApiErrorMessage(e));
    }
  };
  const submit = async () => {
    if (!placeId) return;
    try {
      const s = await create({
        placeId,
        overrides: {
          timezone: timezone.trim(),
          logoMediaUuid: logo.trim() || null,
          coverMediaUuid: cover.trim() || null,
        },
      }).unwrap();
      onClose();
      router.push(s?.uuid ? `/shops/${s.uuid}` : "/shops");
      router.refresh();
    } catch (e) {
      setError(getShopApiErrorMessage(e));
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-[30px] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex justify-between border-b bg-white px-6 py-5">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black">
              <MapPinned className="text-[#137A3D]" />
              Import from Google Places
            </h2>
            <p className="text-sm text-gray-500">Search → Preview → Create</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <div>
            <div className="flex">
              <label className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void runSearch()}
                  className="h-12 w-full rounded-l-2xl border border-r-0 pl-11"
                />
              </label>
              <button
                onClick={() => void runSearch()}
                className="rounded-r-2xl bg-[#137A3D] px-5 font-black text-white"
              >
                {searching ? "..." : "Search"}
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {results.map((r, i) => {
                const id = extractGooglePlaceId(r);
                return (
                  <button
                    key={id ?? i}
                    onClick={() => void select(r)}
                    className={`w-full rounded-2xl border p-4 text-left ${id === placeId ? "border-emerald-300 bg-emerald-50" : "border-gray-100"}`}
                  >
                    <p className="font-black">{googleResultTitle(r, i)}</p>
                    {/* <p className="mt-1 break-all text-xs text-gray-400">
                      placeId: {id ?? "not detected"}
                    </p> */}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl bg-gray-50 p-4">
              <h3 className="font-black">Preview</h3>
              {previewing ? (
                <div className="p-10 text-center">
                  <Loader2 className="mx-auto animate-spin" />
                </div>
              ) : preview ? (
                <pre className="mt-3 max-h-[280px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-xs text-white">
                  {JSON.stringify(preview, null, 2)}
                </pre>
              ) : (
                <p className="mt-3 text-sm text-gray-400">Select result</p>
              )}
            </div>
            <Field
              label="Timezone override"
              value={timezone}
              onChange={setTimezone}
            />
            <Field label="Logo media UUID" value={logo} onChange={setLogo} />
            <Field label="Cover media UUID" value={cover} onChange={setCover} />
            {/* <div className="rounded-2xl bg-blue-50 px-4 py-3 text-xs text-blue-700">
              Google response DTO មិនមានក្នុង collection ដូច្នេះ preview បង្ហាញ
              real JSON ដោយមិន fabricate schema។
            </div> */}
            {error && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <button
              disabled={!placeId || creating}
              onClick={() => void submit()}
              className="h-12 w-full rounded-2xl bg-[#137A3D] font-black text-white disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Store from Google"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border px-3"
      />
    </label>
  );
}
