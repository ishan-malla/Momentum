"use client";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

type Props = {
  xpActivityControl?: ReactNode;
};

export default function PomodoroHeader({ xpActivityControl }: Props) {
  return (
    <header>
      <div className="mx-auto w-full xl:max-w-7xl px-4 py-4 sm:px-5 sm:py-5 xl:px-0">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-heading text-[24px] font-semibold text-foreground sm:text-[28px]">
            Pomodoro Timer
          </h1>

          <div className="flex flex-col items-end gap-2">
            {xpActivityControl ? <div>{xpActivityControl}</div> : null}

            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-9 border-border/80 bg-card px-3.5 text-sm text-foreground hover:bg-muted/60"
            >
              <Link to="/timer/analytics">See analytics</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
