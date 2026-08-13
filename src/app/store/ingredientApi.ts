// // // // // import { adminBaseApi } from "./adminBaseApi";

// // // // // import type {
// // // // //   CreateIngredientPayload,
// // // // //   Ingredient,
// // // // //   IngredientListParams,
// // // // //   IngredientPage,
// // // // //   UpdateIngredientPayload,
// // // // // } from "@/src/types/ingredient";

// // // // // type UnknownRecord = Record<string, unknown>;

// // // // // function asRecord(value: unknown): UnknownRecord | null {
// // // // //   if (
// // // // //     typeof value === "object" &&
// // // // //     value !== null &&
// // // // //     !Array.isArray(value)
// // // // //   ) {
// // // // //     return value as UnknownRecord;
// // // // //   }

// // // // //   return null;
// // // // // }

// // // // // function unwrapPayload(value: unknown): unknown {
// // // // //   const record = asRecord(value);

// // // // //   if (!record) {
// // // // //     return value;
// // // // //   }

// // // // //   if (record.payload !== undefined) {
// // // // //     return record.payload;
// // // // //   }

// // // // //   if (record.data !== undefined) {
// // // // //     return record.data;
// // // // //   }

// // // // //   return value;
// // // // // }

// // // // // function toNumber(
// // // // //   value: unknown,
// // // // //   fallback: number,
// // // // // ): number {
// // // // //   const number = Number(value);

// // // // //   return Number.isFinite(number)
// // // // //     ? number
// // // // //     : fallback;
// // // // // }

// // // // // function normalizeIngredient(
// // // // //   value: unknown,
// // // // // ): Ingredient {
// // // // //   const raw =
// // // // //     asRecord(
// // // // //       unwrapPayload(value),
// // // // //     ) ?? {};

// // // // //   const activeValue =
// // // // //     raw.isActive ??
// // // // //     raw.active;

// // // // //   return {
// // // // //     id:
// // // // //       raw.id === null ||
// // // // //       raw.id === undefined
// // // // //         ? null
// // // // //         : toNumber(
// // // // //             raw.id,
// // // // //             0,
// // // // //           ),

// // // // //     uuid: String(
// // // // //       raw.uuid ?? "",
// // // // //     ),

// // // // //     code: String(
// // // // //       raw.code ?? "",
// // // // //     ),

// // // // //     name: String(
// // // // //       raw.name ?? "",
// // // // //     ),

// // // // //     description:
// // // // //       raw.description === null ||
// // // // //       raw.description === undefined
// // // // //         ? null
// // // // //         : String(
// // // // //             raw.description,
// // // // //           ),

// // // // //     isActive:
// // // // //       activeValue ===
// // // // //       undefined
// // // // //         ? true
// // // // //         : Boolean(
// // // // //             activeValue,
// // // // //           ),

// // // // //     createdAt:
// // // // //       raw.createdAt === null ||
// // // // //       raw.createdAt ===
// // // // //         undefined
// // // // //         ? null
// // // // //         : String(
// // // // //             raw.createdAt,
// // // // //           ),

// // // // //     updatedAt:
// // // // //       raw.updatedAt === null ||
// // // // //       raw.updatedAt ===
// // // // //         undefined
// // // // //         ? null
// // // // //         : String(
// // // // //             raw.updatedAt,
// // // // //           ),
// // // // //   };
// // // // // }

// // // // // function normalizeIngredientPage(
// // // // //   response: unknown,
// // // // // ): IngredientPage {
// // // // //   const payload =
// // // // //     unwrapPayload(
// // // // //       response,
// // // // //     );

// // // // //   const raw =
// // // // //     asRecord(payload);

// // // // //   const rawContents =
// // // // //     Array.isArray(payload)
// // // // //       ? payload
// // // // //       : Array.isArray(
// // // // //             raw?.content,
// // // // //           )
// // // // //         ? raw.content
// // // // //         : Array.isArray(
// // // // //               raw?.contents,
// // // // //             )
// // // // //           ? raw.contents
// // // // //           : [];

// // // // //   const contents =
// // // // //     rawContents.map(
// // // // //       normalizeIngredient,
// // // // //     );

// // // // //   const pageNumber =
// // // // //     toNumber(
// // // // //       raw?.number ??
// // // // //         raw?.pageNumber,
// // // // //       0,
// // // // //     );

// // // // //   const pageSize =
// // // // //     toNumber(
// // // // //       raw?.size ??
// // // // //         raw?.pageSize,
// // // // //       contents.length,
// // // // //     );

// // // // //   const totalElements =
// // // // //     toNumber(
// // // // //       raw?.totalElements,
// // // // //       contents.length,
// // // // //     );

// // // // //   const totalPages =
// // // // //     toNumber(
// // // // //       raw?.totalPages,
// // // // //       pageSize > 0
// // // // //         ? Math.ceil(
// // // // //             totalElements /
// // // // //               pageSize,
// // // // //           )
// // // // //         : 1,
// // // // //     );

// // // // //   const numberOfElements =
// // // // //     toNumber(
// // // // //       raw?.numberOfElements,
// // // // //       contents.length,
// // // // //     );

// // // // //   return {
// // // // //     contents,
// // // // //     pageNumber,
// // // // //     pageSize,
// // // // //     numberOfElements,
// // // // //     totalElements,
// // // // //     totalPages:
// // // // //       Math.max(
// // // // //         totalPages,
// // // // //         1,
// // // // //       ),

// // // // //     first:
// // // // //       typeof raw?.first ===
// // // // //       "boolean"
// // // // //         ? raw.first
// // // // //         : pageNumber === 0,

// // // // //     last:
// // // // //       typeof raw?.last ===
// // // // //       "boolean"
// // // // //         ? raw.last
// // // // //         : pageNumber >=
// // // // //           totalPages - 1,

// // // // //     empty:
// // // // //       typeof raw?.empty ===
// // // // //       "boolean"
// // // // //         ? raw.empty
// // // // //         : contents.length ===
// // // // //           0,
// // // // //   };
// // // // // }

// // // // // export const ingredientApi =
// // // // //   adminBaseApi.injectEndpoints({
// // // // //     endpoints: (builder) => ({
// // // // //       /* =========================================
// // // // //          GET ALL
// // // // //       ========================================== */

