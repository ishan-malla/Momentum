import { useMemo, useState } from "react";
import { Link } from "react-router";
import HabitHeatMapCompact from "@/components/calendar/HabitHeatMapCompact";
import AnalyticsStatCard from "@/components/analytics/AnalyticsStatCard";
import HabitCompletionTrendChart from "@/components/analytics/HabitCompletionTrendChart";
import HabitHighlightsCard from "@/components/analytics/HabitHighlightsCard";
import HabitLevelCard from "@/components/analytics/HabitLevelCard";
import HabitStreakComparisonChart from "@/components/analytics/HabitStreakComparisonChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetHabitAnalyticsQuery,
  useGetHabitHeatMapQuery,
} from "@/features/habit/habitApiSlice";

const Analytics = () => {
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());

  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
    isError: isAnalyticsError,
    refetch: refetchAnalytics,
  } = useGetHabitAnalyticsQuery({ days: 14 });
  const {
    currentData: heatMapData,
    isLoading: isHeatMapLoading,
    refetch: refetchHeatMap,
  } = useGetHabitHeatMapQuery({ year: selectedYear, month: selectedMonth });

  const summary = analyticsData?.summary;
  const streaks = analyticsData?.streakComparison ?? [];
  const trend = analyticsData?.completionTrend ?? [];
  const streakLabel = summary?.bestCurrentStreak
    ? `${summary.bestCurrentStreak} Day Best Live Streak`
    : "";
  const statCards = useMemo(
    () =>
      summary
        ? [
            {
              label: "Active Habits",
              value: `${summary.activeHabits}`,
              hint: "Current habits being tracked right now.",
            },
            {
              label: "Today Completion",
              value: `${summary.completionRateToday}%`,
              hint: `${summary.completedToday}/${summary.totalToday} habits completed today.`,
            },
            {
              label: "14 Day Consistency",
              value: `${summary.recentCompletionRate}%`,
              hint: "Average completion across the last two weeks.",
            },
          ]
        : [],
    [summary],
  );

  const handleMonthChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const handleRetry = () => {
    refetchAnalytics();
    refetchHeatMap();
  };

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
            <Link to="/habits">Back</Link>
          </Button>
        </div>
        <h1 className="font-heading text-[2.15rem] font-semibold tracking-[-0.03em] text-[#2f3e32]">
          Habit Analytics
        </h1>
        <p className="max-w-2xl text-sm text-[#6e675c] sm:text-[0.95rem]">
          A simpler view of your routine: how often you finish habits, how your
          streaks are holding up, and where your consistency is trending.
        </p>
      </section>

      {isAnalyticsError ? (
        <Card className="rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-secondary text-lg font-semibold text-[#304034]">
                Couldn&apos;t load habit analytics
              </p>
              <p className="text-sm text-[#7b7467]">
                Try again and I&apos;ll pull the latest habit data.
              </p>
            </div>
            <Button onClick={handleRetry}>Retry</Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        {isAnalyticsLoading && !summary ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[130px] rounded-[1.2rem]" />
          ))
        ) : (
          <>
            {statCards.map((card) => (
              <AnalyticsStatCard key={card.label} {...card} />
            ))}
            {summary ? <HabitLevelCard summary={summary} /> : null}
          </>
        )}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        {isAnalyticsLoading && !trend.length ? (
          <Skeleton className="h-[360px] rounded-[1.35rem]" />
        ) : (
          <HabitCompletionTrendChart data={trend} />
        )}

        <Card className="rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
          <CardContent className="space-y-4 px-3 py-4 sm:px-4 sm:py-5">
            <div className="px-2 sm:px-3">
              <p className="font-heading text-xl font-semibold text-[#2f3e32]">
                Completion Calendar
              </p>
              <p className="text-sm text-[#7b7467]">
                Monthly view of how steadily your habits are getting done.
              </p>
            </div>
            {isHeatMapLoading && !heatMapData ? (
              <Skeleton className="h-[360px] rounded-[1rem]" />
            ) : (
              <HabitHeatMapCompact
                year={heatMapData?.year ?? selectedYear}
                month={heatMapData?.month ?? selectedMonth}
                progressData={heatMapData?.progressData ?? []}
                hasData={heatMapData?.hasData ?? false}
                streakLabel={streakLabel}
                minYear={heatMapData?.bounds.minYear ?? selectedYear}
                minMonth={heatMapData?.bounds.minMonth ?? selectedMonth}
                maxYear={heatMapData?.bounds.maxYear ?? selectedYear}
                maxMonth={heatMapData?.bounds.maxMonth ?? selectedMonth}
                onMonthChange={handleMonthChange}
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_272px]">
        {isAnalyticsLoading && !streaks.length ? (
          <Skeleton className="h-[360px] rounded-[1.35rem]" />
        ) : (
          <HabitStreakComparisonChart data={streaks} />
        )}
        {summary ? <HabitHighlightsCard summary={summary} streaks={streaks} /> : null}
      </section>
    </div>
  );
};

export default Analytics;
