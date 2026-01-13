import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Plus, Minus } from "lucide-react";
import { useState } from "react";

type Habit = {
  id: number;
  name: string;
  streak: number;
  completed: boolean;
  type: "binary" | "quantitative";
  current?: number;
  target?: number;
  unit?: string;
};

export function HabitCard({ habit }: { habit: Habit }) {
  const [completed, setCompleted] = useState(habit.completed);
  const [current, setCurrent] = useState(habit.current || 0);

  const handleToggle = () => {
    setCompleted(!completed);
  };

  const handleIncrement = () => {
    if (habit.target && current < habit.target) {
      setCurrent(current + 1);
    }
  };

  const handleDecrement = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  const progress =
    habit.type === "quantitative" && habit.target
      ? (current / habit.target) * 100
      : 0;

  return (
    <Card
      className={`p-4 transition-all ${
        completed ? "bg-success/10 border-success/30" : "bg-card"
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="font-serif font-medium text-lg text-foreground">
              {habit.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm">🔥</span>
              <span className="text-sm font-stat font-bold text-streak">
                {habit.streak}
              </span>
              <span className="text-xs font-franklin text-muted-foreground">
                day streak
              </span>
            </div>
          </div>
          {habit.type === "binary" && (
            <Button
              size="icon"
              variant={completed ? "default" : "outline"}
              className={completed ? "bg-success hover:bg-success/90" : ""}
              onClick={handleToggle}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>

        {habit.type === "quantitative" && habit.target && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={handleDecrement}
                disabled={current === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">
                <p className="text-2xl font-stat font-bold text-foreground">
                  {current}/{habit.target}
                </p>
                <p className="text-xs font-franklin text-muted-foreground">
                  {habit.unit}
                </p>
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={handleIncrement}
                disabled={current >= habit.target}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-success transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
