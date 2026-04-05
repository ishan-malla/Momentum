import SocialAvatar from "@/components/social/SocialAvatar";
import { Card, CardContent } from "@/components/ui/card";
import type { FeedItem } from "@/data/mockSocial";
import { Award, CheckCircle2, Flame, PartyPopper } from "lucide-react";

type ActivityFeedCardProps = {
  items: FeedItem[];
};

const iconMap = {
  habit: {
    icon: CheckCircle2,
    className: "bg-[#e6efe0] text-[#587055]",
  },
  achievement: {
    icon: Award,
    className: "bg-[#fdf0df] text-[#b17834]",
  },
  level: {
    icon: PartyPopper,
    className: "bg-[#ffe8df] text-[#d46b39]",
  },
  streak: {
    icon: Flame,
    className: "bg-[#fff0e7] text-[#d46b39]",
  },
} satisfies Record<FeedItem["actionType"], { icon: typeof CheckCircle2; className: string }>;

const ActivityFeedCard = ({ items }: ActivityFeedCardProps) => {
  return (
    <Card className="h-full max-h-[32rem] rounded-[1.1rem] border border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
      <CardContent className="flex h-full max-h-[32rem] flex-col gap-4 px-4 py-5 sm:px-5">
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-semibold text-[#2f3e32]">
            Recent Activity
          </h2>
          <p className="text-sm text-[#7b7467]">
            Bite-sized updates from the people you follow.
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 [scrollbar-color:rgba(210,202,190,0.55)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-[999px] [&::-webkit-scrollbar-thumb]:bg-[rgba(210,202,190,0.55)] [&::-webkit-scrollbar-thumb]:border-[1px] [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:my-3 [&::-webkit-scrollbar-track]:bg-transparent">
          {items.map((item) => {
            const { icon: Icon, className } = iconMap[item.actionType];

            return (
              <div
                key={item.id}
                className="flex gap-3 rounded-[0.95rem] border border-transparent bg-[#fffdfa] px-3 py-3"
              >
                <SocialAvatar
                  username={item.username}
                  avatarUrl={item.avatarUrl}
                  className="mt-0.5 h-10 w-10"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[#2f3e32]">
                      {item.username}
                    </span>
                    <span className={`rounded-full p-1 ${className}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-xs text-[#8a826f]">{item.timeAgo}</span>
                  </div>

                  <p className="mt-1 text-sm leading-6 text-[#615a4f]">
                    {item.actionText}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeedCard;
