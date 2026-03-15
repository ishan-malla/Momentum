import { useMemo } from "react";
import DeleteHabitConfirmModal from "@/components/habit/DeleteHabitConfirmModal";
import HabitListSection from "@/components/habit/HabitListSection";
import GreetUser from "@/components/users/GreetUser";
import { useGetTasksQuery } from "@/features/tasks/taskApiSlice";
import type { Task } from "@/features/tasks/taskTypes";
import { useHabitInteractions } from "@/features/habit/useHabitInteractions";

const Home = () => {
  const today = new Date().toISOString().split("T")[0];
  const { data: tasks = [], isLoading: isTasksLoading, isError: isTasksError } =
    useGetTasksQuery();

  const todaysTasks = useMemo(
    () => tasks.filter((task: Task) => task.scheduledDate === today),
    [tasks, today],
  );

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
      <section className="mx-auto mt-4 w-full space-y-4 px-4 sm:px-5 xl:max-w-6xl xl:px-0">
        <h3 className="font-heading text-[24px] font-semibold text-foreground sm:text-[28px]">
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

      <section className="mx-auto mt-10 w-full space-y-4 px-4 sm:px-5 xl:max-w-6xl xl:px-0">
        <h3 className="font-heading text-[24px] font-semibold text-foreground sm:text-[28px]">
          Today&apos;s Tasks
        </h3>

        {isTasksLoading && (
          <p className="text-sm text-muted-foreground">Loading tasks...</p>
        )}
        {isTasksError && (
          <p className="text-sm text-destructive">Could not load tasks.</p>
        )}
        {!isTasksLoading && !isTasksError && todaysTasks.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No tasks scheduled for today.
          </p>
        )}

        <div className="space-y-3">
          {todaysTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary/70" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-heading font-semibold text-foreground">
                    {task.name}
                  </p>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {task.priority}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {task.scheduledTime}
                </p>
                {task.description ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {task.description}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
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
