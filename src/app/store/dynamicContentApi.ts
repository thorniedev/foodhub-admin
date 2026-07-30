import { FilterOption } from "../../types/dynamicContent";
import { baseApi } from "./baseApi";
// import { FilterOption } from "@/types/dynamicContent";

let memoryStore: FilterOption[] | null = null;

async function ensureStore(): Promise<FilterOption[]> {
  if (memoryStore) return memoryStore;
  const res = await fetch("/data/dynamicContent.json");
  const data: FilterOption[] = await res.json();
  memoryStore = data;
  return memoryStore;
}

export const dynamicContentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFilterOptions: builder.query<FilterOption[], void>({
      queryFn: async () => {
        const data = await ensureStore();
        return { data: [...data] };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "DynamicContent" as const,
                id,
              })),
              { type: "DynamicContent" as const, id: "LIST" },
            ]
          : [{ type: "DynamicContent" as const, id: "LIST" }],
    }),

    addFilterOption: builder.mutation<FilterOption, Omit<FilterOption, "id">>({
      queryFn: async (newItem) => {
        const data = await ensureStore();
        const option: FilterOption = {
          ...newItem,
          id: `${newItem.groupKey}-${Date.now()}`,
        };
        memoryStore = [...data, option];
        return { data: option };
      },
      invalidatesTags: [{ type: "DynamicContent", id: "LIST" }],
    }),

    updateFilterOption: builder.mutation<
      FilterOption,
      { id: string; changes: Partial<FilterOption> }
    >({
      queryFn: async ({ id, changes }) => {
        const data = await ensureStore();
        const index = data.findIndex((o) => o.id === id);

        if (index === -1) {
          return {
            error: {
              status: 404,
              data: "Option not found",
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
        { type: "DynamicContent", id },
        { type: "DynamicContent", id: "LIST" },
      ],
    }),

    deleteFilterOption: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        const data = await ensureStore();
        memoryStore = data.filter((o) => o.id !== id);
        return { data: { id } };
      },
      invalidatesTags: (result, error, id) => [
        { type: "DynamicContent", id },
        { type: "DynamicContent", id: "LIST" },
      ],
    }),

    reorderFilterOption: builder.mutation<
      FilterOption[],
      { id: string; direction: "up" | "down" }
    >({
      queryFn: async ({ id, direction }) => {
        const data = await ensureStore();

        const current = data.find((o) => o.id === id);

        if (!current) {
          return {
            error: {
              status: 404,
              data: "Option not found",
            } as any,
          };
        }

        const siblings = data
          .filter((o) => o.groupKey === current.groupKey)
          .sort((a, b) => a.order - b.order);

        const index = siblings.findIndex((o) => o.id === id);
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= siblings.length) {
          return { data: [...data] };
        }

        const target = siblings[targetIndex];

        const updatedCurrent = {
          ...current,
          order: target.order,
        };

        const updatedTarget = {
          ...target,
          order: current.order,
        };

        memoryStore = data.map((o) => {
          if (o.id === updatedCurrent.id) return updatedCurrent;
          if (o.id === updatedTarget.id) return updatedTarget;
          return o;
        });

        return { data: [...memoryStore] };
      },

      invalidatesTags: [{ type: "DynamicContent", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFilterOptionsQuery,
  useAddFilterOptionMutation,
  useUpdateFilterOptionMutation,
  useDeleteFilterOptionMutation,
  useReorderFilterOptionMutation,
} = dynamicContentApi;
