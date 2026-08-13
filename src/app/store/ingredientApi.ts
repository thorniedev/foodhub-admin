// // import { adminBaseApi } from "./adminBaseApi";

// // import type {
// //   CreateIngredientPayload,
// //   Ingredient,
// //   IngredientListParams,
// //   IngredientPage,
// //   UpdateIngredientPayload,
// // } from "@/src/types/ingredient";

// // type UnknownRecord = Record<string, unknown>;

// // function asRecord(value: unknown): UnknownRecord | null {
// //   if (
// //     typeof value === "object" &&
// //     value !== null &&
// //     !Array.isArray(value)
// //   ) {
// //     return value as UnknownRecord;
// //   }

// //   return null;
// // }

// // function unwrapPayload(value: unknown): unknown {
// //   const record = asRecord(value);

// //   if (!record) {
// //     return value;
// //   }

// //   if (record.payload !== undefined) {
// //     return record.payload;
// //   }

// //   if (record.data !== undefined) {
// //     return record.data;
// //   }

// //   return value;
// // }

// // function toNumber(
// //   value: unknown,
// //   fallback: number,
// // ): number {
// //   const number = Number(value);

// //   return Number.isFinite(number)
// //     ? number
// //     : fallback;
// // }

// // function normalizeIngredient(
// //   value: unknown,
// // ): Ingredient {
// //   const raw =
// //     asRecord(
// //       unwrapPayload(value),
// //     ) ?? {};

// //   const activeValue =
// //     raw.isActive ??
// //     raw.active;

// //   return {
// //     id:
// //       raw.id === null ||
// //       raw.id === undefined
// //         ? null
// //         : toNumber(
// //             raw.id,
// //             0,
// //           ),

// //     uuid: String(
// //       raw.uuid ?? "",
// //     ),

// //     code: String(
// //       raw.code ?? "",
// //     ),

// //     name: String(
// //       raw.name ?? "",
// //     ),

// //     description:
// //       raw.description === null ||
// //       raw.description === undefined
// //         ? null
// //         : String(
// //             raw.description,
// //           ),

// //     isActive:
// //       activeValue ===
// //       undefined
// //         ? true
// //         : Boolean(
// //             activeValue,
// //           ),

// //     createdAt:
// //       raw.createdAt === null ||
// //       raw.createdAt ===
// //         undefined
// //         ? null
// //         : String(
// //             raw.createdAt,
// //           ),

// //     updatedAt:
// //       raw.updatedAt === null ||
// //       raw.updatedAt ===
// //         undefined
// //         ? null
// //         : String(
// //             raw.updatedAt,
// //           ),
// //   };
// // }

// // function normalizeIngredientPage(
// //   response: unknown,
// // ): IngredientPage {
// //   const payload =
// //     unwrapPayload(
// //       response,
// //     );

// //   const raw =
// //     asRecord(payload);

// //   const rawContents =
// //     Array.isArray(payload)
// //       ? payload
// //       : Array.isArray(
// //             raw?.content,
// //           )
// //         ? raw.content
// //         : Array.isArray(
// //               raw?.contents,
// //             )
// //           ? raw.contents
// //           : [];

// //   const contents =
// //     rawContents.map(
// //       normalizeIngredient,
// //     );

// //   const pageNumber =
// //     toNumber(
// //       raw?.number ??
// //         raw?.pageNumber,
// //       0,
// //     );

// //   const pageSize =
// //     toNumber(
// //       raw?.size ??
// //         raw?.pageSize,
// //       contents.length,
// //     );

// //   const totalElements =
// //     toNumber(
// //       raw?.totalElements,
// //       contents.length,
// //     );

// //   const totalPages =
// //     toNumber(
// //       raw?.totalPages,
// //       pageSize > 0
// //         ? Math.ceil(
// //             totalElements /
// //               pageSize,
// //           )
// //         : 1,
// //     );

// //   const numberOfElements =
// //     toNumber(
// //       raw?.numberOfElements,
// //       contents.length,
// //     );

// //   return {
// //     contents,
// //     pageNumber,
// //     pageSize,
// //     numberOfElements,
// //     totalElements,
// //     totalPages:
// //       Math.max(
// //         totalPages,
// //         1,
// //       ),

