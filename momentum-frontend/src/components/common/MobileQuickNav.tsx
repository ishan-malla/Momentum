import { CheckSquare, Home, User, Users } from "lucide-react";
import { NavLink } from "react-router";

const navItems = [
  { to: "/home", label: "Home", icon: Home, end: true },
  { to: "/habits", label: "Habits", icon: CheckSquare, end: false },
  { to: "/social", label: "Social", icon: Users, end: false },
  { to: "/settings", label: "Profile", icon: User, end: false },
] as const;

const MobileQuickNav = () => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-card/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-2xl items-center gap-1 px-2 pb-[calc(env(safe-area-inset-bottom)+0.45rem)] pt-2">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "flex min-h-[3rem] flex-1 flex-col items-center justify-center gap-1 rounded-md px-1.5 py-1.5 transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              ].join(" ")
            }
            aria-label={label}
          >
            <Icon className="h-4 w-4" />
            <span className="text-[11px] font-secondary leading-none">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileQuickNav;
