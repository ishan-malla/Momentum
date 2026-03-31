import { Card, CardContent } from "@/components/ui/card";
import { Check, Flame, Trophy } from "lucide-react";
import type { HabitDashboardMetrics } from "@/features/habit/habitMetrics";

type Props = {
  metrics: HabitDashboardMetrics;
};

const ProgressBar = ({ progressPercent }: { progressPercent: number }) => {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#e7e2d9]">
      <div
        className="h-full rounded-full bg-primary transition-all duration-300"
        style={{ width: `${progressPercent}%` }}
      />
    </div>
  );
};

const DailyCompletionCard = ({ metrics }: Props) => {
  const previewDots = Array.from({
    length: Math.max(Math.min(metrics.totalHabits, 6), 1),
  });

  return (
    <Card
      className="w-[16.5rem] shrink-0 animate-drop-in overflow-hidden rounded-[1.2rem] border-[1.5px] border-[#d8d1c4] bg-[#fffdfa] shadow-[0_8px_22px_rgba(57,52,43,0.08)] min-[760px]:w-auto"
      style={{ animationDelay: "40ms" }}
    >
      <CardContent className="p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[10px] font-secondary uppercase tracking-[0.11em] text-[#b39463]">
            Daily Completion
          </p>
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-primary/55 text-primary">
            <Check className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="mt-2.5 flex items-end gap-2">
          <p className="font-secondary text-[2.2rem] font-semibold leading-none tracking-[-0.03em] text-[#304034] sm:text-[2.45rem]">
            {metrics.completionRate}%
          </p>
        </div>

        <p className="mt-1 text-[10px] text-[#978c78] sm:text-[0.82rem]">
          {metrics.completedHabits} of {metrics.totalHabits} habits completed
        </p>

        <div className="mt-3">
          <ProgressBar progressPercent={metrics.completionRate} />
        </div>

        <div className="mt-3.5 flex items-center gap-1.5">
          {previewDots.map((_, index) => {
            const isComplete = index < metrics.completedHabits;

            return (
              <span
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  isComplete ? "bg-primary" : "bg-[#ddd6c8]"
                }`}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const NearestHabitCard = ({ metrics }: Props) => {
  const nearest = metrics.nearestHabit;

  return (
    <Card
      className="w-[17.5rem] shrink-0 animate-drop-in overflow-hidden rounded-[1.25rem] border-[1.5px] border-[#d9d6cb] bg-[#fffdfa] shadow-[0_8px_22px_rgba(57,52,43,0.06)] min-[760px]:w-auto"
      style={{ animationDelay: "120ms" }}
    >
      <CardContent className="p-4 sm:p-[1.15rem]">
        <p className="text-[10px] font-secondary uppercase tracking-[0.11em] text-[#a79a80]">
          Nearest To Completion
        </p>

        {nearest ? (
          <>
            <div className="mt-4 flex items-start justify-between gap-3">
              <p className="truncate font-secondary text-[1.34rem] font-semibold text-[#334133]">
                {nearest.habitName}
              </p>
              <span className="shrink-0 rounded-full bg-[#edf1e7] px-3 py-1 text-[10px] font-medium text-[#587257] sm:text-[0.82rem]">
                {nearest.progressPercent}%
              </span>
            </div>

            <div className="mt-1.5">
              <p className="text-[10px] text-[#8f846f] sm:text-[0.82rem]">
                {nearest.habitType === "quantitative"
                  ? `${nearest.quantity} / ${nearest.target} done`
                  : "Ready to complete"}
              </p>
            </div>

            <div className="mt-4.5">
              <ProgressBar progressPercent={nearest.progressPercent} />
            </div>

            <div className="mt-3 h-2" aria-hidden="true" />
          </>
        ) : (
          <>
            <p className="mt-4 text-[1.2rem] font-secondary font-semibold text-foreground">
              You are done for today
            </p>
            <p className="mt-1.5 text-[0.95rem] text-muted-foreground">
              Pick a new challenge or enjoy your free time.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const MilestoneCard = ({ metrics }: Props) => {
  const done = metrics.habitsLeftForPerfectDay === 0;

  return (
    <Card
      className="w-[17.5rem] shrink-0 min-h-[120px] animate-drop-in border-primary/20 bg-primary/95 text-primary-foreground shadow-none min-[760px]:w-auto"
      style={{ animationDelay: "160ms" }}
    >
      <CardContent className="p-3.5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-secondary uppercase tracking-[0.12em] text-primary-foreground/80">
            Next Milestone
          </p>
          <Trophy className="h-4 w-4 text-primary-foreground" />
        </div>

        <p className="mt-2 font-heading text-2xl font-semibold leading-none">
          {done ? "Perfect Day" : "Keep Going"}
        </p>

        <p className="mt-1 text-xs text-primary-foreground/90">
          {done
            ? "All habits are completed today."
            : `${metrics.habitsLeftForPerfectDay} habits left to finish all today.`}
        </p>
      </CardContent>
    </Card>
  );
};

type StreakCardProps = Props & {
  compact?: boolean;
};

export const StreakCard = ({ metrics, compact = false }: StreakCardProps) => {
  const streakDays = metrics.maxStreak;
  const dayLabel = streakDays === 1 ? "day" : "days";
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const currentDayIndex = today.getDay();
  const visibleStreakCount = Math.min(streakDays, currentDayIndex + 1, 7);
  const streakStartIndex = Math.max(0, currentDayIndex - visibleStreakCount + 1);

  return (
    <Card
      className={`animate-drop-in overflow-hidden border-[1.5px] border-[#e7e0d3] bg-[#fffdfa] shadow-[0_10px_26px_rgba(57,52,43,0.06)] ${
        compact
          ? "w-full"
          : "w-[17.5rem] shrink-0 min-[760px]:w-auto"
      }`}
      style={{ animationDelay: "80ms" }}
    >
      <CardContent className={compact ? "px-3 py-1.5" : "px-4 py-2"}>
        <div className="flex flex-col items-center text-center">
          <div
            className={`flex items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,244,223,0.98),rgba(244,162,97,0.18)_55%,rgba(224,122,95,0.32)_100%)] shadow-[0_12px_24px_rgba(224,122,95,0.14)] ${
              compact ? "h-11 w-11" : "h-13 w-13"
            }`}
          >
            <Flame
              className={`fill-streak text-streak drop-shadow-[0_4px_10px_rgba(120,48,16,0.14)] ${
                compact ? "h-5 w-5" : "h-6 w-6"
              }`}
            />
          </div>

          <div className="mt-1">
            <p
              className={`font-secondary font-semibold tracking-[-0.03em] text-[#2d2a26] ${
                compact ? "text-[1.45rem]" : "text-[1.85rem]"
              }`}
            >
              {streakDays} {dayLabel}
            </p>
          </div>
        </div>

        <div
          className={`mt-2 rounded-[1rem] bg-[#f6f1e8] ${
            compact ? "px-2 py-1.25" : "px-2.5 py-1.75"
          }`}
        >
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((label, index) => {
              const isActive =
                visibleStreakCount > 0 &&
                index >= streakStartIndex &&
                index <= currentDayIndex;

              return (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div
                    className={`flex items-center justify-center rounded-full ${
                      compact ? "h-5.5 w-5.5" : "h-6.5 w-6.5"
                    } ${
                      isActive
                        ? "bg-primary/15 text-primary shadow-[0_8px_16px_rgba(97,129,100,0.16)]"
                        : "bg-[#ddd6c8] text-[#fffdfa]"
                    }`}
                  >
                    <Check className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
                  </div>
                  <span className="text-[9px] font-medium text-[#6d6559] sm:text-[10px]">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function HabitSummaryCards({ metrics }: Props) {
  return (
    <section className="no-scrollbar flex gap-3 overflow-x-auto pb-1 min-[760px]:grid min-[760px]:grid-cols-2 min-[1024px]:grid-cols-3 min-[760px]:overflow-visible">
      <DailyCompletionCard metrics={metrics} />
      <NearestHabitCard metrics={metrics} />
      <MilestoneCard metrics={metrics} />
    </section>
  );
}