// //     first:
// //       typeof raw?.first ===
// //       "boolean"
// //         ? raw.first
// //         : pageNumber === 0,

// //     last:
// //       typeof raw?.last ===
// //       "boolean"
// //         ? raw.last
// //         : pageNumber >=
// //           totalPages - 1,

// //     empty:
// //       typeof raw?.empty ===
// //       "boolean"
// //         ? raw.empty
// //         : contents.length ===
// //           0,
// //   };
// // }

// // export const ingredientApi =
// //   adminBaseApi.injectEndpoints({
// //     endpoints: (builder) => ({
// //       /* =========================================
// //          GET ALL
// //       ========================================== */

// //     //   getIngredients:
// //     //     builder.query<
// //     //       IngredientPage,
// //     //       IngredientListParams | void
// //     //     >({
// //     //       query: (params) => ({
// //     //         url: "/ingredients",
// //     //         method: "GET",

// //     //         params: {
// //     //           page:
// //     //             params?.page ??
// //     //             0,

// //     //           size:
// //     //             params?.size ??
// //     //             20,

// //     //           sort:
// //     //             params?.sort ??
// //     //             "name,asc",
// //     //         },
// //     //       }),

// //     //       transformResponse:
// //     //         normalizeIngredientPage,
// //     //     }),


// // //     getIngredients: builder.query<
// // //   IngredientPage,
// // //   IngredientListParams | void
// // // >({
// // //   query: (params) => ({
// // //     url: "/ingredients",
// // //     method: "GET",
// // //     params: {
// // //       page: params?.page ?? 0,
// // //       size: params?.size ?? 20,
// // //       sort: params?.sort ?? "name,asc",
// // //     },
// // //   }),

// // //   transformResponse: normalizeIngredientPage,
// // // }),
// // getIngredients: builder.query<
// //   IngredientPage,
// //   IngredientListParams | void
// // >({
// //   query: (params) => ({
// //     url: "/ingredients",
// //     method: "GET",
// //     params: {
// //       page: params?.page ?? 0,
// //       size: params?.size ?? 20,
// //       sort: params?.sort ?? "name,asc",
// //     },
// //   }),

// //   transformResponse: normalizeIngredientPage,
// // }),

// //       /* =========================================
// //          GET ONE
// //       ========================================== */

// //       getIngredientByUuid:
// //         builder.query<
// //           Ingredient,
// //           string
// //         >({
// //           query: (uuid) => ({
// //             url: `/ingredients/${encodeURIComponent(
// //               uuid,
// //             )}`,

// //             method: "GET",
// //           }),

// //           transformResponse:
// //             normalizeIngredient,
// //         }),

// //       /* =========================================
// //          CREATE
// //       ========================================== */

// //       createIngredient:
// //         builder.mutation<
// //           Ingredient,
// //           CreateIngredientPayload
// //         >({
// //           query: (body) => ({
// //             url: "/ingredients",
// //             method: "POST",
// //             body,
// //           }),

// //           transformResponse:
// //             normalizeIngredient,
// //         }),

// //       /* =========================================
// //          UPDATE
// //       ========================================== */

// //       updateIngredient:
// //         builder.mutation<
// //           Ingredient,
// //           {
// //             uuid: string;
// //             body: UpdateIngredientPayload;
// //           }
// //         >({
// //           query: ({
// //             uuid,
// //             body,
// //           }) => ({
// //             url: `/ingredients/${encodeURIComponent(
// //               uuid,
// //             )}`,

// //             method: "PATCH",
// //             body,
// //           }),

// //           transformResponse:
// //             normalizeIngredient,
// //         }),

// //       /* =========================================
// //          SOFT DELETE
// //       ========================================== */

// //       deleteIngredient:
// //         builder.mutation<
// //           void,
// //           string
// //         >({
// //           query: (uuid) => ({
// //             url: `/ingredients/${encodeURIComponent(
// //               uuid,
// //             )}`,

// //             method: "DELETE",
// //           }),

// //           transformResponse:
// //             () => undefined,
// //         }),

