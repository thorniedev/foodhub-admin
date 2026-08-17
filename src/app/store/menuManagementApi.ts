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

function normalizePage<T>(
  value:
    | BackendEnvelope<
        Partial<ApiPage<T>> & {
          contents?: T[];
        }
      >
    | (Partial<ApiPage<T>> & {
        contents?: T[];
      })
    | T[],
): ApiPage<T> {
  const raw = unwrap(value);

  if (Array.isArray(raw)) {
    return {
      content: raw,
      number: 0,
      size: raw.length,
      numberOfElements: raw.length,
      totalElements: raw.length,
      totalPages: 1,
      first: true,
      last: true,
      empty: raw.length === 0,
    };
  }

  const content = raw.content ?? raw.contents ?? [];

  return {
    content,
    number: raw.number ?? 0,
    size: raw.size ?? content.length,
    numberOfElements:
      raw.numberOfElements ?? content.length,
    totalElements:
      raw.totalElements ?? content.length,
    totalPages: Math.max(raw.totalPages ?? 1, 1),
    first: raw.first ?? true,
    last: raw.last ?? true,
    empty: raw.empty ?? content.length === 0,
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
            const result = await browserRequest<unknown>(
              "/api/admin/stores?page=0&size=100",
            );

            if ("error" in result) {
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

            // 1. Primary: Discovery Search API (POST /api/discovery/menu-items/search)
            let result = await browserRequest<unknown>(
              `/api/discovery/menu-items/search?page=${p.page ?? 0}&size=${
                p.size ?? 100
              }&sort=FOODHUB_RATING_DESC`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                  p.query
                    ? { query: p.query }
                    : p.rootCategoryCode
                    ? { categoryUuids: [p.rootCategoryCode] }
                    : {},
                ),
              },
            );

            // 2. Fallback: GET /api/menu-items
            if ("error" in result) {
              const query = makeQuery({
                page: p.page ?? 0,
                size: p.size ?? 100,
                sort: "createdAt,desc",
                query: p.query,
                storeUuid: p.storeUuid,
              });

              result = await browserRequest<unknown>(
                `/api/menu-items${query}`,
              );
            }

            // 3. Fallback 2: GET /api/catalog/foods
            if ("error" in result) {
              result = await browserRequest<unknown>(
                `/api/catalog/foods?page=${p.page ?? 0}&size=${p.size ?? 100}`,
              );
            }

            if ("error" in result) {
              return result;
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
            // 1. Create Core Menu Item (POSTMAN Collection: POST /api/v1/admin/stores/{storeUuid}/menu-items)
            const jsonPayload = {
              foodUuid: payload.foodUuid,
              name: payload.menuItem?.name,
              description: payload.menuItem?.description,
              price: payload.menuItem?.price,
              currencyCode: payload.menuItem?.currencyCode ?? "USD",
              preparationTimeMinutes: payload.menuItem?.preparationTimeMinutes,
              availabilityStatus: payload.menuItem?.availabilityStatus ?? "AVAILABLE",
              ingredientDataStatus: payload.menuItem?.ingredientDataStatus ?? "VERIFIED",
              featured: payload.menuItem?.isFeatured ?? true,
              source: "ADMIN",
            };

            let result = await browserRequest<unknown>(
              `/api/admin/stores/${encodeURIComponent(
                storeUuid,
              )}/menu-items`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(jsonPayload),
              },
            );

            if (
              "error" in result &&
              (result.error as { status?: number })?.status === 404
            ) {
              result = await browserRequest<unknown>(
                `/api/catalog/stores/${encodeURIComponent(
                  storeUuid,
                )}/menu-items`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(jsonPayload),
                },
              );
            }

            if ("error" in result) {
              return result;
            }

            const createdItem = unwrap<MenuItemRecord>(result.data as never);
            const newItemUuid = createdItem?.uuid;

            // 2. Upload Multi-Images for the newly created MenuItem
            if (newItemUuid && Array.isArray(images) && images.length > 0) {
              const form = new FormData();
              // Thumbnail & Gallery
              form.append("thumbnail", images[0]);
              images.slice(1, 4).forEach((image) => {
                form.append("gallery", image);
              });
              images.forEach((image) => {
                form.append("images", image);
              });

              let imgResult = await browserRequest<unknown>(
                `/api/admin/menu-items/${encodeURIComponent(
                  newItemUuid,
                )}/images`,
                {
                  method: "PUT",
                  body: form,
                },
              );

              if ("error" in imgResult) {
                imgResult = await browserRequest<unknown>(
                  `/api/admin/menu-items/${encodeURIComponent(
                    newItemUuid,
                  )}/images`,
                  {
                    method: "POST",
                    body: form,
                  },
                );
              }

              if ("error" in imgResult) {
                await browserRequest<unknown>(
                  `/api/catalog/menu-items/${encodeURIComponent(
                    newItemUuid,
                  )}/images`,
                  {
                    method: "PUT",
                    body: form,
                  },
                );
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
            // 1. Update Core MenuItem (POSTMAN Collection: PUT /api/v1/admin/menu-items/{uuid})
            let coreResult = await browserRequest<unknown>(
              `/api/admin/menu-items/${encodeURIComponent(
                uuid,
              )}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  foodUuid: payload.foodUuid,
                  name: payload.menuItem?.name,
                  description: payload.menuItem?.description,
                  price: payload.menuItem?.price,
                  currencyCode: payload.menuItem?.currencyCode ?? "USD",
                  preparationTimeMinutes: payload.menuItem?.preparationTimeMinutes,
                  availabilityStatus: payload.menuItem?.availabilityStatus ?? "AVAILABLE",
                  ingredientDataStatus: payload.menuItem?.ingredientDataStatus ?? "VERIFIED",
                  featured: payload.menuItem?.isFeatured ?? true,
                  source: "ADMIN",
                }),
              },
            );

            if (
              "error" in coreResult &&
              (coreResult.error as { status?: number })?.status === 404
            ) {
              coreResult = await browserRequest<unknown>(
                `/api/catalog/menu-items/${encodeURIComponent(
                  uuid,
                )}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    foodUuid: payload.foodUuid,
                    menuItem: payload.menuItem,
                  }),
                },
              );
            }

            if ("error" in coreResult) {
              return coreResult;
            }

            // 2. Update Ingredients if provided (POSTMAN Collection: PUT /api/v1/admin/menu-items/{uuid}/ingredients)
            if (payload.ingredients !== undefined) {
              await browserRequest<unknown>(
                `/api/admin/menu-items/${encodeURIComponent(
                  uuid,
                )}/ingredients`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    ingredients: payload.ingredients,
                  }),
                },
              );
            }

            // 3. Update Dietary Types if provided (POSTMAN Collection: PUT /api/v1/admin/menu-items/{uuid}/dietary-types)
            if (payload.dietaryTypes !== undefined) {
              await browserRequest<unknown>(
                `/api/admin/menu-items/${encodeURIComponent(
                  uuid,
                )}/dietary-types`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    dietaryTypes: payload.dietaryTypes,
                  }),
                },
              );
            }

            // 4. Update Allergen Declarations if provided (POSTMAN Collection: PUT /api/v1/admin/menu-items/{uuid}/allergen-declarations)
            if (payload.allergenDeclarations !== undefined) {
              await browserRequest<unknown>(
                `/api/admin/menu-items/${encodeURIComponent(
                  uuid,
                )}/allergen-declarations`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    declarations: payload.allergenDeclarations,
                  }),
                },
              );
            }

            // 5. Update Images if any new images selected
            if (uuid && Array.isArray(images) && images.length > 0) {
              const form = new FormData();
              form.append("thumbnail", images[0]);
              images.slice(1, 4).forEach((image) => {
                form.append("gallery", image);
              });
              images.forEach((image) => {
                form.append("images", image);
              });

              let imgResult = await browserRequest<unknown>(
                `/api/admin/menu-items/${encodeURIComponent(
                  uuid,
                )}/images`,
                {
                  method: "PUT",
                  body: form,
                },
              );

              if ("error" in imgResult) {
                imgResult = await browserRequest<unknown>(
                  `/api/admin/menu-items/${encodeURIComponent(
                    uuid,
                  )}/images`,
                  {
                    method: "POST",
                    body: form,
                  },
                );
              }

              if ("error" in imgResult) {
                await browserRequest<unknown>(
                  `/api/catalog/menu-items/${encodeURIComponent(
                    uuid,
                  )}/images`,
                  {
                    method: "PUT",
                    body: form,
                  },
                );
              }
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
