import { apiSlice } from "@/api/apiSlice";
import { syncGamificationMutation } from "@/features/gamification/gamificationMutationSync";
import type { GamificationMutationPayload } from "@/features/gamification/gamificationTypes";
import type {
  PomodoroAnalyticsQuery,
  PomodoroAnalyticsResponse,
} from "@/features/pomodoro/pomodoroAnalytics";

export type PomodoroSettings = {
  focusDurationMin: number;
  breakDurationMin: number;
  longBreakDurationMin: number;
  sessionsUntilLongBreak: number;
  soundEnabled: boolean;
};

export type PomodoroSession = {
  id: string;
  type: "Focus" | "Break";
  startTime: string;
  endTime: string;
  xp: number;
  durationInMinutes: number;
};

export type PomodoroStats = {
  sessionsCompleted: number;
  focusMinutes: number;
  xpEarned: number;
};

export type PomodoroDashboard = {
  settings: PomodoroSettings;
  sessions: PomodoroSession[];
  stats: PomodoroStats;
};

type UpdatePomodoroSettingsRequest = {
  focusDurationMin: number;
  breakDurationMin: number;
  longBreakDurationMin: number;
  sessionsUntilLongBreak: number;
  soundEnabled: boolean;
};

type CreatePomodoroSessionRequest = {
  type: "focus" | "break";
  durationInMinutes: number;
};

type CreatePomodoroSessionResponse = GamificationMutationPayload & {
  message: string;
  session: PomodoroSession;
};

type UpdatePomodoroSettingsResponse = {
  message: string;
  settings: PomodoroSettings;
};

export const pomodoroApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPomodoroDashboard: builder.query<PomodoroDashboard, void>({
      query: () => ({
        url: "/pomodoro",
        method: "GET",
      }),
      providesTags: ["Pomodoro"],
    }),

    getPomodoroAnalytics: builder.query<
      PomodoroAnalyticsResponse,
      PomodoroAnalyticsQuery | undefined
    >({
      query: ({ days = 28 } = {}) => ({
        url: "/pomodoro/analytics",
        method: "GET",
        params: { days },
      }),
      providesTags: ["Pomodoro"],
    }),

    updatePomodoroSettings: builder.mutation<
      UpdatePomodoroSettingsResponse,
      UpdatePomodoroSettingsRequest
    >({
      query: (body) => ({
        url: "/pomodoro/settings",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Pomodoro"],
    }),

    createPomodoroSession: builder.mutation<
      CreatePomodoroSessionResponse,
      CreatePomodoroSessionRequest
    >({
      query: (body) => ({
        url: "/pomodoro/session",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, getState, queryFulfilled }) {
        await syncGamificationMutation(dispatch, getState, queryFulfilled);
      },
      invalidatesTags: ["Pomodoro", "Friends", "Profile"],
    }),
  }),
});

export const {
  useGetPomodoroDashboardQuery,
  useGetPomodoroAnalyticsQuery,
  useUpdatePomodoroSettingsMutation,
  useCreatePomodoroSessionMutation,
} = pomodoroApiSlice;
