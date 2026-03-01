import { useState } from "react";
import HabitHeatMap from "@/components/calendar/HabitHeatMap";
import CreateHabitModal from "@/components/habit/CreateHabitModal";
import DeleteHabitConfirmModal from "@/components/habit/DeleteHabitConfirmModal";
import HabitListSection from "@/components/habit/HabitListSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetHabitHeatMapQuery } from "@/features/habit/habitApiSlice";
import { useHabitCreate } from "@/features/habit/useHabitCreate";
import { useHabitInteractions } from "@/features/habit/useHabitInteractions";
import { Plus } from "lucide-react";

const Habits = () => {
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

  const [selectedYear, setSelectedYear] = useState<number>(() =>
    new Date().getFullYear(),
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(() =>
    new Date().getMonth(),
  );

  const { currentData: heatMapData, isLoading: isHeatMapLoading } =
    useGetHabitHeatMapQuery({
      year: selectedYear,
      month: selectedMonth,
    });

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
    <div className="mx-auto mt-6 w-full xl:max-w-6xl space-y-4 px-4 sm:px-5 xl:px-0">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[20px] font-serif font-semibold text-foreground sm:text-[24px] lg:text-[28px]">
          Today&apos;s Habits
        </h2>
        <Button
          type="button"
          size="sm"
          onClick={openCreateModal}
          className="mt-1 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Habit
        </Button>
      </div>

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

      <Card className="py-5">
        <CardContent className="px-5 sm:px-6">
          {isHeatMapLoading && !heatMapData ? (
            <div className="h-[440px] animate-pulse rounded-lg border border-border bg-muted/30" />
          ) : (
            <HabitHeatMap
              year={heatMapData?.year ?? selectedYear}
              month={heatMapData?.month ?? selectedMonth}
              progressData={heatMapData?.progressData ?? []}
              hasData={heatMapData?.hasData ?? false}
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
