import Friendship from "../models/friendshipSchema.js";

export const buildFriendshipPairKey = (leftUserId, rightUserId) => {
  return [String(leftUserId), String(rightUserId)].sort().join(":");
};

export const getAcceptedFriendIds = async (userId) => {
  const friendships = await Friendship.find({
    status: "accepted",
    $or: [{ requester: userId }, { recipient: userId }],
  })
    .select("requester recipient")
    .lean();

  return friendships.map((friendship) => {
    const requesterId = String(friendship.requester);
    return requesterId === String(userId)
      ? String(friendship.recipient)
      : requesterId;
  });
};
