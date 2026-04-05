import mongoose from "mongoose";

const xpEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sourceType: {
      type: String,
      enum: ["habit", "pomodoro", "task"],
      required: true,
    },
    sourceId: {
      type: String,
      required: true,
      trim: true,
    },
    xpDelta: {
      type: Number,
      required: true,
    },
    baseXp: {
      type: Number,
      required: true,
      min: 0,
    },
    multiplier: {
      type: Number,
      required: true,
      min: 1,
    },
    occurredAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

xpEventSchema.index({ user: 1, occurredAt: -1 });
xpEventSchema.index({ sourceType: 1, sourceId: 1, occurredAt: -1 });

const XpEvent = mongoose.model("XpEvent", xpEventSchema);
export default XpEvent;
