import {
  Calendar,
  CheckSquare,
  Home,
  Menu,
  Shield,
  Timer,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { useMemo, useState } from "react";
import { NavLink } from "react-router";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/features/auth/authSlice";

const Navbar = () => {
  const user = useSelector(selectCurrentUser);
  const [open, setOpen] = useState(false);

  const navItems = useMemo(() => {
    const items = [
      { to: "/home", label: "Overview", icon: Home, end: true },
      { to: "/habits", label: "Habits", icon: CheckSquare, end: false },
      { to: "/timer", label: "Timer", icon: Timer, end: false },
      { to: "/task-calendar", label: "Tasks & Calendar", icon: Calendar, end: false },
      { to: "/social", label: "Social", icon: Users, end: false },
      { to: "/achievments", label: "Achievements", icon: Trophy, end: false },
    ] as const;

    if (user?.role === "admin") {
      return [...items, { to: "/admin", label: "Admin", icon: Shield, end: false }] as const;
    }

    return items;
  }, [user?.role]);

  return (
    <div className="relative flex h-14 items-center border-b border-border/70 bg-card/95 backdrop-blur md:hidden">
      <div className="flex h-full w-full items-center justify-between px-4 sm:px-5">
        <h1 className="font-elegant text-base font-semibold tracking-tight sm:text-lg">
          Momentum
        </h1>

        <div className="flex items-center">
          <Button
            type="button"
            variant="outline"
            className="h-9 w-9 border-border/70 bg-transparent p-0 hover:bg-secondary/90"
            onClick={() => setOpen((v) => !v)}
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
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 right-0 top-full z-50 border-b border-border/70 bg-card md:hidden">
            <div className="mx-auto px-4 py-3">
              <div className="grid gap-1">
                {navItems.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      [
                        "group flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-franklin",
                        isActive
                          ? "border-border bg-secondary text-foreground"
                          : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={[
                            "h-4 w-4 transition-colors",
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground group-hover:text-foreground",
                          ].join(" ")}
                        />
                        {label}
                      </>
                    )}
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
