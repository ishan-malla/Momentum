import type { Habit } from "@/features/habit/habitApiSlice";

export type HabitProgressPreview = {
  habitId: string;
  habitName: string;
  habitType: "binary" | "quantitative";
  quantity: number | null;
  target: number | null;
  progressPercent: number;
  remaining: number | null;
};

export type HabitDashboardMetrics = {
  totalHabits: number;
  completedHabits: number;
  completionRate: number;
  maxStreak: number;
  habitsLeftForPerfectDay: number;
  nearestHabit: HabitProgressPreview | null;
};

const clampPercent = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
};

const getHabitProgressPercent = (habit: Habit) => {
  if (habit.habitTemplate.habitType === "binary") {
    return habit.completion ? 100 : 0;
  }

  const target = habit.habitTemplate.frequency ?? 0;
  if (target <= 0) return habit.completion ? 100 : 0;
  return clampPercent((habit.quantity / target) * 100);
};

const getNearestHabit = (habits: Habit[]) => {
  const candidates: HabitProgressPreview[] = habits
    .filter((habit) => !habit.skipped)
    .filter((habit) => !habit.completion)
    .map((habit): HabitProgressPreview => {
      if (habit.habitTemplate.habitType === "binary") {
        return {
          habitId: habit._id,
          habitName: habit.habitTemplate.name,
          habitType: "binary",
          quantity: null,
          target: null,
          progressPercent: getHabitProgressPercent(habit),
          remaining: null,
        };
      }

      const target = Math.max(0, habit.habitTemplate.frequency ?? 0);

      return {
        habitId: habit._id,
        habitName: habit.habitTemplate.name,
        habitType: "quantitative",
        quantity: habit.quantity,
        target,
        progressPercent: getHabitProgressPercent(habit),
        remaining: Math.max(0, target - habit.quantity),
      };
    })
    .sort((a, b) => {
      if (b.progressPercent !== a.progressPercent) {
        return b.progressPercent - a.progressPercent;
      }
      return a.habitName.localeCompare(b.habitName);
    });

  return candidates[0] ?? null;
};

export const getHabitDashboardMetrics = (habits: Habit[]): HabitDashboardMetrics => {
  const totalHabits = habits.length;
  const completedHabits = habits.filter((habit) => habit.completion).length;

  const completionRate =
    totalHabits > 0 ? clampPercent((completedHabits / totalHabits) * 100) : 0;

  const maxStreak = habits.reduce((best, habit) => {
    return Math.max(best, habit.habitTemplate.streak ?? 0);
  }, 0);

  const habitsLeftForPerfectDay = habits.filter((habit) => !habit.completion).length;

  return {
    totalHabits,
    completedHabits,
    completionRate,
    maxStreak,
    habitsLeftForPerfectDay,
    nearestHabit: getNearestHabit(habits),
  };
};
