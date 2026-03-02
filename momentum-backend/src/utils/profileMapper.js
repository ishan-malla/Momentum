export const toProfile = (user) => ({
  id: user._id,
  email: user.email,
  username: user.username,
  bio: user.bio || "",
  avatarUrl: user.avatarUrl || "",
  role: user.role,
  isVerified: user.isVerified,
});
