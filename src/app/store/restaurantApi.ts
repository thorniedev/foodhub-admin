import { baseApi } from "./baseApi";
import { Restaurant } from "@/src/types/createFood";

let memoryStore: Restaurant[] | null = null;

async function ensureStore(): Promise<Restaurant[]> {
  if (memoryStore) return memoryStore;
  const res = await fetch("/data/restaurants.json");
  const data: Restaurant[] = await res.json();
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
  overrideExisting: false,
});

export const { useGetRestaurantsQuery } = restaurantApi;