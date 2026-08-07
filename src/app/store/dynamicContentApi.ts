import { baseApi } from "./baseApi";
import { FilterGroup, FilterOption } from "../../types/dynamicContent";

let optionsStore: FilterOption[] | null = null;
let groupsStore: FilterGroup[] | null = null;

const DEFAULT_GROUPS: FilterGroup[] = [
  { key: "sort", label: "ការតម្រៀប", order: 1 },
  { key: "time", label: "ពេលវេលាញាំ", order: 2 },
  { key: "distance", label: "ចម្ងាយ", order: 3 },
  { key: "category", label: "ប្រភេទចំណីអាហារ", order: 4 },
  { key: "diet", label: "របបអាហារ", order: 5 },
  { key: "price", label: "តម្លៃ", order: 6 },
  { key: "age", label: "អាហារតាមវ័យ", order: 7 },
];

async function ensureOptionsStore(): Promise<FilterOption[]> {
  if (optionsStore) return optionsStore;
  const res = await fetch("/data/dynamicContent.json");
  const data: FilterOption[] = await res.json();
  optionsStore = data;
  return optionsStore;
}

async function ensureGroupsStore(): Promise<FilterGroup[]> {
  if (groupsStore) return groupsStore;
  const options = await ensureOptionsStore();
  const extraKeys = Array.from(new Set(options.map((o) => o.groupKey))).filter(
    (k) => !DEFAULT_GROUPS.some((g) => g.key === k)
  );
  groupsStore = [
    ...DEFAULT_GROUPS,
    ...extraKeys.map((k, i) => ({
      key: k,
      label: k,
      order: DEFAULT_GROUPS.length + i + 1,
    })),
  ];
  return groupsStore;
}

function slugKey(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u1780-\u17FF]+/g, "-")
      .replace(/^-+|-+$/g, "") || `group-${Date.now()}`
  );
}

export const dynamicContentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFilterGroups: builder.query<FilterGroup[], void>({
      queryFn: async () => {
        const groups = await ensureGroupsStore();
        return { data: [...groups].sort((a, b) => a.order - b.order) };
      },
      providesTags: [{ type: "FilterGroup", id: "LIST" }],
    }),

    addFilterGroup: builder.mutation<FilterGroup, { label: string }>({
      queryFn: async ({ label }) => {
        const groups = await ensureGroupsStore();
        const key = slugKey(label);
        if (groups.some((g) => g.key === key)) {
          return { error: { status: 409, data: "Group already exists" } as any };
        }
        const group: FilterGroup = { key, label, order: groups.length + 1 };
        groupsStore = [...groups, group];
        return { data: group };
      },
      invalidatesTags: [{ type: "FilterGroup", id: "LIST" }],
    }),

    updateFilterGroup: builder.mutation<FilterGroup, { key: string; label: string }>({
      queryFn: async ({ key, label }) => {
        const groups = await ensureGroupsStore();
        const index = groups.findIndex((g) => g.key === key);
        if (index === -1) {
          return { error: { status: 404, data: "Group not found" } as any };
        }
        const updated = { ...groups[index], label };
        groupsStore = [...groups.slice(0, index), updated, ...groups.slice(index + 1)];
        return { data: updated };
      },
      invalidatesTags: [{ type: "FilterGroup", id: "LIST" }],
    }),

    deleteFilterGroup: builder.mutation<{ key: string }, string>({
      queryFn: async (key) => {
        const groups = await ensureGroupsStore();
        groupsStore = groups.filter((g) => g.key !== key);
        const options = await ensureOptionsStore();
        optionsStore = options.filter((o) => o.groupKey !== key);
        return { data: { key } };
      },
      invalidatesTags: [
        { type: "FilterGroup", id: "LIST" },
        { type: "DynamicContent", id: "LIST" },
      ],
    }),

    getFilterOptions: builder.query<FilterOption[], void>({
      queryFn: async () => {
        const data = await ensureOptionsStore();
        return { data: [...data] };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "DynamicContent" as const, id })),
              { type: "DynamicContent" as const, id: "LIST" },
            ]
          : [{ type: "DynamicContent" as const, id: "LIST" }],
    }),

    addFilterOption: builder.mutation<FilterOption, Omit<FilterOption, "id">>({
      queryFn: async (newItem) => {
        const data = await ensureOptionsStore();
        const option: FilterOption = { ...newItem, id: `${newItem.groupKey}-${Date.now()}` };
        optionsStore = [...data, option];
        return { data: option };
      },
      invalidatesTags: [{ type: "DynamicContent", id: "LIST" }],
    }),

 updateFilterOption: builder.mutation<
  FilterOption,
  {
    id: string;
    changes: Partial<FilterOption>;
  }
