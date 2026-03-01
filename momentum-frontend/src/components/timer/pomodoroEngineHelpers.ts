import type {
  PomodoroRuntimeSettings,
  RuntimeState,
} from "@/components/timer/usePomodoroEngine";

export const getTransitionAfterCompletion = (
  prev: RuntimeState,
  settings: PomodoroRuntimeSettings,
): RuntimeState => {
  if (prev.mode === "work") {
    const nextCycles = prev.focusCyclesSinceLongBreak + 1;
    const longBreak = nextCycles >= settings.sessionsUntilLongBreak;
    const nextBreakDuration = longBreak
      ? settings.longBreakDurationMin
      : settings.breakDurationMin;

    return {
      ...prev,
      mode: "break",
      isRunning: false,
      endsAtMs: null,
      sessionDurationMin: nextBreakDuration,
      remainingSec: nextBreakDuration * 60,
      focusCyclesSinceLongBreak: longBreak ? 0 : nextCycles,
    };
  }

  return {
    ...prev,
    mode: "work",
    isRunning: false,
    endsAtMs: null,
    sessionDurationMin: settings.focusDurationMin,
    remainingSec: settings.focusDurationMin * 60,
  };
};
