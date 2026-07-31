
// import { baseApi } from "./baseApi";
// import { FoodType } from "@/src/types/foodType";
// import { CreateFoodPayload } from "@/src/types/createFood";

// let memoryStore: FoodType[] | null = null;

// async function ensureStore(): Promise<FoodType[]> {
//   if (memoryStore) return memoryStore;
//   const res = await fetch("/data/foodTypes.json");
//   const data: FoodType[] = await res.json();
//   memoryStore = data;
//   return memoryStore;
// }

// export const foodTypeApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     getFoodTypes: builder.query<FoodType[], void>({
//       queryFn: async () => {
//         const data = await ensureStore();
//         return { data: [...data] };
//       },
//       providesTags: (result) =>
//         result
//           ? [
//               ...result.map(({ id }) => ({ type: "FoodType" as const, id })),
//               { type: "FoodType" as const, id: "LIST" },
//             ]
//           : [{ type: "FoodType" as const, id: "LIST" }],
//     }),

//     createFoodType: builder.mutation<FoodType, CreateFoodPayload>({
//       queryFn: async (payload) => {
//         const data = await ensureStore();
//         const newItem: FoodType = {
//           id: `FD${String(data.length + 1).padStart(3, "0")}`,
//           name: payload.foodName,
//           image: payload.images[0] ?? "/Image/foods/placeholder.jpg",
//           shopName: payload.restaurantName,
//           rating: 0,
//           dietType: payload.dietSuitability.includes("halal") ? "halal" : "normal",
//           mealTime: "lunch",
//           distance: "ជិត",
//           portionSize: "១០ នាទី",
//           description: payload.description,
//           category: (payload.category as FoodType["category"]) ?? "general",
//           status: payload.status === "published" ? "active" : "disabled",
//         };
//         memoryStore = [newItem, ...data];
//         return { data: newItem };
//       },
//       invalidatesTags: [{ type: "FoodType", id: "LIST" }],
//     }),
//   }),
//   overrideExisting: false,
// });

// export const { useGetFoodTypesQuery, useCreateFoodTypeMutation } = foodTypeApi;


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

updateFoodType: builder.mutation<
  FoodType,
  { id: string; changes: Partial<FoodType> }
>({
  queryFn: async ({ id, changes }) => {
    const data = await ensureStore();
    const index = data.findIndex((f) => f.id === id);

    if (index === -1) {
      return {
        error: {
          status: 404,
          data: "Food type not found",
        } as any,
      };
    }

    const updated: FoodType = {
      ...data[index],
      ...changes,
    };

    memoryStore = [
      ...data.slice(0, index),
      updated,
      ...data.slice(index + 1),
    ];

    return { data: updated };
  },

  invalidatesTags: (_result, _error, { id }) => [
    { type: "FoodType", id },
    { type: "FoodType", id: "LIST" },
  ],
}),

deleteFoodType: builder.mutation<{ id: string }, string>({
  queryFn: async (id) => {
    const data = await ensureStore();

    memoryStore = data.filter((f) => f.id !== id);

    return {
      data: { id },
    };
  },

  invalidatesTags: (_result, _error, id) => [
    { type: "FoodType", id },
    { type: "FoodType", id: "LIST" },
  ],
}),

toggleFoodTypeStatus: builder.mutation<FoodType, string>({
  queryFn: async (id) => {
    const data = await ensureStore();
    const index = data.findIndex((f) => f.id === id);

    if (index === -1) {
      return {
        error: {
          status: 404,
          data: "Food type not found",
        } as any,
      };
    }

    const current = data[index];

    const updated: FoodType = {
      ...current,
      status: current.status === "active" ? "disabled" : "active",
    };

    memoryStore = [
      ...data.slice(0, index),
      updated,
      ...data.slice(index + 1),
    ];

    return { data: updated };
  },

  invalidatesTags: (_result, _error, id) => [
    { type: "FoodType", id },
    { type: "FoodType", id: "LIST" },
  ],
}),
  }),
  overrideExisting: false,
});

export const {
  useGetFoodTypesQuery,
  useCreateFoodTypeMutation,
  useUpdateFoodTypeMutation,
  useDeleteFoodTypeMutation,
  useToggleFoodTypeStatusMutation,
} = foodTypeApi;