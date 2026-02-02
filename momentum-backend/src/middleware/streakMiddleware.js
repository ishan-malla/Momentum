import dayjs from "dayjs";
import { HabitCompletion, HabitTemplate } from "../models/habitSchema.js";

export const streakMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next();

    const yesterday = dayjs().subtract(1, "day").startOf("day").toDate();

    const habitTemplates = await HabitTemplate.find({ user: userId });

    for (const template of habitTemplates) {
      const yesterdayHabit = await HabitCompletion.findOne({
        habitTemplate: template._id,
        user: userId,
        date: yesterday,
      });

      if (
        !yesterdayHabit ||
        (!yesterdayHabit.completion && !yesterdayHabit.skipped)
      ) {
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
