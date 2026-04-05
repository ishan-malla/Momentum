import mongoose from "mongoose";

const friendshipSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pairKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { timestamps: true },
);

friendshipSchema.index({ requester: 1, status: 1, createdAt: -1 });
friendshipSchema.index({ recipient: 1, status: 1, createdAt: -1 });

const Friendship = mongoose.model("Friendship", friendshipSchema);
export default Friendship;
