import User from "../models/userSchema.js";
import { HabitCompletion, HabitTemplate } from "../models/habitSchema.js";
import mongoose from "mongoose";
import dayjs from "dayjs";
//get habit template
export const getHabitTemplate = async (req, res) => {
  try {
    const habitTemplate = await HabitTemplate.find();
    res.json(habitTemplate);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//get by id

export const getHabitTemplateById = async (req, res) => {
  try {
    const { habitTemplateId } = req.params;

    if (!habitTemplateId)
      return res.status(400).json({ message: "Provide a habit" });

    if (!mongoose.Types.ObjectId.isValid(habitTemplateId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const habitTemplate = await HabitTemplate.findById(habitTemplateId).select(
      "name habitType frequency skipDaysInAWeek createdAt updatedAt",
    );

    if (!habitTemplate)
      return res.status(400).json({ message: "habit does not exist" });

    res.status(200).json(habitTemplate);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

//POST-API to create habit template

export const createHabitTemplate = async (req, res) => {
  try {
    const today = dayjs().startOf("day");
    const { name, habitType, frequency, skipDaysInAWeek } = req.body;
    const userId = req.user.id;

    if (!name || !habitType)
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

    const existingHabitTemplate = await HabitTemplate.findOne({ name });
    if (existingHabitTemplate)
      return res
        .status(400)
        .json({ message: "Can't create habit with same name" });

    const newHabitTemplate = await HabitTemplate.create({
      user: userId,
      name: habitName,
      habitType,
      frequency,
      skipDaysInAWeek,
    });

    // if (newHabitTemplate)
    //   return res.status(200).json({
    //     id: newHabitTemplate._id,
    //     name: habitName,
    //     habitType,
    //     frequency,
    //     skipDaysInAWeek,
    //   });

    const newHabit = await HabitCompletion.create({
      user: userId,
      habitTemplate: newHabitTemplate._id,
      date: today,
    });

    if (newHabit && newHabitTemplate)
      return res
        .status(200)
        .json({ message: `${habitName} habit created successfully` });
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
