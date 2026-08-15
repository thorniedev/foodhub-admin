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
//           ListParams | void
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
//           PublicMenuItemListParams | void
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
  FoodCategoryOption,
  FoodRecord,
  FoodWritePayload,
  IngredientOption,
  ListParams,
  MenuItemRecord,
  MenuItemWritePayload,
  PublicMenuItemListParams,
  StoreOption,
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
    new Blob(
      [JSON.stringify(payload)],
      {
        type: "application/json",
      },
    ),
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

      getManagedFoods:
        builder.query<
          ApiPage<FoodRecord>,
          ListParams | void
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
            const result = await browserRequest<unknown>(
              "/api/catalog/foods",
              {
                method: "POST",
                body: makeMultipart(
                  "food",
                  payload,
                  images,
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
                  images,
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
          PublicMenuItemListParams | void
        >({
          async queryFn(params) {
            const p = (params ?? {}) as PublicMenuItemListParams;
            const query = makeQuery({
              page: p.page ?? 0,
              size: p.size ?? 100,
              sort:
                p.sort ??
                "createdAt,desc",
              query: p.query,
              rootCategoryCode:
                p.rootCategoryCode,
              storeUuid:
                p.storeUuid,
              foodUuid:
                p.foodUuid,
              availabilityStatus:
                p.availabilityStatus,
              featured:
                p.featured,
            });

            const result = await browserRequest<unknown>(
              `/api/catalog/menu-items${query}`,
            );

            if ("error" in result) {
              return result;
            }

            return {
              data:
                normalizePage<MenuItemRecord>(
                  result.data as never,
                ),
            };
          },
        }),

      getPublishedMenuItemDetail:
        builder.query<MenuItemRecord, string>({
          async queryFn(uuid) {
            const result = await browserRequest<unknown>(
              `/api/catalog/menu-items/${encodeURIComponent(
                uuid,
              )}/detail`,
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
            const result = await browserRequest<unknown>(
              `/api/catalog/stores/${encodeURIComponent(
                storeUuid,
              )}/menu-items`,
              {
                method: "POST",
                body: makeMultipart(
                  "request",
                  payload,
                  images,
                ),
              },
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
            const result = await browserRequest<unknown>(
              `/api/catalog/menu-items/${encodeURIComponent(
                uuid,
              )}`,
              {
                method: "PUT",
                body: makeMultipart(
                  "request",
                  payload,
                  images,
                ),
              },
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

      deleteStoreMenuItem:
        builder.mutation<void, string>({
          async queryFn(uuid) {
            const result = await browserRequest<unknown>(
              `/api/catalog/menu-items/${encodeURIComponent(
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
    }),

    overrideExisting: false,
  });

export const {
  useGetManagedFoodCategoriesQuery,
  useGetManagedCuisinesQuery,
  useGetManagedIngredientsQuery,
  useGetManagedStoresQuery,

  useGetManagedFoodsQuery,
  useGetManagedFoodQuery,
  useCreateManagedFoodMutation,
  useUpdateManagedFoodMutation,
  useDeleteManagedFoodMutation,

  useGetPublishedMenuItemsQuery,
  useGetPublishedMenuItemDetailQuery,
  useCreateStoreMenuItemMutation,
  useUpdateStoreMenuItemMutation,
  useDeleteStoreMenuItemMutation,
} = menuManagementApi;
