import { NavLink } from "react-router";
import { MOBILE_QUICK_NAV_ITEMS } from "@/components/common/appNavigation";
import { cn } from "@/lib/utils";

const MobileQuickNav = () => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-sidebar-border/80 bg-[#fffdfa]/96 shadow-[0_-8px_18px_rgba(57,52,43,0.05)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-3xl items-center gap-1.5 px-2 pb-[calc(env(safe-area-inset-bottom)+0.45rem)] pt-2">
        {MOBILE_QUICK_NAV_ITEMS.map(({ to, label, shortLabel, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex min-h-[3.15rem] flex-1 flex-col items-center justify-center gap-1 rounded-xl border px-1.5 py-1.5 text-muted-foreground transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out",
                isActive
                  ? "border-sidebar-border bg-sidebar-accent text-foreground shadow-[0_8px_18px_rgba(57,52,43,0.06)] -translate-y-px"
                  : "border-transparent hover:bg-sidebar-accent/80 hover:text-foreground",
              )
            }
            aria-label={label}
          >
            <Icon className="h-4 w-4" />
            <span className="text-[11px] font-secondary leading-none">
              {shortLabel ?? label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileQuickNav;
