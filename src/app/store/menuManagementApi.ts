// "use client";

// import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

// import { adminBaseApi } from "./adminBaseApi";

// import type {
//   ApiPage,
//   CuisineOption,
//   FoodCategoryOption,
//   FoodRecord,
//   FoodWritePayload,
//   IngredientOption,
//   ListParams,
//   MenuItemRecord,
//   MenuItemWritePayload,
//   PublicMenuItemListParams,
//   StoreOption,
// } from "@/src/types/menu-management";

// type BackendEnvelope<T> = {
//   status?: number;
//   message?: string;
//   payload?: T;
//   data?: T;
//   timestamp?: string;
// };

// function unwrap<T>(
//   value: BackendEnvelope<T> | T,
// ): T {
//   if (value && typeof value === "object") {
//     const wrapper = value as BackendEnvelope<T>;

//     if (wrapper.payload !== undefined) {
//       return wrapper.payload;
//     }

//     if (wrapper.data !== undefined) {
//       return wrapper.data;
//     }
//   }

//   return value as T;
// }

// function normalizePage<T>(
//   value:
//     | BackendEnvelope<
//         Partial<ApiPage<T>> & {
//           contents?: T[];
//         }
//       >
//     | (Partial<ApiPage<T>> & {
//         contents?: T[];
//       })
//     | T[],
// ): ApiPage<T> {
//   const raw = unwrap(value);

//   if (Array.isArray(raw)) {
//     return {
//       content: raw,
//       number: 0,
//       size: raw.length,
//       numberOfElements: raw.length,
//       totalElements: raw.length,
//       totalPages: 1,
//       first: true,
//       last: true,
//       empty: raw.length === 0,
//     };
//   }

//   const content = raw.content ?? raw.contents ?? [];

//   return {
//     content,
//     number: raw.number ?? 0,
//     size: raw.size ?? content.length,
//     numberOfElements:
//       raw.numberOfElements ?? content.length,
//     totalElements:
//       raw.totalElements ?? content.length,
//     totalPages: Math.max(raw.totalPages ?? 1, 1),
//     first: raw.first ?? true,
//     last: raw.last ?? true,
//     empty: raw.empty ?? content.length === 0,
//   };
// }

// function toError(
//   status: number | "FETCH_ERROR",
//   data: unknown,
// ): FetchBaseQueryError {
//   if (status === "FETCH_ERROR") {
//     return {
//       status: "FETCH_ERROR",
//       error:
//         typeof data === "string"
//           ? data
//           : "Network request failed.",
//     };
//   }

//   return {
//     status,
//     data,
//   };
// }

// async function browserRequest<T>(
//   url: string,
//   init?: RequestInit,
// ): Promise<
//   | { data: T }
//   | { error: FetchBaseQueryError }
// > {
//   try {
//     const response = await fetch(url, {
//       credentials: "include",
//       cache: "no-store",
//       ...init,
//     });

//     if (response.status === 204) {
//       return {
//         data: undefined as T,
//       };
//     }

//     const text = await response.text();

//     let body: unknown = text;

//     if (text) {
//       try {
//         body = JSON.parse(text);
//       } catch {
//         body = text;
//       }
//     }

//     if (!response.ok) {
//       return {
//         error: toError(response.status, body),
//       };
//     }

//     return {
//       data: body as T,
//     };
//   } catch (error) {
//     return {
//       error: toError(
//         "FETCH_ERROR",
//         error instanceof Error
//           ? error.message
//           : "Network request failed.",
//       ),
//     };
//   }
// }

// function makeQuery(
//   params:
//     | Record<
//         string,
//         string | number | boolean | undefined
//       >
//     | undefined,
// ): string {
//   if (!params) {
//     return "";
//   }

//   const search = new URLSearchParams();

//   Object.entries(params).forEach(([key, value]) => {
//     if (
//       value === undefined ||
//       value === ""
//     ) {
//       return;
//     }

//     search.set(key, String(value));
//   });

//   const value = search.toString();

//   return value ? `?${value}` : "";
// }

// function makeMultipart(
//   key: "food" | "request",
//   payload: unknown,
//   images: File[],
// ): FormData {
//   const form = new FormData();

//   form.append(
//     key,
//     new Blob(
//       [JSON.stringify(payload)],
//       {
//         type: "application/json",
//       },
//     ),
//   );

//   images.slice(0, 4).forEach((image) => {
//     form.append("images", image);
//   });

//   return form;
// }

// export const menuManagementApi =
//   adminBaseApi.injectEndpoints({
//     endpoints: (builder) => ({
//       getManagedFoodCategories:
//         builder.query<FoodCategoryOption[], void>({
//           async queryFn() {
//             const result = await browserRequest<unknown>(
//               "/api/catalog/food-categories?size=200",
//             );

//             if ("error" in result) {
//               return result;
//             }

//             return {
//               data:
//                 normalizePage<FoodCategoryOption>(
//                   result.data as never,
//                 ).content,
//             };
//           },
//         }),

//       getManagedCuisines:
//         builder.query<CuisineOption[], void>({
//           async queryFn() {
//             const result = await browserRequest<unknown>(
//               "/api/catalog/cuisines?page=0&size=100",
//             );

//             if ("error" in result) {
//               return result;
//             }

//             return {
//               data:
//                 normalizePage<CuisineOption>(
//                   result.data as never,
//                 ).content,
//             };
//           },
//         }),

//       getManagedIngredients:
//         builder.query<IngredientOption[], void>({
//           async queryFn() {
//             const result = await browserRequest<unknown>(
//               "/api/admin/catalog/ingredients?page=0&size=100&sort=name%2Casc",
//             );

//             if ("error" in result) {
//               return result;
//             }

//             return {
//               data:
//                 normalizePage<IngredientOption>(
//                   result.data as never,
//                 ).content,
//             };
//           },
//         }),

//       getManagedStores:
//         builder.query<StoreOption[], void>({
//           async queryFn() {
//             const result = await browserRequest<unknown>(
//               "/api/admin/stores?page=0&size=100",
//             );

//             if ("error" in result) {
//               return result;
//             }

//             return {
//               data:
//                 normalizePage<StoreOption>(
//                   result.data as never,
//                 ).content,
//             };
//           },
//         }),

//       getManagedFoods:
//         builder.query<
//           ApiPage<FoodRecord>,
//           ListParams | undefined
//         >({
//           async queryFn(params) {
//             const query = makeQuery({
//               page: params?.page ?? 0,
//               size: params?.size ?? 100,
//               sort:
//                 params?.sort ??
//                 "createdAt,desc",
//               query: params?.query,
//             });

