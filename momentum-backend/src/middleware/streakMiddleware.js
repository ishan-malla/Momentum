import dayjs from "dayjs";
import { HabitCompletion, HabitTemplate } from "../models/habitSchema.js";

export const streakMiddleware = async (req, res, next) => {
  try {
    const today = dayjs().startOf("day");

    // const habits = await HabitCompletion.find().populate({
    //   path: "habitTemplate",
    //   select: "name habitType frequency skipDaysInAWeek streak xp ",
    // });

    const latestHabits = await HabitCompletion.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$habitTemplate",
          latestHabit: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$latestHabit" },
      },
    ]);

    for (const habit of latestHabits) {
      const numberOfDaysMissed = today.diff(habit.date, "day") - 1;
      if (numberOfDaysMissed > 0) {
      }
      console.log(numberOfDaysMissed);

      const latestHabit = await HabitTemplate.findById(
        habit.habitTemplate.toString(),
      );

      if (numberOfDaysMissed >= 0) {
        latestHabit.streak = 0;
      }
    }

    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