// // // // //     //   getIngredients:
// // // // //     //     builder.query<
// // // // //     //       IngredientPage,
// // // // //     //       IngredientListParams | void
// // // // //     //     >({
// // // // //     //       query: (params) => ({
// // // // //     //         url: "/ingredients",
// // // // //     //         method: "GET",

// // // // //     //         params: {
// // // // //     //           page:
// // // // //     //             params?.page ??
// // // // //     //             0,

// // // // //     //           size:
// // // // //     //             params?.size ??
// // // // //     //             20,

// // // // //     //           sort:
// // // // //     //             params?.sort ??
// // // // //     //             "name,asc",
// // // // //     //         },
// // // // //     //       }),

// // // // //     //       transformResponse:
// // // // //     //         normalizeIngredientPage,
// // // // //     //     }),


// // // // // //     getIngredients: builder.query<
// // // // // //   IngredientPage,
// // // // // //   IngredientListParams | void
// // // // // // >({
// // // // // //   query: (params) => ({
// // // // // //     url: "/ingredients",
// // // // // //     method: "GET",
// // // // // //     params: {
// // // // // //       page: params?.page ?? 0,
// // // // // //       size: params?.size ?? 20,
// // // // // //       sort: params?.sort ?? "name,asc",
// // // // // //     },
// // // // // //   }),

// // // // // //   transformResponse: normalizeIngredientPage,
// // // // // // }),
// // // // // getIngredients: builder.query<
// // // // //   IngredientPage,
// // // // //   IngredientListParams | void
// // // // // >({
// // // // //   query: (params) => ({
// // // // //     url: "/ingredients",
// // // // //     method: "GET",
// // // // //     params: {
// // // // //       page: params?.page ?? 0,
// // // // //       size: params?.size ?? 20,
// // // // //       sort: params?.sort ?? "name,asc",
// // // // //     },
// // // // //   }),

// // // // //   transformResponse: normalizeIngredientPage,
// // // // // }),

// // // // //       /* =========================================
// // // // //          GET ONE
// // // // //       ========================================== */

// // // // //       getIngredientByUuid:
// // // // //         builder.query<
// // // // //           Ingredient,
// // // // //           string
// // // // //         >({
// // // // //           query: (uuid) => ({
// // // // //             url: `/ingredients/${encodeURIComponent(
// // // // //               uuid,
// // // // //             )}`,

// // // // //             method: "GET",
// // // // //           }),

// // // // //           transformResponse:
// // // // //             normalizeIngredient,
// // // // //         }),

// // // // //       /* =========================================
// // // // //          CREATE
// // // // //       ========================================== */

// // // // //       createIngredient:
// // // // //         builder.mutation<
// // // // //           Ingredient,
// // // // //           CreateIngredientPayload
// // // // //         >({
// // // // //           query: (body) => ({
// // // // //             url: "/ingredients",
// // // // //             method: "POST",
// // // // //             body,
// // // // //           }),

// // // // //           transformResponse:
// // // // //             normalizeIngredient,
// // // // //         }),

// // // // //       /* =========================================
// // // // //          UPDATE
// // // // //       ========================================== */

// // // // //       updateIngredient:
// // // // //         builder.mutation<
// // // // //           Ingredient,
// // // // //           {
// // // // //             uuid: string;
// // // // //             body: UpdateIngredientPayload;
// // // // //           }
// // // // //         >({
// // // // //           query: ({
// // // // //             uuid,
// // // // //             body,
// // // // //           }) => ({
// // // // //             url: `/ingredients/${encodeURIComponent(
// // // // //               uuid,
// // // // //             )}`,

// // // // //             method: "PATCH",
// // // // //             body,
// // // // //           }),

// // // // //           transformResponse:
// // // // //             normalizeIngredient,
// // // // //         }),

// // // // //       /* =========================================
// // // // //          SOFT DELETE
// // // // //       ========================================== */

// // // // //       deleteIngredient:
// // // // //         builder.mutation<
// // // // //           void,
// // // // //           string
// // // // //         >({
// // // // //           query: (uuid) => ({
// // // // //             url: `/ingredients/${encodeURIComponent(
// // // // //               uuid,
// // // // //             )}`,

// // // // //             method: "DELETE",
// // // // //           }),

// // // // //           transformResponse:
// // // // //             () => undefined,
// // // // //         }),

// // // // //       /* =========================================
// // // // //          RESTORE
// // // // //       ========================================== */

// // // // //       restoreIngredient:
// // // // //         builder.mutation<
// // // // //           Ingredient,
// // // // //           string
// // // // //         >({
// // // // //           query: (uuid) => ({
// // // // //             url: `/ingredients/${encodeURIComponent(
// // // // //               uuid,
// // // // //             )}/restore`,

// // // // //             method: "PATCH",
// // // // //           }),

// // // // //           transformResponse:
// // // // //             normalizeIngredient,
// // // // //         }),
// // // // //     }),

// // // // //     overrideExisting: false,
// // // // //   });

// // // // // export const {
// // // // //   useGetIngredientsQuery,
// // // // //   useGetIngredientByUuidQuery,
// // // // //   useCreateIngredientMutation,
// // // // //   useUpdateIngredientMutation,
// // // // //   useDeleteIngredientMutation,
// // // // //   useRestoreIngredientMutation,
// // // // // } = ingredientApi;













// // // // import { baseApi } from "./baseApi";
// // // // import { adminBaseApi } from "./adminBaseApi";

// // // // import type {
// // // //   CreateIngredientPayload,
// // // //   Ingredient,
// // // //   IngredientListParams,
// // // //   IngredientPage,
// // // //   UpdateIngredientPayload,
// // // // } from "@/src/types/ingredient";

// // // // /* =========================================================
// // // //    RESPONSE HELPERS
// // // // ========================================================= */

// // // // type UnknownRecord = Record<string, unknown>;

// // // // function asRecord(value: unknown): UnknownRecord | null {
// // // //   if (
// // // //     typeof value === "object" &&
// // // //     value !== null &&
// // // //     !Array.isArray(value)
// // // //   ) {
// // // //     return value as UnknownRecord;
// // // //   }

