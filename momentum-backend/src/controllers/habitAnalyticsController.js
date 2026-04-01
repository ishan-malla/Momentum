import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { HabitCompletion, HabitTemplate } from "../models/habitSchema.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const APP_TIMEZONE = "Asia/Kathmandu";
const LEVEL_GOAL = 100;

const clampDays = (value) => {
  const parsed = Number.parseInt(value ?? "14", 10);
  if (Number.isNaN(parsed)) return 14;
  return Math.min(Math.max(parsed, 7), 30);
};

const toPercent = (completed, total) => {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
};

const buildBestStreakMap = (docs) => {
  const best = new Map();
  const current = new Map();
  const previous = new Map();

  for (const doc of docs) {
    const habitId = String(doc.habitTemplate);
    const currentDay = dayjs(doc.date).tz(APP_TIMEZONE).startOf("day");
    const previousDay = previous.get(habitId);
    const nextValue =
      previousDay && currentDay.diff(previousDay, "day") === 1
        ? (current.get(habitId) ?? 0) + 1
        : 1;

    current.set(habitId, nextValue);
    previous.set(habitId, currentDay);
    best.set(habitId, Math.max(best.get(habitId) ?? 0, nextValue));
  }

  return best;
};

export const getHabitAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const totalXp = req.user.totalXp ?? 0;
    const days = clampDays(req.query.days);
    const now = dayjs().tz(APP_TIMEZONE);
    const rangeStart = now.startOf("day").subtract(days - 1, "day");
    const rangeEnd = now.endOf("day");

    const templates = await HabitTemplate.find({
      user: userId,
      isDeleted: { $ne: true },
    })
      .select("name streak")
      .lean();

    const activeHabitIds = templates.map((template) => template._id);
    const [recentCompletions, completedHistory] = activeHabitIds.length
      ? await Promise.all([
          HabitCompletion.find({
            user: userId,
            habitTemplate: { $in: activeHabitIds },
            date: { $gte: rangeStart.toDate(), $lte: rangeEnd.toDate() },
          })
            .select("habitTemplate date completion")
            .lean(),
          HabitCompletion.find({
            user: userId,
            habitTemplate: { $in: activeHabitIds },
            completion: true,
          })
            .select("habitTemplate date")
            .sort({ habitTemplate: 1, date: 1 })
            .lean(),
        ])
      : [[], []];

    const dayKeys = Array.from({ length: days }, (_, index) =>
      rangeStart.add(index, "day").format("YYYY-MM-DD"),
    );
    const dailyStats = new Map(
      dayKeys.map((key) => [key, { completed: 0, total: 0 }]),
    );
    const habitStats = new Map();

    for (const completion of recentCompletions) {
      const dayKey = dayjs(completion.date).tz(APP_TIMEZONE).format("YYYY-MM-DD");
      const habitId = String(completion.habitTemplate);
      const daily = dailyStats.get(dayKey);
      const habit = habitStats.get(habitId) ?? { completed: 0, total: 0 };

      if (daily) {
        daily.total += 1;
        if (completion.completion) daily.completed += 1;
      }

      habit.total += 1;
      if (completion.completion) habit.completed += 1;
      habitStats.set(habitId, habit);
    }

    const todayKey = now.format("YYYY-MM-DD");
    const todayStats = dailyStats.get(todayKey) ?? { completed: 0, total: 0 };
    const recentCompleted = recentCompletions.filter(
      (completion) => completion.completion,
    ).length;
    const bestStreakMap = buildBestStreakMap(completedHistory);
    const bestCurrentStreak = templates.reduce(
      (highest, template) => Math.max(highest, template.streak ?? 0),
      0,
    );

    return res.status(200).json({
      days,
      summary: {
        activeHabits: templates.length,
        completedToday: todayStats.completed,
        totalToday: todayStats.total,
        completionRateToday: toPercent(todayStats.completed, todayStats.total),
        recentCompletionRate: toPercent(recentCompleted, recentCompletions.length),
        bestCurrentStreak,
        totalXp,
        level: Math.floor(totalXp / LEVEL_GOAL) + 1,
        levelProgress: totalXp % LEVEL_GOAL,
        levelGoal: LEVEL_GOAL,
      },
      completionTrend: dayKeys.map((dayKey) => {
        const stats = dailyStats.get(dayKey) ?? { completed: 0, total: 0 };
        const date = dayjs.tz(dayKey, APP_TIMEZONE);

        return {
          date: dayKey,
          label: date.format(days > 14 ? "MMM D" : "ddd"),
          completedHabits: stats.completed,
          totalHabits: stats.total,
          completionRate: toPercent(stats.completed, stats.total),
        };
      }),
      streakComparison: templates
        .map((template) => {
          const habitId = String(template._id);
          const stats = habitStats.get(habitId) ?? { completed: 0, total: 0 };

          return {
            habitId,
            name: template.name,
            currentStreak: template.streak ?? 0,
            bestStreak: bestStreakMap.get(habitId) ?? template.streak ?? 0,
            recentCompletionRate: toPercent(stats.completed, stats.total),
            completedDays: stats.completed,
            trackedDays: stats.total,
          };
        })
        .sort((left, right) => {
          if (right.currentStreak !== left.currentStreak) {
            return right.currentStreak - left.currentStreak;
          }
          if (right.recentCompletionRate !== left.recentCompletionRate) {
            return right.recentCompletionRate - left.recentCompletionRate;
          }
          return left.name.localeCompare(right.name);
        })
        .slice(0, 5),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load habit analytics",
      error: error.message,
    });
  }
};
