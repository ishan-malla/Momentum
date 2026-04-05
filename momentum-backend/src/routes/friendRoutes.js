import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getFriendsOverview,
  removeFriend,
  respondToFriendRequest,
  sendFriendRequest,
} from "../controllers/friendshipController.js";

const router = express.Router();

router.use(protect);

router.get("/", getFriendsOverview);
router.post("/request", sendFriendRequest);
router.patch("/request/:friendshipId", respondToFriendRequest);
router.delete("/:friendId", removeFriend);

export default router;
