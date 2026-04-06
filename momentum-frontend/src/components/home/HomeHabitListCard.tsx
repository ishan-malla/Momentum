import { Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Habit } from "@/features/habit/habitApiSlice";
import { readHabitErrorMessage } from "@/features/habit/habitErrors";

type Props = {
  habits: Habit[];
  habitsError: unknown;
  isLoading: boolean;
  hasQueryError: boolean;
  actionsDisabled: boolean;
  onRetry: () => void;
  onToggleBinary: (habitId: string, nextCompleted: boolean) => void;
  onUpdateQuantity: (habitId: string, delta: 1 | -1) => void;
};

const HabitRow = ({
  habit,
  actionsDisabled,
  onToggleBinary,
  onUpdateQuantity,
}: {
  habit: Habit;
  actionsDisabled: boolean;
  onToggleBinary: (habitId: string, nextCompleted: boolean) => void;
  onUpdateQuantity: (habitId: string, delta: 1 | -1) => void;
}) => {
  const target = habit.habitTemplate.frequency ?? 0;
  const isBinary = habit.habitTemplate.habitType === "binary";
  const isComplete = isBinary ? habit.completion : target > 0 && habit.quantity >= target;
  const isSkipped = habit.skipped && !isComplete;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3">
      <button
        type="button"
        disabled={actionsDisabled || isSkipped}
        onClick={() => isBinary && onToggleBinary(habit._id, !habit.completion)}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors ${
          isComplete ? "bg-primary text-primary-foreground" : "border-2 border-border"
        } ${!isBinary ? "opacity-50" : ""}`}
      >
        {isComplete ? <Check className="h-3.5 w-3.5" /> : null}
      </button>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-heading font-semibold ${isComplete ? "text-muted-foreground line-through" : "text-foreground"}`}>
          {habit.habitTemplate.name}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {isSkipped
            ? "Skipped today"
            : isBinary
              ? habit.habitTemplate.streak > 0
                ? `${habit.habitTemplate.streak} day streak`
                : "Ready to complete"
              : `${habit.quantity}/${target} done`}
        </p>
      </div>

      {!isBinary ? (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            disabled={actionsDisabled || isSkipped || habit.quantity === 0}
            onClick={() => onUpdateQuantity(habit._id, -1)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background disabled:opacity-40"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={actionsDisabled || isSkipped || (target > 0 && habit.quantity >= target)}
            onClick={() => onUpdateQuantity(habit._id, 1)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
};

const HomeHabitListCard = ({
  habits,
  habitsError,
  isLoading,
  hasQueryError,
  actionsDisabled,
  onRetry,
  onToggleBinary,
  onUpdateQuantity,
}: Props) => {
  return (
    <Card className="gap-0 rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-secondary uppercase tracking-[0.14em] text-[#9c8b6d]">
              Today&apos;s Habits
            </p>
            <h2 className="mt-1 font-heading text-xl text-[#2f3e32]">
              Keep your daily checklist nearby
            </h2>
          </div>
          <p className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            {habits.length} total
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[62px] rounded-lg" />
            ))}
          </div>
        ) : hasQueryError ? (
          <div className="rounded-[1rem] border border-[#e7dfd2] bg-[#faf6ef] p-4">
            <p className="text-sm text-[#2f3e32]">
              {readHabitErrorMessage(habitsError, "Failed to load habits.")}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={onRetry}
              className="mt-3 border-[#ddd6c8] bg-[#fffdfa] text-[#304034] hover:bg-[#f6f1e8]"
            >
              Retry
            </Button>
          </div>
        ) : habits.length === 0 ? (
          <div className="rounded-[1rem] border border-[#e7dfd2] bg-[#faf6ef] p-4 text-sm text-[#7b7467]">
            No habits for today yet. Create one from the Habits page.
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <HabitRow
                key={habit._id}
                habit={habit}
                actionsDisabled={actionsDisabled}
                onToggleBinary={onToggleBinary}
                onUpdateQuantity={onUpdateQuantity}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HomeHabitListCard;
