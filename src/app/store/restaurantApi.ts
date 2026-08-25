import { baseApi } from "./baseApi";
import { Restaurant } from "@/src/types/createFood";
import { fetchFileMockJson } from "./mockDataGuard";

let memoryStore: Restaurant[] | null = null;

async function ensureStore(): Promise<Restaurant[]> {
  if (memoryStore) return memoryStore;
  const data = await fetchFileMockJson<Restaurant[]>(
    "/data/restaurants.json",
    "Restaurant",
  );
  memoryStore = data;
  return memoryStore;
}

export const restaurantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRestaurants: builder.query<Restaurant[], void>({
      queryFn: async () => {
        const data = await ensureStore();
        return { data: [...data] };
      },
      providesTags: [{ type: "Restaurant", id: "LIST" }],
    }),
  }),
  overrideExisting: true,
});

export const { useGetRestaurantsQuery } = restaurantApi;
