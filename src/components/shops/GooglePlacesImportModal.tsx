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

/**
 * Payload delivered to the parent form via `onImport`.
 * Includes all structured address fields so the form can auto-fill.
 */
export interface GooglePlacesImportPayload {
  placeId: string;
  displayName: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  logoMediaUuid: string;
  coverMediaUuid: string;
  address: {
    commune: string | null;
    district: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
    formattedAddress: string | null;
  };
  rawPreview: GooglePlacePreview | null;
}

interface GooglePlacesImportModalProps {
  open: boolean;
  onClose: () => void;
  /** When provided, fills the parent form instead of directly creating the store. */
  onImport?: (payload: GooglePlacesImportPayload) => void;
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

/**
 * Extract a single address component by matching any of the given Google
 * Places `types`. Returns the `longText` (full name) of the first match.
 */
function getComponentByTypes(
  components: Array<{ longText?: string; shortText?: string; types?: string[] }>,
  ...targetTypes: string[]
): string | null {
  for (const c of components) {
    const types = c.types ?? [];
    if (targetTypes.some((t) => types.includes(t))) {
      return c.longText?.trim() || c.shortText?.trim() || null;
    }
  }
  return null;
}

/**
 * Parse a Google Places preview response into structured address fields.
 *
 * Google Places API (v1 New) returns an `addressComponents` array:
 *   [{ longText, shortText, types: ["sublocality_level_1", ...] }, ...]
 *
 * Cambodia mapping (and generic international fallback):
 *   commune / sangkat  → sublocality_level_1, sublocality, neighborhood, ward
 *   district / khan    → administrative_area_level_2, sublocality_level_2
 *   city / town        → locality, postal_town, administrative_area_level_3
 *   province / capital → administrative_area_level_1
 *   postalCode         → postal_code
 */
function readAddressFromPreview(preview: GooglePlacePreview): {
  commune:          string | null;
  district:         string | null;
  city:             string | null;
  province:         string | null;
  postalCode:       string | null;
  formattedAddress: string | null;
} {
  /* ── Try addressComponents array first (Google Places API v1) ── */
  const rawComponents = (preview as Record<string, unknown>)["addressComponents"];

  if (Array.isArray(rawComponents) && rawComponents.length > 0) {
    type RawComp = { longText?: string; shortText?: string; types?: string[] };
    const comps = rawComponents as RawComp[];

    return {
      /* Commune / Sangkat / Ward / Neighborhood */
      commune: getComponentByTypes(
        comps,
        "sublocality_level_1",
        "sublocality",
        "neighborhood",
        "ward",
        "quarter",
      ),
      /* District / Khan / County */
      district: getComponentByTypes(
        comps,
        "administrative_area_level_2",
        "sublocality_level_2",
      ),
      /* City / Town / Municipality */
      city: getComponentByTypes(
        comps,
        "locality",
        "postal_town",
        "administrative_area_level_3",
      ),
      /* Province / Capital City / State */
      province: getComponentByTypes(
        comps,
        "administrative_area_level_1",
      ),
      postalCode: getComponentByTypes(comps, "postal_code"),
      formattedAddress: getPreviewString(
        preview,
        "formattedAddress",
        "shortFormattedAddress",
        "address",
      ),
    };
  }

  /* ── Fallback: backend already normalised to flat keys ── */
  return {
    commune:          getPreviewString(preview, "commune",  "sublocality", "neighborhood"),
    district:         getPreviewString(preview, "district", "administrative_area_level_2"),
    city:             getPreviewString(preview, "city",     "locality"),
    province:         getPreviewString(preview, "province", "administrative_area_level_1"),
    postalCode:       getPreviewString(preview, "postalCode", "postal_code"),
    formattedAddress: getPreviewString(
      preview,
      "formattedAddress",
      "shortFormattedAddress",
      "address",
    ),
  };
}

export default function GooglePlacesImportModal({
  open,
  onClose,
  onImport,
}: GooglePlacesImportModalProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GooglePlaceResult[]>([]);

  const [showSuggestions, setShowSuggestions] = useState(false);

  const [activeIndex, setActiveIndex] = useState(-1);

  const [hasSearched, setHasSearched] = useState(false);

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const [preview, setPreview] = useState<GooglePlacePreview | null>(null);

  /*
   * Structured address extracted from the preview's addressComponents.
   * Always re-derived when preview changes (see selectPlace).
   */
  const [resolvedAddress, setResolvedAddress] = useState<ReturnType<typeof readAddressFromPreview> | null>(null);

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

      /*
       * Parse addressComponents immediately so the preview card and the
       * onImport payload both have structured address data.
       */
      setResolvedAddress(readAddressFromPreview(response));
    } catch (requestError) {
      setPreview(null);
      setResolvedAddress(null);

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

      /*
       * ── onImport path ──────────────────────────────────────────────────
       * When a parent form provides onImport, we hand the structured data
       * back instead of creating the store ourselves. This lets the admin
       * review and adjust the data in the form before saving.
       */
      if (onImport) {
        const lat = preview
          ? getPreviewNumber(preview, "latitude", "lat")
          : null;
        const lng = preview
          ? getPreviewNumber(preview, "longitude", "lng", "lon")
          : null;

        const displayName = preview
          ? (getPreviewString(preview, "displayName", "name", "storeName") ?? query.trim())
          : query.trim();

        onImport({
          placeId:        selectedPlaceId,
          displayName,
          latitude:       lat,
          longitude:      lng,
          timezone:       timezone.trim() || "Asia/Phnom_Penh",
          logoMediaUuid,
          coverMediaUuid,
          address: {
            commune:          resolvedAddress?.commune          ?? null,
            district:         resolvedAddress?.district         ?? null,
            city:             resolvedAddress?.city             ?? null,
            province:         resolvedAddress?.province         ?? null,
            postalCode:       resolvedAddress?.postalCode       ?? null,
            formattedAddress: resolvedAddress?.formattedAddress ?? null,
          },
          rawPreview: preview,
        });

        onClose();
        return;
      }

      /*
       * ── Direct-create path ─────────────────────────────────────────────
       * No parent form — create the store directly via the backend API.
       * Pass all resolved address fields as overrides so the backend
       * doesn't have to re-parse addressComponents itself.
       */
      const store = await createStoreFromGoogle({
        placeId: selectedPlaceId,

        overrides: {
          timezone:       timezone.trim(),
          logoMediaUuid:  logoMediaUuid  || null,
          coverMediaUuid: coverMediaUuid || null,

          /* Address overrides — fill what the backend might leave null */
          commune:  resolvedAddress?.commune  || null,
          district: resolvedAddress?.district || null,
          city:     resolvedAddress?.city     || null,
          province: resolvedAddress?.province || null,
          postalCode: resolvedAddress?.postalCode || null,
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
                rounded-full
                bg-primary-50
                text-primary-800
              "
            >
              <MapPinned size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-2xl sm:text-3xl font-medium text-[#0F5A2C]">
                នាំចូលព័ត៌មានពី Google Maps
              </p>

              <p className="mt-1 text-lg font-normal leading-relaxed text-gray-500">
                ស្វែងរកទីតាំងហាង ពិនិត្យព័ត៌មាន បន្ថែមរូបភាពបើចាំបាច់ រួចបង្កើតហាងដោយស្វ័យប្រវត្តិ។
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
              bg-gray-100
              text-gray-500
              transition
              hover:bg-gray-200
              focus:outline-none
              focus:ring-2
              focus:ring-gray-200
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
            lg:grid-cols-12
          "
        >
          {/* =================================================
              LEFT: GOOGLE SEARCH
          ================================================== */}

          <section
            className="
    min-w-0
    rounded-3xl
    border
    border-gray-100
    bg-white
    p-6
    sm:p-8
    lg:col-span-5
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
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-primary-50
                    text-primary-800
                  "
                >
                  <Search size={24} />
                </div>

                <p className="text-2xl font-medium text-[#0F5A2C]">
                  ស្វែងរកតាម Google Maps
                </p>
              </div>

              <p className="mt-2 text-lg font-normal leading-7 text-gray-500">
                ស្វែងរកតាមឈ្មោះហាង ភោជនីយដ្ឋាន ហាងកាហ្វេ ឬអាជីវកម្ម (ឧទាហរណ៍៖ Brown Coffee, Starbucks, Amazon...)។
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
                    placeholder="ស្វែងរកឈ្មោះហាង ភោជនីយដ្ឋាន..."
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
                      h-12
                      w-full
                      rounded-full
                      border
                      border-gray-200
                      bg-gray-50
                      pl-12
                      pr-12
                      text-lg
                      font-normal
                      text-gray-800
                      outline-none
                      transition
                      placeholder:text-gray-400
                      hover:border-gray-300
                      focus:border-primary-600
                      focus:bg-white
                      focus:ring-2
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
                    min-h-12
                    shrink-0
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-primary-800
                    px-7
                    text-lg
                    font-normal
                    text-white
                    transition
                    hover:bg-primary-900
                    focus:outline-none
                    focus:ring-2
                    focus:ring-primary-200
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {searching && <Loader2 size={20} className="animate-spin" />}
                  ស្វែងរក
                </button>
              </div>

              {/* URL Tip helper */}
              {(query.includes("maps.app.goo.gl") || query.includes("google.com/maps") || query.includes("http")) && (
                <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-lg font-normal leading-7 text-amber-800">
                  💡 <strong>សម្គាល់៖</strong> Google Maps ស្វែងរកតាម <strong>ឈ្មោះហាង</strong> (ឧទាហរណ៍៖ <em>Brown Coffee</em>, <em>Starbucks BKK</em>)។ សូមបញ្ចូលឈ្មោះហាងជំនួសឱ្យ Link ផែនទី។
                </div>
              )}

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
                    <div className="flex items-center gap-3 px-5 py-5 text-lg font-normal text-gray-500">
                      <Loader2
                        size={20}
                        className="animate-spin text-primary-700"
                      />
                      កំពុងស្វែងរកពី Google Maps...
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
                              ${active
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
                                rounded-full
                                transition
                                ${active
                                  ? "bg-primary-800 text-white"
                                  : "bg-primary-50 text-primary-700"
                                }
                              `}
                            >
                              <MapPin size={20} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-lg font-medium text-gray-800">
                                {title}
                              </p>

                              {address && (
                                <p className="mt-1 line-clamp-2 text-lg font-normal leading-7 text-gray-500">
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
                          rounded-full
                          bg-gray-50
                          text-gray-300
                        "
                      >
                        <MapPin size={26} />
                      </div>

                      <p className="mt-3 text-lg font-normal text-gray-600">
                        មិនមានទីតាំងត្រូវគ្នាឡើយ
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
                  rounded-3xl
                  border
                  border-gray-100
                  bg-gray-50
                  p-6
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
                      rounded-full
                      bg-white
                      text-primary-700
                    "
                  >
                    <MapPin size={20} />
                  </div>

                  <p className="text-lg font-normal leading-7 text-gray-500">
                    ជ្រើសរើសទីតាំងហាងពីលទ្ធផលស្វែងរកខាងលើ ដើម្បីផ្ទុកព័ត៌មានលម្អិតរបស់ហាង។
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* =================================================
              RIGHT: PREVIEW + OVERRIDES + MEDIA
          ================================================== */}

          <section className="min-w-0 space-y-6 lg:col-span-7">
            {/* PREVIEW */}

            <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-primary-50
                    text-primary-800
                  "
                >
                  <Store size={24} />
                </div>

                <p className="text-2xl font-medium text-[#0F5A2C]">
                  ព័ត៌មានមើលជាមុន (Preview)
                </p>
              </div>

              {previewing ? (
                <div className="flex min-h-[250px] flex-col items-center justify-center">
                  <Loader2
                    size={32}
                    className="animate-spin text-primary-700"
                  />

                  <p className="mt-3 text-lg font-normal text-gray-500">
                    កំពុងផ្ទុកព័ត៌មានទីតាំង...
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
                      rounded-full
                      bg-primary-50
                      text-primary-700
                    "
                  >
                    <MapPin size={28} />
                  </div>

                  <p className="mt-4 text-lg font-normal text-gray-600">
                    សូមជ្រើសរើសទីតាំង
                  </p>

                  <p className="mt-2 max-w-sm text-lg font-normal leading-7 text-gray-500">
                    ស្វែងរកឈ្មោះហាង ឬអាជីវកម្ម រួចចុចជ្រើសរើសពីលទ្ធផលដើម្បីមើលព័ត៌មានលម្អិត។
                  </p>
                </div>
              )}
            </div>

            {/* TIMEZONE */}

            <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-primary-50
                    text-primary-800
                  "
                >
                  <Globe2 size={24} />
                </div>

                <p className="text-2xl font-medium text-[#0F5A2C]">
                  ការកំណត់បន្ថែម
                </p>
              </div>

              <label className="block">
                <span className="mb-2 block text-lg font-normal text-gray-700">
                  តំបន់ពេលវេលា (Timezone)
                </span>

                <input
                  value={timezone}
                  onChange={(event) => setTimezone(event.target.value)}
                  placeholder="Asia/Phnom_Penh"
                  className="
                    h-12
                    w-full
                    rounded-full
                    border
                    border-gray-200
                    bg-gray-50
                    px-5
                    text-lg
                    font-normal
                    text-gray-800
                    outline-none
                    transition
                    placeholder:text-gray-400
                    hover:border-gray-300
                    focus:border-primary-600
                    focus:bg-white
                    focus:ring-2
                    focus:ring-primary-100
                  "
                />
              </label>
            </div>

            {/* MEDIA */}

            <div className="grid gap-5 xl:grid-cols-2">
              <StoreMediaUploader
                label="រូបសញ្ញាហាង (Logo)"
                purpose="STORE_LOGO"
                mediaUuid={logoMediaUuid}
                onMediaUuidChange={setLogoMediaUuid}
                variant="logo"
              />

              <StoreMediaUploader
                label="រូបគម្របហាង (Cover)"
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
                  font-normal
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
              font-normal
              text-gray-600
              transition
              hover:border-primary-200
              hover:bg-primary-50
              hover:text-primary-800
              focus:outline-none
              focus:ring-2
              focus:ring-primary-100
              disabled:cursor-not-allowed
              disabled:opacity-50
              sm:w-auto
            "
          >
            បោះបង់
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
              font-normal
              text-white
              transition
              hover:bg-primary-900
              focus:outline-none
              focus:ring-2
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

            {creating ? "កំពុងបង្កើត..." : "បង្កើតហាងពី Google Maps"}
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
            label="លេខទូរស័ព្ទ"
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
                <p className="text-lg font-medium text-primary-800">កូអរដោនេទីតាំង</p>

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
                    មើលនៅលើ Google Maps
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
        បានជ្រើសរើសទីតាំងរួចរាល់
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
