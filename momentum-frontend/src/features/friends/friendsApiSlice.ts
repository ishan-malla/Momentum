import { apiSlice } from "@/api/apiSlice";

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

export type FriendsOverview = {
  friendCode: string;
  friends: FriendSummary[];
  pendingRequests: PendingRequest[];
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
  useRemoveFriendMutation,
  useRespondToFriendRequestMutation,
  useSendFriendRequestMutation,
} = friendsApiSlice;
