import User from "../models/userSchema.js";

const FRIEND_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const FRIEND_CODE_PATTERN = /^#[A-Z0-9]{6}$/;

const createRandomFriendCode = () => {
  let code = "#";

  for (let index = 0; index < 6; index += 1) {
    const nextIndex = Math.floor(Math.random() * FRIEND_CODE_CHARS.length);
    code += FRIEND_CODE_CHARS[nextIndex];
  }

  return code;
};

export const normalizeFriendCode = (value = "") => {
  return String(value).trim().toUpperCase();
};

export const isValidFriendCode = (value = "") => {
  return FRIEND_CODE_PATTERN.test(normalizeFriendCode(value));
};

export const generateUniqueFriendCode = async () => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const friendCode = createRandomFriendCode();
    const exists = await User.exists({ friendCode });

    if (!exists) {
      return friendCode;
    }
  }

  throw new Error("Failed to generate a unique friend code");
};

export const ensureUserFriendCode = async (user) => {
  if (user.friendCode) {
    return user.friendCode;
  }

  user.friendCode = await generateUniqueFriendCode();
  await user.save({ validateBeforeSave: false });
  return user.friendCode;
};
