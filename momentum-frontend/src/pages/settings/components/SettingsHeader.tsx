import { Button } from "@/components/ui/button";

type Props = {
  isRefreshingProfile: boolean;
  hasLoadError: boolean;
  onRetry: () => void;
};

export default function SettingsHeader({
  isRefreshingProfile,
  hasLoadError,
  onRetry,
}: Props) {
  return (
    <div>
      <h2 className="font-heading text-[20px] font-semibold text-foreground sm:text-[24px] lg:text-[28px]">
        Settings & Profile
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Update your profile and manage your account.
      </p>

      {isRefreshingProfile && (
        <p className="mt-2 text-xs text-muted-foreground">Refreshing profile...</p>
      )}

      {hasLoadError && (
        <div className="mt-2 flex items-center gap-2">
          <p className="text-xs text-destructive">Could not load latest profile data.</p>
          <Button type="button" size="sm" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
