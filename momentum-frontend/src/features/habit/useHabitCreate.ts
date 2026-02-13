import { useState } from "react";
import { toast } from "sonner";
import {
  INITIAL_CREATE_DRAFT,
  validateCreateHabitDraft,
  type CreateHabitDraft,
} from "./createHabitDraft";
import { useCreateHabitTemplateMutation } from "./habitApiSlice";
import { readHabitErrorMessage } from "./habitErrors";

export const useHabitCreate = () => {
  const [createDraft, setCreateDraft] =
    useState<CreateHabitDraft>(INITIAL_CREATE_DRAFT);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [createHabitTemplate, { isLoading: isCreatingHabit }] =
    useCreateHabitTemplateMutation();

  const openCreateModal = () => setIsCreateModalOpen(true);

  const closeCreateModal = () => {
    setCreateDraft(INITIAL_CREATE_DRAFT);
    setIsCreateModalOpen(false);
  };

  const handleCreateHabit = async () => {
    const validation = validateCreateHabitDraft(createDraft);
    if (!validation.payload) {
      toast.error("Invalid habit", { description: validation.errorMessage });
      return;
    }

    try {
      const result = await createHabitTemplate(validation.payload).unwrap();
      toast.success("Habit created", { description: result.message });
      closeCreateModal();
    } catch (error) {
      toast.error("Could not create habit", {
        description: readHabitErrorMessage(error, "Please try again."),
      });
    }
  };

  return {
    createDraft,
    setCreateDraft,
    isCreateModalOpen,
    isCreatingHabit,
    openCreateModal,
    closeCreateModal,
    handleCreateHabit,
  };
};
