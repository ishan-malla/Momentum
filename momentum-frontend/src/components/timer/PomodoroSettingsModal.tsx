"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export type PomodoroDraftSettings = {
  workDurationMin: number;
  breakDurationMin: number;
  longBreakDurationMin: number;
  sessionsUntilLongBreak: number;
};

type Props = {
  open: boolean;
  draft: PomodoroDraftSettings;
  onChange: (next: PomodoroDraftSettings) => void;
  onClose: () => void;
  onApply: () => void;
};

export default function PomodoroSettingsModal({
  open,
  draft,
  onChange,
  onClose,
  onApply,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md overflow-hidden p-0 shadow-lg animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Timer Settings"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h3 className="text-lg font-serif font-semibold text-foreground">
              Timer Settings
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Customize your Pomodoro timer durations to fit your workflow.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <label className="block text-sm font-franklin font-medium text-foreground">
              Focus Duration (minutes)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={draft.workDurationMin}
              onChange={(e) =>
                onChange({
                  ...draft,
                  workDurationMin: Number(e.target.value),
                })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-foreground font-stat outline-none transition-[color,box-shadow] hover:bg-muted/35 focus:border-primary/60 focus:ring-[3px] focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-franklin font-medium text-foreground">
              Break Duration (minutes)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={draft.breakDurationMin}
              onChange={(e) =>
                onChange({
                  ...draft,
                  breakDurationMin: Number(e.target.value),
                })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-foreground font-stat outline-none transition-[color,box-shadow] hover:bg-muted/35 focus:border-primary/60 focus:ring-[3px] focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-franklin font-medium text-foreground">
              Long Break Duration (minutes)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={draft.longBreakDurationMin}
              onChange={(e) =>
                onChange({
                  ...draft,
                  longBreakDurationMin: Number(e.target.value),
                })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-foreground font-stat outline-none transition-[color,box-shadow] hover:bg-muted/35 focus:border-primary/60 focus:ring-[3px] focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-franklin font-medium text-foreground">
              Sessions Until Long Break
            </label>
            <input
              type="number"
              min={1}
              max={12}
              value={draft.sessionsUntilLongBreak}
              onChange={(e) =>
                onChange({
                  ...draft,
                  sessionsUntilLongBreak: Number(e.target.value),
                })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-foreground font-stat outline-none transition-[color,box-shadow] hover:bg-muted/35 focus:border-primary/60 focus:ring-[3px] focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onApply}>
            Apply Settings
          </Button>
        </div>
      </Card>
    </div>
  );
}
