import CreateHabitModal from "@/components/habit/CreateHabitModal";
import DeleteHabitConfirmModal from "@/components/habit/DeleteHabitConfirmModal";
import HabitListSection from "@/components/habit/HabitListSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="mx-auto mt-6 w-full max-w-5xl space-y-4 px-4 md:w-2/3 md:px-0">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[24px] font-serif font-semibold text-foreground sm:text-[28px]">
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
        <CardHeader className="px-5 pb-2 sm:px-6">
          <CardTitle className="text-[16px] font-serif">Habit Heatmap</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pt-0 sm:px-6">
          <div className="h-28 rounded-lg border border-dashed border-border bg-muted/30" />
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
