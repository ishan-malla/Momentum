import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import HabitHeatMapCompact from "@/components/calendar/HabitHeatMapCompact";
import CreateHabitModal from "@/components/habit/CreateHabitModal";
import DeleteHabitConfirmModal from "@/components/habit/DeleteHabitConfirmModal";
import HabitDashboardHeader from "@/components/habit/HabitDashboardHeader";
import HabitListSection from "@/components/habit/HabitListSection";
import HabitSummaryCards, {
  StreakCard,
} from "@/components/habit/HabitSummaryCards";
import HabitSummarySkeleton from "@/components/habit/HabitSummarySkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { getHabitDashboardMetrics } from "@/features/habit/habitMetrics";
import { useGetHabitHeatMapQuery } from "@/features/habit/habitApiSlice";
import { useHabitCreate } from "@/features/habit/useHabitCreate";
import { useHabitInteractions } from "@/features/habit/useHabitInteractions";
import { formatDisplayName, getDayGreeting } from "@/utils/greeting";

const Habits = () => {
  const user = useSelector(selectCurrentUser);

  const {
    habits,
    habitsError,
    isHabitsLoading,
    hasQueryError,
    refetchHabits,
    actionsDisabled,
    pendingDelete,
    isDeletingHabit,
    handleToggleBinary,
    handleUpdateQuantity,
    handleToggleSkip,
    requestDeleteHabit,
    closeDeleteDialog,
    confirmDeleteHabit,
  } = useHabitInteractions();

  const {
    createDraft,
    setCreateDraft,
    isCreateModalOpen,
    isCreatingHabit,
    openCreateModal,
    closeCreateModal,
    handleCreateHabit,
  } = useHabitCreate();

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return new Date().getFullYear();
  });
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    return new Date().getMonth();
  });

  const { currentData: heatMapData, isLoading: isHeatMapLoading } =
    useGetHabitHeatMapQuery({
      year: selectedYear,
      month: selectedMonth,
    });

  const metrics = useMemo(() => getHabitDashboardMetrics(habits), [habits]);
  const greeting = getDayGreeting();
  const username = formatDisplayName(user?.username);
  const streakLabel =
    metrics.maxStreak > 0 ? `${metrics.maxStreak} Day Streak Current` : "";

  const handleMonthChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const handleTodayClick = () => {
    const current = new Date();
    setSelectedYear(current.getFullYear());
    setSelectedMonth(current.getMonth());
  };

  return (
    <div className="mx-auto mt-6 w-full space-y-6 px-4 sm:px-5 xl:max-w-7xl xl:px-0">
      <HabitDashboardHeader
        greeting={greeting}
        username={username}
        totalHabits={metrics.totalHabits}
        bestStreak={metrics.maxStreak}
        onAddHabit={openCreateModal}
        analyticsPath="/habits/analytics"
      />

      {isHabitsLoading ? (
        <HabitSummarySkeleton />
      ) : (
        <HabitSummaryCards metrics={metrics} />
      )}

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-heading text-[24px] font-semibold text-foreground">
            Today&apos;s Habits
          </h2>
          <p className="text-xs font-secondary text-muted-foreground sm:text-sm">
            {metrics.completedHabits}/{metrics.totalHabits} completed
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start">
          <HabitListSection
            habits={habits}
            habitsError={habitsError}
            isLoading={isHabitsLoading}
            hasQueryError={hasQueryError}
            onRetry={refetchHabits}
            emptyMessage="No habits for today yet. Create one to get started."
            actionsDisabled={actionsDisabled}
            onToggleBinary={handleToggleBinary}
            onUpdateQuantity={handleUpdateQuantity}
            onToggleSkip={handleToggleSkip}
            onDelete={requestDeleteHabit}
          />

          <div className="grid gap-3 lg:self-start">
            <StreakCard metrics={metrics} compact />

            <Card className="py-4 lg:self-start">
              <CardContent className="px-3 sm:px-4">
                {isHeatMapLoading && !heatMapData ? (
                  <div className="h-[300px] animate-pulse rounded-lg border border-border bg-muted/30 sm:h-[460px]" />
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
                    onTodayClick={handleTodayClick}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <CreateHabitModal
        open={isCreateModalOpen}
        draft={createDraft}
        isSubmitting={isCreatingHabit}
        onChange={setCreateDraft}
        onClose={closeCreateModal}
        onSubmit={handleCreateHabit}
      />

      <DeleteHabitConfirmModal
        open={Boolean(pendingDelete)}
        habitName={pendingDelete?.habitName ?? ""}
        isSubmitting={isDeletingHabit}
        onCancel={closeDeleteDialog}
        onConfirm={confirmDeleteHabit}
      />
    </div>
  );
};

export default Habits;
