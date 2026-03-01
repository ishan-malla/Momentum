import type {
  PomodoroRuntimeSettings,
  RuntimeState,
} from "@/components/timer/usePomodoroEngine";

const STORAGE_KEY = "pomodoro_runtime_v1";

export const createDefaultRuntime = (
  settings: PomodoroRuntimeSettings,
): RuntimeState => ({
  mode: "work",
  isRunning: false,
  remainingSec: settings.focusDurationMin * 60,
  sessionDurationMin: settings.focusDurationMin,
  focusCyclesSinceLongBreak: 0,
  endsAtMs: null,
});

const getModeDuration = (
  mode: RuntimeState["mode"],
  settings: PomodoroRuntimeSettings,
) => (mode === "break" ? settings.breakDurationMin : settings.focusDurationMin);

const normalizeRuntime = (
  runtime: RuntimeState,
  settings: PomodoroRuntimeSettings,
  initialFocusCycles: number,
): RuntimeState => {
  const normalizedMode = runtime.mode === "break" ? "break" : "work";
  const fallbackDuration = getModeDuration(normalizedMode, settings);
  const normalizedDuration =
    Number.isFinite(runtime.sessionDurationMin) && runtime.sessionDurationMin > 0
      ? Math.trunc(runtime.sessionDurationMin)
      : fallbackDuration;

  const normalizedRemaining =
    Number.isFinite(runtime.remainingSec) && runtime.remainingSec > 0
      ? Math.trunc(runtime.remainingSec)
      : normalizedDuration * 60;

  const normalizedCycles =
    Number.isFinite(runtime.focusCyclesSinceLongBreak) &&
    runtime.focusCyclesSinceLongBreak >= 0
      ? Math.trunc(runtime.focusCyclesSinceLongBreak)
      : initialFocusCycles;

  return {
    ...runtime,
    mode: normalizedMode,
    sessionDurationMin: normalizedDuration,
    remainingSec: normalizedRemaining,
    focusCyclesSinceLongBreak: normalizedCycles,
  };
};

export const readRuntime = (
  settings: PomodoroRuntimeSettings,
  initialFocusCycles: number,
): RuntimeState => {
  if (typeof window === "undefined") {
    return createDefaultRuntime(settings);
  }

  const fallback = createDefaultRuntime(settings);
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { ...fallback, focusCyclesSinceLongBreak: initialFocusCycles };
  }

  try {
    const parsed = JSON.parse(raw) as RuntimeState;
    if (
      typeof parsed.remainingSec !== "number" ||
      typeof parsed.sessionDurationMin !== "number" ||
      !["work", "break"].includes(parsed.mode)
    ) {
      return { ...fallback, focusCyclesSinceLongBreak: initialFocusCycles };
    }

    const normalized = normalizeRuntime(parsed, settings, initialFocusCycles);

    if (!normalized.isRunning || !normalized.endsAtMs) {
      return {
        ...fallback,
        ...normalized,
        isRunning: false,
        endsAtMs: null,
      };
    }

    const nextRemaining = Math.max(
      0,
      Math.ceil((normalized.endsAtMs - Date.now()) / 1000),
    );

    return {
      ...fallback,
      ...normalized,
      remainingSec: nextRemaining,
      isRunning: nextRemaining > 0,
      endsAtMs: nextRemaining > 0 ? normalized.endsAtMs : null,
    };
  } catch {
    return { ...fallback, focusCyclesSinceLongBreak: initialFocusCycles };
  }
};

export const saveRuntime = (runtime: RuntimeState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(runtime));
};
