// import { baseApi } from "./baseApi";
// import { UserProfile, UserProfilesResponse } from "../../types/userProfile";

// let memoryStore: UserProfilesResponse | null = null;

// async function ensureStore(): Promise<UserProfilesResponse> {
//   if (memoryStore) return memoryStore;
//   const res = await fetch("/data/userProfiles.json");
//   const data: UserProfilesResponse = await res.json();
//   memoryStore = data;
//   return memoryStore;
// }

// export const userProfileApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     getUserProfiles: builder.query<UserProfile[], void>({
//       queryFn: async () => {
//         const store = await ensureStore();
//         return { data: [...store.userProfiles] };
//       },
//       providesTags: (result) =>
//         result
//           ? [
//               ...result.map(({ uuid }) => ({ type: "User" as const, id: uuid })),
//               { type: "User" as const, id: "LIST" },
//             ]
//           : [{ type: "User" as const, id: "LIST" }],
//     }),

//     getUserProfileByUuid: builder.query<UserProfile | undefined, string>({
//       queryFn: async (uuid) => {
//         const store = await ensureStore();
//         return { data: store.userProfiles.find((p) => p.uuid === uuid) };
//       },
//       providesTags: (result, error, uuid) => [{ type: "User" as const, id: uuid }],
//     }),
// updateUserProfile: builder.mutation<
//   UserProfile,
//   { uuid: string; changes: Partial<UserProfile> }
// >({
//   queryFn: async ({ uuid, changes }) => {
//     const store = await ensureStore();
//     const index = store.userProfiles.findIndex((p) => p.uuid === uuid);

//     if (index === -1) {
//       return {
//         error: { status: 404, data: "Profile not found" } as any,
//       };
//     }

//     const updated: UserProfile = {
//       ...store.userProfiles[index],
//       ...changes,
//       updatedAt: new Date().toISOString(),
//     };

//     const updatedProfiles = [...store.userProfiles];
//     updatedProfiles[index] = updated;

//     memoryStore = {
//       ...store,
//       userProfiles: updatedProfiles,
//     };

//     return { data: updated };
//   },

//   invalidatesTags: (result, error, { uuid }) => [
//     { type: "User", id: uuid },
//     { type: "User", id: "LIST" },
//   ],
// }),

// toggleProfileActive: builder.mutation<UserProfile, string>({
//   queryFn: async (uuid) => {
//     const store = await ensureStore();
//     const index = store.userProfiles.findIndex((p) => p.uuid === uuid);

//     if (index === -1) {
//       return {
//         error: { status: 404, data: "Profile not found" } as any,
//       };
//     }

//     const updated: UserProfile = {
//       ...store.userProfiles[index],
//       isActive: !store.userProfiles[index].isActive,
//       updatedAt: new Date().toISOString(),
//     };

//     const updatedProfiles = [...store.userProfiles];
//     updatedProfiles[index] = updated;

//     memoryStore = {
//       ...store,
//       userProfiles: updatedProfiles,
//     };

//     return { data: updated };
//   },

//   invalidatesTags: (result, error, uuid) => [
//     { type: "User", id: uuid },
//     { type: "User", id: "LIST" },
//   ],
// }),

// setProfileDefault: builder.mutation<UserProfile, string>({
//   queryFn: async (uuid) => {
//     const store = await ensureStore();

//     const updatedProfiles = store.userProfiles.map((p) => ({
//       ...p,
//       isDefault: p.uuid === uuid,
//       updatedAt: new Date().toISOString(),
//     }));

//     memoryStore = {
//       ...store,
//       userProfiles: updatedProfiles,
//     };

//     const updated = updatedProfiles.find((p) => p.uuid === uuid);

//     if (!updated) {
//       return {
//         error: { status: 404, data: "Profile not found" } as any,
//       };
//     }

//     return { data: updated };
//   },

//   invalidatesTags: [{ type: "User", id: "LIST" }],
// }),

// deleteUserProfile: builder.mutation<{ uuid: string }, string>({
//   queryFn: async (uuid) => {
//     const store = await ensureStore();

//     memoryStore = {
//       ...store,
//       userProfiles: store.userProfiles.filter((p) => p.uuid !== uuid),
//     };

//     return {
//       data: { uuid },
//     };
//   },

//   invalidatesTags: (result, error, uuid) => [
//     { type: "User", id: uuid },
//     { type: "User", id: "LIST" },
//   ],
// }),
// }),
// overrideExisting: true,
// });

// export const {
//   useGetUserProfilesQuery,
//   useGetUserProfileByUuidQuery,
//   useUpdateUserProfileMutation,
//   useToggleProfileActiveMutation,
//   useSetProfileDefaultMutation,
//   useDeleteUserProfileMutation,
// } = userProfileApi;



import { adminBaseApi } from "./adminBaseApi";

