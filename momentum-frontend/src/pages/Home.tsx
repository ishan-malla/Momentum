import { HabitCard } from "@/components/habit/habitCard";
import GreetUser from "@/components/users/GreetUser";
import { mockHabits } from "@/data/mockHabits";

const Home = () => {
  return (
    <div>
      <GreetUser />
      <section className="space-y-4 w-full md:w-2/3 max-w-5xl mx-auto px-4 md:px-0">
        <div className="mt-6 flex flex-col gap-4 sm:mt-10 animate-fade-in">
          {mockHabits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
