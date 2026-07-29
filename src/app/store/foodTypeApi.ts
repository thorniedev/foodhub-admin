import { FoodType } from "../../types/foodType";
import { baseApi } from "./baseApi";
// import { FoodType } from "@/types/foodType";

export const foodTypeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFoodTypes: builder.query<FoodType[], void>({
      query: () => ({ url: "/data/foodTypes.json" }),
      providesTags: ["FoodType"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFoodTypesQuery } = foodTypeApi;