>({
  queryFn: async ({ id, changes }) => {
    const data = await ensureOptionsStore();

    const index = data.findIndex((option) => option.id === id);

    if (index === -1) {
      return {
        error: {
          status: 404,
          data: "Option not found",
        } as any,
      };
    }

    const updated: FilterOption = {
      ...data[index],
      ...changes,
    };

    optionsStore = [
      ...data.slice(0, index),
      updated,
      ...data.slice(index + 1),
    ];

    return {
      data: updated,
    };
  },

  invalidatesTags: (result, error, { id }) => [
    {
      type: "DynamicContent",
      id,
    },
    {
      type: "DynamicContent",
      id: "LIST",
    },
  ],
}),

deleteFilterOption: builder.mutation<
  { id: string },
  string
>({
  queryFn: async (id) => {
    const data = await ensureOptionsStore();

    const exists = data.some((option) => option.id === id);

    if (!exists) {
      return {
        error: {
          status: 404,
          data: "Option not found",
        } as any,
      };
    }

    optionsStore = data.filter(
      (option) => option.id !== id,
    );

    return {
      data: {
        id,
      },
    };
  },

  invalidatesTags: (result, error, id) => [
    {
      type: "DynamicContent",
      id,
    },
    {
      type: "DynamicContent",
      id: "LIST",
    },
  ],
}),

reorderFilterOption: builder.mutation<
  FilterOption[],
  {
    id: string;
    direction: "up" | "down";
  }
>({
  queryFn: async ({ id, direction }) => {
    const data = await ensureOptionsStore();

    const current = data.find(
      (option) => option.id === id,
    );

    if (!current) {
      return {
        error: {
          status: 404,
          data: "Option not found",
        } as any,
      };
    }

    const siblings = data
      .filter(
        (option) =>
          option.groupKey === current.groupKey,
      )
      .sort((a, b) => a.order - b.order);

    const currentIndex = siblings.findIndex(
      (option) => option.id === id,
    );

    const targetIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= siblings.length
    ) {
      return {
        data: [...data],
      };
    }

    const target = siblings[targetIndex];

    const currentOrder = current.order;

    const updatedCurrent: FilterOption = {
      ...current,
      order: target.order,
    };

    const updatedTarget: FilterOption = {
      ...target,
      order: currentOrder,
    };

    optionsStore = data.map((option) => {
      if (option.id === updatedCurrent.id) {
        return updatedCurrent;
      }

      if (option.id === updatedTarget.id) {
        return updatedTarget;
      }

      return option;
    });

    return {
      data: [...optionsStore],
    };
  },

  invalidatesTags: [
    {
      type: "DynamicContent",
      id: "LIST",
    },
  ],
}),
  }),
  overrideExisting: false,
});

export const {
  useGetFilterGroupsQuery,
  useAddFilterGroupMutation,
  useUpdateFilterGroupMutation,
  useDeleteFilterGroupMutation,

  useGetFilterOptionsQuery,
  useAddFilterOptionMutation,
  useUpdateFilterOptionMutation,
  useDeleteFilterOptionMutation,
  useReorderFilterOptionMutation,
} = dynamicContentApi;