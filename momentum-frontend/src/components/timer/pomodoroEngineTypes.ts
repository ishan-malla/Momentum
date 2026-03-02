export type TimerMode = "work" | "break";

export type PomodoroRuntimeSettings = {
  focusDurationMin: number;
  breakDurationMin: number;
  longBreakDurationMin: number;
  sessionsUntilLongBreak: number;
};

export type RuntimeState = {
  mode: TimerMode;
  isRunning: boolean;
  remainingSec: number;
  sessionDurationMin: number;
  focusCyclesSinceLongBreak: number;
  endsAtMs: number | null;
};

export type SaveSessionPayload = {
  type: "focus" | "break";
  durationInMinutes: number;
};

export type UsePomodoroEngineArgs = {
  initialSettings: PomodoroRuntimeSettings;
  initialFocusCycles: number;
  soundEnabled: boolean;
  onSaveSession: (payload: SaveSessionPayload) => Promise<void>;
  onSessionSaveError: (mode: TimerMode) => void;
  onSessionCompleted: (mode: TimerMode) => void;
};
