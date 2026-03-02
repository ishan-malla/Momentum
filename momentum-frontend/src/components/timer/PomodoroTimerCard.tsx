"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pause, Pencil, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";

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
  showSettings: boolean;
  onStartPause: () => void;
  onReset: () => void;
  onToggleSound: () => void;
  onToggleSettings: () => void;
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
  showSettings,
  onStartPause,
  onReset,
  onToggleSound,
  onToggleSettings,
  onSwitchToFocus,
  onSwitchToBreak,
}: Props) {
  return (
    <Card className="w-full min-h-[31rem] p-4 sm:min-h-[34rem] sm:p-6">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onToggleSettings}
          className={
            showSettings
              ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10"
              : "bg-transparent hover:bg-muted"
          }
          aria-label="Open settings"
        >
          <Pencil className="h-4 w-4 mr-2" />
          {showSettings ? "Stop editing" : "Edit"}
        </Button>
      </div>

      <div className="mt-5 flex flex-col items-center justify-center space-y-6">
        <div className="relative h-56 w-56 sm:h-72 sm:w-72">
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
                "transition-[stroke-dashoffset] duration-700 ease-out",
                mode === "break" ? "text-primary/70" : "text-primary",
              ].join(" ")}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-numeric tabular-nums text-4xl font-bold text-foreground sm:text-6xl">
              {String(displayMinutes).padStart(2, "0")}:
              {String(displaySeconds).padStart(2, "0")}
            </div>
            <p className="mt-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {mode === "break" ? "BREAK SESSION" : "FOCUS SESSION"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <Button
            type="button"
            size="lg"
            onClick={onStartPause}
            className="h-11 min-w-[10.5rem] gap-2 px-5 text-base font-secondary sm:px-7"
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>{mode === "break" ? "Start Break" : "Start Focus"}</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onReset}
            className="h-11 min-w-[8.5rem] gap-2 bg-transparent px-5 text-base font-secondary hover:bg-muted sm:px-7"
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
            className={`px-4 py-2.5 font-secondary text-base ${
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
            className={`px-4 py-2.5 font-secondary text-base ${
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
