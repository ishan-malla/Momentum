import XpEvent from "../models/xpEventSchema.js";
import {
  calculateProgressFromTotalXp,
  getTotalXpRequiredForLevel,
  readProgressFromUser,
  syncUserProgressFields,
} from "../utils/gamificationUtils.js";

const HABIT_BASE_XP = 10;
const TASK_PRIORITY_XP = {
  low: 5,
  medium: 10,
  high: 15,
};

const normalizeMultiplier = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
};

export const getHabitBaseXp = () => HABIT_BASE_XP;

export const getHabitStreakMultiplier = (streak = 0) => {
  if (streak >= 30) return 2;
  if (streak >= 14) return 1.5;
  if (streak >= 7) return 1.25;
  if (streak >= 3) return 1.1;
  return 1;
};

export const getHabitXpForStreak = (streak = 0) => {
  return Math.round(HABIT_BASE_XP * getHabitStreakMultiplier(streak));
};

export const getTaskBaseXp = (priority = "medium") => {
  return TASK_PRIORITY_XP[priority] ?? TASK_PRIORITY_XP.medium;
};

export const ensureGamificationState = async (user) => {
  const { changed, progress } = syncUserProgressFields(user);

  if (changed && typeof user.save === "function") {
    await user.save();
  }

  return progress;
};

export const applyXpChange = async ({
  user,
  sourceType,
  sourceId,
  baseXp,
  multiplier = 1,
  direction = 1,
  occurredAt = new Date(),
}) => {
  if (!user) {
    throw new Error("User document is required");
  }

  syncUserProgressFields(user);

  const previousProgress = readProgressFromUser(user);
  const normalizedBaseXp = Math.max(0, Math.round(Number(baseXp) || 0));
  const normalizedMultiplier = normalizeMultiplier(multiplier);
  const requestedDelta =
    Math.round(normalizedBaseXp * normalizedMultiplier) * (direction >= 0 ? 1 : -1);
  const nextTotalXp = Math.max(0, previousProgress.totalXp + requestedDelta);
  const xpChange = nextTotalXp - previousProgress.totalXp;

  user.totalXp = nextTotalXp;

  const nextProgress = calculateProgressFromTotalXp(nextTotalXp);
  user.level = nextProgress.level;
  user.xp = nextProgress.xp;

  if (!Array.isArray(user.levelUpHistory)) {
    user.levelUpHistory = [];
  }

  const levelUpOccurred = nextProgress.level > previousProgress.level;
  if (levelUpOccurred) {
    for (
      let nextLevel = previousProgress.level + 1;
      nextLevel <= nextProgress.level;
      nextLevel += 1
    ) {
      user.levelUpHistory.push({
        level: nextLevel,
        achievedAt: occurredAt,
        xpThreshold: getTotalXpRequiredForLevel(nextLevel),
      });
    }
  }

  await user.save();

  if (xpChange !== 0) {
    await XpEvent.create({
      user: user._id,
      sourceType,
      sourceId: String(sourceId),
      xpDelta: xpChange,
      baseXp: normalizedBaseXp,
      multiplier: normalizedMultiplier,
      occurredAt,
    });
  }

  return {
    xpChange,
    userProgress: nextProgress,
    levelUpOccurred,
    levelUpData: levelUpOccurred
      ? {
          previousLevel: previousProgress.level,
          newLevel: nextProgress.level,
          totalXp: nextProgress.totalXp,
          currentXp: nextProgress.xp,
          levelGoal: nextProgress.levelGoal,
        }
      : null,
  };
};
