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
  CreateAdminUserPayload,
  MutableAdminUserStatus,
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

function normalizePage<T>(response: SpringPage<T>): AdminPage<T> {
  return {
    contents: response.contents ?? response.content ?? [],
    pageNumber: response.pageNumber ?? response.number ?? 0,
    pageSize: response.pageSize ?? response.size ?? 20,
    totalElements: response.totalElements ?? 0,
    totalPages: response.totalPages ?? 0,
    first: response.first ?? true,
    last: response.last ?? true,
  };
}

export const userProfileApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUsers: builder.query<AdminPage<AdminUser>, AdminPageQuery | undefined>({
      query: (params) => ({
        url: "/users",
        method: "GET",
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          sort: params?.sort ?? "createdAt,desc",
        },
      }),
      transformResponse: (response: SpringPage<AdminUser>) =>
        normalizePage(response),
    }),

    createAdminUser: builder.mutation<AdminUser, CreateAdminUserPayload>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
    }),

    getAdminUser: builder.query<AdminUser, string>({
      query: (userUuid) => ({
        url: `/users/${encodeURIComponent(userUuid)}`,
        method: "GET",
      }),
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
    }),

    deleteAdminUser: builder.mutation<void, string>({
      query: (userUuid) => ({
        url: `/users/${encodeURIComponent(userUuid)}`,
        method: "DELETE",
      }),
    }),

    restoreAdminUser: builder.mutation<AdminUser, string>({
      query: (userUuid) => ({
        url: `/users/${encodeURIComponent(userUuid)}/restore`,
        method: "PATCH",
      }),
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
      transformResponse: (response: SpringPage<AdminProfile>) =>
        normalizePage(response),
    }),

    getAdminProfile: builder.query<AdminProfile, string>({
      query: (profileUuid) => ({
        url: `/profiles/${encodeURIComponent(profileUuid)}`,
        method: "GET",
      }),
    }),

    deleteAdminProfile: builder.mutation<void, string>({
      query: (profileUuid) => ({
        url: `/profiles/${encodeURIComponent(profileUuid)}`,
        method: "DELETE",
      }),
    }),

    restoreAdminProfile: builder.mutation<AdminProfile, string>({
      query: (profileUuid) => ({
        url: `/profiles/${encodeURIComponent(profileUuid)}/restore`,
        method: "PATCH",
      }),
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  useGetAdminUserQuery,
  useUpdateAdminUserStatusMutation,
  useDeleteAdminUserMutation,
  useRestoreAdminUserMutation,
  useGetAdminUserProfilesQuery,
  useGetAdminProfileQuery,
  useDeleteAdminProfileMutation,
  useRestoreAdminProfileMutation,
} = userProfileApi;
