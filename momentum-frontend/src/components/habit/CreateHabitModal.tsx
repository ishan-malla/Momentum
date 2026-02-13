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

const CreateHabitModal = ({
  open,
  draft,
  isSubmitting,
  onChange,
  onClose,
  onSubmit,
}: CreateHabitModalProps) => {
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
            <div className="relative">
              <select
                value={draft.habitType}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    habitType: event.target.value as HabitType,
                  })
                }
                className="h-9 w-full appearance-none rounded-md border border-input bg-card px-3 pr-9 text-sm text-foreground outline-none transition-[color,box-shadow] hover:bg-muted/40 focus:border-primary/60 focus:ring-[3px] focus:ring-primary/20"
              >
                <option value="binary">Binary (done / not done)</option>
                <option value="quantitative">Quantitative (count based)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
