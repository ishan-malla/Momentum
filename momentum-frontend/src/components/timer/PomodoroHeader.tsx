"use client";

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

type Props = {
  onToggleSettings: () => void;
  showSettings: boolean;
};

export default function PomodoroHeader({
  onToggleSettings,
  showSettings,
}: Props) {
  return (
    <header>
      <div className="mx-auto w-full xl:max-w-6xl px-4 py-4 sm:px-5 sm:py-5 xl:px-0">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-serif font-bold text-foreground sm:text-xl lg:text-2xl">
            Pomodoro Timer
          </h1>
          <Button
            type="button"
            variant="outline"
            onClick={onToggleSettings}
            className={
              showSettings
                ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10"
                : "bg-transparent hover:bg-muted"
            }
            aria-label="Open settings"
          >
            <Pencil className="h-4 w-4 mr-2" />
            {showSettings ? "Stop editing" : "Edit"}
          </Button>
        </div>
      </div>
    </header>
  );
}
