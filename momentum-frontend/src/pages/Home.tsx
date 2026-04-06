import { toast } from "sonner";
import HomeAttentionPanel from "@/components/home/HomeAttentionPanel";
import HomeAppOverviewSection from "@/components/home/HomeAppOverviewSection";
import HomeHabitListCard from "@/components/home/HomeHabitListCard";
import HomeTaskQueueCard from "@/components/home/HomeTaskQueueCard";
import GreetUser from "@/components/users/GreetUser";
import { useGetHabitAnalyticsQuery } from "@/features/habit/habitApiSlice";
import { getHomeAppOverviewData } from "@/features/home/homeAppOverview";
import {
  getHomeOverviewData,
  type HomeAttentionItem,
} from "@/features/home/homeOverview";
import { useHabitInteractions } from "@/features/habit/useHabitInteractions";
import {
  useGetPomodoroAnalyticsQuery,
  useGetPomodoroDashboardQuery,
} from "@/features/pomodoro/pomodoroApiSlice";
import { useGetTasksQuery, useUpdateTaskMutation } from "@/features/tasks/taskApiSlice";
import type { TaskOccurrence } from "@/features/tasks/taskTypes";

const HOME_OVERVIEW_DAYS = 7;

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== "object") return fallback;

  if ("data" in error) {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === "object" && "error" in data) {
      const message = (data as { error?: string }).error;
      if (typeof message === "string" && message.trim().length > 0) return message;
    }
    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message?: string }).message;
      if (typeof message === "string" && message.trim().length > 0) return message;
    }
  }

  if ("error" in error) {
    const message = (error as { error?: unknown }).error;
    if (typeof message === "string" && message.trim().length > 0) return message;
  }

  return fallback;
};

const getAttentionSubtitle = (
  items: HomeAttentionItem[],
  isHabitsLoading: boolean,
  isTasksLoading: boolean,
  hasTasks: boolean,
) => {
  if (isHabitsLoading || (isTasksLoading && !hasTasks)) {
    return "Pulling together today’s priorities.";
  }

  if (items.length > 0) {
    return "Start with the short list below, then use the rest of the page only when you need more detail.";
  }

  return "Nothing urgent is stacked up right now. Keep the queue and habits close, but the day is in a good place.";
};

const Home = () => {
  const now = new Date();
  const { data: tasks = [], isLoading: isTasksLoading, isError: isTasksError, refetch: refetchTasks } =
    useGetTasksQuery();
  const { data: habitAnalytics, isLoading: isHabitAnalyticsLoading, isError: isHabitAnalyticsError } =
    useGetHabitAnalyticsQuery({ days: HOME_OVERVIEW_DAYS });
  const { data: pomodoroDashboard, error: pomodoroError } = useGetPomodoroDashboardQuery();
  const {
    data: pomodoroAnalytics,
    isLoading: isPomodoroAnalyticsLoading,
    isError: isPomodoroAnalyticsError,
  } = useGetPomodoroAnalyticsQuery({ days: HOME_OVERVIEW_DAYS });
  const [updateTask, { isLoading: isUpdatingTask }] = useUpdateTaskMutation();

  const {
    habits,
    habitsError,
    isHabitsLoading,
    hasQueryError,
    refetchHabits,
    actionsDisabled,
    handleToggleBinary,
    handleUpdateQuantity,
  } = useHabitInteractions();

  const overview = getHomeOverviewData({
    habits,
    hasHabitError: hasQueryError,
    tasks,
    hasTaskError: isTasksError,
    pomodoroDashboard,
    hasPomodoroError: Boolean(pomodoroError),
    now,
  });

  const attentionSubtitle = getAttentionSubtitle(
    overview.attentionItems,
    isHabitsLoading,
    isTasksLoading,
    tasks.length > 0,
  );
  const appOverview = getHomeAppOverviewData({
    habitTrend: habitAnalytics?.completionTrend ?? [],
    taskTrend: overview.taskAnalytics.trend.slice(-HOME_OVERVIEW_DAYS),
    focusTrend: pomodoroAnalytics?.dailyTrend ?? [],
    now,
  });
  const isAppOverviewLoading = isHabitAnalyticsLoading || isPomodoroAnalyticsLoading;
  const hasAppOverviewError = isHabitAnalyticsError || isPomodoroAnalyticsError;

  const handleToggleTask = async (task: TaskOccurrence, nextCompleted: boolean) => {
    try {
      await updateTask({
        id: task.taskId,
        patch: { completed: nextCompleted, occurrenceDate: task.occurrenceDate },
      }).unwrap();
    } catch (error: unknown) {
      const fallback = nextCompleted
        ? "Task can only be completed during its scheduled period."
        : "Could not update task.";
      toast.error(getApiErrorMessage(error, fallback));
    }
  };

  return (
    <div className="animate-fade-in pb-8">
      <GreetUser />

      <HomeAppOverviewSection
        data={appOverview}
        isLoading={isAppOverviewLoading}
        hasError={hasAppOverviewError}
      />

      <section className="animate-drop-in mx-auto mt-6 grid w-full gap-5 px-4 sm:px-5 xl:max-w-7xl xl:grid-cols-[minmax(0,1.2fr)_340px] xl:px-0">
        <HomeAttentionPanel
          isLoading={isHabitsLoading || (isTasksLoading && tasks.length === 0)}
          items={overview.attentionItems}
          stats={overview.summaryStats}
          subtitle={attentionSubtitle}
        />
        <HomeTaskQueueCard
          tasks={overview.todayQueue}
          nextTask={overview.nextTask}
          todayValue={overview.todayValue}
          now={now}
          isLoading={isTasksLoading && tasks.length === 0}
          isError={isTasksError}
          isUpdating={isUpdatingTask}
          quickStats={overview.quickStats}
          onRetry={refetchTasks}
          onToggle={handleToggleTask}
        />
      </section>

      <section className="animate-drop-in animate-delay-150 mx-auto mt-6 w-full px-4 sm:px-5 xl:max-w-7xl xl:px-0">
        <div id="today-habits">
          <HomeHabitListCard
            habits={habits}
            habitsError={habitsError}
            isLoading={isHabitsLoading}
            hasQueryError={hasQueryError}
            actionsDisabled={actionsDisabled}
            onRetry={refetchHabits}
            onToggleBinary={handleToggleBinary}
            onUpdateQuantity={handleUpdateQuantity}
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
