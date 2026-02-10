import { HabitCard } from "@/components/habit/habitCard";
import { mockHabits } from "@/data/mockHabits";

const HabitsList = () => {
  return (
    <div className="flex flex-col gap-4">
      {mockHabits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </div>
  );
};

const Habits = () => {
  return (
    <div className="w-full md:w-2/3 max-w-5xl mx-auto px-4 md:px-0 mt-6 space-y-4">
      <div>
        <h2 className="text-[24px] sm:text-[28px] font-serif font-semibold text-foreground">
          Habits
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your habits for today.
        </p>
      </div>

      <HabitsList />
    </div>
  );
};
export default Habits;
