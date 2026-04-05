import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const levelUpHistorySchema = new mongoose.Schema(
  {
    level: {
      type: Number,
      required: true,
      min: 2,
    },
    achievedAt: {
      type: Date,
      required: true,
    },
    xpThreshold: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 10,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    avatarUrl: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    avatarPublicId: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalXp: {
      type: Number,
      default: 0,
      min: 0,
    },
    levelUpHistory: {
      type: [levelUpHistorySchema],
      default: [],
    },
    friendCode: {
      type: String,
      uppercase: true,
      trim: true,
      unique: true,
      sparse: true,
      match: [/^#[A-Z0-9]{6}$/, "Friend code must look like #A3F9KL"],
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    refreshTokenHash: {
      type: String,
      default: null,
    },
    refreshTokenExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function () {
  const { password, otp, otpExpiry, otpVerified, ...safeUser } =
    this.toObject();
  return safeUser;
};

const User = mongoose.model("User", userSchema);
export default User;
