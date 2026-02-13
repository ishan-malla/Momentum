import { Check, Flame, Minus, Plus, SkipForward, Trash2 } from "lucide-react";
import {
  type Habit,
  useGetSkipInfoQuery,
} from "@/features/habit/habitApiSlice";

type HabitCardProps = {
  habit: Habit;
  actionsDisabled?: boolean;
  onToggleBinary?: (habitId: string, nextCompleted: boolean) => void;
  onUpdateQuantity?: (habitId: string, delta: 1 | -1) => void;
  onToggleSkip?: (habitId: string, nextSkipped: boolean) => void;
  onDelete?: (habitTemplateId: string, habitName: string) => void;
};

export const HabitCard = ({
  habit,
  actionsDisabled = false,
  onToggleBinary,
  onUpdateQuantity,
  onToggleSkip,
  onDelete,
}: HabitCardProps) => {
  const { habitTemplate } = habit;
  const isBinary = habitTemplate.habitType === "binary";
  const target = habitTemplate.frequency ?? 0;
  const isComplete =
    isBinary ? habit.completion : target > 0 && habit.quantity >= target;
  const isSkipped = habit.skipped && !isComplete;
  const hasSkipSupport = habitTemplate.skipDaysInAWeek > 0;

  const { data: skipInfo } = useGetSkipInfoQuery(habit._id, {
    skip: !hasSkipSupport,
  });
  const skipsRemaining = skipInfo?.skipsRemaining ?? null;
  const noSkipsRemaining =
    hasSkipSupport &&
    !habit.skipped &&
    skipsRemaining !== null &&
    skipsRemaining <= 0;

  const progress =
    target > 0 ? Math.min((habit.quantity / target) * 100, 100) : 0;

  return (
    <div
      className={`w-full rounded-lg border p-3 transition-all sm:p-4 ${
        isComplete
          ? "border-border bg-muted/70"
          : "border-border/80 bg-muted/35 hover:bg-muted/45"
      } ${isSkipped ? "opacity-90" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        {isBinary && (
          <button
            type="button"
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors ${
              isComplete
                ? "bg-primary/70 text-primary-foreground"
                : "border-2 border-input hover:border-primary"
            }`}
            onClick={() => onToggleBinary?.(habit._id, !habit.completion)}
            disabled={actionsDisabled || isSkipped}
            title={
              isSkipped ? "Skipped today" : isComplete ? "Completed" : "Mark complete"
            }
          >
            {isComplete && <Check className="h-3.5 w-3.5" />}
          </button>
        )}

        <div className="min-w-0 flex-1">
          <h4
            className={[
              "truncate text-[14px] transition-all sm:text-[15px]",
              isComplete
                ? isBinary
                  ? "text-muted-foreground line-through"
                  : "text-muted-foreground"
                : isSkipped
                  ? "text-muted-foreground"
                  : "text-foreground",
            ].join(" ")}
          >
            {habitTemplate.name}
          </h4>
          {isSkipped && (
            <p className="mt-1 text-[10px] leading-none text-muted-foreground/60 sm:text-[11px]">
              Skipped today
            </p>
          )}
          {habitTemplate.habitType === "quantitative" && (
            <p className="mt-1 text-[10px] leading-none text-muted-foreground/60 sm:text-[11px]">
              Daily target: {target}
            </p>
          )}
          {hasSkipSupport && (
            <p className="mt-1 text-[10px] leading-none text-muted-foreground/60 sm:text-[11px]">
              {noSkipsRemaining
                ? "No skips remaining this week"
                : skipsRemaining !== null
                  ? `Skips remaining this week: ${skipsRemaining}`
                  : "Skips remaining this week: --"}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-1 rounded-md bg-streak/10 px-2 py-0.5">
            <span className="text-xs font-semibold text-streak sm:text-sm">
              {habitTemplate.streak}
            </span>
            <Flame className="h-3.5 w-3.5 text-streak" />
          </div>

          {hasSkipSupport && (
            <button
              type="button"
              onClick={() => onToggleSkip?.(habit._id, !habit.skipped)}
              disabled={actionsDisabled || isComplete || noSkipsRemaining}
              className="flex h-7 items-center gap-1 rounded-md border border-border bg-card px-2 text-[11px] text-muted-foreground/80 transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
              title={
                noSkipsRemaining
                  ? "No skips remaining"
                  : habit.skipped
                    ? "Unskip"
                    : "Skip today"
              }
            >
              <SkipForward className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{habit.skipped ? "Unskip" : "Skip"}</span>
            </button>
          )}

          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md text-destructive/70 transition-all hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete?.(habitTemplate._id, habitTemplate.name)}
            disabled={actionsDisabled}
            title="Delete habit"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!isBinary && target > 0 && (
        <div className="mt-2 flex items-center gap-2 sm:mt-3">
          <button
            type="button"
            onClick={() => onUpdateQuantity?.(habit._id, -1)}
            disabled={actionsDisabled || isSkipped || habit.quantity === 0}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-card hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Minus className="h-3 w-3" />
          </button>

          <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="shrink-0 text-center text-xs font-medium text-foreground/80">
            {habit.quantity}/{target}
          </span>

          <button
            type="button"
            onClick={() => onUpdateQuantity?.(habit._id, 1)}
            disabled={actionsDisabled || isSkipped || habit.quantity >= target}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-card hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};
