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

import type { GooglePlacePreview, GooglePlaceResult } from "@/src/types/shop";

import { extractGooglePlaceId, googleResultTitle } from "@/src/lib/shopFormat";

import { getShopApiErrorMessage } from "@/src/lib/shopApiError";

import StoreMediaUploader from "./StoreMediaUploader";

interface GooglePlacesImportModalProps {
  open: boolean;
  onClose: () => void;
}

function getPlaceAddress(result: GooglePlaceResult): string {
  const keys = [
    "formattedAddress",
    "shortFormattedAddress",
    "address",
    "vicinity",
  ];

  for (const key of keys) {
    const value = result[key];

    if (typeof value === "string" && value.trim()) {
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

    if (typeof value === "string" && value.trim()) {
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

    if (typeof value === "number" && Number.isFinite(value)) {
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
  const [results, setResults] = useState<GooglePlaceResult[]>([]);

  const [showSuggestions, setShowSuggestions] = useState(false);

  const [activeIndex, setActiveIndex] = useState(-1);

  const [hasSearched, setHasSearched] = useState(false);

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const [preview, setPreview] = useState<GooglePlacePreview | null>(null);

  const [timezone, setTimezone] = useState("Asia/Phnom_Penh");

  /*
   * These UUIDs stay hidden from the admin.
   * StoreMediaUploader fills them automatically
   * after the Media API upload succeeds.
   */
  const [logoMediaUuid, setLogoMediaUuid] = useState("");

  const [coverMediaUuid, setCoverMediaUuid] = useState("");

  const [error, setError] = useState<string | null>(null);

  const searchRequestId = useRef(0);

  const [searchPlaces, { isFetching: searching }] =
    useLazySearchGooglePlacesQuery();

  const [getPreview, { isFetching: previewing }] =
    useLazyGetGooglePlacePreviewQuery();

  const [createStoreFromGoogle, { isLoading: creating }] =
    useCreateStoreFromGoogleMutation();

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

    const timer = window.setTimeout(async () => {
      const requestId = ++searchRequestId.current;

      try {
        setError(null);

        const response = await searchPlaces(cleanQuery).unwrap();

        if (requestId !== searchRequestId.current) {
          return;
        }

        setResults(response ?? []);
        setHasSearched(true);
        setShowSuggestions(true);
        setActiveIndex(-1);
      } catch (requestError) {
        if (requestId !== searchRequestId.current) {
          return;
        }

        setResults([]);
        setHasSearched(true);

        setError(getShopApiErrorMessage(requestError));
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [open, query, selectedPlaceId, searchPlaces]);

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
      setError("Please enter at least 2 characters.");
      return;
    }

    setSelectedPlaceId(null);
    setPreview(null);

    const requestId = ++searchRequestId.current;

    try {
      setError(null);

      const response = await searchPlaces(cleanQuery).unwrap();

      if (requestId !== searchRequestId.current) {
        return;
      }

      setResults(response ?? []);
      setShowSuggestions(true);
      setHasSearched(true);
      setActiveIndex(-1);
    } catch (requestError) {
      setResults([]);
      setHasSearched(true);

      setError(getShopApiErrorMessage(requestError));
    }
  };

  const selectPlace = async (result: GooglePlaceResult, index: number) => {
    const id = extractGooglePlaceId(result);

    if (!id) {
      setError("Google result does not contain a valid placeId.");
      return;
    }

    setQuery(googleResultTitle(result, index));

    setSelectedPlaceId(id);
    setShowSuggestions(false);
    setActiveIndex(-1);
    setError(null);

    try {
      const response = await getPreview(id).unwrap();

      setPreview(response);
    } catch (requestError) {
      setPreview(null);

      setError(getShopApiErrorMessage(requestError));
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || results.length === 0) {
      if (event.key === "Enter") {
        event.preventDefault();
        void runSearch();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveIndex((current) => Math.min(current + 1, results.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();

      const result = results[activeIndex];

      if (result) {
        void selectPlace(result, activeIndex);
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

      const store = await createStoreFromGoogle({
        placeId: selectedPlaceId,

        overrides: {
          timezone: timezone.trim(),

          logoMediaUuid: logoMediaUuid || null,

          coverMediaUuid: coverMediaUuid || null,
        },
      }).unwrap();

      onClose();

      router.push(store?.uuid ? `/shops/${store.uuid}` : "/shops");

      router.refresh();
    } catch (requestError) {
      setError(getShopApiErrorMessage(requestError));
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
    >
      <div
        className="
          max-h-[94vh]
          w-full
          max-w-6xl
          overflow-y-auto
          rounded-3xl
          border
          border-gray-100
          bg-white
          shadow-2xl
          [scrollbar-width:none]
          [-ms-overflow-style:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {/* =================================================
            MODAL HEADER
        ================================================== */}

        <div
          className="
            sticky
            top-0
            z-50
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-gray-100
            bg-white/95
            px-6
            py-5
            backdrop-blur-md
            sm:px-8
          "
        >
          <div className="flex min-w-0 items-start gap-4">
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
              <MapPinned size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-3xl font-semibold text-primary-800">
                Import from Google Places
              </p>

              <p className="mt-1 text-lg leading-7 text-gray-500">
                Search for a place, review its information, add media if needed,
                then create the Store.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={creating}
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
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X size={22} />
          </button>
        </div>

        {/* =================================================
            MODAL BODY
        ================================================== */}

        <div
          className="
            grid
            gap-6
            p-6
            sm:p-8
            lg:grid-cols-[0.9fr_1.1fr]
          "
        >
          {/* =================================================
              LEFT: GOOGLE SEARCH
          ================================================== */}

          <section
            className="
    min-w-0
    rounded-2xl
    border
    border-gray-100
    bg-white
    p-5
    sm:p-6
    lg:sticky
    lg:top-[118px]
    lg:self-start
    lg:z-30
  "
          >
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary-50
                    text-primary-800
                  "
                >
                  <Search size={22} />
                </div>

                <p className="text-3xl font-semibold text-primary-800">
                  Search Google Places
                </p>
              </div>

              <p className="mt-2 text-lg leading-7 text-gray-500">
                Search by restaurant, cafe, food store, or business name.
              </p>
            </div>

            <div className="relative z-40">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={20}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                    "
                  />

                  <input
                    value={query}
                    autoComplete="off"
                    placeholder="Search restaurant, cafe, store..."
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setSelectedPlaceId(null);
                      setPreview(null);
                      setShowSuggestions(true);
                      setError(null);
                    }}
                    onFocus={() => {
                      if (results.length > 0 && !selectedPlaceId) {
                        setShowSuggestions(true);
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    className="
                      h-[52px]
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-gray-50
                      pl-12
                      pr-12
                      text-lg
                      text-gray-800
                      outline-none
                      transition
                      placeholder:text-gray-400
                      hover:border-gray-300
                      focus:border-primary-600
                      focus:bg-white
                      focus:ring-4
                      focus:ring-primary-100
                    "
                  />

                  {searching && (
                    <Loader2
                      size={20}
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        animate-spin
                        text-primary-700
                      "
                    />
                  )}
                </div>

                <button
                  type="button"
                  disabled={searching || query.trim().length < 2}
                  onClick={() => void runSearch()}
                  className="
                    inline-flex
                    min-h-[52px]
                    shrink-0
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-primary-800
                    px-6
                    text-lg
                    font-medium
                    text-white
                    transition
                    hover:bg-primary-900
                    focus:outline-none
                    focus:ring-4
                    focus:ring-primary-200
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {searching && <Loader2 size={20} className="animate-spin" />}
                  Search
                </button>
              </div>

              {/* Suggestions */}

              {showSuggestions && query.trim().length >= 2 && (
                <div
                  className="
                    absolute
                    left-0
                    right-0
                    top-[64px]
                    z-[100]
                    overflow-hidden
                    rounded-2xl
                    border
                    border-gray-100
                    bg-white
                    shadow-[0_20px_60px_rgba(15,23,42,0.14)]
                  "
                >
                  {searching && (
                    <div className="flex items-center gap-3 px-5 py-5 text-lg text-gray-500">
                      <Loader2
                        size={20}
                        className="animate-spin text-primary-700"
                      />
                      Searching Google Places...
                    </div>
                  )}

                  {!searching && results.length > 0 && (
                    <div
                      className="
                        max-h-[360px]
                        overflow-y-auto
                        py-2
                        [scrollbar-width:thin]
                      "
                    >
                      {results.map((result, index) => {
                        const id = extractGooglePlaceId(result);

                        const title = googleResultTitle(result, index);

                        const address = getPlaceAddress(result);

                        const active = index === activeIndex;

                        return (
                          <button
                            key={id ?? `place-${index}`}
                            type="button"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              void selectPlace(result, index);
                            }}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={`
                              flex
                              w-full
                              items-start
                              gap-3
                              px-4
                              py-4
                              text-left
                              transition
                              ${
                                active
                                  ? "bg-primary-50"
                                  : "bg-white hover:bg-gray-50"
                              }
                            `}
                          >
                            <div
                              className={`
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                ${
                                  active
                                    ? "bg-primary-800 text-white"
                                    : "bg-primary-50 text-primary-800"
                                }
                              `}
                            >
                              <MapPin size={20} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-lg font-semibold text-gray-800">
                                {title}
                              </p>

                              {address && (
                                <p className="mt-1 line-clamp-2 text-lg leading-7 text-gray-500">
                                  {address}
                                </p>
                              )}
                            </div>

                            {id === selectedPlaceId && (
                              <Check
                                size={20}
                                className="mt-2 shrink-0 text-primary-700"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {!searching && hasSearched && results.length === 0 && (
                    <div className="px-5 py-8 text-center">
                      <div
                        className="
                          mx-auto
                          flex
                          h-14
                          w-14
                          items-center
                          justify-center
                          rounded-2xl
                          bg-gray-50
                          text-gray-300
                        "
                      >
                        <MapPin size={26} />
                      </div>

                      <p className="mt-3 text-lg font-medium text-gray-600">
                        No places found
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!selectedPlaceId && (
              <div
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-gray-100
                  bg-gray-50
                  p-5
                "
              >
                <div className="flex items-start gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-white
                      text-primary-700
                    "
                  >
                    <MapPin size={20} />
                  </div>

                  <p className="text-lg leading-7 text-gray-500">
                    Select a Google Place from the search suggestions to load
                    its Store information.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* =================================================
              RIGHT: PREVIEW + OVERRIDES + MEDIA
          ================================================== */}

          <section className="min-w-0 space-y-6">
            {/* PREVIEW */}

            <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary-50
                    text-primary-800
                  "
                >
                  <Store size={22} />
                </div>

                <p className="text-3xl font-semibold text-primary-800">
                  Preview
                </p>
              </div>

              {previewing ? (
                <div className="flex min-h-[250px] flex-col items-center justify-center">
                  <Loader2
                    size={32}
                    className="animate-spin text-primary-700"
                  />

                  <p className="mt-3 text-lg text-gray-500">
                    Loading place information...
                  </p>
                </div>
              ) : preview ? (
                <GooglePlacePreviewCard preview={preview} />
              ) : (
                <div className="flex min-h-[250px] flex-col items-center justify-center px-5 text-center">
                  <div
                    className="
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      bg-primary-50
                      text-primary-700
                    "
                  >
                    <MapPin size={28} />
                  </div>

                  <p className="mt-4 text-lg font-medium text-gray-600">
                    Select a location
                  </p>

                  <p className="mt-2 max-w-sm text-lg leading-7 text-gray-500">
                    Search for a restaurant or store, then choose one from the
                    suggestions to preview its details.
                  </p>
                </div>
              )}
            </div>

            {/* TIMEZONE */}

            <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary-50
                    text-primary-800
                  "
                >
                  <Globe2 size={22} />
                </div>

                <p className="text-3xl font-semibold text-primary-800">
                  Store settings
                </p>
              </div>

              <label className="block">
                <span className="mb-2 block text-lg font-medium text-primary-800">
                  Timezone override
                </span>

                <input
                  value={timezone}
                  onChange={(event) => setTimezone(event.target.value)}
                  placeholder="Asia/Phnom_Penh"
                  className="
                    h-[52px]
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    px-4
                    text-lg
                    text-gray-800
                    outline-none
                    transition
                    placeholder:text-gray-400
                    hover:border-gray-300
                    focus:border-primary-600
                    focus:bg-white
                    focus:ring-4
                    focus:ring-primary-100
                  "
                />
              </label>
            </div>

            {/* MEDIA */}

            <div className="grid gap-5 xl:grid-cols-2">
              <StoreMediaUploader
                label="Store logo"
                purpose="STORE_LOGO"
                mediaUuid={logoMediaUuid}
                onMediaUuidChange={setLogoMediaUuid}
                variant="logo"
              />

              <StoreMediaUploader
                label="Store cover"
                purpose="STORE_COVER"
                mediaUuid={coverMediaUuid}
                onMediaUuidChange={setCoverMediaUuid}
                variant="cover"
              />
            </div>

            {/* ERROR */}

            {error && (
              <div
                className="
                  rounded-2xl
                  border
                  border-red-100
                  bg-red-50
                  px-5
                  py-4
                  text-lg
                  leading-7
                  text-red-600
                "
              >
                {error}
              </div>
            )}
          </section>
        </div>

        {/* =================================================
            STICKY FOOTER ACTIONS
        ================================================== */}

        <div
          className="
            sticky
            bottom-0
            z-40
            flex
            flex-col-reverse
            gap-3
            border-t
            border-gray-100
            bg-white/95
            px-6
            py-4
            backdrop-blur-md
            sm:flex-row
            sm:items-center
            sm:justify-end
            sm:px-8
          "
        >
          <button
            type="button"
            disabled={creating}
            onClick={onClose}
            className="
              inline-flex
              min-h-[52px]
              w-full
              items-center
              justify-center
              rounded-full
              border
              border-gray-200
              bg-white
              px-7
              text-lg
              font-medium
              text-gray-600
              transition
              hover:border-primary-200
              hover:bg-primary-50
              hover:text-primary-800
              focus:outline-none
              focus:ring-4
              focus:ring-primary-100
              disabled:cursor-not-allowed
              disabled:opacity-50
              sm:w-auto
            "
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!selectedPlaceId || creating}
            onClick={() => void submit()}
            className="
              inline-flex
              min-h-[52px]
              w-full
              items-center
              justify-center
              gap-2
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
              disabled:cursor-not-allowed
              disabled:opacity-50
              sm:w-auto
            "
          >
            {creating ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Store size={20} />
            )}

            {creating ? "Creating..." : "Create Store from Google"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   GOOGLE PLACE PREVIEW CARD
========================================================= */

function GooglePlacePreviewCard({ preview }: { preview: GooglePlacePreview }) {
  const displayName =
    getPreviewString(preview, "displayName", "name") ?? "Google Place";

  const address = getPreviewString(
    preview,
    "formattedAddress",
    "shortFormattedAddress",
    "address",
  );

  const phone = getPreviewString(
    preview,
    "phoneNumber",
    "internationalPhoneNumber",
    "nationalPhoneNumber",
  );

  const website = getPreviewString(
    preview,
    "websiteUrl",
    "websiteUri",
    "website",
  );

  const businessStatus = getPreviewString(preview, "businessStatus");

  const operatingStatus = getPreviewString(
    preview,
    "mappedOperatingStatus",
    "operatingStatus",
  );

  const latitude = getPreviewNumber(preview, "latitude", "lat");

  const longitude = getPreviewNumber(preview, "longitude", "lng");

  const hasCoordinates = latitude !== null && longitude !== null;

  const mapsUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : null;

  return (
    <div
      className="
        mt-5
        overflow-hidden
        rounded-2xl
        border
        border-gray-100
        bg-white
      "
    >
      {/* =================================================
          PLACE IDENTITY
      ================================================== */}

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className="
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-primary-800
              text-white
            "
          >
            <Store size={25} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-2xl font-semibold leading-8 text-primary-800">
              {displayName}
            </p>

            {address && (
              <div className="mt-2 flex items-start gap-2 text-lg leading-7 text-gray-500">
                <MapPin size={20} className="mt-1 shrink-0 text-primary-700" />

                <span>{address}</span>
              </div>
            )}
          </div>
        </div>

        {(businessStatus || operatingStatus) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {businessStatus && (
              <span
                className="
                  inline-flex
                  items-center
                  rounded-full
                  bg-gray-100
                  px-3
                  py-1.5
                  text-lg
                  font-medium
                  text-gray-600
                "
              >
                {businessStatus}
              </span>
            )}

            {operatingStatus && (
              <span
                className="
                  inline-flex
                  items-center
                  rounded-full
                  bg-primary-50
                  px-3
                  py-1.5
                  text-lg
                  font-medium
                  text-primary-700
                "
              >
                {operatingStatus}
              </span>
            )}
          </div>
        )}
      </div>

      {/* =================================================
          INFORMATION
      ================================================== */}

      <div className="space-y-3 border-t border-gray-100 p-4">
        {phone && (
          <PreviewInfoRow
            icon={<Phone size={20} />}
            label="Phone"
            value={phone}
          />
        )}

        {website && (
          <div className="rounded-2xl bg-gray-50 px-4 py-4">
            <div className="flex items-start gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  text-primary-700
                "
              >
                <Globe2 size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-lg font-medium text-primary-800">វែបសាយ</p>

                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    mt-1
                    flex
                    items-start
                    gap-2
                    break-all
                    text-lg
                    leading-7
                    text-primary-700
                    transition
                    hover:text-primary-900
                    hover:underline
                  "
                >
                  <span className="min-w-0">{website}</span>

                  <ExternalLink size={19} className="mt-1 shrink-0" />
                </a>
              </div>
            </div>
          </div>
        )}

        {hasCoordinates && (
          <div className="rounded-2xl bg-gray-50 px-4 py-4">
            <div className="flex items-start gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  text-primary-700
                "
              >
                <Navigation size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-lg font-medium text-primary-800">Location</p>

                <p className="mt-1 break-words text-lg leading-7 text-gray-700">
                  {latitude}, {longitude}
                </p>

                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      mt-2
                      inline-flex
                      items-center
                      gap-2
                      text-lg
                      font-medium
                      text-primary-700
                      transition
                      hover:text-primary-900
                      hover:underline
                    "
                  >
                    <MapPin size={19} />
                    View on Google Maps
                    <ExternalLink size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =================================================
          SELECTED STATUS
      ================================================== */}

      <div
        className="
          flex
          items-center
          gap-2
          border-t
          border-primary-100
          bg-primary-50
          px-4
          py-3
          text-lg
          font-medium
          text-primary-700
        "
      >
        <CheckCircle2 size={20} />
        Location selected
      </div>
    </div>
  );
}

/* =========================================================
   PREVIEW INFO ROW
========================================================= */

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
    <div className="rounded-2xl bg-gray-50 px-4 py-4">
      <div className="flex items-start gap-3">
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-white
            text-primary-700
          "
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-lg font-medium text-primary-800">{label}</p>

          <p className="mt-1 break-words text-lg leading-7 text-gray-700">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