//             const result = await browserRequest<unknown>(
//               `/api/catalog/foods${query}`,
//             );

//             if ("error" in result) {
//               return result;
//             }

//             return {
//               data:
//                 normalizePage<FoodRecord>(
//                   result.data as never,
//                 ),
//             };
//           },
//         }),

//       getManagedFood:
//         builder.query<FoodRecord, string>({
//           async queryFn(uuid) {
//             const result = await browserRequest<unknown>(
//               `/api/catalog/foods/${encodeURIComponent(
//                 uuid,
//               )}`,
//             );

//             if ("error" in result) {
//               return result;
//             }

//             return {
//               data: unwrap<FoodRecord>(
//                 result.data as never,
//               ),
//             };
//           },
//         }),

//       createManagedFood:
//         builder.mutation<
//           FoodRecord,
//           {
//             payload: FoodWritePayload;
//             images: File[];
//           }
//         >({
//           async queryFn({
//             payload,
//             images,
//           }) {
//             const result = await browserRequest<unknown>(
//               "/api/catalog/foods",
//               {
//                 method: "POST",
//                 body: makeMultipart(
//                   "food",
//                   payload,
//                   images,
//                 ),
//               },
//             );

//             if ("error" in result) {
//               return result;
//             }

//             return {
//               data: unwrap<FoodRecord>(
//                 result.data as never,
//               ),
//             };
//           },
//         }),

//       updateManagedFood:
//         builder.mutation<
//           FoodRecord,
//           {
//             uuid: string;
//             payload: Partial<FoodWritePayload>;
//             images: File[];
//           }
//         >({
//           async queryFn({
//             uuid,
//             payload,
//             images,
//           }) {
//             const result = await browserRequest<unknown>(
//               `/api/catalog/foods/${encodeURIComponent(
//                 uuid,
//               )}`,
//               {
//                 method: "PATCH",
//                 body: makeMultipart(
//                   "food",
//                   payload,
//                   images,
//                 ),
//               },
//             );

//             if ("error" in result) {
//               return result;
//             }

//             return {
//               data: unwrap<FoodRecord>(
//                 result.data as never,
//               ),
//             };
//           },
//         }),

//       deleteManagedFood:
//         builder.mutation<void, string>({
//           async queryFn(uuid) {
//             const result = await browserRequest<unknown>(
//               `/api/catalog/foods/${encodeURIComponent(
//                 uuid,
//               )}`,
//               {
//                 method: "DELETE",
//               },
//             );

//             if ("error" in result) {
//               return result;
//             }

//             return {
//               data: undefined,
//             };
//           },
//         }),

//       getPublishedMenuItems:
//         builder.query<
//           ApiPage<MenuItemRecord>,
//           PublicMenuItemListParams | undefined
//         >({
//           async queryFn(params) {
//             const query = makeQuery({
//               page: params?.page ?? 0,
//               size: params?.size ?? 100,
//               sort:
//                 params?.sort ??
//                 "createdAt,desc",
//               query: params?.query,
//               rootCategoryCode:
//                 params?.rootCategoryCode,
//               storeUuid:
//                 params?.storeUuid,
//               foodUuid:
//                 params?.foodUuid,
//               availabilityStatus:
//                 params?.availabilityStatus,
//               featured:
//                 params?.featured,
//             });

//             const result = await browserRequest<unknown>(
//               `/api/catalog/menu-items${query}`,
//             );

//             if ("error" in result) {
//               return result;
//             }

//             return {
//               data:
//                 normalizePage<MenuItemRecord>(
//                   result.data as never,
//                 ),
//             };
//           },
//         }),

//       getPublishedMenuItemDetail:
//         builder.query<MenuItemRecord, string>({
//           async queryFn(uuid) {
//             const result = await browserRequest<unknown>(
//               `/api/catalog/menu-items/${encodeURIComponent(
//                 uuid,
//               )}/detail`,
//             );

//             if ("error" in result) {
//               return result;
//             }

//             return {
//               data: unwrap<MenuItemRecord>(
//                 result.data as never,
//               ),
//             };
//           },
//         }),

//       createStoreMenuItem:
//         builder.mutation<
//           MenuItemRecord,
//           {
//             storeUuid: string;
//             payload: MenuItemWritePayload;
//             images: File[];
//           }
//         >({
//           async queryFn({
//             storeUuid,
//             payload,
//             images,
//           }) {
//             const result = await browserRequest<unknown>(
//               `/api/catalog/stores/${encodeURIComponent(
//                 storeUuid,
//               )}/menu-items`,
//               {
//                 method: "POST",
//                 body: makeMultipart(
//                   "request",
//                   payload,
//                   images,
//                 ),
//               },
//             );

//             if ("error" in result) {
//               return result;
//             }

//             return {
//               data: unwrap<MenuItemRecord>(
//                 result.data as never,
//               ),
//             };
//           },
//         }),

//       updateStoreMenuItem:
//         builder.mutation<
//           MenuItemRecord,
//           {
//             uuid: string;
//             payload: MenuItemWritePayload;
//             images: File[];
//           }
//         >({
//           async queryFn({
//             uuid,
//             payload,
//             images,
//           }) {
//             const result = await browserRequest<unknown>(
//               `/api/catalog/menu-items/${encodeURIComponent(
//                 uuid,
//               )}`,
//               {
//                 method: "PUT",
//                 body: makeMultipart(
//                   "request",
//                   payload,
//                   images,
//                 ),
//               },
//             );

//             if ("error" in result) {
//               return result;
//             }

//             return {
//               data: unwrap<MenuItemRecord>(
//                 result.data as never,
//               ),
//             };
//           },
//         }),

//       deleteStoreMenuItem:
//         builder.mutation<void, string>({
//           async queryFn(uuid) {
//             const result = await browserRequest<unknown>(
//               `/api/catalog/menu-items/${encodeURIComponent(
//                 uuid,
//               )}`,
//               {
//                 method: "DELETE",
//               },
//             );

//             if ("error" in result) {
//               return result;
//             }

//             return {
//               data: undefined,
//             };
//           },
//         }),
//     }),

//     overrideExisting: false,
//   });

// export const {
//   useGetManagedFoodCategoriesQuery,
//   useGetManagedCuisinesQuery,
//   useGetManagedIngredientsQuery,
//   useGetManagedStoresQuery,

