import { baseApi } from "./baseApi";
import { Shop } from "../../types/shop";

let memoryStore: Shop[] | null = null;

async function ensureStore(): Promise<Shop[]> {
  if (memoryStore) return memoryStore;
  const res = await fetch("/data/stores.json");
  const data: Shop[] = await res.json();
  memoryStore = data;
  return memoryStore;
}

export const shopApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShops: builder.query<Shop[], void>({
      queryFn: async () => {
        const data = await ensureStore();
        return { data: [...data] };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Shop" as const, id })),
              { type: "Shop" as const, id: "LIST" },
            ]
          : [{ type: "Shop" as const, id: "LIST" }],
    }),

    createShop: builder.mutation<Shop, Omit<Shop, "id">>({
      queryFn: async (newShop) => {
        const data = await ensureStore();
        const shop: Shop = {
          ...newShop,
          id: `SHOP${String(data.length + 1).padStart(3, "0")}`,
        };
        memoryStore = [shop, ...data];
        return { data: shop };
      },
      invalidatesTags: [{ type: "Shop", id: "LIST" }],
    }),

    updateShop: builder.mutation<Shop, { id: string; changes: Partial<Shop> }>({
      queryFn: async ({ id, changes }) => {
        const data = await ensureStore();
        const index = data.findIndex((s) => s.id === id);
        if (index === -1) {
          return { error: { status: 404, data: "Shop not found" } as any };
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
        { type: "Shop", id },
        { type: "Shop", id: "LIST" },
      ],
    }),

    deleteShop: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        const data = await ensureStore();
        memoryStore = data.filter((s) => s.id !== id);
        return { data: { id } };
      },
      invalidatesTags: (result, error, id) => [
        { type: "Shop", id },
        { type: "Shop", id: "LIST" },
      ],
    }),

    toggleShopStatus: builder.mutation<Shop, string>({
      queryFn: async (id) => {
        const data = await ensureStore();
        const index = data.findIndex((s) => s.id === id);
        if (index === -1) {
          return { error: { status: 404, data: "Shop not found" } as any };
        }
        const current = data[index];
        const updated: Shop = {
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
        { type: "Shop", id },
        { type: "Shop", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetShopsQuery,
  useCreateShopMutation,
  useUpdateShopMutation,
  useDeleteShopMutation,
  useToggleShopStatusMutation,
} = shopApi;