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
    <div className="w-full md:w-2/3 max-w-5xl mx-auto px-4 md:px-0 mt-6 sm:mt-8">
      <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight">
        {`Good ${partOfDay(currentHour)}, ${user?.username}`}
      </h1>
      <p className="text-muted-foreground text-sm">
        Keep building momentum. Small steps lead to big changes
      </p>
    </div>
  );
};
export default GreetUser;
