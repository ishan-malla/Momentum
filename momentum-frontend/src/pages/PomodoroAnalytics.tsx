import { Link } from "react-router";
import AnalyticsStatCard from "@/components/analytics/AnalyticsStatCard";
import PomodoroFocusTrendChart from "@/components/analytics/PomodoroFocusTrendChart";
import PomodoroFocusWindowChart from "@/components/analytics/PomodoroFocusWindowChart";
import PomodoroHighlightsCard from "@/components/analytics/PomodoroHighlightsCard";
import PomodoroSessionLengthChart from "@/components/analytics/PomodoroSessionLengthChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPomodoroAnalyticsQuery } from "@/features/pomodoro/pomodoroApiSlice";

const DEFAULT_ANALYTICS_DAYS = 28;

const formatMinutes = (value: number) => {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
};

export default function PomodoroAnalytics() {
  const {
    data: analyticsData,
    isLoading,
    isError,
    refetch,
  } = useGetPomodoroAnalyticsQuery({
    days: DEFAULT_ANALYTICS_DAYS,
  });

  const days = analyticsData?.days ?? DEFAULT_ANALYTICS_DAYS;
  const summary = analyticsData?.summary;
  const dailyTrend = analyticsData?.dailyTrend ?? [];
  const focusWindows = analyticsData?.focusWindowBreakdown ?? [];
  const sessionLengthBreakdown = analyticsData?.sessionLengthBreakdown ?? [];
  const highlights = analyticsData?.highlights;

  let statCards: Array<{ label: string; value: string; hint: string }> = [];

  if (summary) {
    const onTargetHint =
      summary.focusSessions > 0
        ? `${summary.onTargetSessions}/${summary.focusSessions} focus sessions reached your ${summary.targetFocusMinutes} min target.`
        : `Your ${summary.targetFocusMinutes} min focus target will show up here once sessions are logged.`;

    statCards = [
      {
        label: "Focus Sessions",
        value: `${summary.focusSessions}`,
        hint: `${summary.breakSessions} break sessions were logged in the same ${days}-day window.`,
      },
      {
        label: "Focus Minutes",
        value: `${summary.focusMinutes}`,
        hint: `${summary.activeDays} active days and ${formatMinutes(summary.averageFocusMinutes)} min per focus session on average.`,
      },
      {
        label: "On-Target Rate",
        value: `${summary.onTargetRate}%`,
        hint: onTargetHint,
      },
      {
        label: "Current Streak",
        value: `${summary.currentFocusStreak}d`,
        hint: `Best run: ${summary.bestFocusStreak} days. ${summary.xpEarned} XP earned in this span.`,
      },
    ];
  }

  return (
    <div className="mx-auto mt-6 w-full space-y-6 px-4 sm:px-5 xl:max-w-7xl xl:px-0">
      <section className="space-y-2">
        <div className="flex justify-end">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-9 border-[#ddd6c8] bg-[#fffdfa] px-3.5 text-sm text-[#304034] hover:bg-[#f6f1e8]"
          >
            <Link to="/timer">Back</Link>
          </Button>
        </div>
        <h1 className="font-heading text-[2.15rem] font-semibold tracking-[-0.03em] text-[#2f3e32]">
          Pomodoro Analytics
        </h1>
      </section>

      {isError ? (
        <Card className="rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-secondary text-lg font-semibold text-[#304034]">
                Couldn&apos;t load pomodoro analytics
              </p>
              <p className="text-sm text-[#7b7467]">
                Try again and I&apos;ll pull the latest timer history.
              </p>
            </div>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        {isLoading && !summary
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[130px] rounded-[1.2rem]" />
            ))
          : statCards.map((card) => (
              <AnalyticsStatCard key={card.label} {...card} />
            ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_300px]">
        {isLoading && !dailyTrend.length ? (
          <Skeleton className="h-[360px] rounded-[1.35rem]" />
        ) : (
          <PomodoroFocusTrendChart days={days} data={dailyTrend} />
        )}

        {isLoading && !highlights ? (
          <Skeleton className="h-[360px] rounded-[1.05rem]" />
        ) : summary && highlights ? (
          <PomodoroHighlightsCard
            days={days}
            summary={summary}
            highlights={highlights}
          />
        ) : null}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {isLoading && !focusWindows.length ? (
          <Skeleton className="h-[340px] rounded-[1.35rem]" />
        ) : (
          <PomodoroFocusWindowChart data={focusWindows} />
        )}

        {isLoading && !sessionLengthBreakdown.length ? (
          <Skeleton className="h-[340px] rounded-[1.35rem]" />
        ) : (
          <PomodoroSessionLengthChart data={sessionLengthBreakdown} />
        )}
      </section>
    </div>
  );
}
