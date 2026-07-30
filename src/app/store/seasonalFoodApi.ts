import { baseApi } from "./baseApi";
import type { SeasonalFoodImage } from "@/types/seasonalFood";

let memoryStore: SeasonalFoodImage[] | null = null;

async function ensureStore(): Promise<SeasonalFoodImage[]> {
  if (memoryStore) {
    return memoryStore;
  }

  const res = await fetch("/data/seasonalFoodImages.json");

  if (!res.ok) {
    throw new Error(`Failed to load seasonal foods: ${res.status}`);
  }

  const data: SeasonalFoodImage[] = await res.json();

  memoryStore = data;

  return memoryStore;
}

export const seasonalFoodApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSeasonalFoods: builder.query<SeasonalFoodImage[], void>({
      queryFn: async () => {
        try {
          const data = await ensureStore();

          return { data: [...data] };
        } catch (error) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to load seasonal foods",
            },
          };
        }
      },

      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "SeasonalFood" as const,
                id,
              })),
              {
                type: "SeasonalFood" as const,
                id: "LIST",
              },
            ]
          : [
              {
                type: "SeasonalFood" as const,
                id: "LIST",
              },
            ],
    }),

addSeasonalFood: builder.mutation<
  SeasonalFoodImage,
  Omit<SeasonalFoodImage, "id">
>({
  queryFn: async (newItem) => {
    const data = await ensureStore();

    const item: SeasonalFoodImage = {
      ...newItem,
      id: `SF${String(data.length + 1).padStart(3, "0")}`,
    };

    memoryStore = [item, ...data];

    return { data: item };
  },

  invalidatesTags: [
    {
      type: "SeasonalFood",
      id: "LIST",
    },
  ],
}),

updateSeasonalFood: builder.mutation<
  SeasonalFoodImage,
  { id: string; changes: Partial<SeasonalFoodImage> }
>({
  queryFn: async ({ id, changes }) => {
    const data = await ensureStore();

    const index = data.findIndex((item) => item.id === id);

    if (index === -1) {
      return {
        error: {
          status: 404,
          data: "Item not found",
        } as any,
      };
    }

    const updated = {
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

  invalidatesTags: (result, error, { id }) => [
    {
      type: "SeasonalFood",
      id,
    },
    {
      type: "SeasonalFood",
      id: "LIST",
    },
  ],
}),

deleteSeasonalFood: builder.mutation<{ id: string }, string>({
  queryFn: async (id) => {
    const data = await ensureStore();

    memoryStore = data.filter((item) => item.id !== id);

    return {
      data: { id },
    };
  },

  invalidatesTags: (result, error, id) => [
    {
      type: "SeasonalFood",
      id,
    },
    {
      type: "SeasonalFood",
      id: "LIST",
    },
  ],
}),

toggleSeasonalFoodStatus: builder.mutation<
  SeasonalFoodImage,
  string
>({
  queryFn: async (id) => {
    const data = await ensureStore();

    const index = data.findIndex((item) => item.id === id);

    if (index === -1) {
      return {
        error: {
          status: 404,
          data: "Item not found",
        } as any,
      };
    }

    const current = data[index];

    const updated: SeasonalFoodImage = {
      ...current,
      status:
        current.status === "disabled"
          ? "active"
          : "disabled",
    };

    memoryStore = [
      ...data.slice(0, index),
      updated,
      ...data.slice(index + 1),
    ];

    return { data: updated };
  },

  invalidatesTags: (result, error, id) => [
    {
      type: "SeasonalFood",
      id,
    },
    {
      type: "SeasonalFood",
      id: "LIST",
    },
  ],
}),
  }),
  overrideExisting: false,
});

export const {
  useGetSeasonalFoodsQuery,
  useAddSeasonalFoodMutation,
  useUpdateSeasonalFoodMutation,
  useDeleteSeasonalFoodMutation,
  useToggleSeasonalFoodStatusMutation,
} = seasonalFoodApi;