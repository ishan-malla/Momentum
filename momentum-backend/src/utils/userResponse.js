import { readProgressFromUser } from "./gamificationUtils.js";

export const toUserProgress = (user) => {
  return readProgressFromUser(user);
};

export const toClientUser = (user) => {
  const progress = toUserProgress(user);

  return {
    id: user._id,
    email: user.email,
    username: user.username,
    bio: user.bio || "",
    avatarUrl: user.avatarUrl || "",
    friendCode: user.friendCode || "",
    role: user.role,
    isVerified: user.isVerified,
    ...progress,
  };
};
