export type UserProgress = {
  level: number;
  xp: number;
  totalXp: number;
  levelGoal: number;
};

export type LevelUpData = {
  previousLevel: number;
  newLevel: number;
  totalXp: number;
  currentXp: number;
  levelGoal: number;
};

export type GamificationMutationPayload = {
  xpChange: number;
  userProgress: UserProgress;
  levelUpOccurred: boolean;
  levelUpData?: LevelUpData | null;
};
