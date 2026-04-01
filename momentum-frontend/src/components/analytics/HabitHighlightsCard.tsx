import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  HabitAnalyticsSummary,
  HabitStreakComparison,
} from "@/features/habit/habitAnalytics";

type HabitHighlightsCardProps = {
  summary: HabitAnalyticsSummary;
  streaks: HabitStreakComparison[];
};

type DetailRowProps = {
  label: string;
  value: string;
  emphasize?: boolean;
};

const DetailRow = ({ label, value, emphasize = false }: DetailRowProps) => (
  <div className="flex items-start justify-between gap-3 border-b border-[#eee6da] py-2.5 last:border-b-0 last:pb-0">
    <span className="text-[11px] font-secondary uppercase tracking-[0.12em] text-[#9c8b6d]">
      {label}
    </span>
    <span
      className={[
        "max-w-[58%] text-right text-[13px] leading-5",
        emphasize ? "font-semibold text-[#304034]" : "font-medium text-[#5f584d]",
      ].join(" ")}
    >
      {value}
    </span>
  </div>
);

const HabitHighlightsCard = ({
  summary,
  streaks,
}: HabitHighlightsCardProps) => {
  const strongestHabit = streaks[0] ?? null;
  const lowestRateHabit =
    [...streaks].sort(
      (left, right) => left.recentCompletionRate - right.recentCompletionRate,
    )[0] ?? null;

  const strongestHabitDescription = strongestHabit
    ? strongestHabit.trackedDays > 0
      ? `${strongestHabit.recentCompletionRate}% completion across ${strongestHabit.trackedDays} tracked days.`
      : "No recent check-ins yet."
    : "Create a habit to start building momentum.";
  const liveStreakValue =
    summary.bestCurrentStreak > 0
      ? `${summary.bestCurrentStreak} days`
      : "No streak yet";
  const attentionValue = lowestRateHabit
    ? `${lowestRateHabit.name} at ${lowestRateHabit.recentCompletionRate}%`
    : "Nothing to flag yet";

  return (
    <Card className="h-fit self-start gap-0 rounded-[1.05rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
      <CardHeader className="gap-3 border-b border-[#eee6da] px-4 pb-3 pt-3.5">
        <div className="space-y-1">
          <p className="text-[10px] font-secondary uppercase tracking-[0.14em] text-[#9c8b6d]">
            Analytics Snapshot
          </p>
          <CardTitle className="font-heading text-[1rem] text-[#2f3e32]">
            Habit Highlights
          </CardTitle>
          <CardDescription className="text-[12px] leading-5 text-[#7b7467]">
            A simple read on your current habit momentum.
          </CardDescription>
        </div>
        <CardAction className="rounded-full border border-[#eadfce] bg-[#f8f3eb] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b7c60]">
          14D
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3 px-4 pb-4 pt-3">
        <div className="rounded-[0.95rem] border border-[#e9e1d4] bg-[#f8f4ed] px-3 py-3">
          <p className="text-[10px] font-secondary uppercase tracking-[0.12em] text-[#9c8b6d]">
            Strongest Habit
          </p>
          <p className="mt-1.5 font-secondary text-[15px] font-semibold text-[#304034]">
            {strongestHabit?.name ?? "No habits yet"}
          </p>
          <p className="mt-1 text-[12px] leading-5 text-[#6d665b]">
            {strongestHabitDescription}
          </p>

          {strongestHabit ? (
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#e6ddcf] pt-2.5">
              <div>
                <p className="text-[10px] font-secondary uppercase tracking-[0.12em] text-[#9c8b6d]">
                  Live
                </p>
                <p className="mt-1 text-[13px] font-semibold text-[#304034]">
                  {strongestHabit.currentStreak} days
                </p>
              </div>
              <div>
                <p className="text-[10px] font-secondary uppercase tracking-[0.12em] text-[#9c8b6d]">
                  Best
                </p>
                <p className="mt-1 text-[13px] font-semibold text-[#304034]">
                  {strongestHabit.bestStreak} days
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-[0.95rem] border border-[#ece4d7] bg-white px-3">
          <DetailRow
            label="Consistency"
            value={`${summary.recentCompletionRate}%`}
            emphasize
          />
          <DetailRow label="Best Live Streak" value={liveStreakValue} emphasize />
          <DetailRow label="Needs Attention" value={attentionValue} />
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitHighlightsCard;
