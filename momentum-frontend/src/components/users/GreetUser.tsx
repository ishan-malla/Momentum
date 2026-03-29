import { selectCurrentUser } from "@/features/auth/authSlice";
import { formatDisplayName, getDayGreeting } from "@/utils/greeting";
import { useSelector } from "react-redux";

const GreetUser = () => {
  const user = useSelector(selectCurrentUser);
  const greeting = getDayGreeting();
  const username = formatDisplayName(user?.username);

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
    </section>
  );
};
export default GreetUser;
