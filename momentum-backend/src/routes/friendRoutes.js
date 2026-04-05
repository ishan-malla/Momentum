import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getSocialDashboard } from "../controllers/socialController.js";
import {
  getFriendsOverview,
  lookupFriendByCode,
  removeFriend,
  respondToFriendRequest,
  sendFriendRequest,
} from "../controllers/friendshipController.js";

const router = express.Router();

router.use(protect);

router.get("/", getFriendsOverview);
router.get("/dashboard", getSocialDashboard);
router.get("/lookup/:friendCode", lookupFriendByCode);
router.post("/request", sendFriendRequest);
router.patch("/request/:friendshipId", respondToFriendRequest);
router.delete("/:friendId", removeFriend);

export default router;