// // // //   return null;
// // // // }

// // // // function unwrapPayload(value: unknown): unknown {
// // // //   const record = asRecord(value);

// // // //   if (!record) {
// // // //     return value;
// // // //   }

// // // //   if (record.payload !== undefined) {
// // // //     return record.payload;
// // // //   }

// // // //   if (record.data !== undefined) {
// // // //     return record.data;
// // // //   }

// // // //   return value;
// // // // }

// // // // function toNumber(
// // // //   value: unknown,
// // // //   fallback: number,
// // // // ): number {
// // // //   const parsed = Number(value);

// // // //   return Number.isFinite(parsed)
// // // //     ? parsed
// // // //     : fallback;
// // // // }

// // // // function normalizeIngredient(
// // // //   value: unknown,
// // // // ): Ingredient {
// // // //   const raw =
// // // //     asRecord(
// // // //       unwrapPayload(value),
// // // //     ) ?? {};

// // // //   return {
// // // //     id:
// // // //       raw.id === null ||
// // // //       raw.id === undefined
// // // //         ? null
// // // //         : toNumber(raw.id, 0),

// // // //     uuid: String(
// // // //       raw.uuid ?? "",
// // // //     ),

// // // //     code: String(
// // // //       raw.code ?? "",
// // // //     ),

// // // //     name: String(
// // // //       raw.name ?? "",
// // // //     ),

// // // //     description:
// // // //       raw.description === null ||
// // // //       raw.description === undefined
// // // //         ? null
// // // //         : String(
// // // //             raw.description,
// // // //           ),

// // // //     isActive: Boolean(
// // // //       raw.isActive ??
// // // //         raw.active ??
// // // //         true,
// // // //     ),

// // // //     createdAt:
// // // //       raw.createdAt === null ||
// // // //       raw.createdAt === undefined
// // // //         ? null
// // // //         : String(
// // // //             raw.createdAt,
// // // //           ),

// // // //     updatedAt:
// // // //       raw.updatedAt === null ||
// // // //       raw.updatedAt === undefined
// // // //         ? null
// // // //         : String(
// // // //             raw.updatedAt,
// // // //           ),
// // // //   };
// // // // }

// // // // function normalizeIngredientPage(
// // // //   response: unknown,
// // // // ): IngredientPage {
// // // //   const payload =
// // // //     unwrapPayload(response);

// // // //   const raw =
// // // //     asRecord(payload);

// // // //   const source =
// // // //     Array.isArray(payload)
// // // //       ? payload
// // // //       : Array.isArray(
// // // //             raw?.content,
// // // //           )
// // // //         ? raw.content
// // // //         : Array.isArray(
// // // //               raw?.contents,
// // // //             )
// // // //           ? raw.contents
// // // //           : [];

// // // //   const contents =
// // // //     source.map(
// // // //       normalizeIngredient,
// // // //     );

// // // //   const pageNumber =
// // // //     toNumber(
// // // //       raw?.number ??
// // // //         raw?.pageNumber,
// // // //       0,
// // // //     );

// // // //   const pageSize =
// // // //     toNumber(
// // // //       raw?.size ??
// // // //         raw?.pageSize,
// // // //       contents.length,
// // // //     );

// // // //   const totalElements =
// // // //     toNumber(
// // // //       raw?.totalElements,
// // // //       contents.length,
// // // //     );

// // // //   const totalPages =
// // // //     Math.max(
// // // //       toNumber(
// // // //         raw?.totalPages,
// // // //         1,
// // // //       ),
// // // //       1,
// // // //     );

// // // //   return {
// // // //     contents,

// // // //     pageNumber,

// // // //     pageSize,

// // // //     numberOfElements:
// // // //       toNumber(
// // // //         raw?.numberOfElements,
// // // //         contents.length,
// // // //       ),

// // // //     totalElements,

// // // //     totalPages,

// // // //     first:
// // // //       typeof raw?.first ===
// // // //       "boolean"
// // // //         ? raw.first
// // // //         : pageNumber === 0,

// // // //     last:
// // // //       typeof raw?.last ===
// // // //       "boolean"
// // // //         ? raw.last
// // // //         : pageNumber >=
// // // //           totalPages - 1,

// // // //     empty:
// // // //       typeof raw?.empty ===
// // // //       "boolean"
// // // //         ? raw.empty
// // // //         : contents.length === 0,
// // // //   };
// // // // }

// // // // /* =========================================================
// // // //    READ API

// // // //    GET uses catalog endpoint because this is the endpoint
// // // //    currently working on your deployed backend.
// // // // ========================================================= */

// // // // export const ingredientReadApi =
// // // //   baseApi.injectEndpoints({
// // // //     endpoints: (builder) => ({
// // // //       getIngredients:
// // // //         builder.query<
// // // //           IngredientPage,
// // // //           IngredientListParams | void
// // // //         >({
// // // //           query: (params) => ({
// // // //             url: "/catalog/ingredients",

// // // //             method: "GET",

// // // //             params: {
// // // //               page:
// // // //                 params?.page ??
// // // //                 0,

// // // //               size:
// // // //                 params?.size ??
// // // //                 20,

// // // //               sort:
// // // //                 params?.sort ??
// // // //                 "name,asc",
// // // //             },
// // // //           }),

// // // //           transformResponse:
// // // //             normalizeIngredientPage,
// // // //         }),
// // // //     }),

// // // //     overrideExisting: false,
// // // //   });

// // // // /* =========================================================
// // // //    ADMIN CRUD API
// // // // ========================================================= */

// // // // export const ingredientAdminApi =
// // // //   adminBaseApi.injectEndpoints({
// // // //     endpoints: (builder) => ({
// // // //       createIngredient:
// // // //         builder.mutation<
// // // //           Ingredient,
// // // //           CreateIngredientPayload
// // // //         >({
// // // //           query: (body) => ({
// // // //             url: "/ingredients",
// // // //             method: "POST",
// // // //             body,
// // // //           }),

// // // //           transformResponse:
// // // //             normalizeIngredient,
// // // //         }),

