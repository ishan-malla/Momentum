import { selectCurrentUser } from "@/features/auth/authSlice";
import { formatDisplayName, getDayGreeting } from "@/utils/greeting";
import { useSelector } from "react-redux";

const GreetUser = () => {
  const user = useSelector(selectCurrentUser);
  const greeting = getDayGreeting();
  const username = formatDisplayName(user?.username);
  const levelProgressPercent =
    user && user.levelGoal > 0 ? Math.round((user.xp / user.levelGoal) * 100) : 0;

  return (
    <section className="mx-auto mt-6 w-full px-4 font-timer sm:mt-7 sm:px-5 xl:max-w-7xl xl:px-0">
      <p className="text-[11px] font-secondary uppercase tracking-[0.14em] text-muted-foreground/85">
        Overview
      </p>
      <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {`${greeting}, ${username}`}
      </h1>
      <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
        Keep building momentum. Small steps lead to big changes.
      </p>

      {user ? (
        <div className="mt-5 max-w-xl rounded-2xl border border-[#ddd6c8] bg-[#fffdfa] p-4 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-secondary uppercase tracking-[0.14em] text-[#8a826f]">
                Current Level
              </p>
              <h2 className="mt-1 font-heading text-2xl font-semibold text-[#2f3e32]">
                Level {user.level}
              </h2>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-[#2f3e32]">
                {user.totalXp.toLocaleString()} XP
              </p>
              <p className="text-xs text-[#8a826f]">Total progress</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-[#efe7da]">
              <div
                className="h-full rounded-full bg-[#d98d32] transition-all duration-300"
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between gap-3 text-sm text-[#6f675b]">
              <span>
                {user.xp}/{user.levelGoal} XP toward Level {user.level + 1}
              </span>
              <span>{levelProgressPercent}%</span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
export default GreetUser;
