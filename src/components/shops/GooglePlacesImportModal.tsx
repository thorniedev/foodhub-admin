"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { useRouter } from "next/navigation";

import {
  Check,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Loader2,
  MapPin,
  MapPinned,
  Navigation,
  Phone,
  Search,
  Store,
  X,
} from "lucide-react";

import {
  useCreateStoreFromGoogleMutation,
  useLazyGetGooglePlacePreviewQuery,
  useLazySearchGooglePlacesQuery,
} from "@/src/app/store/shop/shopApi";

import type {
  GooglePlacePreview,
  GooglePlaceResult,
} from "@/src/types/shop";

import {
  extractGooglePlaceId,
  googleResultTitle,
} from "@/src/lib/shopFormat";

import { getShopApiErrorMessage } from "@/src/lib/shopApiError";

import StoreMediaUploader from "./StoreMediaUploader";

interface GooglePlacesImportModalProps {
  open: boolean;
  onClose: () => void;
}

function getPlaceAddress(
  result: GooglePlaceResult,
): string {
  const keys = [
    "formattedAddress",
    "shortFormattedAddress",
    "address",
    "vicinity",
  ];

  for (const key of keys) {
    const value = result[key];

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return "";
}

function getPreviewString(
  preview: GooglePlacePreview,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = preview[key];

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return null;
}

function getPreviewNumber(
  preview: GooglePlacePreview,
  ...keys: string[]
): number | null {
  for (const key of keys) {
    const value = preview[key];

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === "string" &&
      value.trim() &&
      Number.isFinite(Number(value))
    ) {
      return Number(value);
    }
  }

  return null;
}

