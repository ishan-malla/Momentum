import { Button } from "@/components/ui/button";
import { selectCurrentUser } from "@/features/auth/authSlice";
import {
  useGetProfileQuery,
  useLogoutMutation,
  useUpdateProfileMutation,
} from "@/features/auth/authApiSlice";
import { LogOut, Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [updateProfile, { isLoading: isSavingProfile }] = useUpdateProfileMutation();
  const {
    data: profileData,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    isError: isProfileError,
    refetch,
  } = useGetProfileQuery(undefined, { skip: !user });

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const profile = profileData?.profile ?? user;

  useEffect(() => {
    if (!profile) return;
    setUsername(profile.username ?? "");
    setBio(profile.bio ?? "");
  }, [profile?.username, profile?.bio]);

  const avatarLetter = useMemo(() => {
    const c = (username || profile?.username || "").trim().charAt(0);
    return c ? c.toUpperCase() : "?";
  }, [profile?.username, username]);

  const onSave = async () => {
    const nextUsername = username.trim();
    const nextBio = bio.trim();

    if (nextUsername.length < 3 || nextUsername.length > 10) {
      toast.error("Invalid username", {
        description: "Username must be between 3 and 10 characters.",
      });
      return;
    }

    if (nextBio.length > 200) {
      toast.error("Invalid bio", {
        description: "Bio must be 200 characters or fewer.",
      });
      return;
    }

    try {
      await updateProfile({ username: nextUsername, bio: nextBio }).unwrap();
      setIsEditing(false);
      toast.success("Profile updated");
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "Could not update profile. Please try again.";
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
    <div className="max-w-3xl mx-auto px-4 md:px-0 mt-6">
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        <div>
          <h2 className="text-[24px] sm:text-[28px] font-serif font-semibold text-foreground">
            Settings & Profile
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Update your profile and manage your account.
          </p>
          {isProfileFetching && (
            <p className="mt-2 text-xs text-muted-foreground">Refreshing profile...</p>
          )}
          {isProfileError && (
            <div className="mt-2 flex items-center gap-2">
              <p className="text-xs text-destructive">Could not load latest profile data.</p>
              <Button type="button" size="sm" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-[16px] font-serif font-medium text-foreground">
              Profile Information
            </h3>
            <Button
              type="button"
              variant="outline"
              className="bg-transparent"
              onClick={() => {
                setIsEditing((prev) => {
                  if (prev && profile) {
                    setUsername(profile.username ?? "");
                    setBio(profile.bio ?? "");
                  }
                  return !prev;
                });
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>

          <div className="flex items-center gap-5 mt-5">
            <div className="h-20 w-20 rounded-full bg-primary/20 text-primary flex items-center justify-center font-franklin font-bold text-[28px]">
              {avatarLetter}
            </div>
            <div className="flex-1">
              <label className="text-[13px] font-franklin font-medium text-muted-foreground block mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!isEditing || isSavingProfile}
                className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-sans text-[14px] disabled:opacity-70"
                placeholder="Your username"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="text-[13px] font-franklin font-medium text-muted-foreground block mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={profile?.email ?? ""}
              disabled
              className="w-full px-4 py-2 bg-card border border-border rounded-lg font-sans text-[14px] disabled:opacity-70"
            />
          </div>

          <div className="mt-5">
            <label className="text-[13px] font-franklin font-medium text-muted-foreground block mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={!isEditing || isSavingProfile}
              className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-sans text-[14px] resize-none disabled:opacity-70"
              rows={3}
              placeholder="Tell us about yourself"
            />
          </div>

          <Button
            type="button"
            className="mt-5 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={onSave}
            disabled={!isEditing || isSavingProfile}
          >
            {isSavingProfile ? "Saving..." : "Save Profile Changes"}
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-[16px] font-serif font-medium text-foreground mb-4">
            Account
          </h3>
          <Button
            variant="destructive"
            className="w-full justify-center"
            onClick={onLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
