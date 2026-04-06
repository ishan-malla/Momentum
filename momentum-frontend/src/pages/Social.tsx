import { useState } from "react";
import ActivityFeedCard from "@/components/social/ActivityFeedCard";
import FriendProfileModal from "@/components/social/FriendProfileModal";
import FriendsComparisonChart from "@/components/social/FriendsComparisonChart";
import LeaderboardCard from "@/components/social/LeaderboardCard";
import type { SocialProfileSummary } from "@/components/social/socialTypes";
import SocialHeaderActions from "@/components/social/SocialHeaderActions";
import {
  useGetFriendsOverviewQuery,
  useGetSocialDashboardQuery,
  useRemoveFriendMutation,
  useRespondToFriendRequestMutation,
  useSendFriendRequestMutation,
} from "@/features/friends/friendsApiSlice";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { type SocialMetric } from "@/data/mockSocial";
import { formatDisplayName } from "@/utils/greeting";
import { useSelector } from "react-redux";
import { toast } from "sonner";

const Social = () => {
  const user = useSelector(selectCurrentUser);
  const [friendCode, setFriendCode] = useState("");
  const [selectedMetric, setSelectedMetric] = useState<SocialMetric>("xp");
  const [selectedProfile, setSelectedProfile] = useState<SocialProfileSummary | null>(null);
  const { data, refetch } = useGetFriendsOverviewQuery();
  const { data: socialData } = useGetSocialDashboardQuery();
  const [sendFriendRequest] = useSendFriendRequestMutation();
  const [removeFriend, { isLoading: isRemovingFriend }] = useRemoveFriendMutation();
  const [respondToFriendRequest] = useRespondToFriendRequestMutation();
  const friends = data?.friends ?? [];
  const pendingRequests = data?.pendingRequests ?? [];
  const currentFriendCode = data?.friendCode ?? user?.friendCode ?? "";
  const currentUsername = formatDisplayName(user?.username, "You");
  const leaderboardEntries = (socialData?.leaderboard ?? []).map((entry) =>
    entry.isCurrentUser
      ? {
          ...entry,
          username: currentUsername,
          bio: user?.bio || entry.bio,
          avatarUrl: user?.avatarUrl || entry.avatarUrl,
          canUnfriend: false,
        }
      : { ...entry, canUnfriend: true },
  );
  const activityFeedItems = (socialData?.activityFeed ?? []).map((item) =>
    item.username === user?.username
      ? {
          ...item,
          username: currentUsername,
          avatarUrl: user?.avatarUrl || item.avatarUrl,
        }
      : item,
  );

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (
      typeof error === "object" &&
      error !== null &&
      "data" in error &&
      typeof error.data === "object" &&
      error.data !== null &&
      "message" in error.data &&
      typeof error.data.message === "string"
    ) {
      return error.data.message;
    }

    return fallback;
  };

  const handleFriendCodeChange = (value: string) => {
    setFriendCode(value.toUpperCase().replace(/\s+/g, ""));
  };

  const handleSendRequest = async () => {
    try {
      const response = await sendFriendRequest({ friendCode }).unwrap();
      setFriendCode("");
      toast.success(response.message);
      refetch();
    } catch (error) {
      toast.error("Couldn't send friend request", {
        description: getErrorMessage(error, "Please try again."),
      });
    }
  };

  const handleRespondToRequest = async (
    friendshipId: string,
    action: "accept" | "decline",
  ) => {
    try {
      const response = await respondToFriendRequest({ friendshipId, action }).unwrap();
      toast.success(response.message);
      refetch();
    } catch (error) {
      toast.error("Couldn't update request", {
        description: getErrorMessage(error, "Please try again."),
      });
    }
  };

  const handleUnfriend = async (friendId: string) => {
    try {
      const response = await removeFriend({ friendId }).unwrap();
      toast.success(response.message);
      setSelectedProfile(null);
      refetch();
    } catch (error) {
      toast.error("Couldn't remove friend", {
        description: getErrorMessage(error, "Please try again."),
      });
    }
  };

  return (
    <div className="animate-fade-in mx-auto mt-6 w-full space-y-6 px-4 sm:px-5 xl:max-w-7xl xl:px-0">
      <section className="animate-drop-in space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <p className="font-secondary text-sm font-semibold uppercase tracking-[0.16em] text-[#8a826f]">
              Social
            </p>
            <h1 className="font-heading text-[2.15rem] font-semibold tracking-[-0.03em] text-[#2f3e32]">
              Stay motivated with friends
            </h1>
            <p className="max-w-3xl text-sm text-[#7b7467] sm:text-base">
              Keep up with friends, shared momentum, and a little friendly competition.
            </p>
          </div>

          <SocialHeaderActions
            currentFriendCode={currentFriendCode}
            friendCode={friendCode}
            friends={friends}
            pendingRequests={pendingRequests}
            onFriendCodeChange={handleFriendCodeChange}
            onSendRequest={handleSendRequest}
            onAcceptRequest={(requestId) => handleRespondToRequest(requestId, "accept")}
            onDeclineRequest={(requestId) => handleRespondToRequest(requestId, "decline")}
            onSelectFriend={setSelectedProfile}
          />
        </div>
      </section>

      <section className="space-y-5">
        <div className="animate-drop-in animate-delay-75 grid gap-5 xl:grid-cols-[minmax(0,0.7fr)_minmax(0,0.3fr)]">
          <LeaderboardCard
            entries={leaderboardEntries}
            metric={selectedMetric}
            onMetricChange={setSelectedMetric}
            onSelectFriend={setSelectedProfile}
          />
          <ActivityFeedCard items={activityFeedItems} />
        </div>

        <div className="animate-drop-in animate-delay-150">
          <FriendsComparisonChart
            entries={leaderboardEntries}
            metric={selectedMetric}
            maxFriends={4}
          />
        </div>
      </section>

      <FriendProfileModal
        open={Boolean(selectedProfile)}
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onUnfriend={handleUnfriend}
        isRemovingFriend={isRemovingFriend}
      />
    </div>
  );
};

export default Social;