// //       /* =========================================
// //          RESTORE
// //       ========================================== */

// //       restoreIngredient:
// //         builder.mutation<
// //           Ingredient,
// //           string
// //         >({
// //           query: (uuid) => ({
// //             url: `/ingredients/${encodeURIComponent(
// //               uuid,
// //             )}/restore`,

// //             method: "PATCH",
// //           }),

// //           transformResponse:
// //             normalizeIngredient,
// //         }),
// //     }),

// //     overrideExisting: false,
// //   });

// // export const {
// //   useGetIngredientsQuery,
// //   useGetIngredientByUuidQuery,
// //   useCreateIngredientMutation,
// //   useUpdateIngredientMutation,
// //   useDeleteIngredientMutation,
// //   useRestoreIngredientMutation,
// // } = ingredientApi;













// import { baseApi } from "./baseApi";
// import { adminBaseApi } from "./adminBaseApi";

// import type {
//   CreateIngredientPayload,
//   Ingredient,
//   IngredientListParams,
//   IngredientPage,
//   UpdateIngredientPayload,
// } from "@/src/types/ingredient";

// /* =========================================================
//    RESPONSE HELPERS
// ========================================================= */

// type UnknownRecord = Record<string, unknown>;

// function asRecord(value: unknown): UnknownRecord | null {
//   if (
//     typeof value === "object" &&
//     value !== null &&
//     !Array.isArray(value)
//   ) {
//     return value as UnknownRecord;
//   }

//   return null;
// }

// function unwrapPayload(value: unknown): unknown {
//   const record = asRecord(value);

//   if (!record) {
//     return value;
//   }

//   if (record.payload !== undefined) {
//     return record.payload;
//   }

//   if (record.data !== undefined) {
//     return record.data;
//   }

//   return value;
// }

// function toNumber(
//   value: unknown,
//   fallback: number,
// ): number {
//   const parsed = Number(value);

//   return Number.isFinite(parsed)
//     ? parsed
//     : fallback;
// }

// function normalizeIngredient(
//   value: unknown,
// ): Ingredient {
//   const raw =
//     asRecord(
//       unwrapPayload(value),
//     ) ?? {};

//   return {
//     id:
//       raw.id === null ||
//       raw.id === undefined
//         ? null
//         : toNumber(raw.id, 0),

//     uuid: String(
//       raw.uuid ?? "",
//     ),

//     code: String(
//       raw.code ?? "",
//     ),

//     name: String(
//       raw.name ?? "",
//     ),

//     description:
//       raw.description === null ||
//       raw.description === undefined
//         ? null
//         : String(
//             raw.description,
//           ),

//     isActive: Boolean(
//       raw.isActive ??
//         raw.active ??
//         true,
//     ),

//     createdAt:
//       raw.createdAt === null ||
//       raw.createdAt === undefined
//         ? null
//         : String(
//             raw.createdAt,
//           ),

//     updatedAt:
//       raw.updatedAt === null ||
//       raw.updatedAt === undefined
//         ? null
//         : String(
//             raw.updatedAt,
//           ),
//   };
// }

// function normalizeIngredientPage(
//   response: unknown,
// ): IngredientPage {
//   const payload =
//     unwrapPayload(response);

//   const raw =
//     asRecord(payload);

//   const source =
//     Array.isArray(payload)
//       ? payload
//       : Array.isArray(
//             raw?.content,
//           )
//         ? raw.content
//         : Array.isArray(
//               raw?.contents,
//             )
//           ? raw.contents
//           : [];

//   const contents =
//     source.map(
//       normalizeIngredient,
//     );

//   const pageNumber =
//     toNumber(
//       raw?.number ??
//         raw?.pageNumber,
//       0,
//     );

//   const pageSize =
//     toNumber(
//       raw?.size ??
//         raw?.pageSize,
//       contents.length,
//     );

//   const totalElements =
//     toNumber(
//       raw?.totalElements,
//       contents.length,
//     );

//   const totalPages =
//     Math.max(
//       toNumber(
//         raw?.totalPages,
//         1,
//       ),
//       1,
//     );

//   return {
//     contents,

