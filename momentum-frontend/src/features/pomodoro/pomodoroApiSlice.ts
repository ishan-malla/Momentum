import { apiSlice } from "@/api/apiSlice";

export type PomodoroSettings = {
  focusDurationMin: number;
  breakDurationMin: number;
  longBreakDurationMin: number;
  sessionsUntilLongBreak: number;
  soundEnabled: boolean;
  xpPerFocusSession: number;
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

type CreatePomodoroSessionResponse = {
  message: string;
  session: PomodoroSession;
  xpEarned: number;
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
      invalidatesTags: ["Pomodoro"],
    }),
  }),
});

export const {
  useGetPomodoroDashboardQuery,
  useUpdatePomodoroSettingsMutation,
  useCreatePomodoroSessionMutation,
} = pomodoroApiSlice;
