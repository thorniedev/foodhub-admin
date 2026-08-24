import { Area, FoodByAreaImage } from "@/src/types/foodByArea";
import { baseApi } from "./baseApi";

const AREA_KEYS: string[] = [
  "phnom_penh",
  "siem_reap",
  "battambang",
  "kampot",
  "kratie",
];

export const foodByAreaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFoodByAreas: builder.query<FoodByAreaImage[], void>({
      query: () => ({ url: "/api/banners" }),
      transformResponse: (response: any[]) => {
        return response
          .filter((item) => item.location && AREA_KEYS.includes(item.location))
          .map((item) => ({
            id: item.id,
            location: item.location,
            name: item.name,
            description: item.description ?? "",
            image_url: item.image_url,
            isdisplay: item.isdisplay ?? item.isDisplay ?? true,
          }));
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
      query: (newItem) => ({
        url: "/api/banners/standard",
        method: "POST",
        body: {
          id: crypto.randomUUID(),
          location: newItem.location,
          name: newItem.name,
          description: newItem.description,
          isdisplay: newItem.isdisplay ?? true,
          image_url: newItem.image_url,
        },
      }),
      invalidatesTags: [{ type: "FoodByArea", id: "LIST" }],
    }),

    updateFoodByArea: builder.mutation<
      FoodByAreaImage,
      { id: string; changes: Partial<FoodByAreaImage> }
    >({
      query: ({ id, changes }) => ({
        url: `/api/banners/standard/${id}`,
        method: "PUT",
        body: changes,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "FoodByArea", id },
        { type: "FoodByArea", id: "LIST" },
      ],
    }),

    deleteFoodByArea: builder.mutation<{ id: string }, string>({
      query: (id) => ({ url: `/api/banners/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "FoodByArea", id },
        { type: "FoodByArea", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetFoodByAreasQuery,
  useAddFoodByAreaMutation,
  useUpdateFoodByAreaMutation,
  useDeleteFoodByAreaMutation,
} = foodByAreaApi;
