import { updateCurrentUser } from "@/features/auth/authSlice";
import { pushGamificationFeedback } from "@/features/gamification/gamificationSlice";
import type { GamificationMutationPayload } from "@/features/gamification/gamificationTypes";
import type { RootState } from "@/store/store";

const hasGamificationPayload = (
  value: unknown,
): value is GamificationMutationPayload => {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "userProgress" in value &&
    typeof value.userProgress === "object" &&
    value.userProgress !== null &&
    "level" in value.userProgress &&
    "xp" in value.userProgress &&
    "totalXp" in value.userProgress &&
    "levelGoal" in value.userProgress
  );
};

export const syncGamificationMutation = async <T>(
  dispatch: (action: unknown) => void,
  getState: () => unknown,
  queryFulfilled: Promise<{ data: T }>,
) => {
  try {
    const { data } = await queryFulfilled;
    if (!hasGamificationPayload(data)) {
      return;
    }

    const token = (getState() as RootState).auth.token;
    if (token) {
      dispatch(updateCurrentUser(data.userProgress));
    }

    dispatch(
      pushGamificationFeedback({
        xpChange: data.xpChange,
        levelUpOccurred: data.levelUpOccurred,
        levelUpData: data.levelUpData ?? null,
      }),
    );
  } catch {
    // no-op
  }
};
