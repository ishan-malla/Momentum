import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useDeleteHabitTemplateMutation,
  useGetHabitsQuery,
  useUpdateHabitProgressMutation,
  useUpdateSkipHabitMutation,
} from "./habitApiSlice";
import { readHabitErrorMessage, readHabitErrorStatus } from "./habitErrors";

type PendingDelete = {
  habitTemplateId: string;
  habitName: string;
} | null;

export const useHabitInteractions = () => {
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);

  const {
    data: habitsData,
    error: habitsError,
    isLoading: isHabitsLoading,
    isFetching: isHabitsFetching,
    refetch: refetchHabits,
  } = useGetHabitsQuery();

  const [updateHabitProgress, { isLoading: isUpdatingProgress }] =
    useUpdateHabitProgressMutation();
  const [updateSkipHabit, { isLoading: isUpdatingSkip }] =
    useUpdateSkipHabitMutation();
  const [deleteHabitTemplate, { isLoading: isDeletingHabit }] =
    useDeleteHabitTemplateMutation();

  const noHabitsForToday = readHabitErrorStatus(habitsError) === 404;
  const hasQueryError = Boolean(habitsError) && !noHabitsForToday;
  const habits = useMemo(
    () => (noHabitsForToday ? [] : habitsData ?? []),
    [habitsData, noHabitsForToday],
  );

  const actionsDisabled =
    isHabitsFetching || isUpdatingProgress || isUpdatingSkip || isDeletingHabit;

  const handleToggleBinary = async (habitId: string, nextCompleted: boolean) => {
    try {
      await updateHabitProgress({
        habitId,
        delta: nextCompleted ? 1 : -1,
      }).unwrap();
    } catch (error) {
      toast.error("Could not update habit", {
        description: readHabitErrorMessage(error, "Please try again."),
      });
    }
  };

  const handleUpdateQuantity = async (habitId: string, delta: 1 | -1) => {
    try {
      await updateHabitProgress({ habitId, delta }).unwrap();
    } catch (error) {
      toast.error("Could not update habit", {
        description: readHabitErrorMessage(error, "Please try again."),
      });
    }
  };

  const handleToggleSkip = async (habitId: string, nextSkipped: boolean) => {
    try {
      await updateSkipHabit({
        habitId,
        delta: nextSkipped ? 1 : -1,
      }).unwrap();
    } catch (error) {
      toast.error("Could not update skip status", {
        description: readHabitErrorMessage(error, "Please try again."),
      });
    }
  };

  const requestDeleteHabit = (habitTemplateId: string, habitName: string) => {
    setPendingDelete({ habitTemplateId, habitName });
  };

  const closeDeleteDialog = () => setPendingDelete(null);

  const confirmDeleteHabit = async () => {
    if (!pendingDelete) return;

    try {
      const result = await deleteHabitTemplate({
        habitTemplateId: pendingDelete.habitTemplateId,
      }).unwrap();
      toast.success("Habit deleted", { description: result.message });
      setPendingDelete(null);
    } catch (error) {
      toast.error("Could not delete habit", {
        description: readHabitErrorMessage(error, "Please try again."),
      });
    }
  };

  return {
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
  };
};
