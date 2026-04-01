export type HabitAnalyticsQuery = {
  days?: number;
};

export type HabitAnalyticsSummary = {
  activeHabits: number;
  completedToday: number;
  totalToday: number;
  completionRateToday: number;
  recentCompletionRate: number;
  bestCurrentStreak: number;
  totalXp: number;
  level: number;
  levelProgress: number;
  levelGoal: number;
};

export type HabitCompletionTrendPoint = {
  date: string;
  label: string;
  completedHabits: number;
  totalHabits: number;
  completionRate: number;
};

export type HabitStreakComparison = {
  habitId: string;
  name: string;
  currentStreak: number;
  bestStreak: number;
  recentCompletionRate: number;
  completedDays: number;
  trackedDays: number;
};

export type HabitAnalyticsResponse = {
  days: number;
  summary: HabitAnalyticsSummary;
  completionTrend: HabitCompletionTrendPoint[];
  streakComparison: HabitStreakComparison[];
};

export const getLevelProgressPercent = ({
  levelGoal,
  levelProgress,
}: Pick<HabitAnalyticsSummary, "levelGoal" | "levelProgress">) => {
  if (!levelGoal) return 0;
  return Math.round((levelProgress / levelGoal) * 100);
};
