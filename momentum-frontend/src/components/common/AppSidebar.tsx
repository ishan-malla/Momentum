import { selectCurrentUser } from "@/features/auth/authSlice";
import { useLogoutMutation } from "@/features/auth/authApiSlice";
import {
  ChevronRight,
  LogOut,
  Settings,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router";
import { formatDisplayName } from "@/utils/greeting";
import { toast } from "sonner";
import { getPrimaryNavigation } from "@/components/common/appNavigation";
import { cn } from "@/lib/utils";

const AppSidebar = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const navItems = useMemo(() => getPrimaryNavigation(user?.role), [user?.role]);

  const displayName = formatDisplayName(user?.username, "Guest");
  const avatarUrl = user?.avatarUrl ?? "";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    if (!isAccountMenuOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const root = accountMenuRef.current;
      if (!root) return;
      if (root.contains(event.target as Node)) return;
      setIsAccountMenuOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsAccountMenuOpen(false);
    };
    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isAccountMenuOpen]);

  const handleOpenSettings = () => {
    setIsAccountMenuOpen(false);
    navigate("/settings");
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast.success("Logged out");
      navigate("/auth/login", { replace: true });
    } catch {
      toast.error("Logout failed", { description: "Please try again." });
    } finally {
      setIsAccountMenuOpen(false);
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[20rem] border-r border-sidebar-border/80 bg-sidebar md:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-sidebar-border/70 px-5 py-5">
          <h1 className="font-secondary text-lg font-semibold tracking-tight text-foreground">
            Momentum
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <p className="px-2 pb-2 text-[11px] font-secondary uppercase tracking-[0.14em] text-muted-foreground/90">
            Navigation
          </p>
          <div className="space-y-1.5">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-lg border px-3.5 py-2.75 text-[15px] font-secondary transition-colors",
                    isActive
                      ? "border-sidebar-border bg-sidebar-accent text-foreground"
                      : "border-transparent text-muted-foreground hover:border-sidebar-border/80 hover:bg-sidebar-accent hover:text-foreground",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors duration-200",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="border-t border-sidebar-border/80 p-4">
          <div ref={accountMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((previous) => !previous)}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-accent"
              aria-label="Open account menu"
              aria-expanded={isAccountMenuOpen}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/20 font-secondary text-sm font-bold text-primary">
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

              <div className="min-w-0 flex-1 text-left">
                <p className="truncate font-secondary text-sm font-medium text-foreground">
                  {displayName}
                </p>
                <p className="truncate text-xs text-muted-foreground">{user?.email ?? ""}</p>
              </div>

              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  isAccountMenuOpen && "rotate-90",
                )}
              />
            </button>

            {isAccountMenuOpen && (
              <div className="animate-drop-in absolute bottom-16 right-0 z-50 w-[62%] overflow-hidden rounded-lg border border-sidebar-border bg-sidebar">
                <button
                  type="button"
                  onClick={handleOpenSettings}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-secondary text-foreground transition-colors hover:bg-sidebar-accent"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-secondary text-destructive transition-colors hover:bg-sidebar-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