// // // //       updateIngredient:
// // // //         builder.mutation<
// // // //           Ingredient,
// // // //           {
// // // //             uuid: string;
// // // //             body: UpdateIngredientPayload;
// // // //           }
// // // //         >({
// // // //           query: ({
// // // //             uuid,
// // // //             body,
// // // //           }) => ({
// // // //             url: `/ingredients/${encodeURIComponent(
// // // //               uuid,
// // // //             )}`,

// // // //             method: "PATCH",

// // // //             body,
// // // //           }),

// // // //           transformResponse:
// // // //             normalizeIngredient,
// // // //         }),

// // // //       deleteIngredient:
// // // //         builder.mutation<
// // // //           void,
// // // //           string
// // // //         >({
// // // //           query: (uuid) => ({
// // // //             url: `/ingredients/${encodeURIComponent(
// // // //               uuid,
// // // //             )}`,

// // // //             method: "DELETE",
// // // //           }),

// // // //           transformResponse:
// // // //             () => undefined,
// // // //         }),

// // // //       restoreIngredient:
// // // //         builder.mutation<
// // // //           Ingredient,
// // // //           string
// // // //         >({
// // // //           query: (uuid) => ({
// // // //             url: `/ingredients/${encodeURIComponent(
// // // //               uuid,
// // // //             )}/restore`,

// // // //             method: "PATCH",
// // // //           }),

// // // //           transformResponse:
// // // //             normalizeIngredient,
// // // //         }),
// // // //     }),

// // // //     overrideExisting: false,
// // // //   });

// // // // export const {
// // // //   useGetIngredientsQuery,
// // // // } = ingredientReadApi;

// // // // export const {
// // // //   useCreateIngredientMutation,
// // // //   useUpdateIngredientMutation,
// // // //   useDeleteIngredientMutation,
// // // //   useRestoreIngredientMutation,
// // // // } = ingredientAdminApi;


// // // import { adminBaseApi } from "./adminBaseApi";

// // // import type {
// // //   Ingredient,
// // //   IngredientPage,
// // //   IngredientListParams,
// // //   CreateIngredientPayload,
// // //   UpdateIngredientPayload,
// // // } from "@/src/types/ingredient";

// // // type BackendResponse<T> = {
// // //   status: number;
// // //   message: string;
// // //   payload: T;
// // //   timestamp?: string;
// // // };

// // // type SpringPage<T> = {
// // //   content: T[];
// // //   empty?: boolean;
// // //   first?: boolean;
// // //   last?: boolean;
// // //   number?: number;
// // //   numberOfElements?: number;
// // //   size?: number;
// // //   totalElements?: number;
// // //   totalPages?: number;
// // // };

// // // function normalizePage(
// // //   response:
// // //     | BackendResponse<SpringPage<Ingredient>>
// // //     | SpringPage<Ingredient>,
// // // ): IngredientPage {
// // //   const page =
// // //     "payload" in response
// // //       ? response.payload
// // //       : response;

// // //   const contents =
// // //     page.content ?? [];

// // //   return {
// // //     contents,
// // //     pageNumber: page.number ?? 0,
// // //     pageSize: page.size ?? contents.length,
// // //     numberOfElements:
// // //       page.numberOfElements ??
// // //       contents.length,
// // //     totalElements:
// // //       page.totalElements ??
// // //       contents.length,
// // //     totalPages:
// // //       page.totalPages ?? 1,
// // //     first:
// // //       page.first ?? true,
// // //     last:
// // //       page.last ?? true,
// // //     empty:
// // //       page.empty ??
// // //       contents.length === 0,
// // //   };
// // // }

// // // function unwrapIngredient(
// // //   response:
// // //     | BackendResponse<Ingredient>
// // //     | Ingredient,
// // // ): Ingredient {
// // //   if (
// // //     typeof response === "object" &&
// // //     response !== null &&
// // //     "payload" in response
// // //   ) {
// // //     return response.payload;
// // //   }

// // //   return response;
// // // }

// // // export const ingredientApi =
// // //   adminBaseApi.injectEndpoints({
// // //     endpoints: (builder) => ({
// // //       /* =====================================================
// // //          GET ALL
// // //          Browser:
// // //          /api/admin/ingredients

// // //          Backend:
// // //          /api/v1/admin/ingredients
// // //       ===================================================== */

// // //       getIngredients:
// // //         builder.query<
// // //           IngredientPage,
// // //           IngredientListParams | void
// // //         >({
// // //           query: (params) => ({
// // //             url: "/ingredients",
// // //             method: "GET",
// // //             params: {
// // //               page:
// // //                 params?.page ?? 0,
// // //               size:
// // //                 params?.size ?? 20,
// // //               sort:
// // //                 params?.sort ??
// // //                 "name,asc",
// // //             },
// // //           }),

// // //           transformResponse: (
// // //             response:
// // //               | BackendResponse<
// // //                   SpringPage<Ingredient>
// // //                 >
// // //               | SpringPage<Ingredient>,
// // //           ) =>
// // //             normalizePage(response),

// // //           providesTags: [
// // //             {
// // //               type: "Ingredient",
// // //               id: "LIST",
// // //             },
// // //           ],
// // //         }),

// // //       /* =====================================================
// // //          GET ONE
// // //       ===================================================== */

// // //       getIngredientByCode:
// // //         builder.query<
// // //           Ingredient,
// // //           string
// // //         >({
// // //           query: (code) => ({
// // //             url: `/ingredients/${encodeURIComponent(
// // //               code,
// // //             )}`,
// // //             method: "GET",
// // //           }),

// // //           transformResponse: (
// // //             response:
// // //               | BackendResponse<Ingredient>
// // //               | Ingredient,
// // //           ) =>
// // //             unwrapIngredient(response),
// // //         }),

// // //       /* =====================================================
// // //          CREATE
// // //       ===================================================== */

// // //       createIngredient:
// // //         builder.mutation<
// // //           Ingredient,
// // //           CreateIngredientPayload
// // //         >({
// // //           query: (body) => ({
// // //             url: "/ingredients",
// // //             method: "POST",
// // //             body,
// // //           }),

// // //           transformResponse: (
// // //             response:
// // //               | BackendResponse<Ingredient>
// // //               | Ingredient,
// // //           ) =>
// // //             unwrapIngredient(response),

