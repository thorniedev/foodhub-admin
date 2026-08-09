"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { useRouter } from "next/navigation";

import {
  Check,
  Loader2,
  MapPin,
  MapPinned,
  Search,
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

  const [logo, setLogo] = useState("");
  const [cover, setCover] = useState("");

  const [error, setError] = useState<
    string | null
  >(null);

  const [hasSearched, setHasSearched] =
    useState(false);

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

  // ===============================
  // AUTO SEARCH / AUTOCOMPLETE
  // ===============================
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

    // User already selected a suggestion.
    if (selectedPlaceId) {
      return;
    }

    const timer = window.setTimeout(
      async () => {
        const currentRequestId =
          ++searchRequestId.current;

        try {
          setError(null);

          const response =
            await searchPlaces(
              cleanQuery,
            ).unwrap();

          // Ignore older search requests.
          if (
            currentRequestId !==
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
            currentRequestId !==
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

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    open,
    query,
    selectedPlaceId,
    searchPlaces,
  ]);

  // ===============================
  // RESET WHEN MODAL CLOSES
  // ===============================
  useEffect(() => {
    if (open) {
      return;
    }

    setQuery("");
    setResults([]);
    setShowSuggestions(false);
    setSelectedPlaceId(null);
    setPreview(null);
    setActiveIndex(-1);
    setHasSearched(false);
    setError(null);
  }, [open]);

  if (!open) {
    return null;
  }

  // ===============================
  // MANUAL SEARCH BUTTON
  // ===============================
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

    const currentRequestId =
      ++searchRequestId.current;

    try {
      setError(null);

      const response =
        await searchPlaces(
          cleanQuery,
        ).unwrap();

      if (
        currentRequestId !==
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

  // ===============================
  // SELECT SUGGESTION
  // ===============================
  const selectPlace = async (
    result: GooglePlaceResult,
    index: number,
  ) => {
    const id =
      extractGooglePlaceId(result);

    if (!id) {
      setError(
        "Result does not contain a valid placeId.",
      );

      return;
    }

    const title =
      googleResultTitle(
        result,
        index,
      );

    setQuery(title);
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

  // ===============================
  // KEYBOARD CONTROL
  // ===============================
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

  // ===============================
  // CREATE STORE
  // ===============================
  const submit = async () => {
    if (!selectedPlaceId) {
      return;
    }

    try {
      setError(null);

      const store =
        await createStoreFromGoogle({
          placeId:
            selectedPlaceId,

          overrides: {
            timezone:
              timezone.trim(),

            logoMediaUuid:
              logo.trim() || null,

            coverMediaUuid:
              cover.trim() || null,
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
      <div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-[30px] bg-white shadow-2xl">
        {/* HEADER */}
        <div className="sticky top-0 z-50 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div>
            <h2 className="flex items-center gap-3 text-3xl font-black text-gray-950">
              <MapPinned
                size={30}
                className="text-[#137A3D]"
              />

              Import from Google Places
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Search → Preview → Create
            </p>
          </div>

          <button
            type="button"
            disabled={creating}
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 transition hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="grid gap-6 p-6 lg:grid-cols-2">
          {/* LEFT */}
          <section>
            <div className="relative z-40">
              {/* SEARCH INPUT */}
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

                      // If user types again,
                      // clear old selection.
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
                    className="h-12 w-full rounded-l-2xl border border-r-0 border-gray-200 bg-white pl-12 pr-11 text-sm font-medium text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
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
                    query.trim().length <
                      2
                  }
                  onClick={() =>
                    void runSearch()
                  }
                  className="min-w-[100px] rounded-r-2xl bg-[#137A3D] px-5 text-sm font-black text-white transition hover:bg-[#0f6833] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Search
                </button>
              </div>

              {/* AUTOCOMPLETE */}
              {showSuggestions &&
                query.trim().length >=
                  2 && (
                  <div className="absolute left-0 right-0 top-[58px] z-[100] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                    {searching && (
                      <div className="flex items-center gap-3 px-5 py-5 text-sm text-gray-500">
                        <Loader2
                          size={18}
                          className="animate-spin text-[#137A3D]"
                        />

                        Searching...
                      </div>
                    )}

                    {!searching &&
                      results.length >
                        0 && (
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
                                      : "hover:bg-gray-50"
                                  }`}
                                >
                                  <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                      active
                                        ? "bg-[#137A3D] text-white"
                                        : "bg-emerald-50 text-[#137A3D]"
                                    }`}
                                  >
                                    <MapPin
                                      size={
                                        18
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
                                      className="mt-2 text-[#137A3D]"
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

                          <p className="mt-1 text-xs text-gray-400">
                            Try another
                            restaurant or
                            store name.
                          </p>
                        </div>
                      )}
                  </div>
                )}

              {/* <p className="mt-2 text-xs text-gray-400">
                Type at least 2 characters.
                Suggestions appear
                automatically.
              </p> */}
            </div>
          </section>

          {/* RIGHT */}
          <section className="space-y-4">
            {/* PREVIEW */}
            <div className="rounded-[24px] bg-gray-50 p-5">
              <h3 className="text-2xl font-black text-gray-900">
                Preview
              </h3>

              {previewing ? (
                <div className="flex min-h-[150px] items-center justify-center">
                  <Loader2
                    size={28}
                    className="animate-spin text-[#137A3D]"
                  />
                </div>
              ) : preview ? (
                <pre className="mt-4 max-h-[260px] overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-slate-950 p-4 text-xs leading-5 text-white">
                  {JSON.stringify(
                    preview,
                    null,
                    2,
                  )}
                </pre>
              ) : (
                <p className="mt-4 text-sm text-gray-400">
                  Select a suggestion to
                  preview the place.
                </p>
              )}
            </div>

            <Field
              label="Timezone override"
              value={timezone}
              onChange={setTimezone}
            />

            <Field
              label="Logo media UUID"
              value={logo}
              onChange={setLogo}
            />

            <Field
              label="Cover media UUID"
              value={cover}
              onChange={setCover}
            />

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
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#137A3D] font-black text-white transition hover:bg-[#0f6833] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating && (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
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

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-gray-800">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
      />
    </label>
  );
}