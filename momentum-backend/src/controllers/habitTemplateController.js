import User from "../models/userSchema.js";
import { HabitTemplate } from "../models/habitSchema.js";

//POST-API to create habit template

export const createHabitTemplate = async (req, res) => {
  try {
    const { name, habitType, frequency, skipDaysInAWeek } = req.body;
    const userId = req.user.id;
    if (!name || !skipDaysInAWeek || !habitType)
      return res.status(400).json({ message: "Some fields are missing" });

    if (habitType === "quantitative" && !frequency)
      return res
        .status(400)
        .json({ message: "quantitative habits must have a frequency" });

    if (habitType === "quantitative" && frequency === 0)
      return res.status(200).json({
        message: "frequency of quantitative habit must be greater than 0",
      });

    if (skipDaysInAWeek > 7)
      return res.status(400).json({ message: "skip days must be less than 7" });

    const user = await User.findById(userId);

    const newHabitTemplate = await HabitTemplate.create({
      user,
      name,
      habitType,
      frequency,
      skipDaysInAWeek,
    });

    if (newHabitTemplate)
      return res.status(200).json({ message: "Habit created succesfully" });
  } catch (error) {
    console.error("Habit template error", error);
    res.status(500).json({ message: "Server error" });
  }
};
