import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { formatDisplayName, getDayGreeting } from "@/utils/greeting";

const GreetUser = () => {
  const user = useSelector(selectCurrentUser);
  const greeting = getDayGreeting();
  const username = formatDisplayName(user?.username);
  const progressPercent =
    user && user.levelGoal > 0 ? Math.round((user.xp / user.levelGoal) * 100) : 0;

  return (
    <section className="mx-auto mt-6 w-full px-4 sm:px-5 xl:max-w-7xl xl:px-0">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-secondary uppercase tracking-[0.14em] text-[#9c8b6d]">
            Overview
          </p>
          <h1 className="mt-1 font-heading text-[2.15rem] font-semibold tracking-[-0.03em] text-[#2f3e32]">
            {`${greeting}, ${username}`}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7b7467]">
            Start with what matters today, then keep the rest of the page out of the way.
          </p>
        </div>

        {user ? (
          <div className="flex flex-wrap gap-2">
            <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm text-primary">
              <span className="opacity-80">Level </span>
              <span className="font-semibold">{user.level}</span>
            </div>
            <div className="rounded-full border border-[#ddd6c8] bg-[#fffdfa] px-3 py-1.5 text-sm text-[#2f3e32]">
              <span className="text-[#7b7467]">XP </span>
              <span className="font-semibold">{user.totalXp.toLocaleString()}</span>
            </div>
            <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm text-primary">
              <span className="opacity-80">Next level </span>
              <span className="font-semibold">{progressPercent}%</span>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default GreetUser;
