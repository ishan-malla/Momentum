import { HabitCompletion, HabitTemplate } from "../models/habitSchema.js";
import dayjs from "dayjs";
//get
export const getHabits = async (req, res) => {
  try {
    const today = dayjs().startOf("day").toDate();
    const habits = await HabitCompletion.find().populate({
      path: "habitTemplate",
      select: "name habitType frequency skipDaysInAWeek streak xp ",
    });

    const todaysHabit = habits.filter((habit) =>
      dayjs(habit.date).isSame(today, "day"),
    );

    if (!todaysHabit[0])
      return res.status(400).json({ message: "No habits today" });

    return res.status(200).json(todaysHabit);

    // const habit
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching habits",
      error: error.message,
    });
  }
};
