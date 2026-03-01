import { selectCurrentUser } from "@/features/auth/authSlice";
import {
  Calendar,
  ChartColumnDecreasing,
  CheckSquare,
  Home,
  Settings,
  Shield,
  Timer,
  Trophy,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router";

const AppSidebar = () => {
  const user = useSelector(selectCurrentUser);

  const navItems = useMemo(() => {
    const items = [
      { to: "/home", label: "Overview", icon: Home, end: true },
      { to: "/habits", label: "Habits", icon: CheckSquare, end: false },
      { to: "/timer", label: "Timer", icon: Timer, end: false },
      { to: "/task-calendar", label: "Tasks & Calendar", icon: Calendar, end: false },
      {
        to: "/analytics",
        label: "Analytics",
        icon: ChartColumnDecreasing,
        end: false,
      },
      { to: "/social", label: "Social", icon: Users, end: false },
      { to: "/achievments", label: "Achievements", icon: Trophy, end: false },
      { to: "/settings", label: "Settings", icon: Settings, end: false },
    ];

    if (user?.role === "admin") {
      return [...items, { to: "/admin", label: "Admin", icon: Shield, end: false }];
    }

    return items;
  }, [user?.role]);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[21rem] border-r border-border/70 bg-card shadow-[8px_0_24px_rgba(28,25,23,0.06)] md:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-border/60 px-5 py-5">
          <h1 className="font-elegant text-xl font-semibold tracking-tight text-foreground">
            Momentum
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <p className="px-2 pb-2 text-[11px] font-franklin uppercase tracking-[0.14em] text-muted-foreground/90">
            Navigation
          </p>
          <div className="space-y-1.5">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-[15px] font-franklin transition-all",
                    isActive
                      ? "border-border bg-secondary text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                      : "border-transparent text-muted-foreground hover:border-border/70 hover:bg-secondary hover:text-foreground",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={[
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground",
                      ].join(" ")}
                    />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
