import { Home, User, Users } from "lucide-react";
import { NavLink } from "react-router";

const navItems = [
  { to: "/home", label: "Overview", icon: Home, end: true },
  { to: "/social", label: "Social", icon: Users, end: false },
  { to: "/settings", label: "Profile", icon: User, end: false },
] as const;

const MobileQuickNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
      <div className="mx-auto flex xl:max-w-5xl items-center justify-around px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "flex flex-col items-center justify-center gap-1 rounded-md px-3 py-2",
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

export default MobileQuickNav;

