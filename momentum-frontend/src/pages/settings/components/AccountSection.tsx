import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

type Props = {
  isLoggingOut: boolean;
  onLogout: () => void;
};

export default function AccountSection({ isLoggingOut, onLogout }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-4 font-heading text-[15px] font-medium text-foreground sm:text-[16px]">
        Account
      </h3>
      <Button
        type="button"
        variant="destructive"
        className="w-full justify-center"
        onClick={onLogout}
        disabled={isLoggingOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        {isLoggingOut ? "Logging out..." : "Logout"}
      </Button>
    </div>
  );
}
