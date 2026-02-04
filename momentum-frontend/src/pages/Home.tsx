import { HabitCard } from "@/components/habit/habitCard";
import GreetUser from "@/components/users/GreetUser";
import { useState } from "react";

const habitsData = [
  {
    id: 1,
    name: "Morning Meditation",
    streak: 12,
    completed: true,
    type: "binary" as const,
    category: "Wellness",
  },
  {
    id: 2,
    name: "Read 30 Pages",
    streak: 8,
    completed: false,
    type: "binary" as const,
    category: "Learning",
  },
  {
    id: 3,
    name: "Drink Water",
    streak: 15,
    completed: true,
    type: "quantitative" as const,
    current: 6,
    target: 8,
    unit: "glasses",
    category: "Health",
  },
  {
    id: 4,
    name: "Exercise",
    streak: 5,
    completed: false,
    type: "binary" as const,
    category: "Fitness",
  },
  {
    id: 5,
    name: "Practice Guitar",
    streak: 3,
    completed: false,
    type: "binary" as const,
    category: "Creative",
  },
];

const Home = () => {
  return (
    <div>
      <GreetUser />
      <section className="space-y-4 w-2/3 mx-auto">
        <div className="flex flex-col gap-5 mt-10">
          {habitsData.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
