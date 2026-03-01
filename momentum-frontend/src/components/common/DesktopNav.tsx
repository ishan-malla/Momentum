import {
  Calendar,
  ChartColumnDecreasing,
  Check,
  Clock,
  Target,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router";

const isActive = "border-b-3 border-primary text-primary";
const notActiveStyle = "text-muted-foreground hover:text-accent-foreground";

const navLinks = [
  { tabName: "Overview", route: "/home", icon: <Target size={16} /> },
  { tabName: "Habits", route: "/habits", icon: <Check size={16} /> },
  { tabName: "Timer", route: "/timer", icon: <Clock size={16} /> },
  {
    tabName: "Tasks & Calendar",
    route: "/task-calendar",
    icon: <Calendar size={16} />,
  },
  {
    tabName: "Analytics",
    route: "/analytics",
    icon: <ChartColumnDecreasing size={16} />,
  },
  { tabName: "Social", route: "/social", icon: <Users size={16} /> },
];

const DesktopNav = () => {
  const { pathname } = useLocation();

  return (
    <div className="bg-card border-b border-border sticky hidden md:flex h-11 items-center p-5 xl:p-0">
      <div className="w-full xl:max-w-6xl mx-auto hidden md:flex h-full items-center justify-between space-x-4 px-4 xl:px-0">
        {navLinks.map((tab, index) => {
          return (
            <Link
              to={tab.route}
              className={` h-11  text-sm text-muted-foreground flex items-center gap-2  p-2  ${
                pathname === tab.route ? isActive : notActiveStyle
              }`}
              key={index}
            >
              <span>{tab.icon}</span>
              <span>{tab.tabName}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
export default DesktopNav;
