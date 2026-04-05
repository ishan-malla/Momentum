import SocialAvatar from "@/components/social/SocialAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PendingRequest } from "@/features/friends/friendsApiSlice";

type SocialActionsPanelProps = {
  currentFriendCode: string;
  friendCode: string;
  requests: PendingRequest[];
  onFriendCodeChange: (value: string) => void;
  onSendRequest: () => void;
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
};

const SocialActionsPanel = ({
  currentFriendCode,
  friendCode,
  requests,
  onFriendCodeChange,
  onSendRequest,
  onAcceptRequest,
  onDeclineRequest,
}: SocialActionsPanelProps) => {
  return (
    <Card className="w-full rounded-[1.1rem] border border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.08)]">
      <CardContent className="space-y-4 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-secondary text-xs font-semibold uppercase tracking-[0.14em] text-[#8a826f]">
            Friend Requests
          </p>
          <span className="rounded-full bg-[#eef3e8] px-2.5 py-1 text-[11px] font-semibold text-[#4b6349]">
            {requests.length} pending
          </span>
        </div>

        <div className="rounded-[0.95rem] border border-[#e6ded0] bg-[#fffdfa] px-3 py-3">
          <p className="text-[11px] font-secondary uppercase tracking-[0.14em] text-[#9c8b6d]">
            Your Friend Code
          </p>
          <p className="mt-1 font-heading text-lg font-semibold tracking-[0.08em] text-[#2f3e32]">
            {currentFriendCode || "Loading..."}
          </p>
        </div>

        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            onSendRequest();
          }}
        >
          <Input
            value={friendCode}
            onChange={(event) => onFriendCodeChange(event.target.value)}
            placeholder="Enter friend code e.g. #A3F9KL"
            className="h-11 rounded-xl border-[#ddd6c8] bg-[#fffdfa] text-sm shadow-none placeholder:text-[#9d9588] focus-visible:border-[#90a77f] focus-visible:ring-[#90a77f]/20"
          />
          <Button
            type="submit"
            className="h-10 rounded-xl bg-[#6f8d6e] px-4 text-sm text-white shadow-none hover:bg-[#5f7c5e]"
          >
            Send Request
          </Button>
        </form>

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
      </CardContent>
    </Card>
  );
};

export default SocialActionsPanel;
