import { Season, SeasonalFoodImage } from "@/src/types/seasonalFood";
import { baseApi } from "./baseApi";

const seasonStringToInt = (season: Season): number => {
  switch (season) {
    case "rainy": return 1;
    case "dry": return 2;
    case "hot": return 3;
    case "festival": return 4;
    default: return 1;
  }
};

const seasonIntToString = (seasonInt: number): Season => {
  switch (seasonInt) {
    case 1: return "rainy";
    case 2: return "dry";
    case 3: return "hot";
    case 4: return "festival";
    default: return "rainy";
  }
};

export const seasonalFoodApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSeasonalFoods: builder.query<SeasonalFoodImage[], void>({
      query: () => ({ url: "/api/banners" }),
      transformResponse: (response: any[]) => {
        return response
          .filter((item) => item.season !== null && item.season !== undefined)
          .map((item) => ({
            id: item.id,
            name: item.name,
            image_url: item.image_url,
            season: seasonIntToString(item.season),
            order: item.order ?? item.displayOrder ?? 0,
            isdisplay: item.isdisplay ?? item.isDisplay ?? true,
          }));
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "SeasonalFood" as const,
                id,
              })),
              { type: "SeasonalFood" as const, id: "LIST" },
            ]
          : [{ type: "SeasonalFood" as const, id: "LIST" }],
    }),

    addSeasonalFood: builder.mutation<
      SeasonalFoodImage,
      Omit<SeasonalFoodImage, "id">
    >({
      query: (newItem) => {
        const payload = {
          id: crypto.randomUUID(),
          name: newItem.name,
          season: seasonStringToInt(newItem.season),
          order: newItem.order,
          isdisplay: newItem.isdisplay ?? true,
          image_url: newItem.image_url,
        };
        return { url: "/api/banners/seasonal", method: "POST", body: payload };
      },
      invalidatesTags: [{ type: "SeasonalFood", id: "LIST" }],
    }),

    updateSeasonalFood: builder.mutation<
      SeasonalFoodImage,
      { id: string; changes: Partial<SeasonalFoodImage> }
    >({
      query: ({ id, changes }) => {
        const payload: any = { ...changes };
        if (changes.season) {
          payload.season = seasonStringToInt(changes.season);
        }
        return {
          url: `/api/banners/seasonal/${id}`,
          method: "PUT",
          body: payload,
        };
      },
      invalidatesTags: (_r, _e, { id }) => [
        { type: "SeasonalFood", id },
        { type: "SeasonalFood", id: "LIST" },
      ],
    }),

    deleteSeasonalFood: builder.mutation<{ id: string }, string>({
      query: (id) => ({ url: `/api/banners/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "SeasonalFood", id },
        { type: "SeasonalFood", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetSeasonalFoodsQuery,
  useAddSeasonalFoodMutation,
  useUpdateSeasonalFoodMutation,
  useDeleteSeasonalFoodMutation,
} = seasonalFoodApi;
