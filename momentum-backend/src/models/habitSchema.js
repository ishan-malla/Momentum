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
      trim: true,
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
    streak: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true },
);

habitTemplateSchema.index({ user: 1, name: 1 }, { unique: true });

// Individual habit schema
const habitCompletionSchema = new mongoose.Schema(
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

    //this is the updated quantity when update request is done from the user this is for binary habits

    completion: {
      type: Boolean,
      default: false,
    },

    skipped: {
      type: Boolean,
      default: false,
    },

    //this is the updated quantity when update request is done from the user this is for qualitative habits
    quantity: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true },
);

habitCompletionSchema.index(
  { user: 1, habitTemplate: 1, date: 1 },
  { unique: true },
);

// Export models
export const HabitTemplate = mongoose.model(
  "HabitTemplate",
  habitTemplateSchema,
);
export const HabitCompletion = mongoose.model(
  "HabitCompletion",
  habitCompletionSchema,
);
