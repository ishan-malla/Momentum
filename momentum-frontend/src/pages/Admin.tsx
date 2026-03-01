import { Button } from "@/components/ui/button";
import { useLogoutMutation } from "@/features/auth/authApiSlice";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const [logout, { isLoading }] = useLogoutMutation();

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
    <div className="mx-auto mt-6 w-full xl:max-w-6xl px-4 sm:px-5 xl:px-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[20px] sm:text-[24px] lg:text-[28px] font-serif font-semibold text-foreground">
            Hi Admin
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            You are logged in as an admin.
          </p>
        </div>
        <Button variant="destructive" onClick={onLogout} disabled={isLoading}>
          <LogOut className="h-4 w-4 mr-2" />
          {isLoading ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  );
};

export default Admin;
