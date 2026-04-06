import type { HabitCompletionTrendPoint } from "@/features/habit/habitAnalytics";
import type { PomodoroDailyTrendPoint } from "@/features/pomodoro/pomodoroAnalytics";
import type { TaskCompletionTrendPoint } from "@/features/tasks/taskAnalytics";

const OVERVIEW_DAYS = 7;

export type HomeAppActivityPoint = {
  date: string;
  label: string;
  habits: number;
  tasks: number;
  focus: number;
  focusMinutes: number;
  total: number;
};

export type HomeAppConsistencyPoint = {
  label: string;
  activeDays: number;
  totalActions: number;
};

export type HomeAppInsight = {
  label: string;
  value: string;
  detail: string;
};

export type HomeAppOverviewData = {
  activity: HomeAppActivityPoint[];
  consistency: HomeAppConsistencyPoint[];
  insights: HomeAppInsight[];
};

const formatDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
  });
};

const getRecentDateMeta = (now: Date) => {
  return Array.from({ length: OVERVIEW_DAYS }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    date.setDate(date.getDate() - (OVERVIEW_DAYS - 1 - index));

    return {
      date: formatDateValue(date),
      label: formatDateLabel(date),
    };
  });
};

export const getHomeAppOverviewData = ({
  habitTrend,
  taskTrend,
  focusTrend,
  now,
}: {
  habitTrend: HabitCompletionTrendPoint[];
  taskTrend: TaskCompletionTrendPoint[];
  focusTrend: PomodoroDailyTrendPoint[];
  now: Date;
}): HomeAppOverviewData => {
  const habitMap = new Map(habitTrend.map((point) => [point.date, point]));
  const taskMap = new Map(taskTrend.map((point) => [point.date, point]));
  const focusMap = new Map(focusTrend.map((point) => [point.date, point]));

  const activity = getRecentDateMeta(now).map(({ date, label }) => {
    const habits = habitMap.get(date)?.completedHabits ?? 0;
    const tasks = taskMap.get(date)?.completed ?? 0;
    const focus = focusMap.get(date)?.focusSessions ?? 0;
    const focusMinutes = focusMap.get(date)?.focusMinutes ?? 0;

    return {
      date,
      label,
      habits,
      tasks,
      focus,
      focusMinutes,
      total: habits + tasks + focus,
    };
  });

  const consistency = [
    {
      label: "Habits",
      activeDays: activity.filter((point) => point.habits > 0).length,
      totalActions: activity.reduce((sum, point) => sum + point.habits, 0),
    },
    {
      label: "Tasks",
      activeDays: activity.filter((point) => point.tasks > 0).length,
      totalActions: activity.reduce((sum, point) => sum + point.tasks, 0),
    },
    {
      label: "Focus",
      activeDays: activity.filter((point) => point.focus > 0).length,
      totalActions: activity.reduce((sum, point) => sum + point.focus, 0),
    },
  ];

  const bestDay =
    [...activity].sort((left, right) => right.total - left.total || left.date.localeCompare(right.date))[0] ??
    null;
  const strongestArea =
    [...consistency].sort(
      (left, right) =>
        right.activeDays - left.activeDays || right.totalActions - left.totalActions,
    )[0] ?? null;
  const quietestArea =
    [...consistency].sort(
      (left, right) =>
        left.activeDays - right.activeDays || left.totalActions - right.totalActions,
    )[0] ?? null;

  const allPillarDays = activity.filter(
    (point) => point.habits > 0 && point.tasks > 0 && point.focus > 0,
  ).length;
  const totalFocusMinutes = activity.reduce((sum, point) => sum + point.focusMinutes, 0);

  const insights: HomeAppInsight[] = [
    {
      label: "Best day",
      value: bestDay && bestDay.total > 0 ? bestDay.label : "No activity yet",
      detail:
        bestDay && bestDay.total > 0
          ? `${bestDay.habits} habits, ${bestDay.tasks} tasks, and ${bestDay.focusMinutes} focus minutes.`
          : "Once activity starts showing up, the strongest day of the week will appear here.",
    },
    {
      label: "Steadiest area",
      value: strongestArea ? `${strongestArea.label} · ${strongestArea.activeDays}/7` : "--",
      detail:
        strongestArea && quietestArea && strongestArea.label !== quietestArea.label
          ? `${quietestArea.label} has been the quietest area this week.`
          : "Your habits, tasks, and focus are moving with a similar rhythm right now.",
    },
    {
      label: "All-pillar days",
      value: `${allPillarDays}/7`,
      detail:
        totalFocusMinutes > 0
          ? `${totalFocusMinutes} focus minutes were logged across the last 7 days.`
          : "No focus time has been logged in the last 7 days yet.",
    },
  ];

  return {
    activity,
    consistency,
    insights,
  };
};
