import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

const accessSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
  return process.env.JWT_SECRET;
};

const refreshSecret = () => {
  return process.env.JWT_REFRESH_SECRET || accessSecret();
};

export const signAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, accessSecret(), {
    expiresIn: ACCESS_EXPIRES_IN,
  });
};

export const signRefreshToken = (user) => {
  return jwt.sign({ id: user._id, type: "refresh" }, refreshSecret(), {
    expiresIn: REFRESH_EXPIRES_IN,
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, refreshSecret());
};

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const setRefreshTokenCookie = (res, refreshToken) => {
  const isProd = process.env.NODE_ENV === "production";
  const maxAgeMs = 30 * 24 * 60 * 60 * 1000;

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: maxAgeMs,
  });

  return maxAgeMs;
};

export const clearRefreshTokenCookie = (res) => {
  res.clearCookie("refreshToken", {
    path: "/api/auth",
  });
};
