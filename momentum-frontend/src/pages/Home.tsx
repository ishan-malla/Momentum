import DeleteHabitConfirmModal from "@/components/habit/DeleteHabitConfirmModal";
import HabitListSection from "@/components/habit/HabitListSection";
import GreetUser from "@/components/users/GreetUser";
import { useHabitInteractions } from "@/features/habit/useHabitInteractions";

const Home = () => {
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

  return (
    <div>
      <GreetUser />
      <section className="mx-auto mt-6 w-full max-w-5xl space-y-4 px-4 md:w-2/3 md:px-0">
        <h3 className="text-[24px] font-serif font-semibold text-foreground">
          Today&apos;s Habits
        </h3>

        <HabitListSection
          habits={habits}
          habitsError={habitsError}
          isLoading={isHabitsLoading}
          hasQueryError={hasQueryError}
          onRetry={refetchHabits}
          emptyMessage="No habits for today yet. Create one from the Habits page."
          actionsDisabled={actionsDisabled}
          onToggleBinary={handleToggleBinary}
          onUpdateQuantity={handleUpdateQuantity}
          onToggleSkip={handleToggleSkip}
          onDelete={requestDeleteHabit}
        />
      </section>

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

export default Home;