import type {
  AdminPage,
  AdminPageQuery,
  AdminProfile,
  AdminUser,
  AdminUserProfilesQuery,
  CreateAdminProfilePayload,
  CreateAdminUserPayload,
  MutableAdminUserStatus,
  UpdateAdminProfilePayload,
} from "@/src/types/userProfile";

interface SpringPage<T> {
  content?: T[];
  contents?: T[];
  number?: number;
  pageNumber?: number;
  size?: number;
  pageSize?: number;
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
}

function normalizeAdminUser(response: any): AdminUser {
  const raw = response?.data ?? response?.payload ?? response;
  if (!raw) return raw;
  return {
    ...raw,
    emailVerified: Boolean(
      raw.emailVerified ??
      raw.isEmailVerified ??
      raw.isVerified ??
      raw.verified ??
      raw.email_verified ??
      raw.is_email_verified
    ),
  };
}

function normalizePage<T>(response: any): AdminPage<T> {
  if (!response) {
    return {
      contents: [],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    };
  }

  const dataObj =
    (response.data && typeof response.data === "object" && !Array.isArray(response.data)
      ? response.data
      : null) ||
    (response.payload && typeof response.payload === "object" && !Array.isArray(response.payload)
      ? response.payload
      : null) ||
    response;

  const rawList = (
    dataObj.items ??
    dataObj.contents ??
    dataObj.content ??
    (Array.isArray(response.data) ? response.data : []) ??
    (Array.isArray(response.payload) ? response.payload : []) ??
    (Array.isArray(response) ? response : [])
  ) as any[];

  const contents = rawList.map((item) =>
    item && typeof item === "object" && ("primaryEmail" in item || "email" in item || "username" in item)
      ? normalizeAdminUser(item)
      : item,
  ) as T[];

  const totalElements =
    typeof dataObj.totalElements === "number"
      ? dataObj.totalElements
      : typeof dataObj.total === "number"
        ? dataObj.total
        : contents.length;

  const pageSize =
    typeof dataObj.pageSize === "number"
      ? dataObj.pageSize
      : typeof dataObj.size === "number"
        ? dataObj.size
        : 20;

  const pageNumber =
    typeof dataObj.pageNumber === "number"
      ? dataObj.pageNumber
      : typeof dataObj.number === "number"
        ? dataObj.number
        : 0;

  const totalPages =
    typeof dataObj.totalPages === "number"
      ? dataObj.totalPages
      : (totalElements ? Math.ceil(totalElements / Math.max(1, pageSize)) : 0);

  return {
    contents,
    pageNumber,
    pageSize,
    totalElements,
    totalPages,
    first: typeof dataObj.isFirst === "boolean" ? dataObj.isFirst : (dataObj.first ?? true),
    last: typeof dataObj.isLast === "boolean" ? dataObj.isLast : (dataObj.last ?? true),
  };
}