//     pageNumber,

//     pageSize,

//     numberOfElements:
//       toNumber(
//         raw?.numberOfElements,
//         contents.length,
//       ),

//     totalElements,

//     totalPages,

//     first:
//       typeof raw?.first ===
//       "boolean"
//         ? raw.first
//         : pageNumber === 0,

//     last:
//       typeof raw?.last ===
//       "boolean"
//         ? raw.last
//         : pageNumber >=
//           totalPages - 1,

//     empty:
//       typeof raw?.empty ===
//       "boolean"
//         ? raw.empty
//         : contents.length === 0,
//   };
// }

// /* =========================================================
//    READ API

//    GET uses catalog endpoint because this is the endpoint
//    currently working on your deployed backend.
// ========================================================= */

// export const ingredientReadApi =
//   baseApi.injectEndpoints({
//     endpoints: (builder) => ({
//       getIngredients:
//         builder.query<
//           IngredientPage,
//           IngredientListParams | void
//         >({
//           query: (params) => ({
//             url: "/catalog/ingredients",

//             method: "GET",

//             params: {
//               page:
//                 params?.page ??
//                 0,

//               size:
//                 params?.size ??
//                 20,

//               sort:
//                 params?.sort ??
//                 "name,asc",
//             },
//           }),

//           transformResponse:
//             normalizeIngredientPage,
//         }),
//     }),

//     overrideExisting: false,
//   });

// /* =========================================================
//    ADMIN CRUD API
// ========================================================= */

// export const ingredientAdminApi =
//   adminBaseApi.injectEndpoints({
//     endpoints: (builder) => ({
//       createIngredient:
//         builder.mutation<
//           Ingredient,
//           CreateIngredientPayload
//         >({
//           query: (body) => ({
//             url: "/ingredients",
//             method: "POST",
//             body,
//           }),

//           transformResponse:
//             normalizeIngredient,
//         }),

//       updateIngredient:
//         builder.mutation<
//           Ingredient,
//           {
//             uuid: string;
//             body: UpdateIngredientPayload;
//           }
//         >({
//           query: ({
//             uuid,
//             body,
//           }) => ({
//             url: `/ingredients/${encodeURIComponent(
//               uuid,
//             )}`,

//             method: "PATCH",

//             body,
//           }),

//           transformResponse:
//             normalizeIngredient,
//         }),

//       deleteIngredient:
//         builder.mutation<
//           void,
//           string
//         >({
//           query: (uuid) => ({
//             url: `/ingredients/${encodeURIComponent(
//               uuid,
//             )}`,

//             method: "DELETE",
//           }),

//           transformResponse:
//             () => undefined,
//         }),

//       restoreIngredient:
//         builder.mutation<
//           Ingredient,
//           string
//         >({
//           query: (uuid) => ({
//             url: `/ingredients/${encodeURIComponent(
//               uuid,
//             )}/restore`,

//             method: "PATCH",
//           }),

//           transformResponse:
//             normalizeIngredient,
//         }),
//     }),

//     overrideExisting: false,
//   });

// export const {
//   useGetIngredientsQuery,
// } = ingredientReadApi;

// export const {
//   useCreateIngredientMutation,
//   useUpdateIngredientMutation,
//   useDeleteIngredientMutation,
//   useRestoreIngredientMutation,
// } = ingredientAdminApi;


import { adminBaseApi } from "./adminBaseApi";

import type {
  Ingredient,
  IngredientPage,
  IngredientListParams,
  CreateIngredientPayload,
  UpdateIngredientPayload,
} from "@/src/types/ingredient";

type BackendResponse<T> = {
  status: number;
  message: string;
  payload: T;
  timestamp?: string;
};

