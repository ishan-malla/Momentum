import { useState } from "react";
import { Check, Plus, Minus, Trash2, Flame, SkipForward } from "lucide-react";

export type Habit = {
  id: number;
  name: string;
  streak: number;
  completed: boolean;
  type: "binary" | "quantitative";
  current?: number;
  target?: number;
  unit?: string;
  skipsPerWeek?: number;
  skipsUsedThisWeek?: number;
  skippedToday?: boolean;
};

type HabitCardProps = {
  habit: Habit;
  onToggle?: (id: number) => void;
  onUpdate?: (id: number, current: number) => void;
  onDelete?: (id: number) => void;
  onSkip?: (id: number) => void;
};

export const HabitCard = ({
  habit,
  onToggle,
  onUpdate,
  onDelete,
  onSkip,
}: HabitCardProps) => {
  const [completed, setCompleted] = useState(habit.completed);
  const [current, setCurrent] = useState(habit.current || 0);
  const [skipsUsedThisWeek, setSkipsUsedThisWeek] = useState(
    habit.skipsUsedThisWeek ?? 0,
  );
  const [skippedToday, setSkippedToday] = useState(habit.skippedToday ?? false);

  const handleToggle = () => {
    const newCompleted = !completed;
    setCompleted(newCompleted);
    onToggle?.(habit.id);
  };

  const handleIncrement = () => {
    if (habit.target && current < habit.target) {
      const newCurrent = current + 1;
      setCurrent(newCurrent);
      onUpdate?.(habit.id, newCurrent);
    }
  };

  const handleDecrement = () => {
    if (current > 0) {
      const newCurrent = current - 1;
      setCurrent(newCurrent);
      onUpdate?.(habit.id, newCurrent);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${habit.name}"?`)) {
      onDelete?.(habit.id);
    }
  };

  const skipsPerWeek = habit.skipsPerWeek ?? 0;
  const skipsLeftThisWeek =
    skipsPerWeek > 0 ? Math.max(0, skipsPerWeek - skipsUsedThisWeek) : 0;
  const showSkips = skipsPerWeek > 0;

  const handleSkip = () => {
    if (!showSkips) return;

    if (skippedToday) {
      setSkippedToday(false);
      setSkipsUsedThisWeek((v) => Math.max(0, v - 1));
      onSkip?.(habit.id);
      return;
    }

    if (skipsLeftThisWeek <= 0) return;
    setSkippedToday(true);
    setSkipsUsedThisWeek((v) => v + 1);
    onSkip?.(habit.id);
  };

  const progress =
    habit.type === "quantitative" && habit.target
      ? (current / habit.target) * 100
      : 0;
  const isComplete =
    habit.type === "quantitative" ? current >= (habit.target || 0) : completed;
  const isDisabledBySkip = skippedToday && !isComplete;
  const showSkippedLabel = skippedToday && !isComplete;

  return (
    <div
      className={`w-full p-3 sm:p-4 rounded-lg border transition-all ${
        isComplete ? "bg-primary/5 border-primary/20" : "bg-card border-border"
      } ${skippedToday ? "opacity-90" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        {habit.type === "binary" && (
          <button
            className={`h-6 w-6 shrink-0 rounded flex items-center justify-center transition-colors ${
              isComplete
                ? "bg-muted text-muted-foreground"
                : "border-2 border-input hover:border-primary"
            }`}
            onClick={handleToggle}
            disabled={isDisabledBySkip}
            title={
              isDisabledBySkip
                ? "Skipped today"
                : isComplete
                  ? "Completed"
                  : "Mark complete"
            }
          >
            {isComplete && <Check className="h-3.5 w-3.5" />}
          </button>
        )}

        <div className="flex-1 min-w-0">
          <h4
            className={[
              "text-[14px] sm:text-[15px] transition-all truncate",
              isComplete
                ? habit.type === "binary"
                  ? "line-through text-muted-foreground"
                  : "text-muted-foreground"
                : showSkippedLabel
                  ? "text-muted-foreground"
                  : "text-foreground",
            ].join(" ")}
          >
            {habit.name}
          </h4>
          {showSkippedLabel && (
            <p className="mt-1 text-[10px] sm:text-[11px] leading-none text-muted-foreground/60">
              Skipped today
            </p>
          )}
          {showSkips && (
            <p className="mt-1 text-[10px] sm:text-[11px] leading-none text-muted-foreground/60">
              Skips left this week: {skipsLeftThisWeek}/{skipsPerWeek}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-streak/10 px-2 py-0.5 rounded-md">
            <span className="text-xs sm:text-sm font-semibold text-streak">
              {habit.streak}
            </span>
            <Flame className="h-3.5 w-3.5 text-streak" />
          </div>
          {showSkips && (
            <button
              type="button"
              onClick={handleSkip}
              disabled={isComplete || (!skippedToday && skipsLeftThisWeek <= 0)}
              className="h-7 px-2 rounded-md border border-border bg-card text-[11px] sm:text-xs text-muted-foreground/80 hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              title={skippedToday ? "Unskip" : "Skip today"}
            >
              <SkipForward className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {skippedToday ? "Unskip" : "Skip"}
              </span>
            </button>
          )}
          <button
            className="h-7 w-7 rounded-md flex items-center justify-center text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {habit.type === "quantitative" && habit.target && (
        <div className="mt-2 sm:mt-3 flex items-center gap-2">
          <button
            onClick={handleDecrement}
            disabled={isDisabledBySkip || current === 0}
            className="h-6 w-6 shrink-0 rounded border border-border bg-card flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus className="h-3 w-3" />
          </button>

          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="text-xs font-medium text-foreground/80 shrink-0 text-center">
            {current}/{habit.target}
          </span>

          <button
            onClick={handleIncrement}
            disabled={isDisabledBySkip || current >= habit.target}
            className="h-6 w-6 shrink-0 rounded border border-border bg-card flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};
