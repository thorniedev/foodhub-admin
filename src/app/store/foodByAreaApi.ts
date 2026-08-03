import { FoodByAreaImage } from "@/src/types/foodByArea";
import { baseApi } from "./baseApi";

let memoryStore: FoodByAreaImage[] | null = null;

async function ensureStore(): Promise<FoodByAreaImage[]> {
  if (memoryStore) return memoryStore;
  const res = await fetch("/data/foodByAreaImages.json");
  const data: FoodByAreaImage[] = await res.json();
  memoryStore = data;
  return memoryStore;
}

export const foodByAreaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFoodByAreas: builder.query<FoodByAreaImage[], void>({
      queryFn: async () => {
        const data = await ensureStore();
        return { data: [...data] };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "FoodByArea" as const, id })),
              { type: "FoodByArea" as const, id: "LIST" },
            ]
          : [{ type: "FoodByArea" as const, id: "LIST" }],
    }),

    addFoodByArea: builder.mutation<
      FoodByAreaImage,
      Omit<FoodByAreaImage, "id">
    >({
      queryFn: async (newItem) => {
        const data = await ensureStore();
        const item: FoodByAreaImage = {
          ...newItem,
          id: `FA${String(data.length + 1).padStart(3, "0")}`,
        };
        memoryStore = [item, ...data];
        return { data: item };
      },
      invalidatesTags: [{ type: "FoodByArea", id: "LIST" }],
    }),

    updateFoodByArea: builder.mutation<
      FoodByAreaImage,
      { id: string; changes: Partial<FoodByAreaImage> }
    >({
      queryFn: async ({ id, changes }) => {
        const data = await ensureStore();
        const index = data.findIndex((o) => o.id === id);
        if (index === -1) {
          return { error: { status: 404, data: "Item not found" } as any };
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
        { type: "FoodByArea", id },
        { type: "FoodByArea", id: "LIST" },
      ],
    }),

    deleteFoodByArea: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        const data = await ensureStore();
        memoryStore = data.filter((o) => o.id !== id);
        return { data: { id } };
      },
      invalidatesTags: (result, error, id) => [
        { type: "FoodByArea", id },
        { type: "FoodByArea", id: "LIST" },
      ],
    }),

    toggleFoodByAreaStatus: builder.mutation<FoodByAreaImage, string>({
      queryFn: async (id) => {
        const data = await ensureStore();
        const index = data.findIndex((o) => o.id === id);
        if (index === -1) {
          return { error: { status: 404, data: "Item not found" } as any };
        }
        const current = data[index];
        const updated: FoodByAreaImage = {
          ...current,
          status: current.status === "disabled" ? "active" : "disabled",
        };
        memoryStore = [
          ...data.slice(0, index),
          updated,
          ...data.slice(index + 1),
        ];
        return { data: updated };
      },
      invalidatesTags: (result, error, id) => [
        { type: "FoodByArea", id },
        { type: "FoodByArea", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFoodByAreasQuery,
  useAddFoodByAreaMutation,
  useUpdateFoodByAreaMutation,
  useDeleteFoodByAreaMutation,
  useToggleFoodByAreaStatusMutation,
} = foodByAreaApi;
