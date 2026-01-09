import mongoose from "mongoose";

// Template schema for habits
const habitTemplateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 25,
    },

    habitType: {
      type: String,
      enum: ["binary", "quantitative"],
      default: "binary",
    },

    frequency: {
      type: Number,
      min: 0,
      required: function () {
        return this.habitType === "quantitative";
      },
    },

    skipDaysInAWeek: {
      type: Number,
      min: 0,
      max: 6,
      default: 0,
    },

    totalNumberOfHabits: {
      type: Number,
      default: 0,
      min: 0,
    },

    xp: {
      type: Number,
      default: 10,
      min: 0,
    },
  },
  { timestamps: true }
);

habitTemplateSchema.index({ user: 1, name: 1 }, { unique: true });

// Individual habit schema
const habitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    habitTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HabitTemplate",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    completion: {
      type: Boolean,
      default: false,
    },

    quantity: {
      type: Number,
      min: 0,
      default: 0,
    },

    streak: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

habitSchema.index({ user: 1, habitTemplate: 1, date: 1 }, { unique: true });

// Export models
export const HabitTemplate = mongoose.model(
  "HabitTemplate",
  habitTemplateSchema
);
export const Habit = mongoose.model("Habit", habitSchema);
