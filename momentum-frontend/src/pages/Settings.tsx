import { Button } from "@/components/ui/button";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { useLogoutMutation } from "@/features/auth/authApiSlice";
import { LogOut, Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState("");

  const avatarLetter = useMemo(() => {
    const c = (username || user?.username || "").trim().charAt(0);
    return c ? c.toUpperCase() : "?";
  }, [user?.username, username]);

  const onSave = () => {
    setIsEditing(false);
    toast.success("Saved", { description: "Profile changes saved (UI only)." });
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

  return (
    <div className="xl:w-2/3 w-full mx-auto p-5 xl:p-0 mt-6">
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        <div>
          <h2 className="text-[24px] sm:text-[28px] font-serif font-semibold text-foreground">
            Settings & Profile
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Update your profile and manage your account.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-[16px] font-serif font-medium text-foreground">
                Profile Information
              </h3>
              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() => setIsEditing((v) => !v)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                {isEditing ? "Stop editing" : "Edit"}
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
                  disabled={!isEditing}
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
                value={user?.email ?? ""}
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
                disabled={!isEditing}
                className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-sans text-[14px] resize-none disabled:opacity-70"
                rows={3}
                placeholder="Tell us about yourself"
              />
            </div>

            <Button
              className="mt-5 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={onSave}
              disabled={!isEditing}
            >
              Save Profile Changes
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
