import type { PomodoroDraftSettings } from "@/components/timer/PomodoroSettingsModal";
import type { PomodoroRuntimeSettings } from "@/components/timer/pomodoroEngineTypes";
import { coerceMinutes } from "@/components/timer/utils";
import type { PomodoroSettings } from "@/features/pomodoro/pomodoroApiSlice";

export const MIN_XP_ELIGIBLE_FOCUS_MINUTES = 5;

export const createRuntimeSettingsFromApi = (
  settings: PomodoroSettings,
): PomodoroRuntimeSettings => ({
  focusDurationMin: settings.focusDurationMin,
  breakDurationMin: settings.breakDurationMin,
  longBreakDurationMin: settings.longBreakDurationMin,
  sessionsUntilLongBreak: settings.sessionsUntilLongBreak,
});

export const fromApiSettings = (
  settings: PomodoroSettings,
): PomodoroRuntimeSettings => ({
  focusDurationMin: settings.focusDurationMin,
  breakDurationMin: settings.breakDurationMin,
  longBreakDurationMin: settings.longBreakDurationMin,
  sessionsUntilLongBreak: settings.sessionsUntilLongBreak,
});

export const toDraftSettings = (
  settings: PomodoroRuntimeSettings,
): PomodoroDraftSettings => ({
  workDurationMin: String(settings.focusDurationMin),
  breakDurationMin: String(settings.breakDurationMin),
  longBreakDurationMin: String(settings.longBreakDurationMin),
  sessionsUntilLongBreak: String(settings.sessionsUntilLongBreak),
});

export const parseDraftSettings = (
  draft: PomodoroDraftSettings,
): PomodoroRuntimeSettings => ({
  focusDurationMin: coerceMinutes(Number.parseInt(draft.workDurationMin, 10), 1, 60),
  breakDurationMin: coerceMinutes(Number.parseInt(draft.breakDurationMin, 10), 1, 30),
  longBreakDurationMin: coerceMinutes(
    Number.parseInt(draft.longBreakDurationMin, 10),
    1,
    60,
  ),
  sessionsUntilLongBreak: coerceMinutes(
    Number.parseInt(draft.sessionsUntilLongBreak, 10),
    1,
    12,
  ),
});
