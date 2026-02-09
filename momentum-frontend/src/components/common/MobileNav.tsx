import { Button } from "@/components/ui/button";
import { Calendar, CheckSquare, Home, Timer, User } from "lucide-react";
import { Link, useLocation } from "react-router";

const navItems = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/habits", label: "Habits", icon: CheckSquare },
  { to: "/timer", label: "Timer", icon: Timer },
  { to: "/task-calendar", label: "Calendar", icon: Calendar },
  { to: "/settings", label: "Profile", icon: User },
] as const;

const MobileNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-50">
      <div className="flex items-center justify-around px-4 py-3">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = pathname === to;
          return (
            <Link key={to} to={to}>
              <Button
                variant="ghost"
                size="sm"
                className={`flex-col h-auto py-2 gap-1 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-franklin">{label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;

