import {
  Menu,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { getPrimaryNavigation, SETTINGS_NAV_ITEM } from "@/components/common/appNavigation";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const user = useSelector(selectCurrentUser);
  const location = useLocation();
  const [openPath, setOpenPath] = useState<string | null>(null);

  const navItems = useMemo(() => getPrimaryNavigation(user?.role), [user?.role]);
  const open = openPath === location.pathname;

  return (
    <div className="relative flex h-14 items-center border-b border-sidebar-border/80 bg-sidebar md:hidden">
      <div className="flex h-full w-full items-center justify-between px-4 sm:px-5">
        <h1 className="font-secondary text-base font-semibold tracking-tight text-foreground sm:text-lg">
          Momentum
        </h1>

        <div className="flex items-center">
          <Button
            type="button"
            variant="outline"
            className="h-9 w-9 rounded-lg border-sidebar-border/80 bg-sidebar p-0 text-foreground shadow-none hover:bg-sidebar-accent"
            onClick={() => setOpenPath((current) => (current === location.pathname ? null : location.pathname))}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <>
          <div
            className="animate-fade-in fixed inset-0 z-40 bg-[#2f2a22]/18 md:hidden"
            onClick={() => setOpenPath(null)}
            aria-hidden="true"
          />
          <div className="animate-drop-in absolute left-3 right-3 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-sidebar-border/80 bg-sidebar md:hidden">
            <div className="mx-auto px-3 py-3">
              <div className="grid gap-1.5">
                {navItems.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 rounded-lg border px-3.5 py-3 text-sm font-secondary transition-colors",
                        isActive
                          ? "border-sidebar-border bg-sidebar-accent text-foreground"
                          : "border-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                      )
                    }
                    onClick={() => setOpenPath(null)}
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
                        {label}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>

              <div className="mt-3 border-t border-sidebar-border/70 pt-3">
                <NavLink
                  to={SETTINGS_NAV_ITEM.to}
                  end={SETTINGS_NAV_ITEM.end}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-lg border px-3.5 py-3 text-sm font-secondary transition-colors",
                      isActive
                        ? "border-sidebar-border bg-sidebar-accent text-foreground"
                        : "border-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                    )
                  }
                  onClick={() => setOpenPath(null)}
                >
                  {({ isActive }) => (
                    <>
                      <SETTINGS_NAV_ITEM.icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors duration-200",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                      {SETTINGS_NAV_ITEM.label}
                    </>
                  )}
                </NavLink>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default Navbar;
