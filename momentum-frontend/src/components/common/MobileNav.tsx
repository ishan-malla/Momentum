import {
  Calendar,
  CheckSquare,
  Home,
  Timer,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { NavLink } from "react-router";

const navItems = [
  { to: "/home", label: "Home", icon: Home, end: true },
  { to: "/habits", label: "Habits", icon: CheckSquare, end: false },
  { to: "/timer", label: "Timer", icon: Timer, end: false },
  { to: "/task-calendar", label: "Calendar", icon: Calendar, end: false },
  { to: "/social", label: "Social", icon: Users, end: false },
  { to: "/achievments", label: "Awards", icon: Trophy, end: false },
  { to: "/settings", label: "Profile", icon: User, end: false },
] as const;

const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-50">
      <div className="flex items-center gap-1 overflow-x-auto px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "min-w-[4.5rem] flex-1 shrink-0 rounded-md py-2",
                "flex flex-col items-center justify-center gap-1",
                "text-muted-foreground transition-colors",
                isActive ? "text-primary bg-primary/5" : "hover:text-foreground",
              ].join(" ")
            }
            aria-label={label}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[11px] font-franklin leading-none">
              {label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
