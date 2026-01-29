import { HabitCompletion, HabitTemplate } from "../models/habitSchema.js";

//get
export const getHabits = async (req, res) => {
  try {
    const habits = await HabitCompletion.find().populate({
      path: "habitTemplate",
      select: "name habitType frequency skipDaysInAWeek streak xp ",
    });

    return res.status(200).json(habits);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching habits",
      error: error.message,
    });
  }
};
