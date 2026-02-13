"use client";

import { useMemo, useState } from "react";
import PomodoroHeader from "@/components/timer/PomodoroHeader";
import PomodoroSettingsModal, {
  type PomodoroDraftSettings,
} from "@/components/timer/PomodoroSettingsModal";
import PomodoroStats from "@/components/timer/PomodoroStats";
import PomodoroTimerCard from "@/components/timer/PomodoroTimerCard";
import TodaysSessions from "@/components/timer/TodaysSessions";
import { clamp01, coerceMinutes, formatTime } from "@/components/timer/utils";

type TimerMode = "work" | "break";

type PomodoroSessionType = "Focus" | "Break";

type PomodoroSession = {
  id: string;
  type: PomodoroSessionType;
  startTime: string;
  endTime: string;
  xp: number;
};

export default function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>("work");
  const [isRunning, setIsRunning] = useState(false);

  const [workDurationMin, setWorkDurationMin] = useState(25);
  const [breakDurationMin, setBreakDurationMin] = useState(5);
  const [longBreakDurationMin, setLongBreakDurationMin] = useState(15);
  const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(4);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const [remainingSec, setRemainingSec] = useState(workDurationMin * 60);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);

  const [draftSettings, setDraftSettings] = useState<PomodoroDraftSettings>(() => ({
    workDurationMin,
    breakDurationMin,
    longBreakDurationMin,
    sessionsUntilLongBreak,
  }));

  const totalSec = useMemo(() => {
    const minutes = mode === "break" ? breakDurationMin : workDurationMin;
    return Math.max(1, Math.floor(minutes * 60));
  }, [mode, breakDurationMin, workDurationMin]);

  const progress = useMemo(() => clamp01(1 - remainingSec / totalSec), [remainingSec, totalSec]);

  const displayMinutes = Math.floor(remainingSec / 60);
  const displaySeconds = remainingSec % 60;

  const ringRadius = 45;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - progress);

  const sessionsCompleted = useMemo(
    () => sessions.filter((s) => s.type === "Focus").length,
    [sessions],
  );

  const onStartPause = () => setIsRunning((prev) => !prev);

  const onReset = () => {
    setIsRunning(false);
    setRemainingSec((mode === "break" ? breakDurationMin : workDurationMin) * 60);
  };

  const openOrCloseSettings = () => {
    setShowSettings((prev) => {
      const next = !prev;
      if (next) {
        setDraftSettings({
          workDurationMin,
          breakDurationMin,
          longBreakDurationMin,
          sessionsUntilLongBreak,
        });
      }
      return next;
    });
  };

  const closeSettings = () => setShowSettings(false);

  const applySettings = () => {
    const nextWork = coerceMinutes(draftSettings.workDurationMin, 1, 60);
    const nextBreak = coerceMinutes(draftSettings.breakDurationMin, 1, 30);
    const nextLongBreak = coerceMinutes(draftSettings.longBreakDurationMin, 1, 60);
    const nextUntilLong = coerceMinutes(draftSettings.sessionsUntilLongBreak, 1, 12);

    setWorkDurationMin(nextWork);
    setBreakDurationMin(nextBreak);
    setLongBreakDurationMin(nextLongBreak);
    setSessionsUntilLongBreak(nextUntilLong);

    setIsRunning(false);
    setRemainingSec((mode === "break" ? nextBreak : nextWork) * 60);
    setShowSettings(false);
  };

  const switchToFocus = () => {
    setIsRunning(false);
    setMode("work");
    setRemainingSec(workDurationMin * 60);
  };

  const switchToBreak = () => {
    if (mode === "work") {
      const endedAt = new Date();
      const startedAt = new Date(endedAt.getTime() - workDurationMin * 60_000);
      setSessions((prev) => [
        ...prev,
        {
          id: `${endedAt.getTime()}-${Math.random().toString(16).slice(2)}`,
          type: "Focus",
          startTime: formatTime(startedAt),
          endTime: formatTime(endedAt),
          xp: 10,
        },
      ]);
    }
    setIsRunning(false);
    setMode("break");
    setRemainingSec(breakDurationMin * 60);
  };

  return (
    <div className="min-h-screen bg-background">
      <PomodoroSettingsModal
        open={showSettings}
        draft={draftSettings}
        onChange={(next) =>
          setDraftSettings({
            workDurationMin: coerceMinutes(next.workDurationMin, 1, 60),
            breakDurationMin: coerceMinutes(next.breakDurationMin, 1, 30),
            longBreakDurationMin: coerceMinutes(next.longBreakDurationMin, 1, 60),
            sessionsUntilLongBreak: coerceMinutes(next.sessionsUntilLongBreak, 1, 12),
          })
        }
        onClose={closeSettings}
        onApply={applySettings}
      />

      <PomodoroHeader
        onToggleSettings={openOrCloseSettings}
        showSettings={showSettings}
      />

      <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 md:w-2/3 md:px-0">
        <div className="animate-drop-in" style={{ animationDelay: "0ms" }}>
          <PomodoroTimerCard
            mode={mode}
            isRunning={isRunning}
            displayMinutes={displayMinutes}
            displaySeconds={displaySeconds}
            ringRadius={ringRadius}
            ringCircumference={ringCircumference}
            ringOffset={ringOffset}
            soundEnabled={soundEnabled}
            workDurationMin={workDurationMin}
            breakDurationMin={breakDurationMin}
            onStartPause={onStartPause}
            onReset={onReset}
            onToggleSound={() => setSoundEnabled((v) => !v)}
            onSwitchToFocus={switchToFocus}
            onSwitchToBreak={switchToBreak}
          />
        </div>

        <div className="animate-drop-in" style={{ animationDelay: "70ms" }}>
          <PomodoroStats
            sessionsCompleted={sessionsCompleted}
            workDurationMin={workDurationMin}
          />
        </div>

        <div className="animate-drop-in" style={{ animationDelay: "140ms" }}>
          <TodaysSessions sessions={sessions} />
        </div>
      </main>
    </div>
  );
}
