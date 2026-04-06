import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type LogoutConfirmModalProps = {
  open: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const LogoutConfirmModal = ({
  open,
  isSubmitting,
  onCancel,
  onConfirm,
}: LogoutConfirmModalProps) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onCancel, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#fffdfa]/72 p-4"
      onClick={() => !isSubmitting && onCancel()}
    >
      <Card
        className="animate-drop-in w-full max-w-sm gap-0 rounded-[1.2rem] border border-[#ddd6c8] bg-[#fffdfa] p-0 shadow-[0_18px_40px_rgba(57,52,43,0.12)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Confirm logout"
      >
        <div className="space-y-2 px-6 py-5">
          <h3 className="font-heading text-lg font-semibold text-[#2f3e32]">
            Log out?
          </h3>
          <p className="text-sm leading-6 text-[#7b7467]">
            You&apos;ll need to sign in again to get back to the admin panel.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#eee6da] px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="border-[#ddd6c8] bg-[#fffdfa] text-[#304034] hover:bg-[#f6f1e8]"
          >
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Logging out..." : "Log out"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LogoutConfirmModal;
