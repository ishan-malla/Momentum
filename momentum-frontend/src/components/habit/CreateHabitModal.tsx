import { useEffect, useRef, useState } from "react";
import type { HabitType } from "@/features/habit/habitApiSlice";
import type { CreateHabitDraft } from "@/features/habit/createHabitDraft";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronDown, X } from "lucide-react";

type CreateHabitModalProps = {
  open: boolean;
  draft: CreateHabitDraft;
  isSubmitting: boolean;
  onChange: (next: CreateHabitDraft) => void;
  onClose: () => void;
  onSubmit: () => void;
};

const HABIT_TYPE_OPTIONS: Array<{ value: HabitType; label: string }> = [
  { value: "binary", label: "Binary (done / not done)" },
  { value: "quantitative", label: "Quantitative (count based)" },
];

const CreateHabitModal = ({
  open,
  draft,
  isSubmitting,
  onChange,
  onClose,
  onSubmit,
}: CreateHabitModalProps) => {
  const [habitTypeMenuOpen, setHabitTypeMenuOpen] = useState(false);
  const habitTypeMenuRef = useRef<HTMLDivElement>(null);

  const habitTypeLabel =
    HABIT_TYPE_OPTIONS.find((option) => option.value === draft.habitType)?.label ??
    HABIT_TYPE_OPTIONS[0].label;

  useEffect(() => {
    if (!open) {
      setHabitTypeMenuOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (!habitTypeMenuOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (habitTypeMenuRef.current?.contains(event.target as Node)) return;
      setHabitTypeMenuOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHabitTypeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [habitTypeMenuOpen]);

  const handleHabitTypeChange = (habitType: HabitType) => {
    onChange({
      ...draft,
      habitType,
    });
    setHabitTypeMenuOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md overflow-hidden p-0 shadow-lg animate-slide-in-right"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Create Habit"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h3 className="text-lg font-serif font-semibold text-foreground">
              Create Habit
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a daily habit and track progress from your habits list.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close create habit dialog"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <label className="mb-2 block text-sm font-franklin font-medium text-foreground">
              Habit Name
            </label>
            <Input
              type="text"
              maxLength={25}
              placeholder="Morning walk"
              value={draft.name}
              onChange={(event) =>
                onChange({
                  ...draft,
                  name: event.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="mb-2 block text-sm font-franklin font-medium text-foreground">
              Habit Type
            </label>
            <div className="relative" ref={habitTypeMenuRef}>
              <button
                type="button"
                onClick={() => setHabitTypeMenuOpen((current) => !current)}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-card px-3 pr-9 text-sm text-foreground outline-none transition-[color,box-shadow] hover:bg-muted/40 focus-visible:ring-[3px] focus-visible:ring-border/40"
                aria-haspopup="listbox"
                aria-expanded={habitTypeMenuOpen}
                aria-label="Select habit type"
              >
                <span>{habitTypeLabel}</span>
              </button>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              {habitTypeMenuOpen && (
                <div
                  role="listbox"
                  aria-label="Habit type options"
                  className="absolute left-0 top-full z-20 mt-0.5 w-full overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md animate-drop-in"
                >
                  {HABIT_TYPE_OPTIONS.map((option) => {
                    const isSelected = draft.habitType === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleHabitTypeChange(option.value)}
                        className={`flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm transition-colors ${
                          isSelected
                            ? "bg-muted text-foreground"
                            : "text-foreground hover:bg-muted/60"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {draft.habitType === "quantitative" && (
            <div className="space-y-2">
              <label className="mb-2 block text-sm font-franklin font-medium text-foreground">
                Daily Frequency
              </label>
              <Input
                type="number"
                min={1}
                max={999}
                value={draft.frequency}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    frequency: event.target.value,
                  })
                }
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="mb-2 block text-sm font-franklin font-medium text-foreground">
              Skip Days Per Week
            </label>
            <Input
              type="number"
              min={0}
              max={6}
              value={draft.skipDaysInAWeek}
              onChange={(event) =>
                onChange({
                  ...draft,
                  skipDaysInAWeek: event.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Habit"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CreateHabitModal;