//   useGetManagedFoodsQuery,
//   useGetManagedFoodQuery,
//   useCreateManagedFoodMutation,
//   useUpdateManagedFoodMutation,
//   useDeleteManagedFoodMutation,

//   useGetPublishedMenuItemsQuery,
//   useGetPublishedMenuItemDetailQuery,
//   useCreateStoreMenuItemMutation,
//   useUpdateStoreMenuItemMutation,
//   useDeleteStoreMenuItemMutation,
// } = menuManagementApi;



"use client";

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import { adminBaseApi } from "./adminBaseApi";
import { uploadMenuItemMediaFile } from "@/src/lib/menuItemMediaClient";

import type {
  ApiPage,
  CuisineOption,
  EventOption,
  FoodCategoryOption,
  FoodRecord,
  FoodWritePayload,
  IngredientOption,
  ListParams,
  MenuItemAllergenDeclarationPayload,
  MenuItemDietaryTypePayload,
  MenuItemIngredientPayload,
  MenuItemRecord,
  MenuItemWritePayload,
  PublicMenuItemListParams,
  SeasonOption,
  StoreOption,
  WeatherConditionOption,
} from "@/src/types/menu-management";

type BackendEnvelope<T> = {
  status?: number;
  message?: string;
  payload?: T;
  data?: T;
  timestamp?: string;
};

function unwrap<T>(
  value: BackendEnvelope<T> | T,
): T {
  if (value && typeof value === "object") {
    const wrapper = value as BackendEnvelope<T>;

    if (wrapper.payload !== undefined) {
      return wrapper.payload;
    }

    if (wrapper.data !== undefined) {
      return wrapper.data;
    }
  }

  return value as T;
}

function normalizeMenuItemEntity<T>(item: T): T {
  if (!item || typeof item !== "object") return item;
  const anyItem = item as Record<string, unknown>;
  const store = anyItem.store as Record<string, unknown> | undefined;
  const food = anyItem.food as Record<string, unknown> | undefined;
  return {
    ...anyItem,
    uuid: anyItem.uuid || anyItem.menuItemUuid || anyItem.id?.toString(),
    name: anyItem.name || (anyItem as any).menuItemName || food?.canonicalName || food?.localName || "",
    description: anyItem.description || food?.description || "",
    storeUuid: anyItem.storeUuid || store?.uuid,
    foodUuid: anyItem.foodUuid || food?.uuid,
    availabilityStatus: anyItem.availabilityStatus || "AVAILABLE",
    price: anyItem.price != null ? Number(anyItem.price) : 0,
    currencyCode: anyItem.currencyCode || "USD",
  } as T;
}

function extractListFromRaw(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.content)) return raw.content;
  if (Array.isArray(raw.contents)) return raw.contents;
  if (Array.isArray(raw.items)) return raw.items;
  if (Array.isArray(raw.menuItems)) return raw.menuItems;
  if (Array.isArray(raw.results)) return raw.results;
  if (Array.isArray(raw.data)) return raw.data;
  if (raw.payload && typeof raw.payload === "object") {
    return extractListFromRaw(raw.payload);
  }
  if (raw.data && typeof raw.data === "object") {
    return extractListFromRaw(raw.data);
  }
  return [];
}

function normalizePage<T>(
  value:
    | BackendEnvelope<
        Partial<ApiPage<T>> & {
          contents?: T[];
          items?: T[];
          pageNumber?: number;
          pageSize?: number;
          hasNext?: boolean;
        }
      >
    | (Partial<ApiPage<T>> & {
        contents?: T[];
        items?: T[];
        pageNumber?: number;
        pageSize?: number;
        hasNext?: boolean;
      })
    | T[],
): ApiPage<T> {
  const raw = unwrap(value) as any;

  const rawList = extractListFromRaw(raw);
  const content = rawList.map((it: any) => normalizeMenuItemEntity(it));

  return {
    content,
    number: raw?.number ?? raw?.pageNumber ?? 0,
    size: raw?.size ?? raw?.pageSize ?? content.length,
    numberOfElements:
      raw?.numberOfElements ?? content.length,
    totalElements:
      raw?.totalElements ?? (raw?.totalElements !== undefined ? raw.totalElements : content.length),
    totalPages: Math.max(raw?.totalPages ?? 1, 1),
    first: raw?.first ?? ((raw?.pageNumber ?? 0) === 0),
    last: raw?.last ?? (raw?.hasNext !== undefined ? !raw.hasNext : true),
    empty: raw?.empty ?? content.length === 0,
  };
}

function toError(
  status: number | "FETCH_ERROR",
  data: unknown,
): FetchBaseQueryError {
  if (status === "FETCH_ERROR") {
    return {
      status: "FETCH_ERROR",
      error:
        typeof data === "string"
          ? data
          : "Network request failed.",
    };
  }

  return {
    status,
    data,
  };
}

async function browserRequest<T>(
  url: string,
  init?: RequestInit,
): Promise<
  | { data: T }
  | { error: FetchBaseQueryError }
> {
  try {
    const response = await fetch(url, {
      credentials: "include",
      cache: "no-store",
      ...init,
    });

    if (response.status === 204) {
      return {
        data: undefined as T,
      };
    }

    const text = await response.text();

    let body: unknown = text;

    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }

    if (!response.ok) {
      return {
        error: toError(response.status, body),
      };
    }

    return {
      data: body as T,
    };
  } catch (error) {
    return {
      error: toError(
        "FETCH_ERROR",
        error instanceof Error
          ? error.message
          : "Network request failed.",
      ),
    };
  }
}

function makeQuery(
  params:
    | Record<
        string,
        string | number | boolean | undefined
      >
    | undefined,
): string {
  if (!params) {
    return "";
  }

  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === ""
    ) {
      return;
    }

    search.set(key, String(value));
  });

  const value = search.toString();

  return value ? `?${value}` : "";
}

function makeMultipart(
  key: "food" | "request",
  payload: unknown,
  images: File[],
): FormData {
  const form = new FormData();

  form.append(
    key,
    typeof payload === "string" ? payload : JSON.stringify(payload),
  );

  images.slice(0, 4).forEach((image) => {
    form.append("images", image);
  });

  return form;
}

