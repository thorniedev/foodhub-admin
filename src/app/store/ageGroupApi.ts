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
  response: ApiResponse<T> | T,
): T {
  if (
    response &&
    typeof response === "object" &&
    "payload" in response
  ) {
    const wrapped = response as ApiResponse<T>;

    return wrapped.payload;
  }

  return response as T;
}

/* =========================================================
   NORMALIZE PAGE
========================================================= */

function normalizeAgeGroupPage(
  response:
    | ApiResponse<SpringPage<AgeGroup>>
    | SpringPage<AgeGroup>,
): AgeGroupPage {
  const page = unwrapPayload(response);

  return {
    contents: page.content ?? [],

    pageNumber: page.number ?? 0,

    pageSize: page.size ?? 10,

    totalElements: page.totalElements ?? 0,

    totalPages: page.totalPages ?? 1,

    first: page.first ?? true,

    last: page.last ?? true,
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