import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Trophy } from "lucide-react";
import type { HabitDashboardMetrics } from "@/features/habit/habitMetrics";

type Props = {
  metrics: HabitDashboardMetrics;
};

const ProgressBar = ({ progressPercent }: { progressPercent: number }) => {
  return (
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
      <div
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${progressPercent}%` }}
      />
    </div>
  );
};

const DailyCompletionCard = ({ metrics }: Props) => {
  const isEverythingCompleted =
    metrics.totalHabits > 0 && metrics.completedHabits === metrics.totalHabits;

  return (
    <Card
      className="w-[17.5rem] shrink-0 animate-drop-in border-border bg-card shadow-none min-[760px]:w-auto"
      style={{ animationDelay: "40ms" }}
    >
      <CardContent className="p-3.5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-secondary uppercase tracking-[0.12em] text-muted-foreground">
            Daily Completion
          </p>
          <CheckCircle2 className="h-4 w-4 text-primary" />
        </div>

        <div className="mt-2 flex items-end gap-2">
          <p className="font-heading text-3xl font-semibold leading-none text-foreground">
            {metrics.completionRate}%
          </p>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {metrics.completedHabits} of {metrics.totalHabits} habits completed
        </p>

        {!isEverythingCompleted && <ProgressBar progressPercent={metrics.completionRate} />}
      </CardContent>
    </Card>
  );
};

const NearestHabitCard = ({ metrics }: Props) => {
  const nearest = metrics.nearestHabit;

  return (
    <Card
      className="w-[17.5rem] shrink-0 animate-drop-in border-border bg-card shadow-none min-[760px]:w-auto"
      style={{ animationDelay: "80ms" }}
    >
      <CardContent className="p-3.5">
        <p className="text-[11px] font-secondary uppercase tracking-[0.12em] text-muted-foreground">
          Nearest To Completion
        </p>

        {nearest ? (
          <>
            <p className="mt-2 truncate text-base font-secondary font-semibold text-foreground">
              {nearest.habitName}
            </p>

            {nearest.habitType === "quantitative" ? (
              <>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {nearest.quantity}/{nearest.target} done ({nearest.progressPercent}%)
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {nearest.remaining} left to complete
                </p>
              </>
            ) : (
              <>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Binary habit ({nearest.progressPercent}%)
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Mark it complete to finish today&apos;s target.
                </p>
              </>
            )}

            <ProgressBar progressPercent={nearest.progressPercent} />
          </>
        ) : (
          <>
            <p className="mt-2 text-base font-secondary font-semibold text-foreground">
              You are done for today
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
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
      className="w-[17.5rem] shrink-0 animate-drop-in border-primary/20 bg-primary/95 text-primary-foreground shadow-none min-[760px]:w-auto"
      style={{ animationDelay: "120ms" }}
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

export default function HabitSummaryCards({ metrics }: Props) {
  return (
    <section className="no-scrollbar flex gap-3 overflow-x-auto pb-1 min-[760px]:grid min-[760px]:grid-cols-3 min-[760px]:overflow-visible">
      <DailyCompletionCard metrics={metrics} />
      <NearestHabitCard metrics={metrics} />
      <MilestoneCard metrics={metrics} />
    </section>
  );
}