// // //           invalidatesTags: [
// // //             {
// // //               type: "Ingredient",
// // //               id: "LIST",
// // //             },
// // //           ],
// // //         }),

// // //       /* =====================================================
// // //          UPDATE
// // //       ===================================================== */

// // //       updateIngredient:
// // //         builder.mutation<
// // //           Ingredient,
// // //           {
// // //             code: string;
// // //             body: UpdateIngredientPayload;
// // //           }
// // //         >({
// // //           query: ({
// // //             code,
// // //             body,
// // //           }) => ({
// // //             url: `/ingredients/${encodeURIComponent(
// // //               code,
// // //             )}`,
// // //             method: "PATCH",
// // //             body,
// // //           }),

// // //           transformResponse: (
// // //             response:
// // //               | BackendResponse<Ingredient>
// // //               | Ingredient,
// // //           ) =>
// // //             unwrapIngredient(response),

// // //           invalidatesTags: [
// // //             {
// // //               type: "Ingredient",
// // //               id: "LIST",
// // //             },
// // //           ],
// // //         }),

// // //       /* =====================================================
// // //          DELETE / DISABLE
// // //       ===================================================== */

// // //       deleteIngredient:
// // //         builder.mutation<
// // //           void,
// // //           string
// // //         >({
// // //           query: (code) => ({
// // //             url: `/ingredients/${encodeURIComponent(
// // //               code,
// // //             )}`,
// // //             method: "DELETE",
// // //           }),

// // //           invalidatesTags: [
// // //             {
// // //               type: "Ingredient",
// // //               id: "LIST",
// // //             },
// // //           ],    
// // //         }),

// // //       /* =====================================================
// // //          RESTORE
// // //       ===================================================== */

// // //       restoreIngredient:
// // //         builder.mutation<
// // //           Ingredient,
// // //           string
// // //         >({
// // //           query: (code) => ({
// // //             url: `/ingredients/${encodeURIComponent(
// // //               code,
// // //             )}/restore`,
// // //             method: "PATCH",
// // //           }),

// // //           transformResponse: (
// // //             response:
// // //               | BackendResponse<Ingredient>
// // //               | Ingredient,
// // //           ) =>
// // //             unwrapIngredient(response),

// // //           invalidatesTags: [
// // //             {
// // //               type: "Ingredient",
// // //               id: "LIST",
// // //             },
// // //           ],
// // //         }),
// // //     }),

// // //     overrideExisting: false,
// // //   });

// // // export const {
// // //   useGetIngredientsQuery,
// // //   useGetIngredientByCodeQuery,
// // //   useCreateIngredientMutation,
// // //   useUpdateIngredientMutation,
// // //   useDeleteIngredientMutation,
// // //   useRestoreIngredientMutation,
// // // } = ingredientApi;

// // import { baseApi } from "./baseApi";
// // import { adminBaseApi } from "./adminBaseApi";

// // import type {
// //   CreateIngredientPayload,
// //   Ingredient,
// //   IngredientListParams,
// //   IngredientPage,
// //   UpdateIngredientPayload,
// // } from "@/src/types/ingredient";

// // /* =========================================================
// //    API RESPONSE
// // ========================================================= */

// // type ApiResponse<T> = {
// //   status: number;
// //   message: string;
// //   payload: T;
// //   timestamp?: string;
// // };

// // type SpringPage<T> = {
// //   content: T[];
// //   empty?: boolean;
// //   first?: boolean;
// //   last?: boolean;
// //   number?: number;
// //   numberOfElements?: number;
// //   size?: number;
// //   totalElements?: number;
// //   totalPages?: number;
// // };

// // /* =========================================================
// //    HELPERS
// // ========================================================= */

// // function unwrapPayload<T>(
// //   response: ApiResponse<T> | T,
// // ): T {
// //   if (
// //     response &&
// //     typeof response === "object" &&
// //     "payload" in response
// //   ) {
// //     return (response as ApiResponse<T>).payload;
// //   }

// //   return response as T;
// // }

// // function normalizePage(
// //   response:
// //     | ApiResponse<SpringPage<Ingredient>>
// //     | SpringPage<Ingredient>,
// // ): IngredientPage {
// //   const page = unwrapPayload(response);

// //   const contents = page.content ?? [];

// //   return {
// //     contents,

// //     pageNumber:
// //       page.number ?? 0,

// //     pageSize:
// //       page.size ?? contents.length,

// //     numberOfElements:
// //       page.numberOfElements ?? contents.length,

// //     totalElements:
// //       page.totalElements ?? contents.length,

// //     totalPages:
// //       Math.max(page.totalPages ?? 1, 1),

// //     first:
// //       page.first ?? true,

// //     last:
// //       page.last ?? true,

// //     empty:
// //       page.empty ?? contents.length === 0,
// //   };
// // }

// // /* =========================================================
// //    GET INGREDIENTS

// //    IMPORTANT:
// //    This uses:
// //    /api/catalog/ingredients

// //    NOT:
// //    /api/admin/ingredients
// // ========================================================= */

// // const ingredientCatalogApi =
// //   baseApi.injectEndpoints({
// //     endpoints: (builder) => ({
// //       getIngredients: builder.query<
// //         IngredientPage,
// //         IngredientListParams | void
// //       >({
// //         query: (params) => ({
// //           url: "/catalog/ingredients",

// //           method: "GET",

// //           params: {
// //             page:
// //               params?.page ?? 0,

// //             size:
// //               params?.size ?? 100,

// //             sort:
// //               params?.sort ?? "name,asc",
// //           },
// //         }),

// //         transformResponse: (
// //           response:
// //             | ApiResponse<SpringPage<Ingredient>>
// //             | SpringPage<Ingredient>,
// //         ) => normalizePage(response),
// //       }),
// //     }),

// //     overrideExisting: false,
// //   });

// // /* =========================================================
// //    ADMIN CRUD
// // ========================================================= */

// // const ingredientAdminApi =
// //   adminBaseApi.injectEndpoints({
// //     endpoints: (builder) => ({
// //       /* =====================================================
// //          CREATE

// //          POST /api/admin/ingredients
// //       ===================================================== */

