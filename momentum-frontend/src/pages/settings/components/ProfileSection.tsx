import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

type ProfileData = {
  username?: string | null;
  email?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
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
