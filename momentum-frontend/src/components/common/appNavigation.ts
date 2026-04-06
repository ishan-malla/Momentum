import {
  Calendar,
  CheckSquare,
  Home,
  Settings,
  Shield,
  Timer,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AppNavigationItem = {
  to: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  end: boolean;
};

const PRIMARY_NAV_ITEMS: AppNavigationItem[] = [
  { to: "/home", label: "Overview", shortLabel: "Home", icon: Home, end: true },
  { to: "/habits", label: "Habits", shortLabel: "Habits", icon: CheckSquare, end: false },
  { to: "/timer", label: "Timer", shortLabel: "Timer", icon: Timer, end: false },
  {
    to: "/task-calendar",
    label: "Tasks & Calendar",
    shortLabel: "Tasks",
    icon: Calendar,
    end: false,
  },
  { to: "/social", label: "Social", shortLabel: "Social", icon: Users, end: false },
  {
    to: "/achievments",
    label: "Achievements",
    shortLabel: "Awards",
    icon: Trophy,
    end: false,
  },
];

const ADMIN_NAV_ITEM: AppNavigationItem = {
  to: "/admin",
  label: "Admin",
  shortLabel: "Admin",
  icon: Shield,
  end: false,
};

export const SETTINGS_NAV_ITEM: AppNavigationItem = {
  to: "/settings",
  label: "Settings",
  shortLabel: "Settings",
  icon: Settings,
  end: false,
};

export const getPrimaryNavigation = (role?: string | null) => {
  if (role === "admin") {
    return [...PRIMARY_NAV_ITEMS, ADMIN_NAV_ITEM];
  }

  return PRIMARY_NAV_ITEMS;
};

export const MOBILE_QUICK_NAV_ITEMS: AppNavigationItem[] = [
  PRIMARY_NAV_ITEMS[0],
  PRIMARY_NAV_ITEMS[1],
  PRIMARY_NAV_ITEMS[2],
  PRIMARY_NAV_ITEMS[3],
  PRIMARY_NAV_ITEMS[4],
];
