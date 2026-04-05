import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

type ProfileData = {
  username?: string | null;
  email?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  level?: number | null;
  xp?: number | null;
  totalXp?: number | null;
  levelGoal?: number | null;
};

type Props = {
  profile: ProfileData | null;
  isEditing: boolean;
  isSaving: boolean;
  isUploadingAvatar: boolean;
  username: string;
  bio: string;
  avatarUrl?: string;
  avatarLetter: string;
  onToggleEdit: () => void;
  onUsernameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onAvatarFileSelect: (file: File | null) => void;
  onRemoveAvatar: () => void;
  onSave: () => void;
};

export default function ProfileSection({
  profile,
  isEditing,
  isSaving,
  isUploadingAvatar,
  username,
  bio,
  avatarUrl,
  avatarLetter,
  onToggleEdit,
  onUsernameChange,
  onBioChange,
  onAvatarFileSelect,
  onRemoveAvatar,
  onSave,
}: Props) {
  const level = profile?.level ?? 1;
  const levelXp = profile?.xp ?? 0;
  const totalXp = profile?.totalXp ?? 0;
  const levelGoal = profile?.levelGoal ?? 250;
  const progressPercent =
    levelGoal > 0 ? Math.round((levelXp / levelGoal) * 100) : 0;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-heading text-[16px] font-medium text-foreground">
          Profile Information
        </h3>

        <Button
          type="button"
          variant="outline"
          className="bg-transparent"
          onClick={onToggleEdit}
        >
          <Pencil className="mr-2 h-4 w-4" />
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

      <div className="mt-5 flex items-center gap-5">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary/20 font-secondary text-[24px] font-bold text-primary sm:text-[28px]">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              avatarLetter
            )}
          </div>
          {isEditing && (
            <div className="mt-2 flex items-center justify-center gap-3 text-[11px] font-secondary">
              <label className="cursor-pointer text-primary hover:underline">
                {isUploadingAvatar ? "Uploading..." : "Change"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isSaving || isUploadingAvatar}
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    onAvatarFileSelect(file);
                    event.currentTarget.value = "";
                  }}
                />
              </label>

              {avatarUrl ? (
                <button
                  type="button"
                  onClick={onRemoveAvatar}
                  disabled={isSaving || isUploadingAvatar}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-60"
                >
                  Remove
                </button>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex-1">
          <label className="mb-2 block font-secondary text-[13px] font-medium text-muted-foreground">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            disabled={!isEditing || isSaving}
            className="w-full rounded-lg border border-border bg-card px-4 py-2 font-primary text-[14px] disabled:opacity-70"
            placeholder="Your username"
          />
        </div>
      </div>

      <div className="mt-5">
        <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-secondary uppercase tracking-[0.14em] text-muted-foreground">
                Progression
              </p>
              <h4 className="mt-1 font-heading text-xl font-semibold text-foreground">
                Level {level}
              </h4>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                {totalXp.toLocaleString()} XP
              </p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-border/70">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>
                {levelXp}/{levelGoal} XP toward Level {level + 1}
              </span>
              <span>{progressPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block font-secondary text-[13px] font-medium text-muted-foreground">
          Email Address
        </label>
        <input
          type="email"
          value={profile?.email ?? ""}
          disabled
          className="w-full rounded-lg border border-border bg-card px-4 py-2 font-primary text-[14px] disabled:opacity-70"
        />
      </div>

      <div className="mt-5">
        <label className="mb-2 block font-secondary text-[13px] font-medium text-muted-foreground">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(event) => onBioChange(event.target.value)}
          disabled={!isEditing || isSaving}
          className="w-full resize-none rounded-lg border border-border bg-card px-4 py-2 font-primary text-[14px] disabled:opacity-70"
          rows={3}
          placeholder="Tell us about yourself"
        />
      </div>

      <Button
        type="button"
        className="mt-5 bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={onSave}
        disabled={!isEditing || isSaving || isUploadingAvatar}
      >
        {isSaving ? "Saving..." : "Save Profile Changes"}
      </Button>
    </div>
  );
}
