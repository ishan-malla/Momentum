import { apiSlice } from "@/api/apiSlice";
import { syncGamificationMutation } from "@/features/gamification/gamificationMutationSync";
import type { GamificationMutationPayload } from "@/features/gamification/gamificationTypes";
import type {
  HabitAnalyticsQuery,
  HabitAnalyticsResponse,
} from "@/features/habit/habitAnalytics";

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

type HabitProgressResponse = MessageResponse &
  GamificationMutationPayload & {
    habit: Habit;
    totalXp: number;
  };

type SkipInfoResponse = {
  skipsRemaining: number;
};

export type HabitHeatMapBounds = {
  minYear: number;
  minMonth: number;
  maxYear: number;
  maxMonth: number;
  canGoPrev: boolean;
  canGoNext: boolean;
};

export type HabitHeatMapResponse = {
  year: number;
  month: number;
  totalDays: number;
  hasData: boolean;
  progressData: number[];
  bounds: HabitHeatMapBounds;
};

type HabitHeatMapQuery = {
  year?: number;
  month?: number;
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
      HabitProgressResponse,
      UpdateHabitProgressRequest
    >({
      query: ({ habitId, delta }) => ({
        url: `/habit/${habitId}/progress`,
        method: "PATCH",
        body: { delta },
      }),
      async onQueryStarted(_arg, { dispatch, getState, queryFulfilled }) {
        await syncGamificationMutation(dispatch, getState, queryFulfilled);
      },
      invalidatesTags: ["Habits", "Friends", "Profile"],
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

    getHabitHeatMap: builder.query<
      HabitHeatMapResponse,
      HabitHeatMapQuery | undefined
    >(
      {
        query: (params) => ({
          url: "/habit-heatmap",
          method: "GET",
          params: params ?? undefined,
        }),
        providesTags: ["Habits"],
      },
    ),

    getHabitAnalytics: builder.query<HabitAnalyticsResponse, HabitAnalyticsQuery>(
      {
        query: ({ days = 14 }) => ({
          url: "/habit/analytics",
          method: "GET",
          params: { days },
        }),
        providesTags: ["Habits"],
      },
    ),

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
  useGetHabitHeatMapQuery,
  useGetHabitAnalyticsQuery,
  useDeleteHabitTemplateMutation,
} = habitApiSlice;
