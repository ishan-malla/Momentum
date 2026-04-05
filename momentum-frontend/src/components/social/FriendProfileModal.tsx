import { useEffect, useState } from "react";
import SocialAvatar from "@/components/social/SocialAvatar";
import type { SocialProfileSummary } from "@/components/social/socialTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Sparkles, Trophy, X } from "lucide-react";

type FriendProfileModalProps = {
  open: boolean;
  profile: SocialProfileSummary | null;
  onClose: () => void;
  isRemovingFriend?: boolean;
  onUnfriend?: (friendId: string) => void;
};

const FriendProfileModal = ({
  open,
  profile,
  onClose,
  isRemovingFriend = false,
  onUnfriend,
}: FriendProfileModalProps) => {
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [showUnfriendConfirm, setShowUnfriendConfirm] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isAvatarOpen) {
          setIsAvatarOpen(false);
          return;
        }

        if (showUnfriendConfirm) {
          setShowUnfriendConfirm(false);
          return;
        }

        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAvatarOpen, onClose, open, showUnfriendConfirm]);

  useEffect(() => {
    if (!open) {
      setIsAvatarOpen(false);
      setShowUnfriendConfirm(false);
    }
  }, [open]);

  if (!open || !profile) return null;

  const statCards = [
    {
      label: "Level",
      value: `Lvl ${profile.level}`,
      tone: "bg-[#eef3e8] text-[#4b6349]",
      icon: Sparkles,
    },
    {
      label: "Total XP",
      value: profile.totalXp.toLocaleString(),
      tone: "bg-[#f7edd2] text-[#946d0a]",
      icon: Trophy,
    },
    {
      label: "Live Streak",
      value: `${profile.streakCount} days`,
      tone: "bg-[#fff1e8] text-[#d46b39]",
      icon: Flame,
    },
    {
      label: "Weekly XP",
      value:
        typeof profile.weeklyXp === "number"
          ? `${profile.weeklyXp} XP`
          : "Not available",
      tone: "bg-[#f3ede4] text-[#756047]",
      icon: Sparkles,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-lg overflow-hidden rounded-[1.35rem] border border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_24px_60px_rgba(57,52,43,0.18)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${profile.username} profile`}
      >
        <div className="border-b border-[#e7dfd2] bg-[#fffdfa] px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsAvatarOpen(true)}
                className="rounded-full transition-transform hover:scale-[1.03]"
                aria-label={`View ${profile.username} profile picture`}
              >
                <SocialAvatar
                  username={profile.username}
                  avatarUrl={profile.avatarUrl}
                  className="h-16 w-16 border border-[#ebe3d7] shadow-[0_8px_24px_rgba(57,52,43,0.08)]"
                  textClassName="text-base"
                />
              </button>
              <div>
                <p className="font-secondary text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a826f]">
                  {profile.isCurrentUser ? "Your Profile" : "Friend Profile"}
                </p>
                <h3 className="mt-1 font-heading text-[1.75rem] font-semibold leading-none text-[#2f3e32]">
                  {profile.username}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-[#6f675a]">
                  A quick snapshot of momentum, streaks, and progress right now.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {profile.canUnfriend ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUnfriendConfirm((current) => !current)}
                  className="h-9 rounded-xl border-[#e4cabc] bg-[#fffdfa] px-3.5 text-sm text-[#9b6247] hover:bg-[#fff1ea]"
                >
                  Unfriend
                </Button>
              ) : null}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9 rounded-full text-[#7b7467] hover:bg-white/70 hover:text-[#2f3e32]"
                aria-label="Close profile"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="space-y-5 px-5 py-5">
          {profile.canUnfriend && showUnfriendConfirm ? (
            <div className="rounded-[1rem] border border-[#ead7cd] bg-[#fff8f4] px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-secondary uppercase tracking-[0.14em] text-[#a56f55]">
                    Confirm Unfriend
                  </p>
                  <p className="mt-1 text-sm text-[#6f675a]">
                    Remove {profile.username} from your friends list?
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUnfriendConfirm(false)}
                    className="h-9 rounded-xl border-[#ddd6c8] bg-[#fffdfa] px-3.5 text-sm text-[#7b7467] hover:bg-[#f6f1e8]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onUnfriend?.(profile.id)}
                    disabled={isRemovingFriend}
                    className="h-9 rounded-xl bg-[#b96d4c] px-3.5 text-sm text-white hover:bg-[#a45d3e]"
                  >
                    {isRemovingFriend ? "Removing..." : "Confirm"}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            {statCards.map(({ label, value, tone, icon: Icon }) => (
              <div
                key={label}
                className="rounded-[1rem] border border-[#e6ded0] bg-[#fffdfa] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-secondary uppercase tracking-[0.14em] text-[#9c8b6d]">
                      {label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#2f3e32]">{value}</p>
                  </div>
                  <span className={`rounded-full p-2 ${tone}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[1rem] border border-[#e6ded0] bg-[#f9f4eb] px-4 py-4">
            <p className="text-[11px] font-secondary uppercase tracking-[0.14em] text-[#9c8b6d]">
              Momentum Note
            </p>
            <p className="mt-2 text-sm leading-6 text-[#615a4f]">
              {profile.username} is currently at level {profile.level} with a{" "}
              {profile.streakCount}-day streak
              {typeof profile.weeklyXp === "number"
                ? ` and ${profile.weeklyXp} XP earned this week.`
                : "."}
            </p>
          </div>
        </CardContent>
      </Card>

      {isAvatarOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
          onClick={() => setIsAvatarOpen(false)}
        >
          <div
            className="flex flex-col items-center gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="rounded-full border border-white/60 bg-[#fffdfa] p-2 shadow-[0_24px_60px_rgba(30,27,23,0.22)]">
              <SocialAvatar
                username={profile.username}
                avatarUrl={profile.avatarUrl}
                className="h-40 w-40 sm:h-48 sm:w-48"
                textClassName="text-[2.15rem]"
              />
            </div>
            <p className="text-sm font-medium text-white/90">{profile.username}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FriendProfileModal;
