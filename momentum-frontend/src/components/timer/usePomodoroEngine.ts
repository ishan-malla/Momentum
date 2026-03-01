import { useEffect, useMemo, useRef, useState } from "react";
import { clamp01 } from "@/components/timer/utils";
import {
  playAlarmSound,
  primeAlarmSound,
  stopAlarmSound,
} from "@/components/timer/alarmSound";
import { readRuntime, saveRuntime } from "@/components/timer/pomodoroRuntimeStorage";
import { getTransitionAfterCompletion } from "@/components/timer/pomodoroEngineHelpers";
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
type SaveSessionPayload = {
  type: "focus" | "break";
  durationInMinutes: number;
};

type UsePomodoroEngineArgs = {
  initialSettings: PomodoroRuntimeSettings;
  initialFocusCycles: number;
  soundEnabled: boolean;
  onSaveSession: (payload: SaveSessionPayload) => Promise<void>;
  onSessionSaveError: (mode: TimerMode) => void;
  onSessionCompleted: (mode: TimerMode) => void;
};
export const usePomodoroEngine = ({
  initialSettings,
  initialFocusCycles,
  soundEnabled,
  onSaveSession,
  onSessionSaveError,
  onSessionCompleted,
}: UsePomodoroEngineArgs) => {
  const settingsRef = useRef(initialSettings);
  const soundEnabledRef = useRef(soundEnabled);
  const saveSessionRef = useRef(onSaveSession);
  const saveErrorRef = useRef(onSessionSaveError);
  const completedRef = useRef(onSessionCompleted);
  useEffect(() => {
    settingsRef.current = initialSettings;
  }, [initialSettings]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    saveSessionRef.current = onSaveSession;
    saveErrorRef.current = onSessionSaveError;
    completedRef.current = onSessionCompleted;
  }, [soundEnabled, onSaveSession, onSessionSaveError, onSessionCompleted]);

  const [runtime, setRuntime] = useState<RuntimeState>(() =>
    readRuntime(initialSettings, initialFocusCycles),
  );

  useEffect(() => {
    saveRuntime(runtime);
  }, [runtime]);

  useEffect(() => {
    return () => {
      stopAlarmSound();
    };
  }, []);

  useEffect(() => {
    if (!runtime.isRunning || !runtime.endsAtMs) return;
    const activeEndsAtMs = runtime.endsAtMs;
    const activeMode = runtime.mode;
    const activeDuration = runtime.sessionDurationMin;
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
          return nextRemaining === prev.remainingSec
            ? prev
            : { ...prev, remainingSec: nextRemaining };
        });
        return;
      }

      completionHandled = true;

      const mode = activeMode;
      const payload = {
        type: mode === "work" ? "focus" : "break",
        durationInMinutes: Math.max(1, Math.trunc(activeDuration || 0)),
      } as const;

      setRuntime((prev) => {
        if (!prev.isRunning || prev.endsAtMs !== activeEndsAtMs) return prev;
        const transitioned = getTransitionAfterCompletion(
          {
            ...prev,
            isRunning: false,
            endsAtMs: null,
            remainingSec: 0,
          },
          settingsRef.current,
        );

        return {
          ...transitioned,
          isRunning: true,
          endsAtMs: Date.now() + transitioned.remainingSec * 1000,
        };
      });

      void (async () => {
        try {
          await saveSessionRef.current(payload);
          return;
        } catch {
          // Retry once for intermittent network/auth refresh races.
        }

        await new Promise((resolve) => window.setTimeout(resolve, 500));

        try {
          await saveSessionRef.current(payload);
        } catch {
          saveErrorRef.current(mode);
        }
      })();

      completedRef.current(mode);
      playAlarmSound();
      if (navigator.vibrate && soundEnabledRef.current) navigator.vibrate(120);
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [runtime.isRunning, runtime.endsAtMs, runtime.mode, runtime.sessionDurationMin]);

  const onStartPause = () => {
    if (!runtime.isRunning) {
      stopAlarmSound();
      primeAlarmSound();
    }

    setRuntime((prev) => {
      if (prev.isRunning && prev.endsAtMs) {
        const nextRemaining = Math.max(
          0,
          Math.ceil((prev.endsAtMs - Date.now()) / 1000),
        );
        return { ...prev, isRunning: false, endsAtMs: null, remainingSec: nextRemaining };
      }

      const fallbackDuration =
        prev.mode === "break"
          ? settingsRef.current.breakDurationMin
          : settingsRef.current.focusDurationMin;
      const normalizedDuration =
        Number.isFinite(prev.sessionDurationMin) && prev.sessionDurationMin > 0
          ? Math.max(1, Math.trunc(prev.sessionDurationMin))
          : fallbackDuration;
      const nextRemaining =
        Number.isFinite(prev.remainingSec) && prev.remainingSec > 0
          ? prev.remainingSec
          : normalizedDuration * 60;
      const normalizedRemaining = Math.max(1, Math.trunc(nextRemaining));

      return {
        ...prev,
        isRunning: true,
        sessionDurationMin: normalizedDuration,
        remainingSec: normalizedRemaining,
        endsAtMs: Date.now() + normalizedRemaining * 1000,
      };
    });
  };

  const onReset = () => {
    stopAlarmSound();
    setRuntime((prev) => ({
      ...prev,
      isRunning: false,
      endsAtMs: null,
      remainingSec: prev.sessionDurationMin * 60,
    }));
  };

  const switchToFocus = () => {
    stopAlarmSound();
    setRuntime((prev) => ({
      ...prev,
      mode: "work",
      isRunning: false,
      endsAtMs: null,
      sessionDurationMin: settingsRef.current.focusDurationMin,
      remainingSec: settingsRef.current.focusDurationMin * 60,
    }));
  };

  const switchToBreak = () => {
    stopAlarmSound();
    setRuntime((prev) => ({
      ...prev,
      mode: "break",
      isRunning: false,
      endsAtMs: null,
      sessionDurationMin: settingsRef.current.breakDurationMin,
      remainingSec: settingsRef.current.breakDurationMin * 60,
    }));
  };

  const syncCurrentModeWithSettings = (nextSettings: PomodoroRuntimeSettings) => {
    setRuntime((prev) => {
      const wasLongBreak =
        prev.mode === "break" &&
        prev.sessionDurationMin === settingsRef.current.longBreakDurationMin;
      const nextDuration =
        prev.mode === "work"
          ? nextSettings.focusDurationMin
          : wasLongBreak
            ? nextSettings.longBreakDurationMin
            : nextSettings.breakDurationMin;

      return {
        ...prev,
        isRunning: false,
        endsAtMs: null,
        sessionDurationMin: nextDuration,
        remainingSec: nextDuration * 60,
      };
    });
  };

  const totalSec = useMemo(
    () => Math.max(1, runtime.sessionDurationMin * 60),
    [runtime.sessionDurationMin],
  );

  return {
    ...runtime,
    progress: clamp01(1 - runtime.remainingSec / totalSec),
    displayMinutes: Math.floor(runtime.remainingSec / 60),
    displaySeconds: runtime.remainingSec % 60,
    onStartPause,
    onReset,
    switchToFocus,
    switchToBreak,
    syncCurrentModeWithSettings,
  };
};
