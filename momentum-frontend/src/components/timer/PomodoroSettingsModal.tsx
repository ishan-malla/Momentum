"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export type PomodoroDraftSettings = {
  workDurationMin: string;
  breakDurationMin: string;
  longBreakDurationMin: string;
  sessionsUntilLongBreak: string;
};

type Props = {
  open: boolean;
  draft: PomodoroDraftSettings;
  onChange: (next: PomodoroDraftSettings) => void;
  onClose: () => void;
  onApply: () => void;
};

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 font-stat text-foreground outline-none transition-[color,box-shadow] hover:bg-muted/35 focus:border-primary/60 focus:ring-[3px] focus:ring-primary/20";

const normalizeNumericDraftValue = (raw: string) => {
  const digitsOnly = raw.replace(/\D/g, "");
  if (digitsOnly.length === 0) return "";
  return String(Number.parseInt(digitsOnly, 10));
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
        className="w-full max-w-md overflow-hidden border-border bg-card p-0 shadow-lg animate-slide-in-right"
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
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={draft.workDurationMin}
              onChange={(e) =>
                onChange({
                  ...draft,
                  workDurationMin: normalizeNumericDraftValue(e.target.value),
                })
              }
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-franklin font-medium text-foreground">
              Break Duration (minutes)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={draft.breakDurationMin}
              onChange={(e) =>
                onChange({
                  ...draft,
                  breakDurationMin: normalizeNumericDraftValue(e.target.value),
                })
              }
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-franklin font-medium text-foreground">
              Long Break Duration (minutes)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={draft.longBreakDurationMin}
              onChange={(e) =>
                onChange({
                  ...draft,
                  longBreakDurationMin: normalizeNumericDraftValue(e.target.value),
                })
              }
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-franklin font-medium text-foreground">
              Sessions Until Long Break
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={draft.sessionsUntilLongBreak}
              onChange={(e) =>
                onChange({
                  ...draft,
                  sessionsUntilLongBreak: normalizeNumericDraftValue(e.target.value),
                })
              }
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onApply}
          >
            Apply Settings
          </Button>
        </div>
      </Card>
    </div>
  );
}
