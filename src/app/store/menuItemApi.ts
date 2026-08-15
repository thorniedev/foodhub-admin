// // import { baseApi } from "./baseApi";
// // import { CreateMenuItemPayload, MenuItem } from "../../types/menuItem";

// // let memoryStore: MenuItem[] | null = null;

// // async function ensureStore(): Promise<MenuItem[]> {
// //   if (memoryStore) return memoryStore;
// //   const res = await fetch("/data/menuItem.json");
// //   const json = await res.json();
// //   memoryStore = (json.menuItems ?? []) as MenuItem[];
// //   return memoryStore;
// // }

// // export const menuItemApi = baseApi.injectEndpoints({
// //   endpoints: (builder) => ({
// //     getMenuItems: builder.query<MenuItem[], void>({
// //       queryFn: async () => {
// //         const data = await ensureStore();
// //         return { data: [...data] };
// //       },
// //       providesTags: (result) =>
// //         result
// //           ? [
// //               ...result.map(({ uuid }) => ({ type: "MenuItem" as const, id: uuid })),
// //               { type: "MenuItem" as const, id: "LIST" },
// //             ]
// //           : [{ type: "MenuItem" as const, id: "LIST" }],
// //     }),

// //     createMenuItem: builder.mutation<MenuItem, CreateMenuItemPayload>({
// //       queryFn: async (payload) => {
// //         const data = await ensureStore();
// //         const item: MenuItem = {
// //           ...payload,
// //           uuid: crypto.randomUUID(),
// //           legacyId: data.length + 1,
// //           createdAt: new Date().toISOString(),
// //           updatedAt: new Date().toISOString(),
// //         };
// //         memoryStore = [item, ...data];
// //         return { data: item };
// //       },
// //       invalidatesTags: [{ type: "MenuItem", id: "LIST" }],
// //     }),

// //     updateMenuItem: builder.mutation<MenuItem, { uuid: string; changes: Partial<MenuItem> }>({
// //       queryFn: async ({ uuid, changes }) => {
// //         const data = await ensureStore();
// //         const index = data.findIndex((m) => m.uuid === uuid);
// //         if (index === -1) {
// //           return { error: { status: 404, data: "Menu item not found" } as any };
// //         }
// //         const updated = { ...data[index], ...changes, updatedAt: new Date().toISOString() };
// //         memoryStore = [...data.slice(0, index), updated, ...data.slice(index + 1)];
// //         return { data: updated };
// //       },
// //       invalidatesTags: (result, error, { uuid }) => [
// //         { type: "MenuItem", id: uuid },
// //         { type: "MenuItem", id: "LIST" },
// //       ],
// //     }),

// //     deleteMenuItem: builder.mutation<{ uuid: string }, string>({
// //       queryFn: async (uuid) => {
// //         const data = await ensureStore();
// //         memoryStore = data.filter((m) => m.uuid !== uuid);
// //         return { data: { uuid } };
// //       },
// //       invalidatesTags: (result, error, uuid) => [
// //         { type: "MenuItem", id: uuid },
// //         { type: "MenuItem", id: "LIST" },
// //       ],
// //     }),

// //     toggleMenuItemAvailability: builder.mutation<MenuItem, string>({
// //       queryFn: async (uuid) => {
// //         const data = await ensureStore();
// //         const index = data.findIndex((m) => m.uuid === uuid);
// //         if (index === -1) {
// //           return { error: { status: 404, data: "Menu item not found" } as any };
// //         }
// //         const current = data[index];
// //         const updated: MenuItem = {
// //           ...current,
// //           availabilityStatus:
// //             current.availabilityStatus === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE",
// //         };
// //         memoryStore = [...data.slice(0, index), updated, ...data.slice(index + 1)];
// //         return { data: updated };
// //       },
// //       invalidatesTags: (result, error, uuid) => [
// //         { type: "MenuItem", id: uuid },
// //         { type: "MenuItem", id: "LIST" },
// //       ],
// //     }),
// //   }),
// //   overrideExisting: true,
// // });

// // export const {
// //   useGetMenuItemsQuery,
// //   useCreateMenuItemMutation,
// //   useUpdateMenuItemMutation,
// //   useDeleteMenuItemMutation,
// //   useToggleMenuItemAvailabilityMutation,
// // } = menuItemApi;











