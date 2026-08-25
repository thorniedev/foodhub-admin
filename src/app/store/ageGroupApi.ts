import { catalogBaseApi } from "./catalogBaseApi";

import type {
  AgeGroup,
  AgeGroupPage,
  CreateAgeGroupPayload,
  GetAgeGroupsParams,
  UpdateAgeGroupPayload,
} from "@/src/types/ageGroup";

/* =========================================================
   REAL BACKEND RESPONSE
========================================================= */

interface ApiResponse<T> {
  status: number;
  message: string;
  payload: T;
  timestamp?: string;
}

interface SpringPage<T> {
  content: T[];

  empty?: boolean;

  first?: boolean;

  last?: boolean;

  number: number;

  numberOfElements?: number;

  size: number;

  totalElements: number;

  totalPages: number;
}

/* =========================================================
   HELPERS
========================================================= */

function unwrapPayload<T>(
  response: any,
): T {
  if (
    response &&
    typeof response === "object"
  ) {
    if ("data" in response && response.data !== undefined && response.data !== null) {
      return response.data;
    }
    if ("payload" in response && response.payload !== undefined && response.payload !== null) {
      return response.payload;
    }
  }

  return response as T;
}

/* =========================================================
   NORMALIZE PAGE
========================================================= */

function normalizeAgeGroupPage(
  response: any,
): AgeGroupPage {
  const page = unwrapPayload<any>(response);

  const contents =
    page?.items ??
    page?.contents ??
    page?.content ??
    (Array.isArray(page) ? page : []);

  const totalElements =
    typeof page?.totalElements === "number"
      ? page.totalElements
      : typeof page?.total === "number"
        ? page.total
        : contents.length;

  const pageSize =
    typeof page?.pageSize === "number"
      ? page.pageSize
      : typeof page?.size === "number"
        ? page.size
        : 10;

  const pageNumber =
    typeof page?.pageNumber === "number"
      ? page.pageNumber
      : typeof page?.number === "number"
        ? page.number
        : 0;

  const totalPages =
    typeof page?.totalPages === "number"
      ? page.totalPages
      : Math.max(1, Math.ceil(totalElements / Math.max(1, pageSize)));

  return {
    contents,
    pageNumber,
    pageSize,
    totalElements,
    totalPages,
    first: typeof page?.isFirst === "boolean" ? page.isFirst : (page?.first ?? true),
    last: typeof page?.isLast === "boolean" ? page.isLast : (page?.last ?? true),
  };
}

/* =========================================================
   AGE GROUP API
========================================================= */

export const ageGroupApi =
  catalogBaseApi.injectEndpoints({
    endpoints: (builder) => ({
      /* =====================================================
         GET ACTIVE AGE GROUPS

         GET /api/v1/catalog/age-groups
      ===================================================== */

      getAgeGroups: builder.query<
        AgeGroupPage,
        GetAgeGroupsParams | undefined
      >({
        query: (params) => {
          const p = (params ?? {}) as GetAgeGroupsParams;
          return {
            url: "/age-groups",

            method: "GET",

            params: {
              page: p.page ?? 0,

              size: p.size ?? 20,

              sort: p.sort ?? "minAge,asc",
            },
          };
        },

        transformResponse: (
          response:
            | ApiResponse<SpringPage<AgeGroup>>
            | SpringPage<AgeGroup>,
        ) => {
          return normalizeAgeGroupPage(response);
        },

        providesTags: (result) =>
          result
            ? [
              {
                type: "AgeGroup" as const,
                id: "LIST",
              },

              ...result.contents.map((item) => ({
                type: "AgeGroup" as const,
                id: item.uuid,
              })),
            ]
            : [
              {
                type: "AgeGroup" as const,
                id: "LIST",
              },
            ],
      }),

      /* =====================================================
         GET AGE GROUP DETAIL

         GET /api/v1/catalog/age-groups/{uuid}
      ===================================================== */

      getAgeGroupByUuid: builder.query<
        AgeGroup,
        string
      >({
        query: (uuid) => ({
          url: `/age-groups/${encodeURIComponent(uuid)}`,

          method: "GET",
        }),

        transformResponse: (
          response:
            | ApiResponse<AgeGroup>
            | AgeGroup,
        ) => {
          return unwrapPayload(response);
        },

        providesTags: (
          _result,
          _error,
          uuid,
        ) => [
            {
              type: "AgeGroup",
              id: uuid,
            },
          ],
      }),

      /* =====================================================
         CREATE AGE GROUP

         POST /api/v1/catalog/age-groups
      ===================================================== */

      createAgeGroup: builder.mutation<
        AgeGroup,
        CreateAgeGroupPayload
      >({
        query: (body) => ({
          url: "/age-groups",

          method: "POST",

          body,
        }),

        transformResponse: (
          response:
            | ApiResponse<AgeGroup>
            | AgeGroup,
        ) => {
          return unwrapPayload(response);
        },

        invalidatesTags: [
          {
            type: "AgeGroup",
            id: "LIST",
          },
        ],
      }),

      /* =====================================================
         UPDATE AGE GROUP

         PATCH /api/v1/catalog/age-groups/{uuid}
      ===================================================== */

      updateAgeGroup: builder.mutation<
        AgeGroup,
        {
          uuid: string;
          body: UpdateAgeGroupPayload;
        }
      >({
        query: ({ uuid, body }) => ({
          url: `/age-groups/${encodeURIComponent(uuid)}`,

          method: "PATCH",

          body,
        }),

        transformResponse: (
          response:
            | ApiResponse<AgeGroup>
            | AgeGroup,
        ) => {
          return unwrapPayload(response);
        },

        invalidatesTags: (
          _result,
          _error,
          { uuid },
        ) => [
            {
              type: "AgeGroup",
              id: uuid,
            },

            {
              type: "AgeGroup",
              id: "LIST",
            },
          ],
      }),

      /* =====================================================
         DELETE AGE GROUP

         DELETE /api/v1/catalog/age-groups/{uuid}
      ===================================================== */

      deleteAgeGroup: builder.mutation<
        unknown,
        string
      >({
        query: (uuid) => ({
          url: `/age-groups/${encodeURIComponent(uuid)}`,

          method: "DELETE",
        }),

        invalidatesTags: (
          _result,
          _error,
          uuid,
        ) => [
            {
              type: "AgeGroup",
              id: uuid,
            },

            {
              type: "AgeGroup",
              id: "LIST",
            },
          ],
      }),
    }),

    overrideExisting: false,
  });

export const {
  useGetAgeGroupsQuery,
  useGetAgeGroupByUuidQuery,
  useCreateAgeGroupMutation,
  useUpdateAgeGroupMutation,
  useDeleteAgeGroupMutation,
} = ageGroupApi;