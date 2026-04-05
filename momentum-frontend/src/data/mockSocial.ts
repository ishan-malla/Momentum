export type SocialMetric = "xp" | "level" | "streak";

export type FriendSummary = {
  id: string;
  username: string;
  avatarUrl?: string;
  level: number;
  totalXp: number;
  streakCount: number;
};

export type PendingRequest = {
  id: string;
  username: string;
  avatarUrl?: string;
  level: number;
  totalXp: number;
  streakCount: number;
};

export type LeaderboardEntry = {
  id: string;
  username: string;
  avatarUrl?: string;
  weeklyXp: number;
  level: number;
  totalXp: number;
  streakCount: number;
  isCurrentUser?: boolean;
  history: {
    xp: number[];
    level: number[];
    streak: number[];
  };
};

export type FeedItem = {
  id: string;
  username: string;
  avatarUrl?: string;
  actionType: "habit" | "achievement" | "level" | "streak";
  actionText: string;
  timeAgo: string;
};

export const mockFriends: FriendSummary[] = [
  { id: "friend-1", username: "Nina", level: 8, totalXp: 13420, streakCount: 12 },
  { id: "friend-2", username: "Jordan", level: 7, totalXp: 11980, streakCount: 9 },
  { id: "friend-3", username: "Priya", level: 6, totalXp: 10450, streakCount: 6 },
  { id: "friend-4", username: "Elias", level: 5, totalXp: 8870, streakCount: 4 },
];

export const mockPendingRequests: PendingRequest[] = [
  { id: "request-1", username: "Maya", level: 6, totalXp: 9240, streakCount: 7 },
  { id: "request-2", username: "Theo", level: 4, totalXp: 6710, streakCount: 11 },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: "friend-1",
    username: "Nina",
    weeklyXp: 640,
    level: 8,
    totalXp: 13420,
    streakCount: 12,
    history: {
      xp: [410, 460, 520, 560, 600, 620, 640],
      level: [7, 7, 7, 7, 8, 8, 8],
      streak: [6, 7, 8, 9, 10, 11, 12],
    },
  },
  {
    id: "current-user",
    username: "You",
    weeklyXp: 580,
    level: 7,
    totalXp: 12110,
    streakCount: 10,
    isCurrentUser: true,
    history: {
      xp: [340, 390, 430, 470, 520, 550, 580],
      level: [6, 6, 6, 7, 7, 7, 7],
      streak: [4, 5, 6, 7, 8, 9, 10],
    },
  },
  {
    id: "friend-2",
    username: "Jordan",
    weeklyXp: 520,
    level: 7,
    totalXp: 11980,
    streakCount: 9,
    history: {
      xp: [300, 340, 380, 430, 470, 495, 520],
      level: [6, 6, 6, 6, 7, 7, 7],
      streak: [3, 4, 5, 6, 7, 8, 9],
    },
  },
  {
    id: "friend-3",
    username: "Priya",
    weeklyXp: 470,
    level: 6,
    totalXp: 10450,
    streakCount: 6,
    history: {
      xp: [280, 310, 345, 380, 415, 445, 470],
      level: [5, 5, 5, 6, 6, 6, 6],
      streak: [2, 3, 4, 4, 5, 5, 6],
    },
  },
  {
    id: "friend-4",
    username: "Elias",
    weeklyXp: 430,
    level: 5,
    totalXp: 8870,
    streakCount: 4,
    history: {
      xp: [230, 270, 300, 335, 365, 400, 430],
      level: [4, 4, 4, 5, 5, 5, 5],
      streak: [1, 2, 2, 3, 3, 4, 4],
    },
  },
];

export const mockFeedItems: FeedItem[] = [
  {
    id: "feed-1",
    username: "Nina",
    actionType: "habit",
    actionText: "completed Morning Stretch before breakfast.",
    timeAgo: "12m ago",
  },
  {
    id: "feed-2",
    username: "Jordan",
    actionType: "achievement",
    actionText: "earned the Consistency Star achievement.",
    timeAgo: "34m ago",
  },
  {
    id: "feed-3",
    username: "Priya",
    actionType: "level",
    actionText: "leveled up to Level 7 after a productive day.",
    timeAgo: "1h ago",
  },
  {
    id: "feed-4",
    username: "Elias",
    actionType: "streak",
    actionText: "hit a 10-day streak milestone and kept it rolling.",
    timeAgo: "2h ago",
  },
  {
    id: "feed-5",
    username: "Maya",
    actionType: "habit",
    actionText: "completed Deep Work and wrapped up two tasks.",
    timeAgo: "3h ago",
  },
];
