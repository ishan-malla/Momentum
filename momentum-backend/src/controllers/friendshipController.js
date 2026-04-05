import mongoose from "mongoose";
import Friendship from "../models/friendshipSchema.js";
import { HabitTemplate } from "../models/habitSchema.js";
import User from "../models/userSchema.js";
import { toUserProgress } from "../utils/userResponse.js";
import {
  ensureUserFriendCode,
  isValidFriendCode,
  normalizeFriendCode,
} from "../utils/friendCodeService.js";
import { buildFriendshipPairKey } from "../utils/friendshipUtils.js";

const buildStreakMap = async (userIds) => {
  if (!userIds.length) {
    return new Map();
  }

  const streaks = await HabitTemplate.aggregate([
    {
      $match: {
        user: {
          $in: userIds.map((userId) => new mongoose.Types.ObjectId(String(userId))),
        },
        isDeleted: { $ne: true },
      },
    },
    {
      $group: {
        _id: "$user",
        streakCount: { $max: "$streak" },
      },
    },
  ]);

  return new Map(
    streaks.map((item) => [String(item._id), Number(item.streakCount) || 0]),
  );
};

const toFriendSummary = (user, streakMap) => ({
  id: String(user._id),
  username: user.username,
  bio: user.bio || "",
  avatarUrl: user.avatarUrl || "",
  level: toUserProgress(user).level,
  totalXp: toUserProgress(user).totalXp,
  streakCount: streakMap.get(String(user._id)) ?? 0,
});

const toPendingRequestSummary = (friendship, streakMap) => ({
  id: String(friendship._id),
  username: friendship.requester.username,
  bio: friendship.requester.bio || "",
  avatarUrl: friendship.requester.avatarUrl || "",
  level: toUserProgress(friendship.requester).level,
  totalXp: toUserProgress(friendship.requester).totalXp,
  streakCount: streakMap.get(String(friendship.requester._id)) ?? 0,
});

const toLookupSummary = (user, streakMap, relationStatus) => ({
  id: String(user._id),
  username: user.username,
  bio: user.bio || "",
  avatarUrl: user.avatarUrl || "",
  level: toUserProgress(user).level,
  totalXp: toUserProgress(user).totalXp,
  streakCount: streakMap.get(String(user._id)) ?? 0,
  relationStatus,
});

export const getFriendsOverview = async (req, res) => {
  try {
    const userId = String(req.user._id);
    const friendCode = await ensureUserFriendCode(req.user);
    const [friendships, pendingRequests] = await Promise.all([
      Friendship.find({
        status: "accepted",
        $or: [{ requester: userId }, { recipient: userId }],
      })
        .populate("requester", "username bio avatarUrl totalXp level xp")
        .populate("recipient", "username bio avatarUrl totalXp level xp")
        .lean(),
      Friendship.find({
        status: "pending",
        recipient: userId,
      })
        .populate("requester", "username bio avatarUrl totalXp level xp")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const friendUsers = friendships
      .map((friendship) =>
        String(friendship.requester._id) === userId
          ? friendship.recipient
          : friendship.requester,
      )
      .filter(Boolean);
    const streakMap = await buildStreakMap([
      ...friendUsers.map((user) => user._id),
      ...pendingRequests.map((item) => item.requester?._id).filter(Boolean),
    ]);

    return res.status(200).json({
      friendCode,
      friends: friendUsers.map((user) => toFriendSummary(user, streakMap)),
      pendingRequests: pendingRequests.map((item) =>
        toPendingRequestSummary(item, streakMap),
      ),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load friends",
      error: error.message,
    });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const friendCode = normalizeFriendCode(req.body?.friendCode);

    if (!isValidFriendCode(friendCode)) {
      return res.status(400).json({ message: "Use a valid friend code like #A3F9KL" });
    }

    const recipient = await User.findOne({ friendCode }).select("_id username");
    if (!recipient) {
      return res.status(404).json({ message: "No user was found with that friend code" });
    }

    if (String(recipient._id) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself" });
    }

    const pairKey = buildFriendshipPairKey(req.user._id, recipient._id);
    const existingFriendship = await Friendship.findOne({ pairKey });

    if (existingFriendship?.status === "accepted") {
      return res.status(400).json({ message: "You are already friends" });
    }

    if (existingFriendship?.status === "pending") {
      if (String(existingFriendship.recipient) === String(req.user._id)) {
        existingFriendship.status = "accepted";
        await existingFriendship.save();
        return res.status(200).json({ message: "Friend request accepted" });
      }

      return res.status(400).json({ message: "Friend request already sent" });
    }

    if (existingFriendship) {
      existingFriendship.requester = req.user._id;
      existingFriendship.recipient = recipient._id;
      existingFriendship.status = "pending";
      await existingFriendship.save();
      return res.status(200).json({ message: "Friend request sent" });
    }

    await Friendship.create({
      requester: req.user._id,
      recipient: recipient._id,
      pairKey,
      status: "pending",
    });

    return res.status(201).json({ message: "Friend request sent" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to send friend request",
      error: error.message,
    });
  }
};

export const lookupFriendByCode = async (req, res) => {
  try {
    const friendCode = normalizeFriendCode(req.params.friendCode);

    if (!isValidFriendCode(friendCode)) {
      return res.status(400).json({ message: "Use a valid friend code like #A3F9KL" });
    }

    const user = await User.findOne({ friendCode }).select(
      "_id username bio avatarUrl totalXp level xp friendCode",
    );

    if (!user) {
      return res.status(404).json({ message: "No user was found with that friend code" });
    }

    const currentUserId = String(req.user._id);
    const targetUserId = String(user._id);
    let relationStatus = "available";

    if (targetUserId === currentUserId) {
      relationStatus = "self";
    } else {
      const pairKey = buildFriendshipPairKey(currentUserId, targetUserId);
      const friendship = await Friendship.findOne({ pairKey }).lean();

      if (friendship?.status === "accepted") {
        relationStatus = "friends";
      } else if (friendship?.status === "pending") {
        relationStatus =
          String(friendship.requester) === currentUserId
            ? "pending_outgoing"
            : "pending_incoming";
      }
    }

    const streakMap = await buildStreakMap([user._id]);

    return res.status(200).json({
      profile: toLookupSummary(user, streakMap, relationStatus),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to look up friend code",
      error: error.message,
    });
  }
};

export const respondToFriendRequest = async (req, res) => {
  try {
    const action = String(req.body?.action || "").trim().toLowerCase();
    const friendship = await Friendship.findOne({
      _id: req.params.friendshipId,
      recipient: req.user._id,
      status: "pending",
    });

    if (!friendship) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({ message: "Action must be accept or decline" });
    }

    friendship.status = action === "accept" ? "accepted" : "declined";
    await friendship.save();

    return res.status(200).json({
      message: action === "accept" ? "Friend request accepted" : "Friend request declined",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update friend request",
      error: error.message,
    });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const userId = String(req.user._id);
    const friendId = String(req.params.friendId || "");

    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      return res.status(400).json({ message: "Invalid friend id" });
    }

    const friendship = await Friendship.findOne({
      status: "accepted",
      $or: [
        { requester: userId, recipient: friendId },
        { requester: friendId, recipient: userId },
      ],
    });

    if (!friendship) {
      return res.status(404).json({ message: "Friendship not found" });
    }

    await friendship.deleteOne();

    return res.status(200).json({ message: "Friend removed" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to remove friend",
      error: error.message,
    });
  }
};