// import { baseApi } from "./baseApi";

// import type {
//   ApiEnvelope,
//   CatalogFood,
//   CatalogListParams,
//   CatalogMenuItem,
//   CreateCatalogFoodPayload,
//   CreateStoreMenuItemPayload,
//   CuisineOption,
//   FoodCategoryOption,
//   FoodListParams,
//   MenuItemListParams,
//   NormalizedPage,
//   PageLike,
// } from "@/src/types/menuItem";

// function unwrap<T>(response: ApiEnvelope<T> | T): T {
//   if (response && typeof response === "object") {
//     const wrapper = response as ApiEnvelope<T>;

//     if (wrapper.payload !== undefined) {
//       return wrapper.payload;
//     }

//     if (wrapper.data !== undefined) {
//       return wrapper.data;
//     }
//   }

//   return response as T;
// }

// function normalizePage<T>(response: ApiEnvelope<PageLike<T>> | PageLike<T>): NormalizedPage<T> {
//   const page = unwrap(response);
//   const contents = page.content ?? page.contents ?? [];
//   const pageNumber = page.number ?? page.pageNumber ?? 0;
//   const pageSize = page.size ?? page.pageSize ?? contents.length;
//   const totalElements = page.totalElements ?? contents.length;
//   const totalPages = Math.max(page.totalPages ?? 1, 1);

//   return {
//     contents,
//     pageNumber,
//     pageSize,
//     numberOfElements: page.numberOfElements ?? contents.length,
//     totalElements,
//     totalPages,
//     first: page.first ?? pageNumber === 0,
//     last: page.last ?? pageNumber >= totalPages - 1,
//     empty: page.empty ?? contents.length === 0,
//   };
// }

// function normalizePossiblyArrayPage<T>(
//   response: ApiEnvelope<PageLike<T> | T[]> | PageLike<T> | T[],
// ): NormalizedPage<T> {
//   const unwrapped = unwrap(response);

//   if (Array.isArray(unwrapped)) {
//     return {
//       contents: unwrapped,
//       pageNumber: 0,
//       pageSize: unwrapped.length,
//       numberOfElements: unwrapped.length,
//       totalElements: unwrapped.length,
//       totalPages: 1,
//       first: true,
//       last: true,
//       empty: unwrapped.length === 0,
//     };
//   }

//   return normalizePage(unwrapped);
// }

// export const menuItemApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     getFoodCategories: builder.query<
//       NormalizedPage<FoodCategoryOption>,
//       CatalogListParams | void
//     >({
//       query: (params) => ({
//         url: "catalog/food-categories",
//         method: "GET",
//         params: {
//           page: params?.page ?? 0,
//           size: params?.size ?? 200,
//           ...(params?.sort ? { sort: params.sort } : {}),
//         },
//       }),
//       transformResponse: (
//         response:
//           | ApiEnvelope<PageLike<FoodCategoryOption> | FoodCategoryOption[]>
//           | PageLike<FoodCategoryOption>
//           | FoodCategoryOption[],
//       ) => normalizePossiblyArrayPage(response),
//     }),

//     createFoodCategory: builder.mutation<
//       FoodCategoryOption,
//       {
//         parentCategoryUuid?: string | null;
//         code: string;
//         name: string;
//         description?: string | null;
//         isActive: boolean;
//       }
//     >({
//       query: (body) => ({
//         url: "catalog/food-categories",
//         method: "POST",
//         body,
//       }),
//       transformResponse: (response: ApiEnvelope<FoodCategoryOption> | FoodCategoryOption) =>
//         unwrap(response),
//     }),

//     getCuisines: builder.query<NormalizedPage<CuisineOption>, CatalogListParams | void>({
//       query: (params) => ({
//         url: "catalog/cuisines",
//         method: "GET",
//         params: {
//           page: params?.page ?? 0,
//           size: params?.size ?? 200,
//           ...(params?.sort ? { sort: params.sort } : {}),
//         },
//       }),
//       transformResponse: (
//         response:
//           | ApiEnvelope<PageLike<CuisineOption> | CuisineOption[]>
//           | PageLike<CuisineOption>
//           | CuisineOption[],
//       ) => normalizePossiblyArrayPage(response),
//     }),

