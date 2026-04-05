import { useState } from "react";
import FriendsPanel from "@/components/social/FriendsPanel";
import type { SocialProfileSummary } from "@/components/social/socialTypes";
import SocialActionsPanel from "@/components/social/SocialActionsPanel";
import { Button } from "@/components/ui/button";
import type {
  FriendSummary,
  PendingRequest,
} from "@/features/friends/friendsApiSlice";
import { UserRoundPlus, Users } from "lucide-react";

type SocialHeaderActionsProps = {
  currentFriendCode: string;
  friendCode: string;
  friends: FriendSummary[];
  pendingRequests: PendingRequest[];
  onFriendCodeChange: (value: string) => void;
  onSendRequest: () => void;
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  onSelectFriend: (profile: SocialProfileSummary) => void;
};

const SocialHeaderActions = ({
  currentFriendCode,
  friendCode,
  friends,
  pendingRequests,
  onFriendCodeChange,
  onSendRequest,
  onAcceptRequest,
  onDeclineRequest,
  onSelectFriend,
}: SocialHeaderActionsProps) => {
  const [activeOverlay, setActiveOverlay] = useState<"actions" | "friends" | null>(
    null,
  );

  const toggleOverlay = (target: "actions" | "friends") => {
    setActiveOverlay((current) => (current === target ? null : target));
  };

  return (
    <div className="relative flex shrink-0 items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => toggleOverlay("actions")}
        className={[
          "relative h-10 rounded-full border-[#ddd6c8] px-3.5 text-sm shadow-none",
          activeOverlay === "actions"
            ? "border-[#d6cec0] bg-[#f3ede4] text-[#2f3e32] hover:bg-[#ece4d8]"
            : "bg-[#fffdfa] text-[#304034] hover:bg-[#f6f1e8]",
        ].join(" ")}
        aria-expanded={activeOverlay === "actions"}
        aria-label={activeOverlay === "actions" ? "Close friend requests" : "Open friend requests"}
      >
        <UserRoundPlus className="h-4 w-4" />
        <span>Requests</span>
        {pendingRequests.length ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[#d46b39] px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {pendingRequests.length}
          </span>
        ) : null}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => toggleOverlay("friends")}
        className={[
          "h-10 rounded-full border-[#ddd6c8] px-3.5 text-sm shadow-none",
          activeOverlay === "friends"
            ? "border-[#d6cec0] bg-[#f3ede4] text-[#2f3e32] hover:bg-[#ece4d8]"
            : "bg-[#fffdfa] text-[#304034] hover:bg-[#f6f1e8]",
        ].join(" ")}
        aria-expanded={activeOverlay === "friends"}
        aria-label={activeOverlay === "friends" ? "Close friends view" : "Open friends view"}
      >
        <Users className="h-4 w-4" />
        <span>View Friends</span>
      </Button>

      {activeOverlay ? (
        <div className="absolute right-0 top-12 z-30 w-[min(90vw,360px)]">
          {activeOverlay === "actions" ? (
            <SocialActionsPanel
              currentFriendCode={currentFriendCode}
              friendCode={friendCode}
              requests={pendingRequests}
              onFriendCodeChange={onFriendCodeChange}
              onSendRequest={onSendRequest}
              onAcceptRequest={onAcceptRequest}
              onDeclineRequest={onDeclineRequest}
            />
          ) : (
            <FriendsPanel
              friends={friends}
              onSelectFriend={(profile) => {
                setActiveOverlay(null);
                onSelectFriend(profile);
              }}
            />
          )}
        </div>
      ) : null}
    </div>
  );
};

export default SocialHeaderActions;
