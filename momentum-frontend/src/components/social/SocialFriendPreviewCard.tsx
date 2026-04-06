import SocialAvatar from "@/components/social/SocialAvatar";
import { Button } from "@/components/ui/button";
import type { FriendLookupProfile } from "@/features/friends/friendsApiSlice";

type Props = {
  profile: FriendLookupProfile;
  message: string;
  canSend: boolean;
  buttonLabel: string;
  onSendRequest: () => void;
};

const SocialFriendPreviewCard = ({
  profile,
  message,
  canSend,
  buttonLabel,
  onSendRequest,
}: Props) => {
  return (
    <div className="rounded-[1rem] border border-[#e6ded0] bg-[#fffdfa] p-4">
      <div className="flex items-start gap-3">
        <SocialAvatar
          username={profile.username}
          avatarUrl={profile.avatarUrl}
          className="h-12 w-12"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-[#2f3e32]">
            {profile.username}
          </p>
          <p className="mt-1 text-sm leading-6 text-[#6f675a]">
            {profile.bio?.trim() || "No bio added yet."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#8a826f]">
            <span className="rounded-full bg-[#f3ede4] px-2.5 py-1 font-semibold text-[#756047]">
              Lvl {profile.level}
            </span>
            <span className="rounded-full bg-[#eef3e8] px-2.5 py-1 font-semibold text-[#4b6349]">
              {profile.totalXp.toLocaleString()} XP
            </span>
            <span className="rounded-full bg-[#fff1e8] px-2.5 py-1 font-semibold text-[#d46b39]">
              {profile.streakCount} day streak
            </span>
          </div>
          <p className="mt-3 text-sm text-[#7b7467]">{message}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          onClick={onSendRequest}
          disabled={!canSend}
          className="h-10 rounded-xl bg-[#6f8d6e] px-4 text-sm text-white shadow-none hover:bg-[#5f7c5e] disabled:bg-[#d8d1c4] disabled:text-[#7b7467]"
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};

export default SocialFriendPreviewCard;
