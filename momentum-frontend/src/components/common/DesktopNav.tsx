import {
  Calendar,
  ChartColumnDecreasing,
  Check,
  Clock,
  Target,
  Users,
} from "lucide-react";

const DesktopNav = () => {
  return (
    <div className="bg-card border-b border-border hidden md:flex h-11 items-center ">
      <div className=" w-full xl:w-2/3 md:mx-auto  hidden md:flex h-full items-center justify-between  space-x-4">
        <button className=" h-11 w-20 text-sm text-muted-foreground flex items-center gap-2">
          <span>
            <Target size={16} />
          </span>
          <span>Overview</span>
        </button>

        <button className=" h-11  text-sm text-muted-foreground flex items-center gap-2">
          <span>
            <Check size={16} />{" "}
          </span>
          <span>Habits</span>
        </button>
        <button className=" h-11  text-sm text-muted-foreground flex items-center gap-2">
          <span>
            <Clock size={16} />{" "}
          </span>
          <span>Timer</span>
        </button>

        <button className=" h-11  text-sm text-muted-foreground flex items-center gap-2">
          <span>
            <Calendar size={16} />
          </span>
          <span>Tasks & Calendar</span>
        </button>

        <button className=" h-11  text-sm text-muted-foreground flex items-center gap-2">
          <span>
            <ChartColumnDecreasing size={16} />
          </span>
          <span>Analytics</span>
        </button>
        <button className=" h-11  text-sm text-muted-foreground flex items-center gap-2">
          <span>
            <Users size={16} />{" "}
          </span>
          <span>Social</span>
        </button>
      </div>
    </div>
  );
};
export default DesktopNav;
