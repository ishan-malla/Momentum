import { useState } from "react";
import { Check, Plus, Minus, Trash2, Flame } from "lucide-react";

type Habit = {
  id: number;
  name: string;
  streak: number;
  completed: boolean;
  type: "binary" | "quantitative";
  current?: number;
  target?: number;
  unit?: string;
};

type HabitCardProps = {
  habit: Habit;
  onToggle?: (id: number) => void;
  onUpdate?: (id: number, current: number) => void;
  onDelete?: (id: number) => void;
};

export const HabitCard = ({
  habit,
  onToggle,
  onUpdate,
  onDelete,
}: HabitCardProps) => {
  const [completed, setCompleted] = useState(habit.completed);
  const [current, setCurrent] = useState(habit.current || 0);

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

  const progress =
    habit.type === "quantitative" && habit.target
      ? (current / habit.target) * 100
      : 0;
  const isComplete =
    habit.type === "quantitative" ? current >= (habit.target || 0) : completed;

  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        isComplete ? "bg-primary/5 border-primary/20" : "bg-card border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {habit.type === "binary" && (
          <button
            className={`h-6 w-6 shrink-0 rounded flex items-center justify-center transition-colors ${
              isComplete
                ? "bg-primary text-primary-foreground"
                : "border-2 border-input hover:border-primary"
            }`}
            onClick={handleToggle}
          >
            {isComplete && <Check className="h-3.5 w-3.5" />}
          </button>
        )}

        <div className="flex-1">
          <h4
            className={`text-[15px] transition-all ${
              isComplete && habit.type === "binary"
                ? "line-through text-accent-foreground"
                : "text-foreground"
            }`}
          >
            {habit.name}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-streak/10 px-2 py-0.5 rounded-md">
            <span className="text-sm font-semibold text-streak">
              {habit.streak}
            </span>
            <Flame className="h-3.5 w-3.5 text-streak" />
          </div>
          <button
            className="h-7 w-7 rounded-md flex items-center justify-center text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {habit.type === "quantitative" && habit.target && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleDecrement}
            disabled={current === 0}
            className="h-6 w-6 shrink-0 rounded flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus className="h-3 w-3" />
          </button>

          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="text-xs font-medium text-foreground/80 shrink-0 ] text-center">
            {current}/{habit.target}
          </span>

          <button
            onClick={handleIncrement}
            disabled={current >= habit.target}
            className="h-6 w-6 shrink-0 rounded flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};
