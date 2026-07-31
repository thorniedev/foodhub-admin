// // import { AppUser } from "../types/user";
// import { AppUser } from "../../types/user";
// import { baseApi } from "./baseApi";

// export const userApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     getUsers: builder.query<AppUser[], void>({
//       query: () => "/data/users.json",
//       providesTags: ["User"],
//     }),
//   }),
//   overrideExisting: false,
// });

// export const { useGetUsersQuery } = userApi;


import { baseApi } from "./baseApi";
import { User } from "../../types/user";

let memoryStore: User[] | null = null;

async function ensureStore(): Promise<User[]> {
  if (memoryStore) return memoryStore;
  const res = await fetch("/data/users.json");
  const data: User[] = await res.json();
  memoryStore = data;
  return memoryStore;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      queryFn: async () => {
        const data = await ensureStore();
        return { data: [...data] };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "User" as const, id })),
              { type: "User" as const, id: "LIST" },
            ]
          : [{ type: "User" as const, id: "LIST" }],
    }),

    createUser: builder.mutation<User, Omit<User, "id">>({
      queryFn: async (newUser) => {
        const data = await ensureStore();
        const user: User = {
          ...newUser,
          id: `USR${String(data.length + 1).padStart(3, "0")}`,
        };
        memoryStore = [user, ...data];
        return { data: user };
      },
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    updateUser: builder.mutation<User, { id: string; changes: Partial<User> }>({
      queryFn: async ({ id, changes }) => {
        const data = await ensureStore();
        const index = data.findIndex((u) => u.id === id);
        if (index === -1) {
          return { error: { status: 404, data: "User not found" } as any };
        }
        const updated = { ...data[index], ...changes };
        memoryStore = [
          ...data.slice(0, index),
          updated,
          ...data.slice(index + 1),
        ];
        return { data: updated };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    deleteUser: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        const data = await ensureStore();
        memoryStore = data.filter((u) => u.id !== id);
        return { data: { id } };
      },
      invalidatesTags: (result, error, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    toggleUserStatus: builder.mutation<User, string>({
      queryFn: async (id) => {
        const data = await ensureStore();
        const index = data.findIndex((u) => u.id === id);
        if (index === -1) {
          return { error: { status: 404, data: "User not found" } as any };
        }
        const current = data[index];
        const updated: User = {
          ...current,
          status: current.status === "banned" ? "active" : "banned",
        };
        memoryStore = [
          ...data.slice(0, index),
          updated,
          ...data.slice(index + 1),
        ];
        return { data: updated };
      },
      invalidatesTags: (result, error, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
} = userApi;