import { baseApi } from "./baseApi";
import { Drink } from "@/src/types/drink";
import { CreateDrinkPayload } from "@/src/types/createDrink";

let memoryStore: Drink[] | null = null;

async function ensureStore(): Promise<Drink[]> {
  if (memoryStore) return memoryStore;
  const res = await fetch("/data/drinks.json");
  const data: Drink[] = await res.json();
  memoryStore = data;
  return memoryStore;
}

export const drinkApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDrinks: builder.query<Drink[], void>({
      queryFn: async () => {
        const data = await ensureStore();
        return { data: [...data] };
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: "Drink" as const, id })),
            { type: "Drink" as const, id: "LIST" },
          ]
          : [{ type: "Drink" as const, id: "LIST" }],
    }),

    createDrink: builder.mutation<Drink, CreateDrinkPayload>({
      queryFn: async (payload) => {
        const data = await ensureStore();
        const newItem: Drink = {
          id: `DR${String(data.length + 1).padStart(3, "0")}`,
          name: payload.drinkName,
          image: payload.images[0] ?? "/Image/drinks/placeholder.jpg",
          shopName: payload.shopName,
          rating: 0,
          drinkType: "other",
          sugarLevel: payload.sugarLevel,
          distance: "ជិត",
          portionSize: "៥ នាទី",
          description: payload.description,
          category: (payload.category as Drink["category"]) ?? "other",
          status: payload.status === "published" ? "active" : "disabled",
        };
        memoryStore = [newItem, ...data];
        return { data: newItem };
      },
      invalidatesTags: [{ type: "Drink", id: "LIST" }],
    }),

    updateDrink: builder.mutation<
      Drink,
      { id: string; changes: Partial<Drink> }
    >({
      queryFn: async ({ id, changes }) => {
        const data = await ensureStore();
        const index = data.findIndex((d) => d.id === id);

        if (index === -1) {
          return {
            error: {
              status: 404,
              data: "Drink not found",
            } as any,
          };
        }

        const updated: Drink = {
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
        { type: "Drink", id },
        { type: "Drink", id: "LIST" },
      ],
    }),

    deleteDrink: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        const data = await ensureStore();

        memoryStore = data.filter((d) => d.id !== id);

        return {
          data: { id },
        };
      },

      invalidatesTags: (_result, _error, id) => [
        { type: "Drink", id },
        { type: "Drink", id: "LIST" },
      ],
    }),

    toggleDrinkStatus: builder.mutation<Drink, string>({
      queryFn: async (id) => {
        const data = await ensureStore();
        const index = data.findIndex((d) => d.id === id);

        if (index === -1) {
          return {
            error: {
              status: 404,
              data: "Drink not found",
            } as any,
          };
        }

        const current = data[index];

        const updated: Drink = {
          ...current,
          status: current.status === "active" ? "disabled" : "active",
        };

        memoryStore = [
          ...data.slice(0, index),
          updated,
          ...data.slice(index + 1),
        ];

        return {
          data: updated,
        };
      },

      invalidatesTags: (_result, _error, id) => [
        { type: "Drink", id },
        { type: "Drink", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetDrinksQuery,
  useCreateDrinkMutation,
  useUpdateDrinkMutation,
  useDeleteDrinkMutation,
  useToggleDrinkStatusMutation,
} = drinkApi;
