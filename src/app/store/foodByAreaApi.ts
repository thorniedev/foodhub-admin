import { adminBaseApi } from "./adminBaseApi";
import type { FoodByAreaImage, Area } from "@/src/types/foodByArea";

export interface FoodByAreaPayload {
  id?: string;
  location: string;
  name: string;
  description?: string;
  isdisplay?: boolean;
  imageFile?: File | Blob | null;
}

export const foodByAreaApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFoodByAreas: builder.query<FoodByAreaImage[], void>({
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
          .filter(
            (item: any) =>
              item.location !== null &&
              item.location !== undefined &&
              (item.season === null || item.season === undefined),
          )
          .map((item: any) => ({
            id: String(item.id ?? item.uuid ?? ""),
            location: item.location || "",
            name: item.name || "",
            description: item.description ?? "",
            image_url:
              item.image ||
              item.imageUrl ||
              item.image_url ||
              item.imageUri ||
              "",
            isdisplay: item.isdisplay ?? item.isDisplay ?? true,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }));
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "FoodByArea" as const,
                id,
              })),
              { type: "FoodByArea" as const, id: "LIST" },
              { type: "Banner" as const, id: "LIST" },
            ]
          : [
              { type: "FoodByArea" as const, id: "LIST" },
              { type: "Banner" as const, id: "LIST" },
            ],
    }),

    addFoodByArea: builder.mutation<any, FoodByAreaPayload>({
      query: (payload) => {
        const requestData = {
          id: payload.id || crypto.randomUUID(),
          location: payload.location,
          name: payload.name,
          description: payload.description || "",
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
          url: "/banners/standard",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: [
        { type: "FoodByArea", id: "LIST" },
        { type: "Banner", id: "LIST" },
      ],
    }),

    updateFoodByArea: builder.mutation<
      any,
      { id: string; changes: Partial<FoodByAreaPayload> }
    >({
      query: ({ id, changes }) => {
        const requestData: any = {
          location: changes.location,
          name: changes.name,
          description: changes.description || "",
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
          url: `/banners/standard/${encodeURIComponent(id)}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: (_r, _e, { id }) => [
        { type: "FoodByArea", id },
        { type: "FoodByArea", id: "LIST" },
        { type: "Banner", id: "LIST" },
      ],
    }),

    deleteFoodByArea: builder.mutation<void, string>({
      query: (id) => ({
        url: `/banners/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "FoodByArea", id },
        { type: "FoodByArea", id: "LIST" },
        { type: "Banner", id: "LIST" },
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
