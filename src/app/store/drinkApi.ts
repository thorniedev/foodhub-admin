import { Drink } from "../../types/drink";
import { baseApi } from "./baseApi";
// import { Drink } from "@/types/drink";

export const drinkApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDrinks: builder.query<Drink[], void>({
      query: () => ({ url: "/data/drinks.json" }),
      providesTags: ["Drink"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDrinksQuery } = drinkApi;