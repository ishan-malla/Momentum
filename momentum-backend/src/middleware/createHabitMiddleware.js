import dayjs from "dayjs";
import { HabitTemplate, HabitCompletion } from "../models/habitSchema.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";

export const createHabit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = dayjs().startOf("day");

    const habitTemplates = await HabitTemplate.find({ user: userId });

    if (habitTemplates.length === 0) {
      return next();
    }

    const latestHabits = await HabitCompletion.aggregate([
      {
        $match: { user: userId },
      },
      {
        $sort: { date: -1 },
      },
      {
        $group: {
          _id: "$habitTemplate",
          latestHabit: { $first: "$$ROOT" },
        },
      },
    ]);

    for (const template of habitTemplates) {
      const templateId = template._id.toString();

      // Find the latest habit for this template
      const latestHabitData = latestHabits.find(
        (item) => item._id.toString() === templateId,
      );

      let startDate;

      if (!latestHabitData) {
        startDate = today;
      } else {
        const lastDate = dayjs(latestHabitData.latestHabit.date).startOf("day");
        startDate = lastDate.add(1, "day");
      }

      let currentDate = startDate;
      while (!currentDate.isAfter(today)) {
        const existingHabit = await HabitCompletion.findOne({
          user: userId,
          habitTemplate: template._id,
          date: currentDate.toDate(),
        });

        if (!existingHabit) {
          await HabitCompletion.create({
            user: userId,
            habitTemplate: template._id,
            date: currentDate.toDate(),
          });
        }

        currentDate = currentDate.add(1, "day");
      }
    }

    next();
  } catch (error) {
    console.error("Create habit middleware error:", error.message);
    next();
  }
};
