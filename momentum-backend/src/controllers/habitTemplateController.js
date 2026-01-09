import User from "../models/userSchema.js";
import { HabitTemplate } from "../models/habitSchema.js";
import mongoose from "mongoose";
//POST-API to create habit template

export const createHabitTemplate = async (req, res) => {
  try {
    const { name, habitType, frequency, skipDaysInAWeek } = req.body;
    const userId = req.user.id;
    if (!name || !skipDaysInAWeek || !habitType)
      return res.status(400).json({ message: "Some fields are missing" });

    const habitName = name.trim();

    if (habitName.length < 3)
      return res
        .status(400)
        .json({ message: "Habit name length must have atleast 3 characters" });

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

    const existingHabitTemplate = await HabitTemplate.findOne({ name });
    if (existingHabitTemplate)
      return res
        .status(400)
        .json({ message: "Can't create habit with same name" });

    const newHabitTemplate = await HabitTemplate.create({
      user,
      name: habitName,
      habitType,
      frequency,
      skipDaysInAWeek,
    });

    if (newHabitTemplate)
      return res.status(200).json({
        id: newHabitTemplate._id,
        name: habitName,
        habitType,
        frequency,
        skipDaysInAWeek,
      });
  } catch (error) {
    console.error("Habit template POST error", error);
    res.status(500).json({ message: "Server error" });
  }
};

//DELETE-API to delete an habit and Habit template this should delete all the habits that are using this template too
export const deleteHabitTemplate = async (req, res) => {
  try {
    const { habitTemplateId } = req.params;
    if (!habitTemplateId)
      return res.status(400).json({ message: "Habit template id missing" });
    if (!mongoose.Types.ObjectId.isValid(habitTemplateId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const deletedHabit = await HabitTemplate.findByIdAndDelete(habitTemplateId);

    if (!deletedHabit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    res.status(200).json({ message: "Habit deleted successfully" });
  } catch (err) {
    console.error("Habit template DELETE error", err);
    res.status(500).json({ message: "Server error" });
  }
};
