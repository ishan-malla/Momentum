import { apiSlice } from "@/api/apiSlice";
import type { FeedItem, LeaderboardEntry } from "@/data/mockSocial";

export type FriendSummary = {
  id: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
  level: number;
  totalXp: number;
  streakCount: number;
};

export type PendingRequest = {
  id: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
  level: number;
  totalXp: number;
  streakCount: number;
};

export type FriendsOverview = {
  friendCode: string;
  friends: FriendSummary[];
  pendingRequests: PendingRequest[];
};

export type SocialDashboard = {
  leaderboard: LeaderboardEntry[];
  activityFeed: FeedItem[];
};

export type FriendLookupProfile = {
  id: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
  level: number;
  totalXp: number;
  streakCount: number;
  relationStatus:
    | "available"
    | "self"
    | "friends"
    | "pending_outgoing"
    | "pending_incoming";
};

export type FriendLookupResponse = {
  profile: FriendLookupProfile;
};

type FriendMessageResponse = {
  message: string;
};

export const friendsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFriendsOverview: builder.query<FriendsOverview, void>({
      query: () => ({
        url: "/friends",
        method: "GET",
      }),
      providesTags: ["Friends"],
    }),
    getSocialDashboard: builder.query<SocialDashboard, void>({
      query: () => ({
        url: "/friends/dashboard",
        method: "GET",
      }),
      providesTags: ["Friends"],
    }),
    lookupFriendByCode: builder.query<FriendLookupResponse, string>({
      query: (friendCode) => ({
        url: `/friends/lookup/${encodeURIComponent(friendCode)}`,
        method: "GET",
      }),
    }),
    sendFriendRequest: builder.mutation<FriendMessageResponse, { friendCode: string }>({
      query: (body) => ({
        url: "/friends/request",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Friends"],
    }),
    respondToFriendRequest: builder.mutation<
      FriendMessageResponse,
      { friendshipId: string; action: "accept" | "decline" }
    >({
      query: ({ friendshipId, action }) => ({
        url: `/friends/request/${friendshipId}`,
        method: "PATCH",
        body: { action },
      }),
      invalidatesTags: ["Friends"],
    }),
    removeFriend: builder.mutation<FriendMessageResponse, { friendId: string }>({
      query: ({ friendId }) => ({
        url: `/friends/${friendId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Friends"],
    }),
  }),
});

export const {
  useGetFriendsOverviewQuery,
  useGetSocialDashboardQuery,
  useLazyLookupFriendByCodeQuery,
  useRemoveFriendMutation,
  useRespondToFriendRequestMutation,
  useSendFriendRequestMutation,
} = friendsApiSlice;
