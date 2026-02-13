import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { HabitCompletion, HabitTemplate } from "../models/habitSchema.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const streakMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next();

    const tz = "Asia/Kathmandu";
    const todayStart = dayjs().tz(tz).startOf("day");
    const todayEnd = todayStart.endOf("day");
    const yesterdayStart = todayStart.subtract(1, "day");
    const yesterdayEnd = yesterdayStart.endOf("day");

    const habitTemplates = await HabitTemplate.find({
      user: userId,
      isDeleted: { $ne: true },
    });

    for (const template of habitTemplates) {
      const [yesterdayHabit, todayHabit] = await Promise.all([
        HabitCompletion.findOne({
          habitTemplate: template._id,
          user: userId,
          date: { $gte: yesterdayStart.toDate(), $lte: yesterdayEnd.toDate() },
        }),
        HabitCompletion.findOne({
          habitTemplate: template._id,
          user: userId,
          date: { $gte: todayStart.toDate(), $lte: todayEnd.toDate() },
        }),
      ]);

      const missedYesterday =
        !yesterdayHabit ||
        (!yesterdayHabit.completion && !yesterdayHabit.skipped);
      const completedOrSkippedToday =
        Boolean(todayHabit) && (todayHabit.completion || todayHabit.skipped);

      if (missedYesterday && !completedOrSkippedToday) {
        if (template.streak !== 0) {
          template.streak = 0;
          await template.save();
        }
      }
    }

    next();
  } catch (error) {
    console.error("Streak middleware error:", error);
    next();
  }
};
