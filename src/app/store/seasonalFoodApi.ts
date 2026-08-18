import { adminBaseApi } from "./adminBaseApi";
import type { SeasonalFoodImage, Season } from "@/src/types/seasonalFood";

export interface SeasonalBannerPayload {
  id?: string;
  name: string;
  season: Season | number;
  order: number;
  isdisplay?: boolean;
  imageFile?: File | Blob | null;
}

const seasonIntToString = (seasonInt: number): Season => {
  switch (seasonInt) {
    case 1:
      return "rainy";
    case 2:
      return "dry";
    case 3:
      return "hot";
    case 4:
      return "festival";
    default:
      return "rainy";
  }
};

const seasonStringToInt = (season: Season | number): number => {
  if (typeof season === "number") return season;
  switch (season) {
    case "rainy":
      return 1;
    case "dry":
      return 2;
    case "hot":
      return 3;
    case "festival":
      return 4;
    default:
      return 1;
  }
};

export const seasonalFoodApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSeasonalFoods: builder.query<SeasonalFoodImage[], void>({
      query: () => ({
        url: "/banners",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        const list = Array.isArray(response)
          ? response
          : Array.isArray(response?.payload)
            ? response.payload
            : Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response?.contents)
                ? response.contents
                : Array.isArray(response?.content)
                  ? response.content
                  : [];

        return list
          .filter((item: any) => item.season !== null && item.season !== undefined)
          .map((item: any) => ({
            id: String(item.id ?? item.uuid ?? ""),
            name: item.name || "",
            image_url:
              item.image ||
              item.imageUrl ||
              item.image_url ||
              item.imageUri ||
              "",
            season: typeof item.season === "number" ? seasonIntToString(item.season) : item.season,
            order: item.order ?? item.displayOrder ?? 1,
            isdisplay: item.isdisplay ?? item.isDisplay ?? true,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
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
              { type: "Banner" as const, id: "LIST" },
            ]
          : [
              { type: "SeasonalFood" as const, id: "LIST" },
              { type: "Banner" as const, id: "LIST" },
            ],
    }),

    addSeasonalFood: builder.mutation<any, SeasonalBannerPayload>({
      query: (payload) => {
        const requestData = {
          id: payload.id || crypto.randomUUID(),
          name: payload.name,
          season: seasonStringToInt(payload.season),
          order: Number(payload.order) || 1,
          isdisplay: payload.isdisplay ?? true,
        };

        const formData = new FormData();
        formData.append(
          "request",
          new Blob([JSON.stringify(requestData)], { type: "application/json" }),
        );

        if (payload.imageFile) {
          formData.append("image", payload.imageFile);
        }

        return {
          url: "/banners/seasonal",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: [
        { type: "SeasonalFood", id: "LIST" },
        { type: "Banner", id: "LIST" },
      ],
    }),

    updateSeasonalFood: builder.mutation<
      any,
      { id: string; changes: Partial<SeasonalBannerPayload> }
    >({
      query: ({ id, changes }) => {
        const requestData: any = {
          name: changes.name,
          season: changes.season !== undefined ? seasonStringToInt(changes.season) : 1,
          order: Number(changes.order) || 1,
          isdisplay: changes.isdisplay ?? true,
        };

        const formData = new FormData();
        formData.append(
          "request",
          new Blob([JSON.stringify(requestData)], { type: "application/json" }),
        );

        if (changes.imageFile) {
          formData.append("image", changes.imageFile);
        }

        return {
          url: `/banners/seasonal/${encodeURIComponent(id)}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: (_r, _e, { id }) => [
        { type: "SeasonalFood", id },
        { type: "SeasonalFood", id: "LIST" },
        { type: "Banner", id: "LIST" },
      ],
    }),

    deleteSeasonalFood: builder.mutation<void, string>({
      query: (id) => ({
        url: `/banners/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "SeasonalFood", id },
        { type: "SeasonalFood", id: "LIST" },
        { type: "Banner", id: "LIST" },
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