// //       createIngredient: builder.mutation<
// //         Ingredient,
// //         CreateIngredientPayload
// //       >({
// //         query: (body) => ({
// //           url: "/ingredients",
// //           method: "POST",
// //           body,
// //         }),

// //         transformResponse: (
// //           response:
// //             | ApiResponse<Ingredient>
// //             | Ingredient,
// //         ) => unwrapPayload(response),
// //       }),

// //       /* =====================================================
// //          UPDATE

// //          PATCH /api/admin/ingredients/{uuid}
// //       ===================================================== */

// //       updateIngredient: builder.mutation<
// //         Ingredient,
// //         {
// //           uuid: string;
// //           body: UpdateIngredientPayload;
// //         }
// //       >({
// //         query: ({ uuid, body }) => ({
// //           url: `/ingredients/${encodeURIComponent(
// //             uuid,
// //           )}`,

// //           method: "PATCH",

// //           body,
// //         }),

// //         transformResponse: (
// //           response:
// //             | ApiResponse<Ingredient>
// //             | Ingredient,
// //         ) => unwrapPayload(response),
// //       }),

// //       /* =====================================================
// //          DELETE

// //          DELETE /api/admin/ingredients/{uuid}
// //       ===================================================== */

// //       deleteIngredient: builder.mutation<
// //         void,
// //         string
// //       >({
// //         query: (uuid) => ({
// //           url: `/ingredients/${encodeURIComponent(
// //             uuid,
// //           )}`,

// //           method: "DELETE",
// //         }),
// //       }),

// //       /* =====================================================
// //          RESTORE

// //          PATCH /api/admin/ingredients/{uuid}/restore
// //       ===================================================== */

// //       restoreIngredient: builder.mutation<
// //         Ingredient,
// //         string
// //       >({
// //         query: (uuid) => ({
// //           url: `/ingredients/${encodeURIComponent(
// //             uuid,
// //           )}/restore`,

// //           method: "PATCH",
// //         }),

// //         transformResponse: (
// //           response:
// //             | ApiResponse<Ingredient>
// //             | Ingredient,
// //         ) => unwrapPayload(response),
// //       }),
// //     }),

// //     overrideExisting: false,
// //   });

// // /* =========================================================
// //    EXPORTS
// // ========================================================= */

// // export const {
// //   useGetIngredientsQuery,
// // } = ingredientCatalogApi;

// // export const {
// //   useCreateIngredientMutation,
// //   useUpdateIngredientMutation,
// //   useDeleteIngredientMutation,
// //   useRestoreIngredientMutation,
// // } = ingredientAdminApi;














// import { adminBaseApi } from "./adminBaseApi";

// import type {
//   CreateIngredientPayload,
//   Ingredient,
//   IngredientListParams,
//   IngredientPage,
//   UpdateIngredientPayload,
// } from "@/src/types/ingredient";

// /* =========================================================
//    BACKEND RESPONSE TYPES
// ========================================================= */

// type ApiResponse<T> = {
//   status: number;
//   message: string;
//   payload: T;
//   timestamp?: string;
// };

// type SpringPage<T> = {
//   content: T[];
//   empty?: boolean;
//   first?: boolean;
//   last?: boolean;
//   number?: number;
//   numberOfElements?: number;
//   size?: number;
//   totalElements?: number;
//   totalPages?: number;
// };

// /* =========================================================
//    UNWRAP BACKEND PAYLOAD
// ========================================================= */

// function unwrapPayload<T>(
//   response: ApiResponse<T> | T,
// ): T {
//   if (
//     response &&
//     typeof response === "object" &&
//     "payload" in response
//   ) {
//     return (response as ApiResponse<T>).payload;
//   }

//   return response as T;
// }

// /* =========================================================
//    NORMALIZE PAGINATION RESPONSE

//    Backend response:

//    {
//      status: 200,
//      message: "...",
//      payload: {
//        content: [...],
//        number: 0,
//        size: 20,
//        totalElements: 20,
//        totalPages: 1
//      }
//    }
// ========================================================= */

// function normalizeIngredientPage(
//   response:
//     | ApiResponse<SpringPage<Ingredient>>
//     | SpringPage<Ingredient>,
// ): IngredientPage {
//   const page = unwrapPayload(response);

//   const contents = page.content ?? [];

//   const pageNumber = page.number ?? 0;

//   const pageSize =
//     page.size ?? contents.length;

//   const totalElements =
//     page.totalElements ?? contents.length;

//   const totalPages = Math.max(
//     page.totalPages ?? 1,
//     1,
//   );

//   return {
//     contents,

//     pageNumber,

//     pageSize,

//     numberOfElements:
//       page.numberOfElements ?? contents.length,

//     totalElements,

//     totalPages,

//     first:
//       page.first ?? pageNumber === 0,

//     last:
//       page.last ??
//       pageNumber >= totalPages - 1,

//     empty:
//       page.empty ?? contents.length === 0,
//   };
// }

// /* =========================================================
//    INGREDIENT API

//    adminBaseApi baseUrl:

//    /api/admin

//    Therefore:

//    url: "ingredients"

//    becomes:

//    /api/admin/ingredients
// ========================================================= */

// export const ingredientApi =
//   adminBaseApi.injectEndpoints({
//     endpoints: (builder) => ({
//       /* =====================================================
//          GET ALL

//          Browser:
//          GET /api/admin/ingredients

//          Backend proxy:
//          GET /api/v1/admin/ingredients
//       ===================================================== */

//       getIngredients: builder.query<
//         IngredientPage,
//         IngredientListParams | void
//       >({
//         query: (params) => ({
//           url: "ingredients",

//           method: "GET",

//           params: {
//             page:
//               params?.page ?? 0,

//             size:
//               params?.size ?? 20,

//             sort:
//               params?.sort ?? "name,asc",
//           },
//         }),

//         transformResponse: (
//           response:
//             | ApiResponse<SpringPage<Ingredient>>
//             | SpringPage<Ingredient>,
//         ) =>
//           normalizeIngredientPage(response),

//         providesTags: (result) =>
//           result
//             ? [
//                 {
//                   type: "Ingredient" as const,
//                   id: "LIST",
//                 },

