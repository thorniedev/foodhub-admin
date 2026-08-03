import { baseApi } from "./baseApi";
import { UserProfile, UserProfilesResponse } from "../../types/userProfile";

let memoryStore: UserProfilesResponse | null = null;

async function ensureStore(): Promise<UserProfilesResponse> {
  if (memoryStore) return memoryStore;
  const res = await fetch("/data/userProfiles.json");
  const data: UserProfilesResponse = await res.json();
  memoryStore = data;
  return memoryStore;
}

export const userProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfiles: builder.query<UserProfile[], void>({
      queryFn: async () => {
        const store = await ensureStore();
        return { data: [...store.userProfiles] };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ uuid }) => ({ type: "User" as const, id: uuid })),
              { type: "User" as const, id: "LIST" },
            ]
          : [{ type: "User" as const, id: "LIST" }],
    }),

    getUserProfileByUuid: builder.query<UserProfile | undefined, string>({
      queryFn: async (uuid) => {
        const store = await ensureStore();
        return { data: store.userProfiles.find((p) => p.uuid === uuid) };
      },
      providesTags: (result, error, uuid) => [{ type: "User" as const, id: uuid }],
    }),
updateUserProfile: builder.mutation<
  UserProfile,
  { uuid: string; changes: Partial<UserProfile> }
>({
  queryFn: async ({ uuid, changes }) => {
    const store = await ensureStore();
    const index = store.userProfiles.findIndex((p) => p.uuid === uuid);

    if (index === -1) {
      return {
        error: { status: 404, data: "Profile not found" } as any,
      };
    }

    const updated: UserProfile = {
      ...store.userProfiles[index],
      ...changes,
      updatedAt: new Date().toISOString(),
    };

    const updatedProfiles = [...store.userProfiles];
    updatedProfiles[index] = updated;

    memoryStore = {
      ...store,
      userProfiles: updatedProfiles,
    };

    return { data: updated };
  },

  invalidatesTags: (result, error, { uuid }) => [
    { type: "User", id: uuid },
    { type: "User", id: "LIST" },
  ],
}),

toggleProfileActive: builder.mutation<UserProfile, string>({
  queryFn: async (uuid) => {
    const store = await ensureStore();
    const index = store.userProfiles.findIndex((p) => p.uuid === uuid);

    if (index === -1) {
      return {
        error: { status: 404, data: "Profile not found" } as any,
      };
    }

    const updated: UserProfile = {
      ...store.userProfiles[index],
      isActive: !store.userProfiles[index].isActive,
      updatedAt: new Date().toISOString(),
    };

    const updatedProfiles = [...store.userProfiles];
    updatedProfiles[index] = updated;

    memoryStore = {
      ...store,
      userProfiles: updatedProfiles,
    };

    return { data: updated };
  },

  invalidatesTags: (result, error, uuid) => [
    { type: "User", id: uuid },
    { type: "User", id: "LIST" },
  ],
}),

setProfileDefault: builder.mutation<UserProfile, string>({
  queryFn: async (uuid) => {
    const store = await ensureStore();

    const updatedProfiles = store.userProfiles.map((p) => ({
      ...p,
      isDefault: p.uuid === uuid,
      updatedAt: new Date().toISOString(),
    }));

    memoryStore = {
      ...store,
      userProfiles: updatedProfiles,
    };

    const updated = updatedProfiles.find((p) => p.uuid === uuid);

    if (!updated) {
      return {
        error: { status: 404, data: "Profile not found" } as any,
      };
    }

    return { data: updated };
  },

  invalidatesTags: [{ type: "User", id: "LIST" }],
}),

deleteUserProfile: builder.mutation<{ uuid: string }, string>({
  queryFn: async (uuid) => {
    const store = await ensureStore();

    memoryStore = {
      ...store,
      userProfiles: store.userProfiles.filter((p) => p.uuid !== uuid),
    };

    return {
      data: { uuid },
    };
  },

  invalidatesTags: (result, error, uuid) => [
    { type: "User", id: uuid },
    { type: "User", id: "LIST" },
  ],
}),
}),
overrideExisting: false,
});

export const {
  useGetUserProfilesQuery,
  useGetUserProfileByUuidQuery,
  useUpdateUserProfileMutation,
  useToggleProfileActiveMutation,
  useSetProfileDefaultMutation,
  useDeleteUserProfileMutation,
} = userProfileApi;