export const userProfileApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUsers: builder.query<AdminPage<AdminUser>, AdminPageQuery | void>({
      query: (params) => {
        const p = (params ?? {}) as AdminPageQuery;
        return {
          url: "/users",
          method: "GET",
          params: {
            page: p.page ?? 0,
            size: p.size ?? 20,
            sort: p.sort ?? "createdAt,desc",
            query: p.query ? p.query.trim() : undefined,
            q: p.query ? p.query.trim() : undefined,
          },
        };
      },
      transformResponse: (response: SpringPage<AdminUser>) =>
        normalizePage(response),
      providesTags: (result) =>
        result
          ? [
            ...result.contents.map(({ uuid }) => ({
              type: "AdminUser" as const,
              id: uuid,
            })),
            { type: "AdminUser" as const, id: "LIST" },
          ]
          : [{ type: "AdminUser" as const, id: "LIST" }],
    }),

    createAdminUser: builder.mutation<AdminUser, CreateAdminUserPayload>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => normalizeAdminUser(response),
      invalidatesTags: [{ type: "AdminUser", id: "LIST" }],
    }),

    getAdminUser: builder.query<AdminUser, string>({
      query: (userUuid) => ({
        url: `/users/${encodeURIComponent(userUuid)}`,
        method: "GET",
      }),
      transformResponse: (response: any) => normalizeAdminUser(response),
      providesTags: (_result, _error, userUuid) => [
        { type: "AdminUser", id: userUuid },
      ],
    }),

    updateAdminUserStatus: builder.mutation<
      AdminUser,
      { userUuid: string; status: MutableAdminUserStatus }
    >({
      query: ({ userUuid, status }) => ({
        url: `/users/${encodeURIComponent(userUuid)}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { userUuid }) => [
        { type: "AdminUser", id: userUuid },
        { type: "AdminUser", id: "LIST" },
      ],
    }),

    updateAdminUser: builder.mutation<
      AdminUser,
      {
        userUuid: string;
        firstName: string;
        lastName: string;
        username: string;
        email: string;
      }
    >({
      query: ({ userUuid, ...payload }) => ({
        url: `/users/${encodeURIComponent(userUuid)}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (_result, _error, { userUuid }) => [
        { type: "AdminUser", id: userUuid },
        { type: "AdminUser", id: "LIST" },
      ],
    }),

    deleteAdminUser: builder.mutation<void, string>({
      query: (userUuid) => ({
        url: `/users/${encodeURIComponent(userUuid)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, userUuid) => [
        { type: "AdminUser", id: userUuid },
        { type: "AdminUser", id: "LIST" },
      ],
    }),

    hardDeleteAdminUser: builder.mutation<void, string>({
      query: (userUuid) => ({
        url: `/users/${encodeURIComponent(userUuid)}/hard`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, userUuid) => [
        { type: "AdminUser", id: userUuid },
        { type: "AdminUser", id: "LIST" },
      ],
    }),

    restoreAdminUser: builder.mutation<AdminUser, string>({
      query: (userUuid) => ({
        url: `/users/${encodeURIComponent(userUuid)}/restore`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, userUuid) => [
        { type: "AdminUser", id: userUuid },
        { type: "AdminUser", id: "LIST" },
      ],
    }),

    getAdminUserProfiles: builder.query<
      AdminPage<AdminProfile>,
      AdminUserProfilesQuery
    >({
      query: ({ userUuid, active, page = 0, size = 20, sort = "createdAt,desc" }) => ({
        url: `/users/${encodeURIComponent(userUuid)}/profiles`,
        method: "GET",
        params: {
          ...(typeof active === "boolean" ? { active } : {}),
          page,
          size,
          sort,
        },
      }),
      transformResponse: (response: any): AdminPage<AdminProfile> => {
        const normalized = normalizePage<AdminProfile>(response);
        return {
          ...normalized,
          contents: [...normalized.contents].sort((a, b) => {
            const aDefault = Boolean(a.isDefault);
            const bDefault = Boolean(b.isDefault);
            if (aDefault && !bDefault) return -1;
            if (!aDefault && bDefault) return 1;

            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
          }),
        };
      },
    }),

    getAdminProfile: builder.query<AdminProfile, string>({
      query: (profileUuid) => ({
        url: `/profiles/${encodeURIComponent(profileUuid)}`,
        method: "GET",
      }),
      transformResponse: (response: any) =>
        (response?.data ?? response?.payload ?? response) as AdminProfile,
    }),

    createAdminProfile: builder.mutation<
      AdminProfile,
      { userUuid: string; body: CreateAdminProfilePayload }
    >({
      query: ({ userUuid, body }) => ({
        url: `/users/${encodeURIComponent(userUuid)}/profiles`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { userUuid }) => [
        { type: "AdminProfile", id: "LIST" },
        { type: "AdminUser", id: userUuid },
      ],
    }),

    updateAdminProfile: builder.mutation<
      AdminProfile,
      { profileUuid: string; body: UpdateAdminProfilePayload }
    >({
      query: ({ profileUuid, body }) => ({
        url: `/profiles/${encodeURIComponent(profileUuid)}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { profileUuid }) => [
        { type: "AdminProfile", id: profileUuid },
        { type: "AdminProfile", id: "LIST" },
      ],
    }),

    deleteAdminProfile: builder.mutation<void, string>({
      query: (profileUuid) => ({
        url: `/profiles/${encodeURIComponent(profileUuid)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, profileUuid) => [
        { type: "AdminProfile", id: profileUuid },
        { type: "AdminProfile", id: "LIST" },
      ],
    }),

    setDefaultAdminProfile: builder.mutation<AdminProfile, string>({
      query: (profileUuid) => ({
        url: `/profiles/${encodeURIComponent(profileUuid)}/default`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, profileUuid) => [
        { type: "AdminProfile", id: profileUuid },
        { type: "AdminProfile", id: "LIST" },
      ],
    }),

    hardDeleteAdminProfile: builder.mutation<void, string>({
      query: (profileUuid) => ({
        url: `/profiles/${encodeURIComponent(profileUuid)}/hard`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, profileUuid) => [
        { type: "AdminProfile", id: profileUuid },
        { type: "AdminProfile", id: "LIST" },
      ],
    }),

    restoreAdminProfile: builder.mutation<AdminProfile, string>({
      query: (profileUuid) => ({
        url: `/profiles/${encodeURIComponent(profileUuid)}/restore`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, profileUuid) => [
        { type: "AdminProfile", id: profileUuid },
        { type: "AdminProfile", id: "LIST" },
      ],
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  useGetAdminUserQuery,
  useUpdateAdminUserStatusMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useHardDeleteAdminUserMutation,
  useRestoreAdminUserMutation,
  useGetAdminUserProfilesQuery,
  useGetAdminProfileQuery,
  useCreateAdminProfileMutation,
  useUpdateAdminProfileMutation,
  useSetDefaultAdminProfileMutation,
  useDeleteAdminProfileMutation,
  useHardDeleteAdminProfileMutation,
  useRestoreAdminProfileMutation,
} = userProfileApi;
