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

export const getHabitById = async (req, res) => {
  try {
    const { id } = req.params;

    const habit = await HabitCompletion.findById(id).populate({
      path: "habitTemplate",
      select: "name habitType frequency skipDaysInAWeek streak xp",
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    return res.status(200).json(habit);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching habit",
      error: error.message,
    });
  }
};