//     createCuisine: builder.mutation<
//       CuisineOption,
//       {
//         code: string;
//         name: string;
//         description?: string | null;
//         isActive: boolean;
//       }
//     >({
//       query: (body) => ({
//         url: "catalog/cuisines",
//         method: "POST",
//         body,
//       }),
//       transformResponse: (response: ApiEnvelope<CuisineOption> | CuisineOption) =>
//         unwrap(response),
//     }),

//     getFoods: builder.query<NormalizedPage<CatalogFood>, FoodListParams | void>({
//       query: (params) => ({
//         url: "catalog/foods",
//         method: "GET",
//         params: {
//           page: params?.page ?? 0,
//           size: params?.size ?? 200,
//           sort: params?.sort ?? "createdAt,desc",
//           ...(params?.query ? { query: params.query } : {}),
//         },
//       }),
//       transformResponse: (
//         response:
//           | ApiEnvelope<PageLike<CatalogFood> | CatalogFood[]>
//           | PageLike<CatalogFood>
//           | CatalogFood[],
//       ) => normalizePossiblyArrayPage(response),
//       providesTags: (result) =>
//         result
//           ? [
//               { type: "Food" as const, id: "LIST" },
//               ...result.contents.map((food) => ({
//                 type: "Food" as const,
//                 id: food.uuid,
//               })),
//             ]
//           : [{ type: "Food" as const, id: "LIST" }],
//     }),

//     // createFood: builder.mutation<CatalogFood, CreateCatalogFoodPayload>({
//     //   query: (body) => ({
//     //     url: "catalog/foods",
//     //     method: "POST",
//     //     body,
//     //   }),
//     //   transformResponse: (response: ApiEnvelope<CatalogFood> | CatalogFood) => unwrap(response),
//     //   invalidatesTags: [{ type: "Food", id: "LIST" }],
//     // }),

//     createFood: builder.mutation<
//   CatalogFood,
//   {
//     body: CreateCatalogFoodPayload;
//     images?: File[];
//   }
// >({
//   query: ({ body, images = [] }) => ({
//     url: "catalog/foods",
//     method: "POST",

//     // IMPORTANT:
//     // Do not manually set Content-Type.
//     // fetch will generate multipart/form-data + boundary.
//     body: buildMultipartBody(
//       "food",
//       body,
//       images,
//     ),
//   }),

//   transformResponse: (
//     response:
//       | ApiEnvelope<CatalogFood>
//       | CatalogFood,
//   ) => unwrap(response),

//   invalidatesTags: [
//     {
//       type: "Food",
//       id: "LIST",
//     },
//   ],
// }),

//     getMenuItems: builder.query<NormalizedPage<CatalogMenuItem>, MenuItemListParams | void>({
//       query: (params) => ({
//         url: "catalog/menu-items",
//         method: "GET",
//         params: {
//           page: params?.page ?? 0,
//           size: params?.size ?? 100,
//           sort: params?.sort ?? "createdAt,desc",
//           ...(params?.foodUuid ? { foodUuid: params.foodUuid } : {}),
//           ...(params?.rootCategoryCode
//             ? { rootCategoryCode: params.rootCategoryCode }
//             : {}),
//         },
//       }),
//       transformResponse: (
//         response:
//           | ApiEnvelope<PageLike<CatalogMenuItem> | CatalogMenuItem[]>
//           | PageLike<CatalogMenuItem>
//           | CatalogMenuItem[],
//       ) => normalizePossiblyArrayPage(response),
//       providesTags: (result) =>
//         result
//           ? [
//               { type: "MenuItem" as const, id: "LIST" },
//               ...result.contents.map((item) => ({
//                 type: "MenuItem" as const,
//                 id: item.uuid,
//               })),
//             ]
//           : [{ type: "MenuItem" as const, id: "LIST" }],
//     }),

//     getMenuItemByUuid: builder.query<CatalogMenuItem, string>({
//       query: (uuid) => ({
//         url: `catalog/menu-items/${encodeURIComponent(uuid)}`,
//         method: "GET",
//       }),
//       transformResponse: (response: ApiEnvelope<CatalogMenuItem> | CatalogMenuItem) =>
//         unwrap(response),
//       providesTags: (_result, _error, uuid) => [{ type: "MenuItem", id: uuid }],
//     }),

