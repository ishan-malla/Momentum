import SocialAvatar from "@/components/social/SocialAvatar";
import { Button } from "@/components/ui/button";
import type { PendingRequest } from "@/features/friends/friendsApiSlice";

type Props = {
  requests: PendingRequest[];
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
};

const SocialPendingRequestsList = ({
  requests,
  onAcceptRequest,
  onDeclineRequest,
}: Props) => {
  return (
    <div className="space-y-3 border-t border-[#e9e1d5] pt-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-secondary text-xs font-semibold uppercase tracking-[0.14em] text-[#8a826f]">
          Pending Requests
        </h3>
        <span className="text-xs text-[#8a826f]">{requests.length}</span>
      </div>

      {requests.length ? (
        <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1 [scrollbar-color:#d8d1c4_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d8d1c4] [&::-webkit-scrollbar-thumb]:border-[2px] [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-[0.95rem] border border-[#e6ded0] bg-[#fffdfa] p-3"
            >
              <div className="flex items-center gap-3">
                <SocialAvatar username={request.username} avatarUrl={request.avatarUrl} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#2f3e32]">
                    {request.username}
                  </p>
                  <p className="text-xs text-[#8a826f]">
                    Lvl {request.level} · {request.totalXp.toLocaleString()} XP
                  </p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onAcceptRequest(request.id)}
                  className="h-9 rounded-xl bg-[#6f8d6e] px-3.5 text-sm text-white hover:bg-[#5f7c5e]"
                >
                  Accept
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onDeclineRequest(request.id)}
                  className="h-9 rounded-xl border-[#ddd6c8] bg-[#fffdfa] px-3.5 text-sm text-[#7b7467] hover:bg-[#f6f1e8]"
                >
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[0.95rem] border border-dashed border-[#e8ddcc] bg-[#fffdfa] px-4 py-5 text-sm text-[#8a826f]">
          No pending requests right now.
        </div>
      )}
    </div>
  );
};

export default SocialPendingRequestsList;
