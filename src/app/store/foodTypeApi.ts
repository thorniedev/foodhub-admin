// import { FoodType } from "../../types/foodType";
// import { baseApi } from "./baseApi";
// // import { FoodType } from "@/types/foodType";

// export const foodTypeApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     getFoodTypes: builder.query<FoodType[], void>({
//       query: () => ({ url: "/data/foodTypes.json" }),
//       providesTags: ["FoodType"],
//     }),
//   }),
//   overrideExisting: false,
// });

// export const { useGetFoodTypesQuery } = foodTypeApi;

import { baseApi } from "./baseApi";
import { FoodType } from "@/src/types/foodType";
import { CreateFoodPayload } from "@/src/types/createFood";

let memoryStore: FoodType[] | null = null;

async function ensureStore(): Promise<FoodType[]> {
  if (memoryStore) return memoryStore;
  const res = await fetch("/data/foodTypes.json");
  const data: FoodType[] = await res.json();
  memoryStore = data;
  return memoryStore;
}

export const foodTypeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFoodTypes: builder.query<FoodType[], void>({
      queryFn: async () => {
        const data = await ensureStore();
        return { data: [...data] };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "FoodType" as const, id })),
              { type: "FoodType" as const, id: "LIST" },
            ]
          : [{ type: "FoodType" as const, id: "LIST" }],
    }),

    createFoodType: builder.mutation<FoodType, CreateFoodPayload>({
      queryFn: async (payload) => {
        const data = await ensureStore();
        const newItem: FoodType = {
          id: `FD${String(data.length + 1).padStart(3, "0")}`,
          name: payload.foodName,
          image: payload.images[0] ?? "/Image/foods/placeholder.jpg",
          shopName: payload.restaurantName,
          rating: 0,
          dietType: payload.dietSuitability.includes("halal") ? "halal" : "normal",
          mealTime: "lunch",
          distance: "ជិត",
          portionSize: "១០ នាទី",
          description: payload.description,
          category: (payload.category as FoodType["category"]) ?? "general",
          status: payload.status === "published" ? "active" : "disabled",
        };
        memoryStore = [newItem, ...data];
        return { data: newItem };
      },
      invalidatesTags: [{ type: "FoodType", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFoodTypesQuery, useCreateFoodTypeMutation } = foodTypeApi;