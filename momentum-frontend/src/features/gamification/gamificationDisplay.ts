export const HABIT_BASE_XP = 10;
export const FIXED_FOCUS_XP = 10;
export const MIN_FOCUS_XP_MINUTES = 5;

export const getHabitStreakMultiplier = (streak: number) => {
  if (streak >= 30) return 2;
  if (streak >= 14) return 1.5;
  if (streak >= 7) return 1.25;
  if (streak >= 3) return 1.1;
  return 1;
};

export const formatMultiplier = (multiplier: number) => {
  return `x${Number(multiplier.toFixed(2)).toString()}`;
};

export const getHabitXpPreview = ({
  streak,
  isComplete,
}: {
  streak: number;
  isComplete: boolean;
}) => {
  const effectiveStreak = isComplete ? streak : streak + 1;
  const multiplier = getHabitStreakMultiplier(effectiveStreak);
  const xp = Math.round(HABIT_BASE_XP * multiplier);

  return {
    effectiveStreak,
    multiplier,
    multiplierLabel: formatMultiplier(multiplier),
    xp,
  };
};