//                 ...result.contents.map((item) => ({
//                   type: "Ingredient" as const,
//                   id: item.uuid,
//                 })),
//               ]
//             : [
//                 {
//                   type: "Ingredient" as const,
//                   id: "LIST",
//                 },
//               ],
//       }),

//       /* =====================================================
//          GET ONE
//       ===================================================== */

//       getIngredientByUuid: builder.query<
//         Ingredient,
//         string
//       >({
//         query: (uuid) => ({
//           url: `ingredients/${encodeURIComponent(
//             uuid,
//           )}`,

//           method: "GET",
//         }),

//         transformResponse: (
//           response:
//             | ApiResponse<Ingredient>
//             | Ingredient,
//         ) => unwrapPayload(response),

//         providesTags: (_result, _error, uuid) => [
//           {
//             type: "Ingredient",
//             id: uuid,
//           },
//         ],
//       }),

//       /* =====================================================
//          CREATE
//       ===================================================== */

//       createIngredient: builder.mutation<
//         Ingredient,
//         CreateIngredientPayload
//       >({
//         query: (body) => ({
//           url: "ingredients",

//           method: "POST",

//           body,
//         }),

//         transformResponse: (
//           response:
//             | ApiResponse<Ingredient>
//             | Ingredient,
//         ) => unwrapPayload(response),

//         invalidatesTags: [
//           {
//             type: "Ingredient",
//             id: "LIST",
//           },
//         ],
//       }),

//       /* =====================================================
//          UPDATE
//       ===================================================== */

//       updateIngredient: builder.mutation<
//         Ingredient,
//         {
//           uuid: string;
//           body: UpdateIngredientPayload;
//         }
//       >({
//         query: ({ uuid, body }) => ({
//           url: `ingredients/${encodeURIComponent(
//             uuid,
//           )}`,

//           method: "PATCH",

//           body,
//         }),

//         transformResponse: (
//           response:
//             | ApiResponse<Ingredient>
//             | Ingredient,
//         ) => unwrapPayload(response),

//         invalidatesTags: (
//           _result,
//           _error,
//           { uuid },
//         ) => [
//           {
//             type: "Ingredient",
//             id: uuid,
//           },

//           {
//             type: "Ingredient",
//             id: "LIST",
//           },
//         ],
//       }),

//       /* =====================================================
//          SOFT DELETE
//       ===================================================== */

//       deleteIngredient: builder.mutation<
//         void,
//         string
//       >({
//         query: (uuid) => ({
//           url: `ingredients/${encodeURIComponent(
//             uuid,
//           )}`,

//           method: "DELETE",
//         }),

//         invalidatesTags: (
//           _result,
//           _error,
//           uuid,
//         ) => [
//           {
//             type: "Ingredient",
//             id: uuid,
//           },

//           {
//             type: "Ingredient",
//             id: "LIST",
//           },
//         ],
//       }),

//       /* =====================================================
//          RESTORE
//       ===================================================== */

//       restoreIngredient: builder.mutation<
//         Ingredient,
//         string
//       >({
//         query: (uuid) => ({
//           url: `ingredients/${encodeURIComponent(
//             uuid,
//           )}/restore`,

//           method: "PATCH",
//         }),

//         transformResponse: (
//           response:
//             | ApiResponse<Ingredient>
//             | Ingredient,
//         ) => unwrapPayload(response),

//         invalidatesTags: (
//           _result,
//           _error,
//           uuid,
//         ) => [
//           {
//             type: "Ingredient",
//             id: uuid,
//           },

//           {
//             type: "Ingredient",
//             id: "LIST",
//           },
//         ],
//       }),
//     }),

//     overrideExisting: false,
//   });

// /* =========================================================
//    EXPORT ALL HOOKS
// ========================================================= */

// export const {
//   useGetIngredientsQuery,
//   useGetIngredientByUuidQuery,
//   useCreateIngredientMutation,
//   useUpdateIngredientMutation,
//   useDeleteIngredientMutation,
//   useRestoreIngredientMutation,
// } = ingredientApi;











import { adminBaseApi } from "./adminBaseApi";

import type {
  CreateIngredientPayload,
  Ingredient,
  IngredientListParams,
  IngredientPage,
  UpdateIngredientPayload,
} from "@/src/types/ingredient";

/* =========================================================
   BACKEND RESPONSE TYPES
========================================================= */

type ApiResponse<T> = {
  status?: number;
  message?: string;

  // Your newer backend response
  payload?: T;

  // Some older responses/tests may use data
  data?: T;

  timestamp?: string;
};

type SpringPage<T> = {
  content?: T[];
  contents?: T[];

  empty?: boolean;
  first?: boolean;
  last?: boolean;

  number?: number;
  pageNumber?: number;

  numberOfElements?: number;

  size?: number;
  pageSize?: number;

  totalElements?: number;
  totalPages?: number;
};

/* =========================================================
   UNWRAP RESPONSE
========================================================= */

function unwrapResponse<T>(
  response: ApiResponse<T> | T,
): T {
  if (
    response &&
    typeof response === "object"
  ) {
    const wrapper =
      response as ApiResponse<T>;

    if (wrapper.payload !== undefined) {
      return wrapper.payload;
    }

    if (wrapper.data !== undefined) {
      return wrapper.data;
    }
  }

  return response as T;
}

/* =========================================================
   NORMALIZE PAGE RESPONSE
========================================================= */

function normalizeIngredientPage(
  response:
    | ApiResponse<SpringPage<Ingredient>>
    | SpringPage<Ingredient>,
): IngredientPage {
  const page =
    unwrapResponse(response);

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
      pageNumber >= totalPages - 1,

    empty:
      page.empty ??
      contents.length === 0,
  };
}

/* =========================================================
   INGREDIENT API

   adminBaseApi baseUrl:
   /api/admin

   Therefore:

   catalog/ingredients

   becomes:

   /api/admin/catalog/ingredients

   Your Next.js catch-all should then proxy it to:

   /api/v1/admin/catalog/ingredients
========================================================= */

