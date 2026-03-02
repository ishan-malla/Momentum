import type {
  PomodoroRuntimeSettings,
  RuntimeState,
  TimerMode,
} from "@/components/timer/pomodoroEngineTypes";

const toPositiveInt = (value: number, fallback: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return Math.max(1, Math.trunc(fallback));
  }
  return Math.max(1, Math.trunc(value));
};

const getDurationForMode = (
  mode: TimerMode,
  settings: PomodoroRuntimeSettings,
) => {
  return mode === "break" ? settings.breakDurationMin : settings.focusDurationMin;
};

export const startRuntime = (
  state: RuntimeState,
  settings: PomodoroRuntimeSettings,
): RuntimeState => {
  const fallbackDuration = getDurationForMode(state.mode, settings);
  const sessionDurationMin = toPositiveInt(state.sessionDurationMin, fallbackDuration);
  const remainingSec = toPositiveInt(state.remainingSec, sessionDurationMin * 60);

  return {
    ...state,
    isRunning: true,
    sessionDurationMin,
    remainingSec,
    endsAtMs: Date.now() + remainingSec * 1000,
  };
};

export const pauseRuntime = (state: RuntimeState): RuntimeState => {
  if (!state.isRunning || !state.endsAtMs) return state;

  const remainingSec = Math.max(0, Math.ceil((state.endsAtMs - Date.now()) / 1000));
  return {
    ...state,
    isRunning: false,
    endsAtMs: null,
    remainingSec,
  };
};

export const resetRuntime = (state: RuntimeState): RuntimeState => {
  const remainingSec = toPositiveInt(state.sessionDurationMin, 1) * 60;
  return {
    ...state,
    isRunning: false,
    endsAtMs: null,
    remainingSec,
  };
};

export const switchRuntimeMode = (
  state: RuntimeState,
  mode: TimerMode,
  settings: PomodoroRuntimeSettings,
): RuntimeState => {
  const nextDurationMin = getDurationForMode(mode, settings);
  return {
    ...state,
    mode,
    isRunning: false,
    endsAtMs: null,
    sessionDurationMin: nextDurationMin,
    remainingSec: nextDurationMin * 60,
  };
};

export const syncRuntimeWithSettings = (
  state: RuntimeState,
  nextSettings: PomodoroRuntimeSettings,
  previousSettings: PomodoroRuntimeSettings,
): RuntimeState => {
  const isLongBreakSession =
    state.mode === "break" &&
    state.sessionDurationMin === previousSettings.longBreakDurationMin;

  const nextDurationMin =
    state.mode === "work"
      ? nextSettings.focusDurationMin
      : isLongBreakSession
        ? nextSettings.longBreakDurationMin
        : nextSettings.breakDurationMin;

  return {
    ...state,
    isRunning: false,
    endsAtMs: null,
    sessionDurationMin: nextDurationMin,
    remainingSec: nextDurationMin * 60,
  };
};

export const getRuntimeTotalSec = (state: RuntimeState) => {
  return Math.max(1, toPositiveInt(state.sessionDurationMin, 1) * 60);
};
