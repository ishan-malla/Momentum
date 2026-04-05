import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";
import { ensureUserFriendCode } from "../utils/friendCodeService.js";

const normalizeRole = (role) => String(role || "").trim().toLowerCase();

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select(
      "-password -otp -otpExpiry -otpVerified"
    );
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    await ensureUserFriendCode(user);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const verifiedOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  if (!req.user.isVerified) {
    return res.status(403).json({ message: "Please verify your email" });
  }
  next();
};

export const adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });

  const role = normalizeRole(req.user.role);
  if (role !== "admin") {
    res.status(403).json({ message: "Admin access only" });
    return;
  }
  next();
};