export default function GooglePlacesImportModal({
  open,
  onClose,
}: GooglePlacesImportModalProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    GooglePlaceResult[]
  >([]);

  const [
    showSuggestions,
    setShowSuggestions,
  ] = useState(false);

  const [activeIndex, setActiveIndex] =
    useState(-1);

  const [hasSearched, setHasSearched] =
    useState(false);

  const [
    selectedPlaceId,
    setSelectedPlaceId,
  ] = useState<string | null>(null);

  const [preview, setPreview] =
    useState<GooglePlacePreview | null>(
      null,
    );

  const [timezone, setTimezone] =
    useState("Asia/Phnom_Penh");

  /*
   * These UUIDs stay hidden from the admin.
   * StoreMediaUploader fills them automatically
   * after the Media API upload succeeds.
   */
  const [
    logoMediaUuid,
    setLogoMediaUuid,
  ] = useState("");

  const [
    coverMediaUuid,
    setCoverMediaUuid,
  ] = useState("");

  const [error, setError] = useState<
    string | null
  >(null);

  const searchRequestId = useRef(0);

  const [
    searchPlaces,
    { isFetching: searching },
  ] = useLazySearchGooglePlacesQuery();

  const [
    getPreview,
    { isFetching: previewing },
  ] = useLazyGetGooglePlacePreviewQuery();

  const [
    createStoreFromGoogle,
    { isLoading: creating },
  ] = useCreateStoreFromGoogleMutation();

  useEffect(() => {
    if (!open) {
      return;
    }

    const cleanQuery = query.trim();

    if (cleanQuery.length < 2) {
      setResults([]);
      setShowSuggestions(false);
      setHasSearched(false);
      setActiveIndex(-1);
      return;
    }

    if (selectedPlaceId) {
      return;
    }

    const timer = window.setTimeout(
      async () => {
        const requestId =
          ++searchRequestId.current;

        try {
          setError(null);

          const response =
            await searchPlaces(
              cleanQuery,
            ).unwrap();

          if (
            requestId !==
            searchRequestId.current
          ) {
            return;
          }

          setResults(response ?? []);
          setHasSearched(true);
          setShowSuggestions(true);
          setActiveIndex(-1);
        } catch (requestError) {
          if (
            requestId !==
            searchRequestId.current
          ) {
            return;
          }

          setResults([]);
          setHasSearched(true);

          setError(
            getShopApiErrorMessage(
              requestError,
            ),
          );
        }
      },
      350,
    );

    return () =>
      window.clearTimeout(timer);
  }, [
    open,
    query,
    selectedPlaceId,
    searchPlaces,
  ]);

  useEffect(() => {
    if (open) {
      return;
    }

    setQuery("");
    setResults([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
    setHasSearched(false);

    setSelectedPlaceId(null);
    setPreview(null);

    setTimezone("Asia/Phnom_Penh");
    setLogoMediaUuid("");
    setCoverMediaUuid("");

    setError(null);
  }, [open]);

  if (!open) {
    return null;
  }

  const runSearch = async () => {
    const cleanQuery = query.trim();

    if (cleanQuery.length < 2) {
      setError(
        "Please enter at least 2 characters.",
      );
      return;
    }

    setSelectedPlaceId(null);
    setPreview(null);

    const requestId =
      ++searchRequestId.current;

    try {
      setError(null);

      const response =
        await searchPlaces(
          cleanQuery,
        ).unwrap();

      if (
        requestId !==
        searchRequestId.current
      ) {
        return;
      }

      setResults(response ?? []);
      setShowSuggestions(true);
      setHasSearched(true);
      setActiveIndex(-1);
    } catch (requestError) {
      setResults([]);
      setHasSearched(true);

      setError(
        getShopApiErrorMessage(
          requestError,
        ),
      );
    }
  };

  const selectPlace = async (
    result: GooglePlaceResult,
    index: number,
  ) => {
    const id =
      extractGooglePlaceId(result);

    if (!id) {
      setError(
        "Google result does not contain a valid placeId.",
      );
      return;
    }

    setQuery(
      googleResultTitle(
        result,
        index,
      ),
    );

    setSelectedPlaceId(id);
    setShowSuggestions(false);
    setActiveIndex(-1);
    setError(null);

    try {
      const response =
        await getPreview(id).unwrap();

      setPreview(response);
    } catch (requestError) {
      setPreview(null);

      setError(
        getShopApiErrorMessage(
          requestError,
        ),
      );
    }
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      !showSuggestions ||
      results.length === 0
    ) {
      if (event.key === "Enter") {
        event.preventDefault();
        void runSearch();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveIndex((current) =>
        Math.min(
          current + 1,
          results.length - 1,
        ),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex((current) =>
        Math.max(current - 1, 0),
      );
      return;
    }

    if (
      event.key === "Enter" &&
      activeIndex >= 0
    ) {
      event.preventDefault();

      const result =
        results[activeIndex];

      if (result) {
        void selectPlace(
          result,
          activeIndex,
        );
      }
      return;
    }

    if (event.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const submit = async () => {
    if (!selectedPlaceId) {
      return;
    }

    try {
      setError(null);

      const previewAddress = String(
        preview?.address ??
          preview?.formattedAddress ??
          preview?.shortFormattedAddress ??
          preview?.vicinity ??
          "",
      );

      let autoCity = "Phnom Penh";
      let autoProvince = "Phnom Penh";

      if (/Siem\s*Reap|សៀមរាប/i.test(previewAddress)) {
        autoCity = "Siem Reap";
        autoProvince = "Siem Reap";
      } else if (/Battambang|បាត់ដំបង/i.test(previewAddress)) {
        autoCity = "Battambang";
        autoProvince = "Battambang";
      } else if (/Sihanouk|ព្រះសីហនុ/i.test(previewAddress)) {
        autoCity = "Preah Sihanouk";
        autoProvince = "Preah Sihanouk";
      } else if (/Kampot|កំពត/i.test(previewAddress)) {
        autoCity = "Kampot";
        autoProvince = "Kampot";
      }

      const store =
        await createStoreFromGoogle({
          placeId:
            selectedPlaceId,

          overrides: {
            city: autoCity,
            province: autoProvince,
            timezone:
              timezone.trim(),

            logoMediaUuid:
              logoMediaUuid || null,

            coverMediaUuid:
              coverMediaUuid || null,
          },
        }).unwrap();

      onClose();

      router.push(
        store?.uuid
          ? `/shops/${store.uuid}`
          : "/shops",
      );

      router.refresh();
    } catch (requestError) {
      setError(
        getShopApiErrorMessage(
          requestError,
        ),
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
      <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-[30px] bg-white shadow-2xl">
        <div className="sticky top-0 z-50 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div>
            <h2 className="flex items-center gap-3 text-4xl font-bold text-[#136C34] md:text-5xl">
              <MapPinned
                size={30}
                className="text-[#137A3D]"
              />

              Import from Google Places
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Search → Preview → Upload
              media → Create
            </p>
          </div>

          <button
            type="button"
            disabled={creating}
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 transition hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section>
            <div className="relative z-40">
              <div className="flex">
                <div className="relative flex-1">
                  <Search
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    value={query}
                    autoComplete="off"
                    placeholder="Search restaurant, cafe, store..."
                    onChange={(event) => {
                      setQuery(
                        event.target.value,
                      );
                      setSelectedPlaceId(
                        null,
                      );
                      setPreview(null);
                      setShowSuggestions(
                        true,
                      );
                      setError(null);
                    }}
                    onFocus={() => {
                      if (
                        results.length > 0 &&
                        !selectedPlaceId
                      ) {
                        setShowSuggestions(
                          true,
                        );
                      }
                    }}
                    onKeyDown={
                      handleKeyDown
                    }
                    className="h-12 w-full rounded-l-2xl border border-r-0 border-gray-200 bg-white pl-12 pr-11 text-lg text-gray-800 outline-none transition focus:border-[#136C34] focus:ring-2 focus:ring-[#136C34]/10"
                  />

                  {searching && (
                    <Loader2
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#137A3D]"
                    />
                  )}
                </div>

                <button
                  type="button"
                  disabled={
                    searching ||
                    query.trim().length < 2
                  }
                  onClick={() =>
                    void runSearch()
                  }
                  className="min-w-[110px] rounded-r-2xl bg-[#136C34] px-5 text-lg text-white transition hover:bg-[#0f592b] disabled:opacity-50"
                >
                  Search
                </button>
              </div>

              {showSuggestions &&
                query.trim().length >= 2 && (
                  <div className="absolute left-0 right-0 top-[58px] z-[100] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                    {searching && (
                      <div className="flex items-center gap-3 px-5 py-5 text-sm text-gray-500">
                        <Loader2
                          size={18}
                          className="animate-spin text-[#137A3D]"
                        />
                        Searching Google
                        Places...
                      </div>
                    )}

                    {!searching &&
                      results.length > 0 && (
                        <div className="max-h-[360px] overflow-y-auto py-2">
                          {results.map(
                            (
                              result,
                              index,
                            ) => {
                              const id =
                                extractGooglePlaceId(
                                  result,
                                );

                              const title =
                                googleResultTitle(
                                  result,
                                  index,
                                );

                              const address =
                                getPlaceAddress(
                                  result,
                                );

                              const active =
                                index ===
                                activeIndex;

                              return (
                                <button
                                  key={
                                    id ??
                                    `place-${index}`
                                  }
                                  type="button"
                                  onMouseDown={(
                                    event,
                                  ) => {
                                    event.preventDefault();
                                    void selectPlace(
                                      result,
                                      index,
                                    );
                                  }}
                                  onMouseEnter={() =>
                                    setActiveIndex(
                                      index,
                                    )
                                  }
                                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${
                                    active
                                      ? "bg-emerald-50"
                                      : "bg-white hover:bg-gray-50"
                                  }`}
                                >
                                  <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                      active
                                        ? "bg-[#137A3D] text-white"
                                        : "bg-emerald-50 text-[#137A3D]"
                                    }`}
                                  >
                                    <MapPin
                                      size={
                                        19
                                      }
                                    />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-black text-gray-900">
                                      {
                                        title
                                      }
                                    </p>

                                    {address && (
                                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                                        {
                                          address
                                        }
                                      </p>
                                    )}
                                  </div>

                                  {id ===
                                    selectedPlaceId && (
                                    <Check
                                      size={
                                        18
                                      }
                                      className="mt-2 shrink-0 text-[#137A3D]"
                                    />
                                  )}
                                </button>
                              );
                            },
                          )}
                        </div>
                      )}

                    {!searching &&
                      hasSearched &&
                      results.length ===
                        0 && (
                        <div className="px-5 py-8 text-center">
                          <MapPin
                            size={28}
                            className="mx-auto text-gray-300"
                          />

                          <p className="mt-2 font-bold text-gray-600">
                            No places found
                          </p>
                        </div>
                      )}
                  </div>
                )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-[24px] bg-gray-50 p-5">
              <h3 className="text-3xl font-bold text-gray-900">
                Preview
              </h3>

              {previewing ? (
                <div className="flex min-h-[240px] flex-col items-center justify-center">
                  <Loader2
                    size={30}
                    className="animate-spin text-[#137A3D]"
                  />

                  <p className="mt-3 text-sm text-gray-400">
                    Loading place
                    information...
                  </p>
                </div>
              ) : preview ? (
                <GooglePlacePreviewCard
                  preview={preview}
                />
              ) : (
                <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-300">
                    <MapPin size={28} />
                  </div>

                  <p className="mt-4 font-bold text-gray-600">
                    Select a location
                  </p>

                  <p className="mt-1 max-w-[280px] text-xs leading-5 text-gray-400">
                    Search for a
                    restaurant or store,
                    then select one from
                    the suggestions.
                  </p>
                </div>
              )}
            </div>

            <label className="block">
              <span className="mb-2 block text-xl font-semibold text-[#F97316]">
                Timezone override
              </span>

              <input
                value={timezone}
                onChange={(event) =>
                  setTimezone(
                    event.target.value,
                  )
                }
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
              />
            </label>

            <div className="grid gap-4 xl:grid-cols-2">
              <StoreMediaUploader
                label="Store logo"
                purpose="STORE_LOGO"
                mediaUuid={
                  logoMediaUuid
                }
                onMediaUuidChange={
                  setLogoMediaUuid
                }
                variant="logo"
              />

              <StoreMediaUploader
                label="Store cover"
                purpose="STORE_COVER"
                mediaUuid={
                  coverMediaUuid
                }
                onMediaUuidChange={
                  setCoverMediaUuid
                }
                variant="cover"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={
                !selectedPlaceId ||
                creating
              }
              onClick={() =>
                void submit()
              }
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#137A3D] font-black text-white transition hover:bg-[#0f6833] disabled:cursor-not-allowed disabled:bg-emerald-700/40"
            >
              {creating ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Store size={18} />
              )}

              {creating
                ? "Creating..."
                : "Create Store from Google"}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function GooglePlacePreviewCard({
  preview,
}: {
  preview: GooglePlacePreview;
}) {
  const displayName =
    getPreviewString(
      preview,
      "displayName",
      "name",
    ) ?? "Google Place";

  const address =
    getPreviewString(
      preview,
      "formattedAddress",
      "shortFormattedAddress",
      "address",
    );

  const phone =
    getPreviewString(
      preview,
      "phoneNumber",
      "internationalPhoneNumber",
      "nationalPhoneNumber",
    );

  const website =
    getPreviewString(
      preview,
      "websiteUrl",
      "websiteUri",
      "website",
    );

  const businessStatus =
    getPreviewString(
      preview,
      "businessStatus",
    );

  const operatingStatus =
    getPreviewString(
      preview,
      "mappedOperatingStatus",
      "operatingStatus",
    );

  const latitude =
    getPreviewNumber(
      preview,
      "latitude",
      "lat",
    );

  const longitude =
    getPreviewNumber(
      preview,
      "longitude",
      "lng",
    );

  const hasCoordinates =
    latitude !== null &&
    longitude !== null;

  const mapsUrl =
    hasCoordinates
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : null;

  return (
    <div className="mt-4 overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 p-5">
        <div className="relative flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#137A3D] text-white shadow-sm">
            <Store size={25} />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-lg font-black leading-6 text-gray-900">
              {displayName}
            </h4>

            {address && (
              <div className="mt-2 flex items-start gap-2 text-sm leading-5 text-gray-500">
                <MapPin
                  size={15}
                  className="mt-0.5 shrink-0 text-[#137A3D]"
                />

                <span>
                  {address}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="relative mt-4 flex flex-wrap gap-2">
          {businessStatus && (
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-black text-blue-700">
              {businessStatus}
            </span>
          )}

          {operatingStatus && (
            <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-[11px] font-black text-emerald-700">
              {operatingStatus}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 p-4">
        {phone && (
          <PreviewInfoRow
            icon={<Phone size={16} />}
            label="Phone"
            value={phone}
          />
        )}

        {website && (
          <div className="rounded-2xl bg-gray-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#137A3D]">
                <Globe2 size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">
                  Website
                </p>

                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 flex items-center gap-1.5 break-all text-sm font-bold text-[#137A3D] hover:underline"
                >
                  {website}
                  <ExternalLink
                    size={13}
                    className="shrink-0"
                  />
                </a>
              </div>
            </div>
          </div>
        )}

        {hasCoordinates && (
          <div className="rounded-2xl bg-gray-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#137A3D]">
                <Navigation
                  size={16}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">
                  Location
                </p>

                <p className="mt-1 text-sm font-bold text-gray-700">
                  {latitude}, {longitude}
                </p>

                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-[#137A3D] hover:underline"
                  >
                    <MapPin size={13} />
                    View on Google Maps
                    <ExternalLink
                      size={12}
                    />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
        <CheckCircle2 size={18} />
        Location selected
      </div>
    </div>
  );
}

function PreviewInfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#137A3D]">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-bold text-gray-700">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
