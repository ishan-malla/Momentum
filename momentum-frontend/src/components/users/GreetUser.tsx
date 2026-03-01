import { selectCurrentUser } from "@/features/auth/authSlice";
import { useSelector } from "react-redux";

const GreetUser = () => {
  const currentDate = new Date();
  const currentHour = currentDate.getHours();

  const partOfDay = (currentHour: number) => {
    if (!currentHour) return;
    if (currentHour < 4) return "night";
    if (currentHour < 13) return "morning";
    if (currentHour < 17) return "afternoon";
    if (currentHour < 20) return "evening";
  };

  const user = useSelector(selectCurrentUser);
  return (
    <div className="mx-auto mt-6 w-full xl:max-w-6xl px-4 sm:mt-8 sm:px-5 xl:px-0">
      <h1 className="text-xl font-serif font-medium tracking-tight sm:text-2xl lg:text-3xl">
        {`Good ${partOfDay(currentHour)}, ${user?.username}`}
      </h1>
      <p className="text-muted-foreground text-sm">
        Keep building momentum. Small steps lead to big changes
      </p>
    </div>
  );
};
export default GreetUser;
