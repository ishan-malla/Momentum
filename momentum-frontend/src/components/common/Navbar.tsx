import { Menu, Settings, Trophy, X } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/features/auth/authSlice";
const Navbar = () => {
  const { pathname } = useLocation();
  const user = useSelector(selectCurrentUser);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navItems = useMemo(() => {
    const items = [
      { to: "/home", label: "Overview", end: true },
      { to: "/habits", label: "Habits", end: false },
      { to: "/timer", label: "Timer", end: false },
      { to: "/task-calendar", label: "Tasks & Calendar", end: false },
      { to: "/analytics", label: "Analytics", end: false },
      { to: "/social", label: "Social", end: false },
      { to: "/achievments", label: "Achievements", end: false },
      { to: "/settings", label: "Settings", end: false },
    ] as const;

    if (user?.role === "admin") {
      return [...items, { to: "/admin", label: "Admin", end: false }] as const;
    }

    return items;
  }, [user?.role]);

  return (
    <div className="border-b border-border bg-card h-16 md:h-22 flex items-center relative">
      <div className="max-w-5xl flex justify-between w-full px-4 sm:px-5 xl:px-0 items-center h-full mx-auto">
        <h1 className="text-base sm:text-lg md:text-3xl font-semibold font-elegant tracking-tight">
          Momentum
        </h1>
        <div className="flex gap-2 sm:gap-5 items-center">
          <Button
            type="button"
            variant="outline"
            className="bg-transparent md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <Button
            className={` ${
              pathname === "/settings"
                ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10"
                : "bg-transparent hover:bg-muted"
            } hidden md:block `}
            variant="outline"
            asChild
          >
            <Link to="/settings">
              <Settings className="w-5 h-5" />
            </Link>
          </Button>

          <Button
            className={` ${
              pathname === "/achievments"
                ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10"
                : "bg-transparent hover:bg-muted"
            } hidden md:block `}
            variant="outline"
            asChild
          >
            <Link to="/achievments">
              <Trophy className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 right-0 top-full z-50 md:hidden border-b border-border bg-card">
            <div className="max-w-5xl mx-auto px-4 py-3">
              <div className="grid gap-1">
                {navItems.map(({ to, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      [
                        "px-3 py-2 rounded-md text-sm font-franklin",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted",
                      ].join(" ")
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default Navbar;