type SpringPage<T> = {
  content: T[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  number?: number;
  numberOfElements?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
};

function normalizePage(
  response:
    | BackendResponse<SpringPage<Ingredient>>
    | SpringPage<Ingredient>,
): IngredientPage {
  const page =
    "payload" in response
      ? response.payload
      : response;

  const contents =
    page.content ?? [];

  return {
    contents,
    pageNumber: page.number ?? 0,
    pageSize: page.size ?? contents.length,
    numberOfElements:
      page.numberOfElements ??
      contents.length,
    totalElements:
      page.totalElements ??
      contents.length,
    totalPages:
      page.totalPages ?? 1,
    first:
      page.first ?? true,
    last:
      page.last ?? true,
    empty:
      page.empty ??
      contents.length === 0,
  };
}

function unwrapIngredient(
  response:
    | BackendResponse<Ingredient>
    | Ingredient,
): Ingredient {
  if (
    typeof response === "object" &&
    response !== null &&
    "payload" in response
  ) {
    return response.payload;
  }

  return response;
}

export const ingredientApi =
  adminBaseApi.injectEndpoints({
    endpoints: (builder) => ({
      /* =====================================================
         GET ALL
         Browser:
         /api/admin/ingredients

         Backend:
         /api/v1/admin/ingredients
      ===================================================== */

      getIngredients:
        builder.query<
          IngredientPage,
          IngredientListParams | void
        >({
          query: (params) => ({
            url: "/ingredients",
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
              | BackendResponse<
                  SpringPage<Ingredient>
                >
              | SpringPage<Ingredient>,
          ) =>
            normalizePage(response),

          providesTags: [
            {
              type: "Ingredient",
              id: "LIST",
            },
          ],
        }),

      /* =====================================================
         GET ONE
      ===================================================== */

      getIngredientByCode:
        builder.query<
          Ingredient,
          string
        >({
          query: (code) => ({
            url: `/ingredients/${encodeURIComponent(
              code,
            )}`,
            method: "GET",
          }),

          transformResponse: (
            response:
              | BackendResponse<Ingredient>
              | Ingredient,
          ) =>
            unwrapIngredient(response),
        }),

      /* =====================================================
         CREATE
      ===================================================== */

      createIngredient:
        builder.mutation<
          Ingredient,
          CreateIngredientPayload
        >({
          query: (body) => ({
            url: "/ingredients",
            method: "POST",
            body,
          }),

          transformResponse: (
            response:
              | BackendResponse<Ingredient>
              | Ingredient,
          ) =>
            unwrapIngredient(response),

          invalidatesTags: [
            {
              type: "Ingredient",
              id: "LIST",
            },
          ],
        }),

      /* =====================================================
         UPDATE
      ===================================================== */

      updateIngredient:
        builder.mutation<
          Ingredient,
          {
            code: string;
            body: UpdateIngredientPayload;
          }
        >({
          query: ({
            code,
            body,
          }) => ({
            url: `/ingredients/${encodeURIComponent(
              code,
            )}`,
            method: "PATCH",
            body,
          }),

          transformResponse: (
            response:
              | BackendResponse<Ingredient>
              | Ingredient,
          ) =>
            unwrapIngredient(response),

          invalidatesTags: [
            {
              type: "Ingredient",
              id: "LIST",
            },
          ],
        }),

      /* =====================================================
         DELETE / DISABLE
      ===================================================== */

      deleteIngredient:
        builder.mutation<
          void,
          string
        >({
          query: (code) => ({
            url: `/ingredients/${encodeURIComponent(
              code,
            )}`,
            method: "DELETE",
          }),

          invalidatesTags: [
            {
              type: "Ingredient",
              id: "LIST",
            },
          ],    
        }),

      /* =====================================================
         RESTORE
      ===================================================== */

      restoreIngredient:
        builder.mutation<
          Ingredient,
          string
        >({
          query: (code) => ({
            url: `/ingredients/${encodeURIComponent(
              code,
            )}/restore`,
            method: "PATCH",
          }),

          transformResponse: (
            response:
              | BackendResponse<Ingredient>
              | Ingredient,
          ) =>
            unwrapIngredient(response),

          invalidatesTags: [
            {
              type: "Ingredient",
              id: "LIST",
            },
          ],
        }),
    }),

    overrideExisting: false,
  });

export const {
  useGetIngredientsQuery,
  useGetIngredientByCodeQuery,
  useCreateIngredientMutation,
  useUpdateIngredientMutation,
  useDeleteIngredientMutation,
  useRestoreIngredientMutation,
} = ingredientApi;