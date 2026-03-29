import {
  useGetProfileQuery,
  useLogoutMutation,
  useUpdateProfileMutation,
} from "@/features/auth/authApiSlice";
import { selectCurrentUser } from "@/features/auth/authSlice";
import {
  useRemoveAvatarMutation,
  useUploadAvatarMutation,
} from "@/features/profile/profileApiSlice";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import AccountSection from "@/pages/settings/components/AccountSection";
import ProfileSection from "@/pages/settings/components/ProfileSection";
import SettingsHeader from "@/pages/settings/components/SettingsHeader";
import {
  BIO_MAX_LENGTH,
  MAX_AVATAR_SIZE_BYTES,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  getApiErrorMessage,
  toImageDataUrl,
} from "@/pages/settings/settingsFormUtils";

const Settings = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [updateProfile, { isLoading: isSavingProfile }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();
  const [removeAvatar, { isLoading: isRemovingAvatar }] = useRemoveAvatarMutation();
  const {
    data: profileData,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    isError: isProfileError,
    refetch,
  } = useGetProfileQuery(undefined, { skip: !user });
  // Prefer auth store user so profile edits reflect instantly after save.
  const profile = user ?? profileData?.profile;
  const [isEditing, setIsEditing] = useState(false);
  const [draftUsername, setDraftUsername] = useState("");
  const [draftBio, setDraftBio] = useState("");
  const [isReadingAvatarFile, setIsReadingAvatarFile] = useState(false);
  const isAvatarBusy = isReadingAvatarFile || isUploadingAvatar || isRemovingAvatar;
  const displayedUsername = isEditing ? draftUsername : profile?.username ?? "";
  const displayedBio = isEditing ? draftBio : profile?.bio ?? "";
  const displayedAvatarUrl = profile?.avatarUrl ?? "";
  const avatarLetter = useMemo(() => {
    const firstCharacter = displayedUsername.trim().charAt(0);
    return firstCharacter ? firstCharacter.toUpperCase() : "?";
  }, [displayedUsername]);
  const toggleEditing = () => {
    if (profile) {
      setDraftUsername(profile.username ?? "");
      setDraftBio(profile.bio ?? "");
    }
    setIsEditing((previous) => !previous);
  };
  const onAvatarFileSelect = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Avatar upload failed", {
        description: "Please choose an image file.",
      });
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error("Avatar upload failed", {
        description: "Image must be 5MB or smaller.",
      });
      return;
    }
    setIsReadingAvatarFile(true);
    try {
      const imageDataUrl = await toImageDataUrl(file);
      const response = await uploadAvatar({ imageDataUrl }).unwrap();
      toast.success("Avatar uploaded");
      void refetch();
      if (isEditing) {
        setDraftUsername(response.profile.username ?? "");
        setDraftBio(response.profile.bio ?? "");
      }
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not upload avatar image.");
      toast.error("Avatar upload failed", { description: message });
    } finally {
      setIsReadingAvatarFile(false);
    }
  };
  const onRemoveAvatar = async () => {
    try {
      await removeAvatar().unwrap();
      toast.success("Avatar removed");
      void refetch();
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not remove avatar image.");
      toast.error("Avatar remove failed", { description: message });
    }
  };
  const onSave = async () => {
    const nextUsername = draftUsername.trim();
    const nextBio = draftBio.trim();
    if (
      nextUsername.length < USERNAME_MIN_LENGTH ||
      nextUsername.length > USERNAME_MAX_LENGTH
    ) {
      toast.error("Invalid username", {
        description: `Username must be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters.`,
      });
      return;
    }
    if (nextBio.length > BIO_MAX_LENGTH) {
      toast.error("Invalid bio", {
        description: `Bio must be ${BIO_MAX_LENGTH} characters or fewer.`,
      });
      return;
    }
    try {
      const response = await updateProfile({
        username: nextUsername,
        bio: nextBio,
      }).unwrap();
      setDraftUsername(response.profile.username ?? "");
      setDraftBio(response.profile.bio ?? "");
      setIsEditing(false);
      void refetch();
      toast.success("Profile updated");
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Could not update profile. Please try again.",
      );
      toast.error("Update failed", { description: message });
    }
  };
  const onLogout = async () => {
    try {
      await logout().unwrap();
      toast.success("Logged out");
      navigate("/auth/login", { replace: true });
    } catch {
      toast.error("Logout failed", { description: "Please try again." });
    }
  };
  if (!profile && isProfileLoading) {
    return (
      <div className="mx-auto mt-6 max-w-3xl px-4 md:px-0">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    );
  }
  return (
    <div className="mx-auto mt-6 w-full px-4 sm:px-5 xl:max-w-7xl xl:px-0">
      <div className="animate-fade-in space-y-6 sm:space-y-8">
        <SettingsHeader
          isRefreshingProfile={isProfileFetching}
          hasLoadError={isProfileError}
          onRetry={refetch}
        />
        <ProfileSection
          profile={profile ?? null}
          isEditing={isEditing}
          isSaving={isSavingProfile}
          isUploadingAvatar={isAvatarBusy}
          username={displayedUsername}
          bio={displayedBio}
          avatarUrl={displayedAvatarUrl}
          avatarLetter={avatarLetter}
          onToggleEdit={toggleEditing}
          onUsernameChange={setDraftUsername}
          onBioChange={setDraftBio}
          onAvatarFileSelect={onAvatarFileSelect}
          onRemoveAvatar={onRemoveAvatar}
          onSave={onSave}
        />
        <AccountSection isLoggingOut={isLoggingOut} onLogout={onLogout} />
      </div>
    </div>
  );
};

export default Settings;
