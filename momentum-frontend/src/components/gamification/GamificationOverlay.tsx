import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Award, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  dismissLevelUp,
  selectActiveLevelUp,
  selectGamificationToastEvent,
} from "@/features/gamification/gamificationSlice";
import { toast } from "sonner";

export default function GamificationOverlay() {
  const dispatch = useDispatch();
  const toastEvent = useSelector(selectGamificationToastEvent);
  const levelUp = useSelector(selectActiveLevelUp);
  const lastToastIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!toastEvent) return;
    if (lastToastIdRef.current === toastEvent.id) return;

    lastToastIdRef.current = toastEvent.id;

    if (toastEvent.xpChange > 0) {
      toast.success(`+${toastEvent.xpChange} XP`, {
        description: "Momentum updated instantly.",
      });
      return;
    }

    toast.message(`${toastEvent.xpChange} XP`, {
      description: "Progress was recalculated after your update.",
    });
  }, [toastEvent]);

  if (!levelUp) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-[2px]">
      <Card className="pointer-events-auto w-full max-w-md overflow-hidden border-[#ecd9ba] bg-[#fff7ea] p-0 shadow-[0_20px_60px_rgba(61,47,23,0.18)]">
        <div className="relative overflow-hidden px-6 py-7 text-[#2f3e32]">
          <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(255,214,143,0.7),transparent_70%)]" />

          <div className="relative">
            <div className="mb-4 inline-flex rounded-full bg-[#ffe6b8] p-3 text-[#b06b15]">
              <Award className="h-6 w-6" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a6a27]">
              Level Up
            </p>
            <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
              Level {levelUp.newLevel}
            </h2>
            <p className="mt-2 text-sm text-[#6c6254]">
              You climbed from Level {levelUp.previousLevel} and now have{" "}
              {levelUp.totalXp.toLocaleString()} total XP.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#ead7b7] bg-white/70 px-4 py-3">
                <div className="flex items-center gap-2 text-[#9a6a27]">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                    Current Progress
                  </span>
                </div>
                <p className="mt-2 text-lg font-semibold text-[#2f3e32]">
                  {levelUp.currentXp}/{levelUp.levelGoal} XP
                </p>
              </div>

              <div className="rounded-2xl border border-[#ead7b7] bg-white/70 px-4 py-3">
                <div className="flex items-center gap-2 text-[#9a6a27]">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                    Total XP
                  </span>
                </div>
                <p className="mt-2 text-lg font-semibold text-[#2f3e32]">
                  {levelUp.totalXp.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={() => dispatch(dismissLevelUp())}
                className="bg-[#d98d32] text-white hover:bg-[#c17b2b]"
              >
                Keep Going
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
