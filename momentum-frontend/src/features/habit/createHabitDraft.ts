import type { CreateHabitTemplateRequest, HabitType } from "./habitApiSlice";

export type CreateHabitDraft = {
  name: string;
  habitType: HabitType;
  frequency: string;
  skipDaysInAWeek: string;
};

export const INITIAL_CREATE_DRAFT: CreateHabitDraft = {
  name: "",
  habitType: "binary",
  frequency: "1",
  skipDaysInAWeek: "0",
};

type DraftValidation =
  | { payload: CreateHabitTemplateRequest; errorMessage: null }
  | { payload: null; errorMessage: string };

export const validateCreateHabitDraft = (
  draft: CreateHabitDraft,
): DraftValidation => {
  const name = draft.name.trim();
  if (name.length < 3) {
    return {
      payload: null,
      errorMessage: "Habit name is too short. Use at least 3 characters.",
    };
  }

  const skipDays = Number(draft.skipDaysInAWeek);
  if (!Number.isInteger(skipDays) || skipDays < 0 || skipDays > 6) {
    return {
      payload: null,
      errorMessage: "Skip days must be a number between 0 and 6.",
    };
  }

  const payload: CreateHabitTemplateRequest = {
    name,
    habitType: draft.habitType,
    skipDaysInAWeek: skipDays,
  };

  if (draft.habitType === "quantitative") {
    const frequency = Number(draft.frequency);
    if (!Number.isInteger(frequency) || frequency <= 0) {
      return {
        payload: null,
        errorMessage:
          "Quantitative habits need a frequency greater than 0.",
      };
    }
    payload.frequency = frequency;
  }

  return { payload, errorMessage: null };
};
