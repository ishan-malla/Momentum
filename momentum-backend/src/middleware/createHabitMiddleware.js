import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { HabitTemplate, HabitCompletion } from "../models/habitSchema.js";

dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);

export const createHabit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = dayjs().tz("Asia/Kathmandu").startOf("day");

    const habitTemplates = await HabitTemplate.find({
      user: userId,
      isDeleted: { $ne: true },
    });

    if (habitTemplates.length === 0) {
      return next();
    }

    const allHabits = await HabitCompletion.find({ user: userId })
      .sort({ date: -1 })
      .lean();

    for (const template of habitTemplates) {
      const templateHabits = allHabits.filter(
        (h) => h.habitTemplate.toString() === template._id.toString(),
      );

      let startDate;

      if (templateHabits.length === 0) {
        startDate = today;
      } else {
        const latestHabit = templateHabits[0];
        const lastDate = dayjs(latestHabit.date)
          .tz("Asia/Kathmandu")
          .startOf("day");

        startDate = lastDate.add(1, "day");
      }

      if (startDate.isAfter(today, "day")) {
        continue;
      }

      let currentDate = startDate;

      while (currentDate.isSameOrBefore(today, "day")) {
        const habitDate = currentDate.startOf("day").toDate();

        await HabitCompletion.updateOne(
          {
            user: userId,
            habitTemplate: template._id,
            date: habitDate,
          },
          {
            $setOnInsert: {
              user: userId,
              habitTemplate: template._id,
              date: habitDate,
            },
          },
          { upsert: true },
        );

        currentDate = currentDate.add(1, "day");
      }
    }

    next();
  } catch (error) {
    console.error(" Create habit middleware error:", error.message);
    console.error("Stack trace:", error.stack);
    next();
  }
};