//     getMenuItemDetail: builder.query<
//       CatalogMenuItem,
//       {
//         uuid: string;
//         sessionUuid?: string;
//         latitude?: number;
//         longitude?: number;
//       }
//     >({
//       query: ({ uuid, sessionUuid, latitude, longitude }) => ({
//         url: `catalog/menu-items/${encodeURIComponent(uuid)}/detail`,
//         method: "GET",
//         params: {
//           ...(sessionUuid ? { sessionUuid } : {}),
//           ...(typeof latitude === "number" ? { latitude } : {}),
//           ...(typeof longitude === "number" ? { longitude } : {}),
//         },
//       }),
//       transformResponse: (response: ApiEnvelope<CatalogMenuItem> | CatalogMenuItem) =>
//         unwrap(response),
//     }),

//     createStoreMenuItem: builder.mutation<
//       CatalogMenuItem,
//       {
//         storeUuid: string;
//         body: CreateStoreMenuItemPayload;
//       }
//     >({
//       query: ({ storeUuid, body }) => ({
//         url: `catalog/stores/${encodeURIComponent(storeUuid)}/menu-items`,
//         method: "POST",
//         body,
//       }),
//       transformResponse: (response: ApiEnvelope<CatalogMenuItem> | CatalogMenuItem) =>
//         unwrap(response),
//       invalidatesTags: [
//         { type: "MenuItem", id: "LIST" },
//         { type: "Food", id: "LIST" },
//       ],
//     }),
//   }),
//   overrideExisting: false,
// });

// export const {
//   useGetFoodCategoriesQuery,
//   useCreateFoodCategoryMutation,
//   useGetCuisinesQuery,
//   useCreateCuisineMutation,
//   useGetFoodsQuery,
//   useCreateFoodMutation,
//   useGetMenuItemsQuery,
//   useGetMenuItemByUuidQuery,
//   useLazyGetMenuItemByUuidQuery,
//   useGetMenuItemDetailQuery,
//   useLazyGetMenuItemDetailQuery,
//   useCreateStoreMenuItemMutation,
// } = menuItemApi;







import { baseApi } from "./baseApi";

import type {
  ApiEnvelope,
  CatalogFood,
  CatalogListParams,
  CatalogMenuItem,
  CreateCatalogFoodPayload,
  CreateMenuItemPayload,
  CreateStoreMenuItemPayload,
  CuisineOption,
  FoodCategoryOption,
  FoodListParams,
  MenuItem,
  MenuItemListParams,
  NormalizedPage,
  PageLike,
} from "@/src/types/menuItem";

/* =========================================================
   RESPONSE HELPERS
========================================================= */

function unwrap<T>(
  response: ApiEnvelope<T> | T,
): T {
  if (
    response &&
    typeof response === "object"
  ) {
    const wrapper =
      response as ApiEnvelope<T>;

    if (
      wrapper.payload !== undefined
    ) {
      return wrapper.payload;
    }

    if (
      wrapper.data !== undefined
    ) {
      return wrapper.data;
    }
  }

  return response as T;
}

function normalizePage<T>(
  response:
    | ApiEnvelope<PageLike<T>>
    | PageLike<T>,
): NormalizedPage<T> {
  const page =
    unwrap(response);

  const contents =
    page.content ??
    page.contents ??
    [];

  const pageNumber =
    page.number ??
    page.pageNumber ??
    0;

  const pageSize =
    page.size ??
    page.pageSize ??
    contents.length;

  const totalElements =
    page.totalElements ??
    contents.length;

  const totalPages =
    Math.max(
      page.totalPages ?? 1,
      1,
    );

  return {
    contents,

    pageNumber,

    pageSize,

    numberOfElements:
      page.numberOfElements ??
      contents.length,

    totalElements,

    totalPages,

    first:
      page.first ??
      pageNumber === 0,

    last:
      page.last ??
      pageNumber >=
        totalPages - 1,

    empty:
      page.empty ??
      contents.length === 0,
  };
}

function normalizePossiblyArrayPage<T>(
  response:
    | ApiEnvelope<
        PageLike<T> | T[]
      >
    | PageLike<T>
    | T[],
): NormalizedPage<T> {
  const unwrapped =
    unwrap(response);

  if (
    Array.isArray(
      unwrapped,
    )
  ) {
    return {
      contents:
        unwrapped,

      pageNumber: 0,

      pageSize:
        unwrapped.length,

      numberOfElements:
        unwrapped.length,

      totalElements:
        unwrapped.length,

      totalPages: 1,

      first: true,

      last: true,

      empty:
        unwrapped.length ===
        0,
    };
  }

  return normalizePage(
    unwrapped,
  );
}

