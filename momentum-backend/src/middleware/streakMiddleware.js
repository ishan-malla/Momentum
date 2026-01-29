import dayjs from "dayjs";
import { HabitCompletion } from "../models/habitSchema.js";

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

    //calculate missed days and if missed days not 0 increment streak

    // count the number of habit tmeplates and figure total number of habits of that day and store
    // if habit is completed increase habit count of day and compare  total and completed to figure out completion rate

    console.log(latestHabits);

    next();
  } catch (error) {
    res.status(401).json({ message: "error at streak middleware" });
  }
};
