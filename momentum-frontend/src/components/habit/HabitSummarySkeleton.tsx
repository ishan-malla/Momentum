import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HabitSummarySkeleton() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="border-border bg-card shadow-none">
          <CardContent className="space-y-3 p-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-1.5 w-full" />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
