export const LEVEL_GOAL_EARLY = 250;
export const LEVEL_GOAL_MID = 400;
export const LEVEL_GOAL_LATE = 650;

const isFiniteNumber = (value) => Number.isFinite(value);

export const normalizeTotalXp = (value) => {
  const parsed = Number(value);
  if (!isFiniteNumber(parsed) || parsed < 0) {
    return 0;
  }

  return Math.floor(parsed);
};

export const getLevelGoal = (level = 1) => {
  if (level >= 26) return LEVEL_GOAL_LATE;
  if (level >= 11) return LEVEL_GOAL_MID;
  return LEVEL_GOAL_EARLY;
};

export const getTotalXpRequiredForLevel = (level = 1) => {
  if (level <= 1) return 0;

  let total = 0;

  for (let currentLevel = 1; currentLevel < level; currentLevel += 1) {
    total += getLevelGoal(currentLevel);
  }

  return total;
};

export const calculateProgressFromTotalXp = (value) => {
  const totalXp = normalizeTotalXp(value);
  let remainingXp = totalXp;
  let level = 1;

  while (remainingXp >= getLevelGoal(level)) {
    remainingXp -= getLevelGoal(level);
    level += 1;
  }

  return {
    level,
    xp: remainingXp,
    totalXp,
    levelGoal: getLevelGoal(level),
  };
};

export const hasStoredProgress = (user) => {
  if (!user) return false;

  return (
    isFiniteNumber(user.level) &&
    user.level >= 1 &&
    isFiniteNumber(user.xp) &&
    user.xp >= 0 &&
    isFiniteNumber(user.totalXp) &&
    user.totalXp >= 0
  );
};

export const readProgressFromUser = (user) => {
  if (!user) {
    return calculateProgressFromTotalXp(0);
  }

  if (hasStoredProgress(user)) {
    return {
      level: Math.floor(user.level),
      xp: Math.floor(user.xp),
      totalXp: normalizeTotalXp(user.totalXp),
      levelGoal: getLevelGoal(user.level),
    };
  }

  return calculateProgressFromTotalXp(user.totalXp ?? 0);
};

export const syncUserProgressFields = (user) => {
  if (!user) {
    return {
      changed: false,
      progress: calculateProgressFromTotalXp(0),
    };
  }

  const progress = calculateProgressFromTotalXp(user.totalXp ?? 0);

  const changed =
    user.level !== progress.level ||
    user.xp !== progress.xp ||
    normalizeTotalXp(user.totalXp) !== progress.totalXp;

  if (changed) {
    user.level = progress.level;
    user.xp = progress.xp;
    user.totalXp = progress.totalXp;
  }

  if (!Array.isArray(user.levelUpHistory)) {
    user.levelUpHistory = [];
  }

  return { changed, progress };
};
