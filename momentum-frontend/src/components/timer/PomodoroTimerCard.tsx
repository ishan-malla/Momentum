"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";

type TimerMode = "work" | "break";

type Props = {
  mode: TimerMode;
  isRunning: boolean;
  displayMinutes: number;
  displaySeconds: number;
  ringRadius: number;
  ringCircumference: number;
  ringOffset: number;
  soundEnabled: boolean;
  workDurationMin: number;
  breakDurationMin: number;
  onStartPause: () => void;
  onReset: () => void;
  onToggleSound: () => void;
  onSwitchToFocus: () => void;
  onSwitchToBreak: () => void;
};

export default function PomodoroTimerCard({
  mode,
  isRunning,
  displayMinutes,
  displaySeconds,
  ringRadius,
  ringCircumference,
  ringOffset,
  soundEnabled,
  workDurationMin,
  breakDurationMin,
  onStartPause,
  onReset,
  onToggleSound,
  onSwitchToFocus,
  onSwitchToBreak,
}: Props) {
  return (
    <Card className="p-6 sm:p-10">
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="relative h-64 w-64 sm:h-72 sm:w-72">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={ringRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-muted-foreground/25"
            />
            <circle
              cx="50"
              cy="50"
              r={ringRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
              strokeLinecap="round"
              className={[
                "transition-[stroke-dashoffset] duration-1000",
                mode === "break" ? "text-primary/70" : "text-primary",
              ].join(" ")}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-stat tabular-nums text-5xl font-bold text-foreground sm:text-6xl">
              {String(displayMinutes).padStart(2, "0")}:
              {String(displaySeconds).padStart(2, "0")}
            </div>
            <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {mode === "break" ? "BREAK SESSION" : "FOCUS SESSION"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="lg"
            onClick={onStartPause}
            className="flex items-center gap-2 px-6 py-2.5 font-franklin"
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Start</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onReset}
            className="flex items-center gap-2 bg-transparent px-6 py-2.5 font-franklin hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </Button>

          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={onToggleSound}
            className="h-11 w-11 bg-transparent hover:bg-muted"
            aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            onClick={onSwitchToFocus}
            variant="outline"
            className={`px-4 py-2 font-franklin text-sm ${
              mode === "work"
                ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10"
                : "bg-transparent hover:bg-muted"
            }`}
          >
            Focus ({workDurationMin}min)
          </Button>

          <Button
            type="button"
            onClick={onSwitchToBreak}
            variant="outline"
            className={`px-4 py-2 font-franklin text-sm ${
              mode === "break"
                ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10"
                : "bg-transparent hover:bg-muted"
            }`}
          >
            Break ({breakDurationMin}min)
          </Button>
        </div>
      </div>
    </Card>
  );
}
