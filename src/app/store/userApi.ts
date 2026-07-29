// import { AppUser } from "../types/user";
import { AppUser } from "../../types/user";
import { baseApi } from "./baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<AppUser[], void>({
      query: () => "/data/users.json",
      providesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetUsersQuery } = userApi;