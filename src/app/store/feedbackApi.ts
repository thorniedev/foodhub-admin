import { Feedback, FeedbackStatus } from "@/src/types/feedback";
import { baseApi } from "./baseApi";
import { fetchFileMockJson } from "./mockDataGuard";

let memoryStore: Feedback[] | null = null;

async function ensureStore(): Promise<Feedback[]> {
  if (memoryStore) return memoryStore;
  const data = await fetchFileMockJson<Feedback[]>(
    "/data/feedbacks.json",
    "Feedback",
  );
  memoryStore = data;
  return memoryStore;
}

const STATUS_CYCLE: Record<FeedbackStatus, FeedbackStatus> = {
  new: "reviewed",
  reviewed: "resolved",
  resolved: "new",
};

export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeedbacks: builder.query<Feedback[], void>({
      queryFn: async () => {
        const data = await ensureStore();
        return { data: [...data] };
      },
    }),

    addFeedback: builder.mutation<Feedback, Omit<Feedback, "id" | "createdAt">>(
      {
        queryFn: async (newItem) => {
          const data = await ensureStore();
          const item: Feedback = {
            ...newItem,
            id: `FB${String(data.length + 1).padStart(3, "0")}`,
            createdAt: new Date().toISOString(),
          };
          memoryStore = [item, ...data];
          return { data: item };
        },
      },
    ),

    updateFeedback: builder.mutation<
      Feedback,
      { id: string; changes: Partial<Feedback> }
    >({
      queryFn: async ({ id, changes }) => {
        const data = await ensureStore();
        const index = data.findIndex((o) => o.id === id);
        if (index === -1) {
          return { error: { status: 404, data: "Item not found" } as any };
        }
        const updated = { ...data[index], ...changes };
        memoryStore = [
          ...data.slice(0, index),
          updated,
          ...data.slice(index + 1),
        ];
        return { data: updated };
      },
    }),

    deleteFeedback: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        const data = await ensureStore();
        memoryStore = data.filter((o) => o.id !== id);
        return { data: { id } };
      },
    }),

    // Cycles new -> reviewed -> resolved -> new
    toggleFeedbackStatus: builder.mutation<Feedback, string>({
      queryFn: async (id) => {
        const data = await ensureStore();
        const index = data.findIndex((o) => o.id === id);
        if (index === -1) {
          return { error: { status: 404, data: "Item not found" } as any };
        }
        const current = data[index];
        const updated: Feedback = {
          ...current,
          status: STATUS_CYCLE[current.status],
        };
        memoryStore = [
          ...data.slice(0, index),
          updated,
          ...data.slice(index + 1),
        ];
        return { data: updated };
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetFeedbacksQuery,
  useAddFeedbackMutation,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
  useToggleFeedbackStatusMutation,
} = feedbackApi;
