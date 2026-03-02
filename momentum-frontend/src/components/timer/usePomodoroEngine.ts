import { useEffect, useRef, useState } from "react";
import { clamp01 } from "@/components/timer/utils";
import { primeAlarmSound, stopAlarmSound } from "@/components/timer/alarmSound";
import {
  getRuntimeTotalSec,
  pauseRuntime,
  resetRuntime,
  startRuntime,
  switchRuntimeMode,
  syncRuntimeWithSettings,
} from "@/components/timer/pomodoroEngineState";
import { readRuntime, saveRuntime } from "@/components/timer/pomodoroRuntimeStorage";
import { usePomodoroCompletionEffect } from "@/components/timer/usePomodoroCompletionEffect";
import type {
  PomodoroRuntimeSettings,
  RuntimeState,
  UsePomodoroEngineArgs,
} from "@/components/timer/pomodoroEngineTypes";

export type {
  PomodoroRuntimeSettings,
  RuntimeState,
  SaveSessionPayload,
  TimerMode,
  UsePomodoroEngineArgs,
} from "@/components/timer/pomodoroEngineTypes";

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

  const [runtime, setRuntime] = useState<RuntimeState>(() => {
    return readRuntime(initialSettings, initialFocusCycles);
  });

  useEffect(() => {
    saveRuntime(runtime);
  }, [runtime]);

  useEffect(() => {
    return () => {
      stopAlarmSound();
    };
  }, []);

  usePomodoroCompletionEffect({
    runtime,
    setRuntime,
    settingsRef,
    soundEnabledRef,
    saveSessionRef,
    saveErrorRef,
    completedRef,
  });

  const onStartPause = () => {
    if (!runtime.isRunning) {
      stopAlarmSound();
      primeAlarmSound();
    }

    setRuntime((prev) => {
      if (prev.isRunning && prev.endsAtMs) {
        return pauseRuntime(prev);
      }
      return startRuntime(prev, settingsRef.current);
    });
  };

  const onReset = () => {
    stopAlarmSound();
    setRuntime((prev) => resetRuntime(prev));
  };

  const switchToFocus = () => {
    stopAlarmSound();
    setRuntime((prev) => switchRuntimeMode(prev, "work", settingsRef.current));
  };

  const switchToBreak = () => {
    stopAlarmSound();
    setRuntime((prev) => switchRuntimeMode(prev, "break", settingsRef.current));
  };

  const syncCurrentModeWithSettings = (nextSettings: PomodoroRuntimeSettings) => {
    setRuntime((prev) => {
      return syncRuntimeWithSettings(prev, nextSettings, settingsRef.current);
    });
  };

  const totalSec = getRuntimeTotalSec(runtime);

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
