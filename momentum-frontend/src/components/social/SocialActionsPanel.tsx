import { useState } from "react";
import SocialFriendPreviewCard from "@/components/social/SocialFriendPreviewCard";
import SocialPendingRequestsList from "@/components/social/SocialPendingRequestsList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type FriendLookupProfile, useLazyLookupFriendByCodeQuery, type PendingRequest } from "@/features/friends/friendsApiSlice";
import { Copy } from "lucide-react";
import { toast } from "sonner";

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
  const [lookupMessage, setLookupMessage] = useState("");
  const [previewProfile, setPreviewProfile] = useState<FriendLookupProfile | null>(null);
  const [lookupFriendByCode, { isFetching: isLookingUp }] = useLazyLookupFriendByCodeQuery();

  const handlePreview = async () => {
    if (!friendCode.trim()) {
      setLookupMessage("Enter a friend code first.");
      return;
    }

    try {
      const response = await lookupFriendByCode(friendCode).unwrap();
      setPreviewProfile(response.profile);
      setLookupMessage("");
    } catch (error) {
      setPreviewProfile(null);
      if (
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data &&
        typeof error.data.message === "string"
      ) {
        setLookupMessage(error.data.message);
        return;
      }

      setLookupMessage("Couldn't load that profile right now.");
    }
  };

  const handleCopyFriendCode = async () => {
    if (!currentFriendCode) {
      toast.error("Friend code is still loading.");
      return;
    }

    try {
      await navigator.clipboard.writeText(currentFriendCode);
      toast.success("Friend code copied");
    } catch {
      toast.error("Couldn't copy friend code");
    }
  };

  const relationMeta =
    previewProfile?.relationStatus === "self"
      ? {
          message: "This is your own friend code.",
          canSend: false,
          buttonLabel: "Send Request",
        }
      : previewProfile?.relationStatus === "friends"
        ? {
            message: "You're already friends.",
            canSend: false,
            buttonLabel: "Send Request",
          }
        : previewProfile?.relationStatus === "pending_outgoing"
          ? {
              message: "Friend request already sent.",
              canSend: false,
              buttonLabel: "Send Request",
            }
          : previewProfile?.relationStatus === "pending_incoming"
            ? {
                message:
                  "This person already sent you a request. Sending now will accept it.",
                canSend: true,
                buttonLabel: "Accept Request",
              }
            : {
                message: "You can send a friend request from here.",
                canSend: true,
                buttonLabel: "Send Request",
              };

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
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-secondary uppercase tracking-[0.14em] text-[#9c8b6d]">
                Your Friend Code
              </p>
              <p className="mt-1 font-heading text-lg font-semibold tracking-[0.08em] text-[#2f3e32]">
                {currentFriendCode || "Loading..."}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopyFriendCode}
              className="h-6 w-6 rounded-full border-[#ddd6c8] bg-[#fffdfa] text-[#7b7467] shadow-none hover:bg-[#f6f1e8] hover:text-[#2f3e32]"
              aria-label="Copy friend code"
            >
              <Copy className="h-2 w-2" />
            </Button>
          </div>
        </div>

        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            handlePreview();
          }}
        >
          <Input
            value={friendCode}
            onChange={(event) => {
              onFriendCodeChange(event.target.value);
              setLookupMessage("");
              setPreviewProfile(null);
            }}
            placeholder="Enter friend code e.g. #A3F9KL"
            className="h-11 rounded-xl border-[#ddd6c8] bg-[#fffdfa] text-sm shadow-none placeholder:text-[#9d9588] focus-visible:border-[#90a77f] focus-visible:ring-[#90a77f]/20"
          />
          <Button
            type="submit"
            className="h-10 rounded-xl bg-[#6f8d6e] px-4 text-sm text-white shadow-none hover:bg-[#5f7c5e]"
          >
            {isLookingUp ? "Checking..." : "Preview"}
          </Button>
        </form>

        {lookupMessage ? (
          <div className="rounded-[0.95rem] border border-dashed border-[#e8ddcc] bg-[#fffdfa] px-4 py-3 text-sm text-[#8a826f]">
            {lookupMessage}
          </div>
        ) : null}

        {previewProfile ? (
          <SocialFriendPreviewCard
            profile={previewProfile}
            message={relationMeta.message}
            canSend={relationMeta.canSend}
            buttonLabel={relationMeta.buttonLabel}
            onSendRequest={onSendRequest}
          />
        ) : null}

        <SocialPendingRequestsList
          requests={requests}
          onAcceptRequest={onAcceptRequest}
          onDeclineRequest={onDeclineRequest}
        />
      </CardContent>
    </Card>
  );
};

export default SocialActionsPanel;
