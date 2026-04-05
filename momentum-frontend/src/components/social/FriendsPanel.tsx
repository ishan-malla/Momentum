import SocialAvatar from "@/components/social/SocialAvatar";
import type { SocialProfileSummary } from "@/components/social/socialTypes";
import { Card, CardContent } from "@/components/ui/card";
import type { FriendSummary } from "@/features/friends/friendsApiSlice";
import { Flame } from "lucide-react";

type FriendsPanelProps = {
  friends: FriendSummary[];
  onSelectFriend?: (profile: SocialProfileSummary) => void;
};

const FriendsPanel = ({ friends, onSelectFriend }: FriendsPanelProps) => {
  return (
    <Card className="w-full rounded-[1.1rem] border border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.08)]">
      <CardContent className="space-y-4 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-secondary text-xs font-semibold uppercase tracking-[0.14em] text-[#8a826f]">
            Friends
          </p>
          <span className="rounded-full bg-[#eef3e8] px-2.5 py-1 text-[11px] font-semibold text-[#4b6349]">
            {friends.length}
          </span>
        </div>

        <p className="text-sm text-[#7b7467]">
          Tap a friend to view their profile and manage the friendship.
        </p>

        <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1 [scrollbar-color:#d8d1c4_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d8d1c4] [&::-webkit-scrollbar-thumb]:border-[2px] [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent">
          {friends.map((friend) => (
            <button
              type="button"
              key={friend.id}
              onClick={() => onSelectFriend?.({ ...friend, canUnfriend: true })}
              className="flex w-full items-center gap-3 rounded-[0.95rem] border border-transparent bg-[#fffdfa] px-3 py-3 text-left transition-all hover:border-[#e6ded0] hover:bg-[#f8f3ea]"
            >
              <SocialAvatar username={friend.username} avatarUrl={friend.avatarUrl} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#2f3e32]">
                  {friend.username}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#8a826f]">
                  <span className="rounded-full bg-[#f3ede4] px-2.5 py-1 font-semibold text-[#756047]">
                    Lvl {friend.level}
                  </span>
                  <span>{friend.totalXp.toLocaleString()} XP</span>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-[#fff1e8] px-2.5 py-1 text-xs font-semibold text-[#d46b39]">
                <Flame className="h-3.5 w-3.5" />
                <span>{friend.streakCount}</span>
              </div>
              <span className="rounded-full border border-[#e6ded0] bg-[#fffdfa] px-2.5 py-1 text-[11px] font-semibold text-[#7b7467]">
                Profile
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FriendsPanel;
