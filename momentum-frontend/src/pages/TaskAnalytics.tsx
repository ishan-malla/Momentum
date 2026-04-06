import { useMemo } from "react";
import { Link } from "react-router";
import AnalyticsStatCard from "@/components/analytics/AnalyticsStatCard";
import TaskBreakdownChart from "@/components/analytics/TaskBreakdownChart";
import TaskCompletionTrendChart from "@/components/analytics/TaskCompletionTrendChart";
import TaskHighlightsCard from "@/components/analytics/TaskHighlightsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTasksQuery } from "@/features/tasks/taskApiSlice";
import { getTaskAnalytics } from "@/features/tasks/taskAnalytics";

export default function TaskAnalytics() {
  const { data: tasks = [], isLoading, isError, refetch } = useGetTasksQuery();

  const analytics = useMemo(() => getTaskAnalytics(tasks), [tasks]);
  const { summary, trend, priorityBreakdown, frequencyBreakdown, weekdayBreakdown, highlights } =
    analytics;

  const statCards = [
    {
      label: "Total Tasks",
      value: `${summary.totalTasks}`,
      hint: `${summary.completedTasks} completed and ${summary.upcomingOpenTasks} still upcoming.`,
    },
    {
      label: "Completion Rate",
      value: `${summary.completionRate}%`,
      hint: `${summary.completedTasks}/${summary.totalTasks} tasks currently marked complete.`,
    },
    {
      label: "This Month",
      value: `${summary.scheduledThisMonth}`,
      hint: `${summary.dueToday} due today and ${summary.overdueOpenTasks} overdue right now.`,
    },
    {
      label: "Task XP Earned",
      value: `${summary.xpEarned}`,
      hint: "XP already awarded from completed tasks based on priority.",
    },
  ];

  return (
    <div className="animate-fade-in mx-auto mt-6 w-full space-y-6 px-4 sm:px-5 xl:max-w-7xl xl:px-0">
      <section className="animate-drop-in space-y-2">
        <div className="flex justify-end">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-9 border-[#ddd6c8] bg-[#fffdfa] px-3.5 text-sm text-[#304034] hover:bg-[#f6f1e8]"
          >
            <Link to="/task-calendar">Back</Link>
          </Button>
        </div>
        <h1 className="font-heading text-[2.15rem] font-semibold tracking-[-0.03em] text-[#2f3e32]">
          Task Analytics
        </h1>
      </section>

      {isError ? (
        <Card className="rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-secondary text-lg font-semibold text-[#304034]">
                Couldn&apos;t load task analytics
              </p>
              <p className="text-sm text-[#7b7467]">
                Try again and I&apos;ll pull the latest task and calendar data.
              </p>
            </div>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="animate-drop-in animate-delay-75 grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        {isLoading && tasks.length === 0
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[130px] rounded-[1.2rem]" />
            ))
          : statCards.map((card) => (
              <AnalyticsStatCard key={card.label} {...card} />
            ))}
      </section>

      <section className="animate-drop-in animate-delay-150 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_300px]">
        {isLoading && tasks.length === 0 ? (
          <Skeleton className="h-[360px] rounded-[1.35rem]" />
        ) : (
          <TaskCompletionTrendChart data={trend} />
        )}

        {isLoading && tasks.length === 0 ? (
          <Skeleton className="h-[360px] rounded-[1.05rem]" />
        ) : (
          <TaskHighlightsCard summary={summary} highlights={highlights} />
        )}
      </section>

      <section className="animate-drop-in animate-delay-225 grid gap-5 xl:grid-cols-2">
        {isLoading && tasks.length === 0 ? (
          <Skeleton className="h-[340px] rounded-[1.35rem]" />
        ) : (
          <TaskBreakdownChart
            title="Priority Mix"
            description="See which priority level is dominating your current task load."
            data={priorityBreakdown}
          />
        )}

        {isLoading && tasks.length === 0 ? (
          <Skeleton className="h-[340px] rounded-[1.35rem]" />
        ) : (
          <TaskBreakdownChart
            title="Frequency Mix"
            description="Daily, weekly, and monthly schedules across all your tasks."
            data={frequencyBreakdown}
          />
        )}
      </section>

      <section className="animate-drop-in animate-delay-300">
        {isLoading && tasks.length === 0 ? (
          <Skeleton className="h-[340px] rounded-[1.35rem]" />
        ) : (
          <TaskBreakdownChart
            title="Schedule by Weekday"
            description="A calendar view of which weekdays carry the heaviest task load."
            data={weekdayBreakdown}
          />
        )}
      </section>
    </div>
  );
}