/* =========================================================
   MULTIPART HELPER

   FOOD CREATE:
   food   -> application/json
   images -> File
   images -> File

   MENU ITEM CREATE:
   request -> application/json
   images  -> File
========================================================= */

function buildMultipartBody(
  jsonPartName:
    | "food"
    | "request",

  body: unknown,

  images: File[] = [],
): FormData {
  const formData =
    new FormData();

  /*
   * IMPORTANT:
   * Spring @RequestPart needs this part to have:
   *
   * Content-Type: application/json
   */
  const jsonBlob =
    new Blob(
      [
        JSON.stringify(
          body,
        ),
      ],
      {
        type:
          "application/json",
      },
    );

  formData.append(
    jsonPartName,
    jsonBlob,
  );

  /*
   * Backend supports multiple image parts.
   * Limit frontend to 4 images.
   */
  images
    .slice(0, 4)
    .forEach(
      (image) => {
        formData.append(
          "images",
          image,
        );
      },
    );

  /*
   * DO NOT manually set:
   *
   * Content-Type: multipart/form-data
   *
   * The browser must generate the boundary.
   */

  return formData;
}

/* =========================================================
   API
========================================================= */

export const menuItemApi =
  baseApi.injectEndpoints({
    endpoints: (
      builder,
    ) => ({
      /* =====================================================
         FOOD CATEGORIES
      ===================================================== */

      getFoodCategories:
        builder.query<
          NormalizedPage<FoodCategoryOption>,
          CatalogListParams | void
        >({
          query: (
            params,
          ) => {
            const p = (params ?? {}) as CatalogListParams;
            return {
              url:
                "catalog/food-categories",

              method:
                "GET",

              params: {
                page:
                  p.page ??
                  0,

                size:
                  p.size ??
                  200,

                ...(p.sort
                  ? {
                      sort:
                        p.sort,
                    }
                  : {}),
              },
            };
          },

          transformResponse:
            (
              response:
                | ApiEnvelope<
                    | PageLike<FoodCategoryOption>
                    | FoodCategoryOption[]
                  >
                | PageLike<FoodCategoryOption>
                | FoodCategoryOption[],
            ) =>
              normalizePossiblyArrayPage(
                response,
              ),
        }),

      /* =====================================================
         CREATE FOOD CATEGORY
      ===================================================== */

      createFoodCategory:
        builder.mutation<
          FoodCategoryOption,
          {
            parentCategoryUuid?:
              | string
              | null;

            code: string;

            name: string;

            description?:
              | string
              | null;

            isActive: boolean;
          }
        >({
          query: (
            body,
          ) => ({
            url:
              "catalog/food-categories",

            method:
              "POST",

            body,
          }),

          transformResponse:
            (
              response:
                | ApiEnvelope<FoodCategoryOption>
                | FoodCategoryOption,
            ) =>
              unwrap(
                response,
              ),
        }),

      /* =====================================================
         CUISINES
      ===================================================== */

      getCuisines:
        builder.query<
          NormalizedPage<CuisineOption>,
          CatalogListParams | void
        >({
          query: (
            params,
          ) => {
            const p = (params ?? {}) as CatalogListParams;
            return {
              url:
                "catalog/cuisines",

              method:
                "GET",

              params: {
                page:
                  p.page ??
                  0,

                size:
                  p.size ??
                  200,

                ...(p.sort
                  ? {
                      sort:
                        p.sort,
                    }
                  : {}),
              },
            };
          },

          transformResponse:
            (
              response:
                | ApiEnvelope<
                    | PageLike<CuisineOption>
                    | CuisineOption[]
                  >
                | PageLike<CuisineOption>
                | CuisineOption[],
            ) =>
              normalizePossiblyArrayPage(
                response,
              ),
        }),

      /* =====================================================
         CREATE CUISINE
      ===================================================== */

      createCuisine:
        builder.mutation<
          CuisineOption,
          {
            code: string;

            name: string;

            description?:
              | string
              | null;

            isActive: boolean;
          }
        >({
          query: (
            body,
          ) => ({
            url:
              "catalog/cuisines",

            method:
              "POST",

            body,
          }),

          transformResponse:
            (
              response:
                | ApiEnvelope<CuisineOption>
                | CuisineOption,
            ) =>
              unwrap(
                response,
              ),
        }),

      /* =====================================================
         GET FOOD CATALOG
      ===================================================== */

      getFoods:
        builder.query<
          NormalizedPage<CatalogFood>,
          FoodListParams | void
        >({
          query: (
            params,
          ) => {
            const p = (params ?? {}) as FoodListParams;
            return {
              url:
                "catalog/foods",

              method:
                "GET",

              params: {
                page:
                  p.page ??
                  0,

                size:
                  p.size ??
                  200,

                sort:
                  p.sort ??
                  "createdAt,desc",

                ...(p.query
                  ? {
                      query:
                        p.query,
                    }
                  : {}),
              },
            };
          },

          transformResponse:
            (
              response:
                | ApiEnvelope<
                    | PageLike<CatalogFood>
                    | CatalogFood[]
                  >
                | PageLike<CatalogFood>
                | CatalogFood[],
            ) =>
              normalizePossiblyArrayPage(
                response,
              ),

          providesTags: (
            result,
          ) =>
            result
              ? [
                  ...result.contents.map(
                    ({
                      uuid,
                    }) => ({
                      type:
                        "Food" as const,

                      id:
                        uuid,
                    }),
                  ),

                  {
                    type:
                      "Food" as const,

                    id:
                      "LIST",
                  },
                ]
              : [
                  {
                    type:
                      "Food" as const,

                    id:
                      "LIST",
                  },
                ],
        }),

      /* =====================================================
         CREATE FOOD WITH IMAGES

         POST /api/catalog/foods

         FormData:
         food   = JSON Blob
         images = File
         images = File
      ===================================================== */

      createFood:
        builder.mutation<
          CatalogFood,
          | CreateCatalogFoodPayload
          | {
              body:
                CreateCatalogFoodPayload;

              images?: File[];
            }
        >({
          query: (
            arg,
          ) => {
            const body = "body" in arg ? arg.body : arg;
            const images = "images" in arg && arg.images ? arg.images : [];
            return {
              url:
                "catalog/foods",

              method:
                "POST",

              body:
                buildMultipartBody(
                  "food",
                  body,
                  images,
                ),
            };
          },

          transformResponse:
            (
              response:
                | ApiEnvelope<CatalogFood>
                | CatalogFood,
            ) =>
              unwrap(
                response,
              ),

          invalidatesTags: [
            {
              type:
                "Food",

              id:
                "LIST",
            },
          ],
        }),

      /* =====================================================
         GET MENU ITEMS
      ===================================================== */

      getMenuItems:
        builder.query<
          NormalizedPage<CatalogMenuItem>,
          MenuItemListParams | void
        >({
          query: (
            params,
          ) => {
            const p = (params ?? {}) as MenuItemListParams;
            return {
              url:
                "catalog/menu-items",

              method:
                "GET",

              params: {
                page:
                  p.page ??
                  0,

                size:
                  p.size ??
                  100,

                sort:
                  p.sort ??
                  "createdAt,desc",

                ...(p.foodUuid
                  ? {
                      foodUuid:
                        p.foodUuid,
                    }
                  : {}),

                ...(p.rootCategoryCode
                  ? {
                      rootCategoryCode:
                        p.rootCategoryCode,
                    }
                  : {}),
              },
            };
          },

          transformResponse:
            (
              response:
                | ApiEnvelope<
                    | PageLike<CatalogMenuItem>
                    | CatalogMenuItem[]
                  >
                | PageLike<CatalogMenuItem>
                | CatalogMenuItem[],
            ) =>
              normalizePossiblyArrayPage(
                response,
              ),

          providesTags: (
            result,
          ) =>
            result
              ? [
                  {
                    type:
                      "MenuItem" as const,

                    id:
                      "LIST",
                  },

                  ...result.contents.map(
                    (
                      item,
                    ) => ({
                      type:
                        "MenuItem" as const,

                      id:
                        item.uuid,
                    }),
                  ),
                ]
              : [
                  {
                    type:
                      "MenuItem" as const,

                    id:
                      "LIST",
                  },
                ],
        }),

      /* =====================================================
         GET MENU ITEM BY UUID
      ===================================================== */

      getMenuItemByUuid:
        builder.query<
          CatalogMenuItem,
          string
        >({
          query: (
            uuid,
          ) => ({
            url:
              `catalog/menu-items/${encodeURIComponent(
                uuid,
              )}`,

            method:
              "GET",
          }),

          transformResponse:
            (
              response:
                | ApiEnvelope<CatalogMenuItem>
                | CatalogMenuItem,
            ) =>
              unwrap(
                response,
              ),

          providesTags: (
            _result,
            _error,
            uuid,
          ) => [
            {
              type:
                "MenuItem",

              id:
                uuid,
            },
          ],
        }),

      /* =====================================================
         MENU ITEM DETAIL
      ===================================================== */

      getMenuItemDetail:
        builder.query<
          CatalogMenuItem,
          {
            uuid: string;

            sessionUuid?:
              string;

            latitude?:
              number;

            longitude?:
              number;
          }
        >({
          query: ({
            uuid,
            sessionUuid,
            latitude,
            longitude,
          }) => ({
            url:
              `catalog/menu-items/${encodeURIComponent(
                uuid,
              )}/detail`,

            method:
              "GET",

            params: {
              ...(sessionUuid
                ? {
                    sessionUuid,
                  }
                : {}),

              ...(typeof latitude ===
              "number"
                ? {
                    latitude,
                  }
                : {}),

              ...(typeof longitude ===
              "number"
                ? {
                    longitude,
                  }
                : {}),
            },
          }),

          transformResponse:
            (
              response:
                | ApiEnvelope<CatalogMenuItem>
                | CatalogMenuItem,
            ) =>
              unwrap(
                response,
              ),
        }),

      /* =====================================================
         CREATE STORE MENU ITEM WITH IMAGES

         POST
         /api/catalog/stores/{storeUuid}/menu-items

         FormData:
         request = JSON Blob
         images  = File
         images  = File
      ===================================================== */

      createStoreMenuItem:
        builder.mutation<
          CatalogMenuItem,
          {
            storeUuid:
              string;

            body:
              CreateStoreMenuItemPayload;

            images?:
              File[];
          }
        >({
          query: ({
            storeUuid,
            body,
            images = [],
          }) => ({
            url:
              `catalog/stores/${encodeURIComponent(
                storeUuid,
              )}/menu-items`,

            method:
              "POST",

            body:
              buildMultipartBody(
                "request",
                body,
                images,
              ),
          }),

          transformResponse:
            (
              response:
                | ApiEnvelope<CatalogMenuItem>
                | CatalogMenuItem,
            ) =>
              unwrap(
                response,
              ),

          invalidatesTags: [
            {
              type:
                "MenuItem",

              id:
                "LIST",
            },

            {
              type:
                "Food",

              id:
                "LIST",
            },
          ],
        }),

      createMenuItem:
        builder.mutation<
          MenuItem,
          CreateMenuItemPayload
        >({
          queryFn: (
            payload,
          ) => {
            const item: MenuItem = {
              ...payload,
              uuid:
                typeof crypto !==
                  "undefined" &&
                crypto.randomUUID
                  ? crypto.randomUUID()
                  : `item-${Date.now()}`,
              legacyId:
                Date.now(),
              createdAt:
                new Date().toISOString(),
              updatedAt:
                new Date().toISOString(),
            };
            return {
              data: item,
            };
          },

          invalidatesTags: [
            {
              type:
                "MenuItem",

              id:
                "LIST",
            },
          ],
        }),
    }),

    overrideExisting:
      false,
  });

/* =========================================================
   EXPORT HOOKS
========================================================= */

export const {
  useGetFoodCategoriesQuery,
  useCreateFoodCategoryMutation,

  useGetCuisinesQuery,
  useCreateCuisineMutation,

  useGetFoodsQuery,
  useCreateFoodMutation,

  useGetMenuItemsQuery,

  useGetMenuItemByUuidQuery,
  useLazyGetMenuItemByUuidQuery,

  useGetMenuItemDetailQuery,
  useLazyGetMenuItemDetailQuery,

  useCreateMenuItemMutation,
  useCreateStoreMenuItemMutation,
} = menuItemApi;