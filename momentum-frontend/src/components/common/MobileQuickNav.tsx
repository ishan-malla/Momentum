import { Home, User, Users } from "lucide-react";
import { NavLink } from "react-router";

const navItems = [
  { to: "/home", label: "Overview", icon: Home, end: true },
  { to: "/social", label: "Social", icon: Users, end: false },
  { to: "/settings", label: "Profile", icon: User, end: false },
] as const;

const MobileQuickNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-card/95 backdrop-blur md:hidden">
      <div className="mx-auto flex xl:max-w-6xl items-center justify-around px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "group flex flex-col items-center justify-center gap-1 rounded-md border px-3 py-2 transition-colors",
                isActive
                  ? "border-border bg-secondary text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground",
              ].join(" ")
            }
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={[
                    "h-5 w-5 transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                  ].join(" ")}
                />
                <span className="text-[11px] font-franklin leading-none">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileQuickNav;
