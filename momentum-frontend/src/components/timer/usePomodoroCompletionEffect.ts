import {
  useEffect,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import { playAlarmSound } from "@/components/timer/alarmSound";
import { getTransitionAfterCompletion } from "@/components/timer/pomodoroEngineHelpers";
import type {
  PomodoroRuntimeSettings,
  RuntimeState,
  SaveSessionPayload,
  TimerMode,
} from "@/components/timer/pomodoroEngineTypes";

type CompletionEffectArgs = {
  runtime: RuntimeState;
  setRuntime: Dispatch<SetStateAction<RuntimeState>>;
  settingsRef: MutableRefObject<PomodoroRuntimeSettings>;
  soundEnabledRef: MutableRefObject<boolean>;
  saveSessionRef: MutableRefObject<(payload: SaveSessionPayload) => Promise<void>>;
  saveErrorRef: MutableRefObject<(mode: TimerMode) => void>;
  completedRef: MutableRefObject<(mode: TimerMode) => void>;
};

const wait = (ms: number) => {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
};

const saveSessionWithRetry = async (
  payload: SaveSessionPayload,
  mode: TimerMode,
  saveSession: (sessionPayload: SaveSessionPayload) => Promise<void>,
  onSaveError: (failedMode: TimerMode) => void,
) => {
  try {
    await saveSession(payload);
    return;
  } catch {
    // Retry once for intermittent auth refresh or network races.
  }

  await wait(500);

  try {
    await saveSession(payload);
  } catch {
    onSaveError(mode);
  }
};

export const usePomodoroCompletionEffect = ({
  runtime,
  setRuntime,
  settingsRef,
  soundEnabledRef,
  saveSessionRef,
  saveErrorRef,
  completedRef,
}: CompletionEffectArgs) => {
  useEffect(() => {
    if (!runtime.isRunning || !runtime.endsAtMs) return;

    const activeEndsAtMs = runtime.endsAtMs;
    const activeMode = runtime.mode;
    const activeDuration = runtime.sessionDurationMin;
    let transitionTimeoutId: number | null = null;
    let completionHandled = false;

    const tick = () => {
      if (completionHandled) return;

      const nextRemaining = Math.max(
        0,
        Math.ceil((activeEndsAtMs - Date.now()) / 1000),
      );

      if (nextRemaining > 0) {
        setRuntime((prev) => {
          if (!prev.isRunning || prev.endsAtMs !== activeEndsAtMs) return prev;
          if (nextRemaining === prev.remainingSec) return prev;
          return { ...prev, remainingSec: nextRemaining };
        });
        return;
      }

      completionHandled = true;

      const payload: SaveSessionPayload = {
        type: activeMode === "work" ? "focus" : "break",
        durationInMinutes: Math.max(1, Math.trunc(activeDuration || 0)),
      };

      setRuntime((prev) => {
        if (!prev.isRunning || prev.endsAtMs !== activeEndsAtMs) return prev;
        return {
          ...prev,
          isRunning: false,
          endsAtMs: null,
          remainingSec: 0,
        };
      });

      transitionTimeoutId = window.setTimeout(() => {
        setRuntime((prev) => {
          if (prev.endsAtMs) return prev;
          if (prev.mode !== activeMode) return prev;
          if (prev.remainingSec !== 0) return prev;

          return getTransitionAfterCompletion(prev, settingsRef.current);
        });
      }, 120);

      void saveSessionWithRetry(
        payload,
        activeMode,
        saveSessionRef.current,
        saveErrorRef.current,
      );

      completedRef.current(activeMode);
      playAlarmSound();

      if (
        typeof navigator !== "undefined" &&
        navigator.vibrate &&
        soundEnabledRef.current
      ) {
        navigator.vibrate(120);
      }
    };

    tick();
    const timerId = window.setInterval(tick, 1000);
    return () => {
      window.clearInterval(timerId);
      if (transitionTimeoutId !== null && !completionHandled) {
        window.clearTimeout(transitionTimeoutId);
      }
    };
  }, [
    runtime.isRunning,
    runtime.endsAtMs,
    runtime.mode,
    runtime.sessionDurationMin,
    setRuntime,
    settingsRef,
    soundEnabledRef,
    saveSessionRef,
    saveErrorRef,
    completedRef,
  ]);
};
