import { baseApi } from "./baseApi";
import { CreateMenuItemPayload, MenuItem } from "../../types/menuItem";

let memoryStore: MenuItem[] | null = null;

async function ensureStore(): Promise<MenuItem[]> {
  if (memoryStore) return memoryStore;
  const res = await fetch("/data/menuItem.json");
  const json = await res.json();
  memoryStore = (json.menuItems ?? []) as MenuItem[];
  return memoryStore;
}

export const menuItemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMenuItems: builder.query<MenuItem[], void>({
      queryFn: async () => {
        const data = await ensureStore();
        return { data: [...data] };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ uuid }) => ({ type: "MenuItem" as const, id: uuid })),
              { type: "MenuItem" as const, id: "LIST" },
            ]
          : [{ type: "MenuItem" as const, id: "LIST" }],
    }),

    createMenuItem: builder.mutation<MenuItem, CreateMenuItemPayload>({
      queryFn: async (payload) => {
        const data = await ensureStore();
        const item: MenuItem = {
          ...payload,
          uuid: crypto.randomUUID(),
          legacyId: data.length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        memoryStore = [item, ...data];
        return { data: item };
      },
      invalidatesTags: [{ type: "MenuItem", id: "LIST" }],
    }),

    updateMenuItem: builder.mutation<MenuItem, { uuid: string; changes: Partial<MenuItem> }>({
      queryFn: async ({ uuid, changes }) => {
        const data = await ensureStore();
        const index = data.findIndex((m) => m.uuid === uuid);
        if (index === -1) {
          return { error: { status: 404, data: "Menu item not found" } as any };
        }
        const updated = { ...data[index], ...changes, updatedAt: new Date().toISOString() };
        memoryStore = [...data.slice(0, index), updated, ...data.slice(index + 1)];
        return { data: updated };
      },
      invalidatesTags: (result, error, { uuid }) => [
        { type: "MenuItem", id: uuid },
        { type: "MenuItem", id: "LIST" },
      ],
    }),

    deleteMenuItem: builder.mutation<{ uuid: string }, string>({
      queryFn: async (uuid) => {
        const data = await ensureStore();
        memoryStore = data.filter((m) => m.uuid !== uuid);
        return { data: { uuid } };
      },
      invalidatesTags: (result, error, uuid) => [
        { type: "MenuItem", id: uuid },
        { type: "MenuItem", id: "LIST" },
      ],
    }),

    toggleMenuItemAvailability: builder.mutation<MenuItem, string>({
      queryFn: async (uuid) => {
        const data = await ensureStore();
        const index = data.findIndex((m) => m.uuid === uuid);
        if (index === -1) {
          return { error: { status: 404, data: "Menu item not found" } as any };
        }
        const current = data[index];
        const updated: MenuItem = {
          ...current,
          availabilityStatus:
            current.availabilityStatus === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE",
        };
        memoryStore = [...data.slice(0, index), updated, ...data.slice(index + 1)];
        return { data: updated };
      },
      invalidatesTags: (result, error, uuid) => [
        { type: "MenuItem", id: uuid },
        { type: "MenuItem", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMenuItemsQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useToggleMenuItemAvailabilityMutation,
} = menuItemApi;