export const menuManagementApi =
  adminBaseApi.injectEndpoints({
    endpoints: (builder) => ({
      getManagedFoodCategories:
        builder.query<FoodCategoryOption[], void>({
          async queryFn() {
            const result = await browserRequest<unknown>(
              "/api/catalog/food-categories?size=200",
            );

            if ("error" in result) {
              return result;
            }

            return {
              data:
                normalizePage<FoodCategoryOption>(
                  result.data as never,
                ).content,
            };
          },
          providesTags: [{ type: "FoodCategory", id: "LIST" }],
        }),

      getManagedCuisines:
        builder.query<CuisineOption[], void>({
          async queryFn() {
            const result = await browserRequest<unknown>(
              "/api/catalog/cuisines?page=0&size=100",
            );

            if ("error" in result) {
              return result;
            }

            return {
              data:
                normalizePage<CuisineOption>(
                  result.data as never,
                ).content,
            };
          },
        }),

      getManagedIngredients:
        builder.query<IngredientOption[], void>({
          async queryFn() {
            const result = await browserRequest<unknown>(
              "/api/admin/catalog/ingredients?page=0&size=100&sort=name%2Casc",
            );

            if ("error" in result) {
              return result;
            }

            return {
              data:
                normalizePage<IngredientOption>(
                  result.data as never,
                ).content,
            };
          },
        }),

      getManagedStores:
        builder.query<StoreOption[], void>({
          async queryFn() {
            // Only approved + active stores are offered when creating/assigning
            // a menu item — a menu item is only ever publicly reachable through
            // its store, so the store picker should never offer a store that
            // isn't already public-ready.
            const result = await browserRequest<unknown>(
              "/api/admin/stores?page=0&size=100&reviewStatus=APPROVED&accountStatus=ACTIVE",
            );

            if ("error" in result) {
              const fallback = await browserRequest<unknown>(
                "/api/catalog/stores?page=0&size=100",
              );
              if (!("error" in fallback)) {
                return {
                  data: normalizePage<StoreOption>(fallback.data as never).content,
                };
              }
              return result;
            }

            return {
              data:
                normalizePage<StoreOption>(
                  result.data as never,
                ).content,
            };
          },
        }),

      getManagedSeasons:
        builder.query<SeasonOption[], void>({
          async queryFn() {
            const result = await browserRequest<unknown>(
              "/api/catalog/seasons?page=0&size=100",
            );

            if ("error" in result) {
              return result;
            }

            return {
              data:
                normalizePage<SeasonOption>(
                  result.data as never,
                ).content,
            };
          },
        }),

      getManagedEvents:
        builder.query<EventOption[], void>({
          async queryFn() {
            const result = await browserRequest<unknown>(
              "/api/catalog/events?page=0&size=100",
            );

            if ("error" in result) {
              return result;
            }

            return {
              data:
                normalizePage<EventOption>(
                  result.data as never,
                ).content,
            };
          },
        }),

      getManagedWeatherConditions:
        builder.query<WeatherConditionOption[], void>({
          async queryFn() {
            const result = await browserRequest<unknown>(
              "/api/catalog/weather-conditions?page=0&size=100",
            );

            if ("error" in result) {
              return result;
            }

            return {
              data:
                normalizePage<WeatherConditionOption>(
                  result.data as never,
                ).content,
            };
          },
        }),

      createSeason:
        builder.mutation<
          SeasonOption,
          {
            code: string;
            name: string;
            localName?: string | null;
            description?: string | null;
            isActive: boolean;
          }
        >({
          async queryFn(payload) {
            const result = await browserRequest<unknown>(
              "/api/catalog/seasons",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              },
            );

            if ("error" in result) {
              return result;
            }

            return {
              data: unwrap<SeasonOption>(result.data as never),
            };
          },
        }),

      updateSeason:
        builder.mutation<
          SeasonOption,
          {
            uuid: string;
            payload: {
              name?: string;
              localName?: string | null;
              description?: string | null;
              isActive?: boolean;
            };
          }
        >({
          async queryFn({ uuid, payload }) {
            const result = await browserRequest<unknown>(
              `/api/catalog/seasons/${encodeURIComponent(uuid)}`,
              {
                method: "PATCH",  
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              },
            );

            if ("error" in result) {
              return result;
            }

            return {
              data: unwrap<SeasonOption>(result.data as never),
            };
          },
        }),

      deleteSeason:
        builder.mutation<void, string>({
          async queryFn(uuid) {
            const result = await browserRequest<unknown>(
              `/api/catalog/seasons/${encodeURIComponent(uuid)}`,
              {
                method: "DELETE",
              },
            );

            if ("error" in result) {
              return result;
            }

            return {
              data: undefined,
            };
          },
        }),

      createEvent:
        builder.mutation<
          EventOption,
          {
            code: string;
            name: string;
            localName?: string | null;
            description?: string | null;
            isActive: boolean;
          }
        >({
          async queryFn(payload) {
            const result = await browserRequest<unknown>(
              "/api/catalog/events",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              },
            );

            if ("error" in result) {
              return result;
            }

            return {
              data: unwrap<EventOption>(result.data as never),
            };
          },
        }),

      updateEvent:
        builder.mutation<
          EventOption,
          {
            uuid: string;
            payload: {
              name?: string;
              localName?: string | null;
              description?: string | null;
              isActive?: boolean;
            };
          }
        >({
          async queryFn({ uuid, payload }) {
            const result = await browserRequest<unknown>(
              `/api/catalog/events/${encodeURIComponent(uuid)}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              },
            );

            if ("error" in result) {
              return result;
            }

            return {
              data: unwrap<EventOption>(result.data as never),
            };
          },
        }),

      deleteEvent:
        builder.mutation<void, string>({
          async queryFn(uuid) {
            const result = await browserRequest<unknown>(
              `/api/catalog/events/${encodeURIComponent(uuid)}`,
              {
                method: "DELETE",
              },
            );

            if ("error" in result) {
              return result;
            }

            return {
              data: undefined,
            };
          },
        }),

      createWeatherCondition:
        builder.mutation<
          WeatherConditionOption,
          {
            code: string;
            name: string;
            localName?: string | null;
            description?: string | null;
            isActive: boolean;
          }
        >({
          async queryFn(payload) {
            const result = await browserRequest<unknown>(
              "/api/catalog/weather-conditions",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              },
            );

            if ("error" in result) {
              return result;
            }

            return {
              data: unwrap<WeatherConditionOption>(result.data as never),
            };
          },
        }),

      updateWeatherCondition:
        builder.mutation<
          WeatherConditionOption,
          {
            uuid: string;
            payload: {
              name?: string;
              localName?: string | null;
              description?: string | null;
              isActive?: boolean;
            };
          }
        >({
          async queryFn({ uuid, payload }) {
            const result = await browserRequest<unknown>(
              `/api/catalog/weather-conditions/${encodeURIComponent(uuid)}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              },
            );

            if ("error" in result) {
              return result;
            }

            return {
              data: unwrap<WeatherConditionOption>(result.data as never),
            };
          },
        }),

      deleteWeatherCondition:
        builder.mutation<void, string>({
          async queryFn(uuid) {
            const result = await browserRequest<unknown>(
              `/api/catalog/weather-conditions/${encodeURIComponent(uuid)}`,
              {
                method: "DELETE",
              },
            );

            if ("error" in result) {
              return result;
            }

            return {
              data: undefined,
            };
          },
        }),

      getManagedFoods:
        builder.query<
          ApiPage<FoodRecord>,
          ListParams | undefined
        >({
          async queryFn(params) {
            const p = (params ?? {}) as ListParams;
            const query = makeQuery({
              page: p.page ?? 0,
              size: p.size ?? 100,
              sort:
                p.sort ??
                "createdAt,desc",
              query: p.query,
            });

            const result = await browserRequest<unknown>(
              `/api/catalog/foods${query}`,
            );

            if ("error" in result) {
              return result;
            }

            return {
              data:
                normalizePage<FoodRecord>(
                  result.data as never,
                ),
            };
          },
        }),

      getManagedFood:
        builder.query<FoodRecord, string>({
          async queryFn(uuid) {
            const result = await browserRequest<unknown>(
              `/api/catalog/foods/${encodeURIComponent(
                uuid,
              )}`,
            );

            if ("error" in result) {
              return result;
            }

            return {
              data: unwrap<FoodRecord>(
                result.data as never,
              ),
            };
          },
        }),

      createManagedFood:
        builder.mutation<
          FoodRecord,
          {
            payload: FoodWritePayload;
            images: File[];
          }
        >({
          async queryFn({
            payload,
            images,
          }) {
            const hasImages = Array.isArray(images) && images.length > 0;
            const result = await browserRequest<unknown>(
              "/api/catalog/foods",
              {
                method: "POST",
                ...(hasImages
                  ? {
                      body: makeMultipart(
                        "food",
                        payload,
                        images,
                      ),
                    }
                  : {
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(payload),
                    }),
              },
            );

            if ("error" in result) {
              return result;
            }

            return {
              data: unwrap<FoodRecord>(
                result.data as never,
              ),
            };
          },
        }),

      updateManagedFood:
        builder.mutation<
          FoodRecord,
          {
            uuid: string;
            payload: Partial<FoodWritePayload>;
            images: File[];
          }
        >({
          async queryFn({
            uuid,
            payload,
            images,
          }) {
            const result = await browserRequest<unknown>(
              `/api/catalog/foods/${encodeURIComponent(
                uuid,
              )}`,
              {
                method: "PATCH",
                body: makeMultipart(
                  "food",
                  payload,
                  images ?? [],
                ),
              },
            );

            if ("error" in result) {
              return result;
            }

            return {
              data: unwrap<FoodRecord>(
                result.data as never,
              ),
            };
          },
        }),

      deleteManagedFood:
        builder.mutation<void, string>({
          async queryFn(uuid) {
            const result = await browserRequest<unknown>(
              `/api/catalog/foods/${encodeURIComponent(
                uuid,
              )}`,
              {
                method: "DELETE",
              },
            );

            if ("error" in result) {
              return result;
            }

            return {
              data: undefined,
            };
          },
        }),

      getPublishedMenuItems:
        builder.query<
          ApiPage<MenuItemRecord>,
          PublicMenuItemListParams | undefined
        >({
          async queryFn(params) {
            const p = (params ?? {}) as PublicMenuItemListParams;

            const safeSize = Math.min(Math.max(1, p.size ?? 100), 100);
            const safePage = Math.max(0, p.page ?? 0);

            // 1. If storeUuid is provided, first try GET /api/catalog/stores/{storeUuid}/menu-items
            if (p.storeUuid) {
              const catalogStoreRes = await browserRequest<unknown>(
                `/api/catalog/stores/${encodeURIComponent(
                  p.storeUuid,
                )}/menu-items?page=${safePage}&size=${safeSize}`,
              );

              if (!("error" in catalogStoreRes)) {
                const norm = normalizePage<MenuItemRecord>(catalogStoreRes.data as never);
                if (norm.content && norm.content.length > 0) {
                  return { data: norm };
                }
              }
            }

            // 2. Discovery Search API (POST /api/discovery/menu-items/search)
            let result = await browserRequest<unknown>(
              `/api/discovery/menu-items/search?page=${safePage}&size=${safeSize}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...(p.query ? { query: p.query } : {}),
                  ...(p.storeUuid
                    ? { storeUuid: p.storeUuid, storeUuids: [p.storeUuid] }
                    : {}),
                  ...(p.rootCategoryCode ? { categoryUuids: [p.rootCategoryCode] } : {}),
                }),
              },
            );

            // 3. Fallbacks if discovery search with POST returned error or empty:
            const rawExtracted = extractListFromRaw(unwrap(result && "data" in result ? result.data : null));
            if ("error" in result || rawExtracted.length === 0) {
              const query = makeQuery({
                page: safePage,
                size: safeSize,
                sort: "createdAt,desc",
                query: p.query,
                storeUuid: p.storeUuid,
              });

              const menuItemsRes = await browserRequest<unknown>(
                `/api/menu-items${query}`,
              );

              if (!("error" in menuItemsRes) && extractListFromRaw(unwrap(menuItemsRes.data)).length > 0) {
                result = menuItemsRes;
              } else {
                const catalogRes = await browserRequest<unknown>(
                  `/api/catalog/menu-items${query}`,
                );
                if (!("error" in catalogRes)) {
                  result = catalogRes;
                }
              }
            }

            if ("error" in result) {
              return {
                data: {
                  content: [],
                  number: 0,
                  size: 0,
                  numberOfElements: 0,
                  totalElements: 0,
                  totalPages: 1,
                  first: true,
                  last: true,
                  empty: true,
                },
              };
            }

            return {
              data: normalizePage<MenuItemRecord>(result.data as never),
            };
          },
        }),

      getMenuItem:
        builder.query<MenuItemRecord, string>({
          async queryFn(uuid) {
            const result = await browserRequest<unknown>(
              `/api/catalog/menu-items/${encodeURIComponent(
                uuid,
              )}`,
            );

            if ("error" in result) {
              return result;
            }

            return {
              data: unwrap<MenuItemRecord>(
                result.data as never,
              ),
            };
          },
        }),

      getPublishedMenuItemDetail:
        builder.query<
          MenuItemRecord,
          string | { uuid: string; latitude?: number; longitude?: number }
        >({
          async queryFn(arg) {
            const uuid = typeof arg === "string" ? arg : arg.uuid;
            const params: Record<string, string | number | boolean | undefined> = {};
            if (typeof arg === "object") {
              if (arg.latitude != null) params.latitude = arg.latitude;
              if (arg.longitude != null) params.longitude = arg.longitude;
            }
            const queryString = makeQuery(params);
            const result = await browserRequest<unknown>(
              `/api/catalog/menu-items/${encodeURIComponent(
                uuid,
              )}/detail${queryString}`,
            );

            if ("error" in result) {
              return result;
            }

            return {
              data: unwrap<MenuItemRecord>(
                result.data as never,
              ),
            };
          },
        }),

      createStoreMenuItem:
        builder.mutation<
          MenuItemRecord,
          {
            storeUuid: string;
            payload: MenuItemWritePayload;
            images: File[];
          }
        >({
          async queryFn({
            storeUuid,
            payload,
            images,
          }) {
            let primaryMediaUuid = payload.thumbnailMediaUuid || payload.primaryMediaUuids?.[0];
            const galleryMediaUuids: string[] = [...(payload.galleryMediaUuids ?? [])];

            // 1. Upload Images to Media API first if new files provided
            if (Array.isArray(images) && images.length > 0) {
              try {
                // Upload primary/thumbnail image
                if (images[0]) {
                  const uploadedPrimary = await uploadMenuItemMediaFile(
                    images[0],
                    "MENU_ITEM_PRIMARY",
                  );
                  if (uploadedPrimary.uuid) {
                    primaryMediaUuid = uploadedPrimary.uuid;
                  }
                }

                // Upload gallery images
                for (let i = 1; i < images.length && i < 4; i++) {
                  const uploadedGallery = await uploadMenuItemMediaFile(
                    images[i],
                    "MENU_ITEM_GALLERY",
                  );
                  if (uploadedGallery.uuid) {
                    galleryMediaUuids.push(uploadedGallery.uuid);
                  }
                }
              } catch (mediaError) {
                console.warn("[MENU ITEM MEDIA UPLOAD FAILED, CONTINUING WITH CREATION]", mediaError);
              }
            }

            const normalizedIngredientDataStatus =
              payload.menuItem?.ingredientDataStatus === "COMPLETE"
                ? "VERIFIED"
                : payload.menuItem?.ingredientDataStatus || "VERIFIED";

            const mediaUuids = primaryMediaUuid ? [primaryMediaUuid] : (payload.primaryMediaUuids ?? []);

            // CreateMenuItemRequest (backend) is a nested DTO:
            // { foodUuid, menuItem: { name, price, ... }, primaryMediaUuids,
            //   thumbnailMediaUuid, galleryMediaUuids, ingredients, dietaryTypes,
            //   allergenDeclarations }. The backend's ObjectMapper bean
            // (JacksonConfig) is a plain `new ObjectMapper()`, which defaults to
            // FAIL_ON_UNKNOWN_PROPERTIES=true (Spring Boot's autoconfigured
            // mapper normally disables this, but this custom bean bypasses
            // that). A flat payload with top-level `name`/`price`/etc. fields
            // that don't exist on CreateMenuItemRequest throws
            // UnrecognizedPropertyException -> HttpMessageNotReadableException
            // -> "Request body is invalid JSON or has invalid field value".
            // /api/v1/admin/... and /api/v1/catalog/... map to the exact same
            // controller method (MenuItemController is @RequestMapping({
            // "/api/v1/catalog", "/api/v1/admin"})), so there is only ever one
            // correct payload shape — send it once, directly.
            const requestBody: Record<string, unknown> = {
              foodUuid: payload.foodUuid,
              menuItem: {
                name: payload.menuItem?.name,
                description: payload.menuItem?.description || null,
                price: Number(payload.menuItem?.price) || 0,
                currencyCode: payload.menuItem?.currencyCode || "USD",
                preparationTimeMinutes: Number(payload.menuItem?.preparationTimeMinutes) || 15,
                availabilityStatus: payload.menuItem?.availabilityStatus || "AVAILABLE",
                ingredientDataStatus: normalizedIngredientDataStatus,
                isFeatured: Boolean(payload.menuItem?.isFeatured),
                // Backend MenuItemSource enum: MANUAL, GOOGLE_IMPORT,
                // BULK_IMPORT, API — there is no "ADMIN" value. Admin-created
                // items are MANUAL (also MenuItemCreationInput's own default).
                source: "MANUAL",
              },
              thumbnailMediaUuid: primaryMediaUuid || null,
              galleryMediaUuids: galleryMediaUuids,
              ingredients: (payload.ingredients ?? []).map((ing) => ({
                ingredientUuid: ing.ingredientUuid,
                quantity: ing.quantity != null ? Number(ing.quantity) : 1,
                unit: ing.unit || "unit",
                isOptional: Boolean(ing.isOptional),
                notes: ing.notes || null,
              })),
              dietaryTypes: (payload.dietaryTypes ?? []).map((d) => ({
                dietaryTypeUuid: d.dietaryTypeUuid,
                verificationStatus: d.verificationStatus || "VERIFIED",
                notes: d.notes || null,
              })),
              allergenDeclarations: (payload.allergenDeclarations ?? []).map((a) => ({
                allergenUuid: a.allergenUuid,
                declarationType: a.declarationType || "MAY_CONTAIN",
                riskLevel: a.riskLevel || "MEDIUM",
                verificationStatus: a.verificationStatus || "VERIFIED",
                notes: a.notes || null,
              })),
            };

            const result = await browserRequest<unknown>(
              `/api/admin/stores/${encodeURIComponent(
                storeUuid,
              )}/menu-items`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
              },
            );

            if ("error" in result) {
              return result;
            }

            const rawCreated = (result.data ?? {}) as any;
            const createdItem = unwrap<MenuItemRecord>(rawCreated);
            const createdUuid =
              createdItem?.uuid ||
              rawCreated?.uuid ||
              rawCreated?.payload?.uuid ||
              rawCreated?.data?.uuid ||
              rawCreated?.menuItemUuid ||
              rawCreated?.id;

            // 3. Attach Ingredients if provided (POSTMAN 04 Request 07)
            if (createdUuid && Array.isArray(payload.ingredients) && payload.ingredients.length > 0) {
              try {
                await browserRequest<unknown>(
                  `/api/admin/menu-items/${encodeURIComponent(createdUuid)}/ingredients`,
                  {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ingredients: payload.ingredients.map((ing) => ({
                        ingredientUuid: ing.ingredientUuid,
                        quantity: ing.quantity ?? 1,
                        unit: ing.unit ?? "unit",
                        isOptional: (ing as any).optional ?? ing.isOptional ?? false,
                        notes: ing.notes || undefined,
                      })),
                    }),
                  },
                );
              } catch (e) {
                console.warn("[ATTACH INGREDIENTS WARNING]", e);
              }
            }

            // 4. Attach Dietary Types if provided (POSTMAN 04 Request 10)
            if (createdUuid && Array.isArray(payload.dietaryTypes) && payload.dietaryTypes.length > 0) {
              try {
                await browserRequest<unknown>(
                  `/api/admin/menu-items/${encodeURIComponent(createdUuid)}/dietary-types`,
                  {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      dietaryTypes: payload.dietaryTypes.map((d) => ({
                        dietaryTypeUuid: d.dietaryTypeUuid,
                        verificationStatus: d.verificationStatus || "VERIFIED",
                        notes: d.notes || undefined,
                      })),
                    }),
                  },
                );
              } catch (e) {
                console.warn("[ATTACH DIETARY WARNING]", e);
              }
            }

            // 5. Attach Allergen Declarations if provided (POSTMAN 04 Request 12)
            if (createdUuid && Array.isArray(payload.allergenDeclarations) && payload.allergenDeclarations.length > 0) {
              try {
                await browserRequest<unknown>(
                  `/api/admin/menu-items/${encodeURIComponent(createdUuid)}/allergen-declarations`,
                  {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      declarations: payload.allergenDeclarations.map((a) => ({
                        allergenUuid: a.allergenUuid,
                        declarationType: a.declarationType || "MAY_CONTAIN",
                        riskLevel: a.riskLevel || "MEDIUM",
                        verificationStatus: a.verificationStatus || "VERIFIED",
                        notes: a.notes || undefined,
                      })),
                    }),
                  },
                );
              } catch (e) {
                console.warn("[ATTACH ALLERGENS WARNING]", e);
              }
            }

            return {
              data: createdItem,
            };
          },
        }),

      updateStoreMenuItem:
        builder.mutation<
          MenuItemRecord,
          {
            uuid: string;
            payload: MenuItemWritePayload;
            images: File[];
          }
        >({
          async queryFn({
            uuid,
            payload,
            images,
          }) {
            const targetUuid =
              uuid && String(uuid) !== "undefined"
                ? String(uuid)
                : (payload as any)?.uuid ||
                  (payload as any)?.menuItemUuid ||
                  (payload as any)?.id;

            // NOTE: UpdateMenuItemRequest has no media fields (see below), and
            // there is no backend endpoint to associate already-uploaded media
            // UUIDs with an existing menu item — MenuItemController.replaceImages
            // only accepts fresh multipart files. Newly selected `images` are
            // still uploaded (so they exist as Media records / are visible via
            // the ImagePicker's own preview), but nothing here can currently
            // attach them to this menu item; that needs a dedicated backend
            // endpoint, tracked separately from this fix.
            let primaryMediaUuid = payload.thumbnailMediaUuid || payload.primaryMediaUuids?.[0];
            const galleryMediaUuids: string[] = [...(payload.galleryMediaUuids ?? [])];
            void primaryMediaUuid;
            void galleryMediaUuids;

            // 1. Upload Images to Media API first if new files provided
            if (Array.isArray(images) && images.length > 0) {
              try {
                if (images[0]) {
                  const uploadedPrimary = await uploadMenuItemMediaFile(
                    images[0],
                    "MENU_ITEM_PRIMARY",
                  );
                  if (uploadedPrimary.uuid) {
                    primaryMediaUuid = uploadedPrimary.uuid;
                  }
                }

                for (let i = 1; i < images.length && i < 4; i++) {
                  const uploadedGallery = await uploadMenuItemMediaFile(
                    images[i],
                    "MENU_ITEM_GALLERY",
                  );
                  if (uploadedGallery.uuid) {
                    galleryMediaUuids.push(uploadedGallery.uuid);
                  }
                }
              } catch (mediaError) {
                console.warn("[MENU ITEM MEDIA UPLOAD FAILED, CONTINUING WITH UPDATE]", mediaError);
              }
            }

            const normalizedIngredientDataStatus =
              payload.menuItem?.ingredientDataStatus === "COMPLETE"
                ? "VERIFIED"
                : payload.menuItem?.ingredientDataStatus || "VERIFIED";

            // UpdateMenuItemRequest (backend) is `{ foodUuid, menuItem: {...} }`
            // only — no media fields at all, unlike CreateMenuItemRequest.
            // Image associations are updated separately via the dedicated
            // .../images endpoint, not through this call. See the matching
            // comment on createStoreMenuItem for why the payload must match
            // the DTO's field names exactly: the backend's ObjectMapper bean
            // fails on any unrecognized JSON property.
            const coreBody = {
              foodUuid: payload.foodUuid,
              menuItem: {
                name: payload.menuItem?.name,
                description: payload.menuItem?.description || null,
                price: Number(payload.menuItem?.price) || 0,
                currencyCode: payload.menuItem?.currencyCode || "USD",
                preparationTimeMinutes: Number(payload.menuItem?.preparationTimeMinutes) || 15,
                availabilityStatus: payload.menuItem?.availabilityStatus || "AVAILABLE",
                ingredientDataStatus: normalizedIngredientDataStatus,
                isFeatured: Boolean(payload.menuItem?.isFeatured),
                // Backend MenuItemSource enum: MANUAL, GOOGLE_IMPORT,
                // BULK_IMPORT, API — there is no "ADMIN" value. Admin-created
                // items are MANUAL (also MenuItemCreationInput's own default).
                source: "MANUAL",
              },
            };

            const coreResult = await browserRequest<unknown>(
              `/api/admin/menu-items/${encodeURIComponent(
                targetUuid,
              )}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(coreBody),
              },
            );

            if ("error" in coreResult) {
              return coreResult;
            }

            // 3. Update Ingredients if provided
            if (payload.ingredients !== undefined && Array.isArray(payload.ingredients)) {
              await browserRequest<unknown>(
                `/api/admin/menu-items/${encodeURIComponent(
                  targetUuid,
                )}/ingredients`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    ingredients: payload.ingredients.map((ing) => ({
                      ingredientUuid: ing.ingredientUuid,
                      quantity: ing.quantity ?? 1,
                      unit: ing.unit ?? "unit",
                      isOptional: (ing as any).optional ?? ing.isOptional ?? false,
                      notes: ing.notes || undefined,
                    })),
                  }),
                },
              );
            }

            // 4. Update Dietary Types if provided
            if (payload.dietaryTypes !== undefined && Array.isArray(payload.dietaryTypes)) {
              await browserRequest<unknown>(
                `/api/admin/menu-items/${encodeURIComponent(
                  targetUuid,
                )}/dietary-types`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    dietaryTypes: payload.dietaryTypes.map((d) => ({
                      dietaryTypeUuid: d.dietaryTypeUuid,
                      verificationStatus: d.verificationStatus || "VERIFIED",
                      notes: d.notes || undefined,
                    })),
                  }),
                },
              );
            }

            // 5. Update Allergen Declarations if provided
            if (payload.allergenDeclarations !== undefined && Array.isArray(payload.allergenDeclarations)) {
              await browserRequest<unknown>(
                `/api/admin/menu-items/${encodeURIComponent(
                  targetUuid,
                )}/allergen-declarations`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    declarations: payload.allergenDeclarations.map((a) => ({
                      allergenUuid: a.allergenUuid,
                      declarationType: a.declarationType || "MAY_CONTAIN",
                      riskLevel: a.riskLevel || "MEDIUM",
                      verificationStatus: a.verificationStatus || "VERIFIED",
                      notes: a.notes || undefined,
                    })),
                  }),
                },
              );
            }

            return {
              data: unwrap<MenuItemRecord>(
                coreResult.data as never,
              ),
            };
          },
        }),

      deleteStoreMenuItem:
        builder.mutation<void, string>({
          async queryFn(uuid) {
            let result = await browserRequest<unknown>(
              `/api/admin/menu-items/${encodeURIComponent(
                uuid,
              )}`,
              {
                method: "DELETE",
              },
            );

            if (
              "error" in result &&
              (result.error as { status?: number })?.status === 404
            ) {
              result = await browserRequest<unknown>(
                `/api/catalog/menu-items/${encodeURIComponent(
                  uuid,
                )}`,
                {
                  method: "DELETE",
                },
              );
            }

            if ("error" in result) {
              return result;
            }

            return {
              data: undefined,
            };
          },
        }),

      replaceMenuItemIngredients:
        builder.mutation<
          unknown,
          {
            uuid: string;
            ingredients: MenuItemIngredientPayload[];
          }
        >({
          async queryFn({ uuid, ingredients }) {
            const result = await browserRequest<unknown>(
              `/api/catalog/menu-items/${encodeURIComponent(
                uuid,
              )}/ingredients`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ingredients }),
              },
            );

            if ("error" in result) {
              return result;
            }

            return {
              data: result.data,
            };
          },
        }),

      replaceMenuItemDietaryTypes:
        builder.mutation<
          unknown,
          {
            uuid: string;
            dietaryTypes: MenuItemDietaryTypePayload[];
          }
        >({
          async queryFn({ uuid, dietaryTypes }) {
            const result = await browserRequest<unknown>(
              `/api/catalog/menu-items/${encodeURIComponent(
                uuid,
              )}/dietary-types`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dietaryTypes }),
              },
            );

            if ("error" in result) {
              return result;
            }

            return {
              data: result.data,
            };
          },
        }),

      replaceMenuItemAllergens:
        builder.mutation<
          unknown,
          {
            uuid: string;
            declarations: MenuItemAllergenDeclarationPayload[];
          }
        >({
          async queryFn({ uuid, declarations }) {
            const result = await browserRequest<unknown>(
              `/api/catalog/menu-items/${encodeURIComponent(
                uuid,
              )}/allergen-declarations`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ declarations }),
              },
            );

            if ("error" in result) {
              return result;
            }

            return {
              data: result.data,
            };
          },
        }),

      replaceMenuItemImages:
        builder.mutation<
          unknown,
          {
            uuid: string;
            thumbnail?: File | null;
            gallery?: File[];
          }
        >({
          async queryFn({ uuid, thumbnail, gallery = [] }) {
            const form = new FormData();
            if (thumbnail) {
              form.append("thumbnail", thumbnail);
            }
            gallery.forEach((file) => {
              form.append("gallery", file);
            });

            const result = await browserRequest<unknown>(
              `/api/catalog/menu-items/${encodeURIComponent(
                uuid,
              )}/images`,
              {
                method: "PUT",
                body: form,
              },
            );

            if ("error" in result) {
              return result;
            }

            return {
              data: result.data,
            };
          },
        }),
    }),

    overrideExisting: false,
  });

export const {
  useGetManagedFoodCategoriesQuery,
  useGetManagedCuisinesQuery,
  useGetManagedIngredientsQuery,
  useGetManagedStoresQuery,
  useGetManagedSeasonsQuery,
  useGetManagedEventsQuery,
  useGetManagedWeatherConditionsQuery,

  useCreateSeasonMutation,
  useUpdateSeasonMutation,
  useDeleteSeasonMutation,

  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,

  useCreateWeatherConditionMutation,
  useUpdateWeatherConditionMutation,
  useDeleteWeatherConditionMutation,

  useGetManagedFoodsQuery,
  useGetManagedFoodQuery,
  useCreateManagedFoodMutation,
  useUpdateManagedFoodMutation,
  useDeleteManagedFoodMutation,

  useGetPublishedMenuItemsQuery,
  useGetMenuItemQuery,
  useGetPublishedMenuItemDetailQuery,
  useCreateStoreMenuItemMutation,
  useUpdateStoreMenuItemMutation,
  useDeleteStoreMenuItemMutation,
  useReplaceMenuItemIngredientsMutation,
  useReplaceMenuItemDietaryTypesMutation,
  useReplaceMenuItemAllergensMutation,
  useReplaceMenuItemImagesMutation,
} = menuManagementApi;