export const ingredientApi =
  adminBaseApi.injectEndpoints({
    endpoints: (builder) => ({
      /* =====================================================
         GET ALL INGREDIENTS

         Browser:
         GET /api/admin/catalog/ingredients

         Backend:
         GET /api/v1/admin/catalog/ingredients
      ===================================================== */

      getIngredients: builder.query<
        IngredientPage,
        IngredientListParams | void
      >({
        query: (params) => ({
          url: "catalog/ingredients",

          method: "GET",

          params: {
            page:
              params?.page ?? 0,

            size:
              params?.size ?? 20,

            sort:
              params?.sort ??
              "name,asc",
          },
        }),

        transformResponse: (
          response:
            | ApiResponse<
                SpringPage<Ingredient>
              >
            | SpringPage<Ingredient>,
        ) =>
          normalizeIngredientPage(
            response,
          ),

        providesTags: (result) =>
          result
            ? [
                {
                  type: "Ingredient" as const,
                  id: "LIST",
                },

                ...result.contents.map(
                  (item) => ({
                    type: "Ingredient" as const,
                    id: item.uuid,
                  }),
                ),
              ]
            : [
                {
                  type: "Ingredient" as const,
                  id: "LIST",
                },
              ],
      }),

      /* =====================================================
         GET INGREDIENT BY UUID

         GET
         /api/v1/admin/catalog/ingredients/{uuid}
      ===================================================== */

      getIngredientByUuid:
        builder.query<
          Ingredient,
          string
        >({
          query: (uuid) => ({
            url: `catalog/ingredients/${encodeURIComponent(
              uuid,
            )}`,

            method: "GET",
          }),

          transformResponse: (
            response:
              | ApiResponse<Ingredient>
              | Ingredient,
          ) =>
            unwrapResponse(
              response,
            ),

          providesTags: (
            _result,
            _error,
            uuid,
          ) => [
            {
              type: "Ingredient",
              id: uuid,
            },
          ],
        }),

      /* =====================================================
         CREATE INGREDIENT

         POST
         /api/v1/admin/catalog/ingredients
      ===================================================== */

      createIngredient:
        builder.mutation<
          Ingredient,
          CreateIngredientPayload
        >({
          query: (body) => ({
            url: "catalog/ingredients",

            method: "POST",

            body,
          }),

          transformResponse: (
            response:
              | ApiResponse<Ingredient>
              | Ingredient,
          ) =>
            unwrapResponse(
              response,
            ),

          invalidatesTags: [
            {
              type: "Ingredient",
              id: "LIST",
            },
          ],
        }),

      /* =====================================================
         UPDATE INGREDIENT

         PATCH
         /api/v1/admin/catalog/ingredients/{uuid}
      ===================================================== */

      updateIngredient:
        builder.mutation<
          Ingredient,
          {
            uuid: string;
            body: UpdateIngredientPayload;
          }
        >({
          query: ({
            uuid,
            body,
          }) => ({
            url: `catalog/ingredients/${encodeURIComponent(
              uuid,
            )}`,

            method: "PATCH",

            body,
          }),

          transformResponse: (
            response:
              | ApiResponse<Ingredient>
              | Ingredient,
          ) =>
            unwrapResponse(
              response,
            ),

          invalidatesTags: (
            _result,
            _error,
            { uuid },
          ) => [
            {
              type: "Ingredient",
              id: uuid,
            },

            {
              type: "Ingredient",
              id: "LIST",
            },
          ],
        }),

      /* =====================================================
         DEACTIVATE / SOFT DELETE

         Your current UI uses:
         useDeleteIngredientMutation()

         But instead of permanently deleting,
         we PATCH:

         {
           "isActive": false
         }

         This keeps the item available in the
         "អសកម្ម" tab and allows Restore.
      ===================================================== */

      deleteIngredient:
        builder.mutation<
          Ingredient,
          string
        >({
          query: (uuid) => ({
            url: `catalog/ingredients/${encodeURIComponent(
              uuid,
            )}`,

            method: "PATCH",

            body: {
              isActive: false,
            },
          }),

          transformResponse: (
            response:
              | ApiResponse<Ingredient>
              | Ingredient,
          ) =>
            unwrapResponse(
              response,
            ),

          invalidatesTags: (
            _result,
            _error,
            uuid,
          ) => [
            {
              type: "Ingredient",
              id: uuid,
            },

            {
              type: "Ingredient",
              id: "LIST",
            },
          ],
        }),

      /* =====================================================
         RESTORE / ACTIVATE

         PATCH
         /api/v1/admin/catalog/ingredients/{uuid}

         {
           "isActive": true
         }
      ===================================================== */

      restoreIngredient:
        builder.mutation<
          Ingredient,
          string
        >({
          query: (uuid) => ({
            url: `catalog/ingredients/${encodeURIComponent(
              uuid,
            )}`,

            method: "PATCH",

            body: {
              isActive: true,
            },
          }),

          transformResponse: (
            response:
              | ApiResponse<Ingredient>
              | Ingredient,
          ) =>
            unwrapResponse(
              response,
            ),

          invalidatesTags: (
            _result,
            _error,
            uuid,
          ) => [
            {
              type: "Ingredient",
              id: uuid,
            },

            {
              type: "Ingredient",
              id: "LIST",
            },
          ],
        }),

      /* =====================================================
         PERMANENT DELETE

         DELETE
         /api/v1/admin/catalog/ingredients/{uuid}

         This is separate from the Soft Delete button.
      ===================================================== */

      hardDeleteIngredient:
        builder.mutation<
          unknown,
          string
        >({
          query: (uuid) => ({
            url: `catalog/ingredients/${encodeURIComponent(
              uuid,
            )}`,

            method: "DELETE",
          }),

          invalidatesTags: (
            _result,
            _error,
            uuid,
          ) => [
            {
              type: "Ingredient",
              id: uuid,
            },

            {
              type: "Ingredient",
              id: "LIST",
            },
          ],
        }),
    }),

    overrideExisting: false,
  });

/* =========================================================
   EXPORT HOOKS
========================================================= */

export const {
  useGetIngredientsQuery,
  useGetIngredientByUuidQuery,
  useCreateIngredientMutation,
  useUpdateIngredientMutation,
  useDeleteIngredientMutation,
  useRestoreIngredientMutation,
  useHardDeleteIngredientMutation,
} = ingredientApi;