import { apiSlice } from "@/api/apiSlice";

export type HabitType = "binary" | "quantitative";

export type HabitTemplate = {
  _id: string;
  name: string;
  habitType: HabitType;
  frequency?: number;
  skipDaysInAWeek: number;
  streak: number;
  isDeleted: boolean;
};

export type Habit = {
  _id: string;
  user: string;
  habitTemplate: HabitTemplate;
  date: string;
  completion: boolean;
  skipped: boolean;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

type MessageResponse = {
  message: string;
};

type SkipInfoResponse = {
  skipsRemaining: number;
};

export type CreateHabitTemplateRequest = {
  name: string;
  habitType: HabitType;
  frequency?: number;
  skipDaysInAWeek?: number;
};

type UpdateHabitProgressRequest = {
  habitId: string;
  delta: 1 | -1;
};

type UpdateSkipHabitRequest = {
  habitId: string;
  delta: 1 | -1;
};

export const habitApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getHabits: builder.query<Habit[], void>({
      query: () => ({
        url: "/habit",
        method: "GET",
      }),
      providesTags: ["Habits"],
    }),

    createHabitTemplate: builder.mutation<
      MessageResponse,
      CreateHabitTemplateRequest
    >({
      query: (body) => ({
        url: "/habit-template",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Habits"],
    }),

    updateHabitProgress: builder.mutation<
      MessageResponse,
      UpdateHabitProgressRequest
    >({
      query: ({ habitId, delta }) => ({
        url: `/habit/${habitId}/progress`,
        method: "PATCH",
        body: { delta },
      }),
      invalidatesTags: ["Habits"],
    }),

    updateSkipHabit: builder.mutation<MessageResponse, UpdateSkipHabitRequest>({
      query: ({ habitId, delta }) => ({
        url: `/habit/${habitId}/skip-habit`,
        method: "PATCH",
        body: { delta },
      }),
      invalidatesTags: ["Habits"],
    }),

    getSkipInfo: builder.query<SkipInfoResponse, string>({
      query: (habitId) => ({
        url: `/habit/${habitId}/skip-habit`,
        method: "GET",
      }),
      providesTags: ["Habits"],
    }),

    deleteHabitTemplate: builder.mutation<
      MessageResponse,
      { habitTemplateId: string }
    >({
      query: ({ habitTemplateId }) => ({
        url: `/habit-template/${habitTemplateId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Habits"],
    }),
  }),
});

export const {
  useGetHabitsQuery,
  useCreateHabitTemplateMutation,
  useUpdateHabitProgressMutation,
  useUpdateSkipHabitMutation,
  useGetSkipInfoQuery,
  useDeleteHabitTemplateMutation,
} = habitApiSlice;
