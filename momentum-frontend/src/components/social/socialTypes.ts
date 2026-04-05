export type SocialProfileSummary = {
  id: string;
  username: string;
  avatarUrl?: string;
  level: number;
  totalXp: number;
  streakCount: number;
  weeklyXp?: number;
  isCurrentUser?: boolean;
  canUnfriend?: boolean;
};
