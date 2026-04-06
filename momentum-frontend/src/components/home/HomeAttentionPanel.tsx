import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  HomeAttentionItem,
  HomeSummaryStat,
} from "@/features/home/homeOverview";

type Props = {
  isLoading: boolean;
  items: HomeAttentionItem[];
  stats: HomeSummaryStat[];
  subtitle: string;
};

const AttentionAction = ({ item }: { item: HomeAttentionItem }) => {
  if (item.actionKind === "anchor") {
    return (
      <Button
        asChild
        variant="outline"
        size="sm"
        className="border-[#ddd6c8] bg-[#fffdfa] text-[#304034] hover:bg-[#f6f1e8]"
      >
        <a href={item.actionHref}>{item.actionLabel}</a>
      </Button>
    );
  }

  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="border-[#ddd6c8] bg-[#fffdfa] text-[#304034] hover:bg-[#f6f1e8]"
    >
      <Link to={item.actionHref}>{item.actionLabel}</Link>
    </Button>
  );
};

const HomeAttentionPanel = ({ isLoading, items, stats, subtitle }: Props) => {
  return (
    <Card className="gap-0 rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
      <CardContent className="space-y-5 p-5">
        <div>
          <p className="text-[11px] font-secondary uppercase tracking-[0.14em] text-[#9c8b6d]">
            Needs Attention
          </p>
          <h2 className="mt-1 font-heading text-xl text-[#2f3e32]">
            {items.length > 0 ? `${items.length} things need attention` : "Today looks clear"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7b7467]">
            {subtitle}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`rounded-[1rem] border px-3.5 py-3 ${
                index === 0
                  ? "border-primary/20 bg-primary/10"
                  : "border-[#e7dfd2] bg-[#faf6ef]"
              }`}
            >
              <p className="text-[10px] font-secondary uppercase tracking-[0.14em] text-[#9c8b6d]">
                {stat.label}
              </p>
              <p className="mt-1 font-heading text-2xl font-semibold text-[#2f3e32]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-[1rem] border border-[#e7dfd2] bg-[#fffdfa] px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                      {item.badge}
                    </span>
                    <p className="mt-3 text-base font-semibold text-[#2f3e32]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#7b7467]">
                      {item.detail}
                    </p>
                  </div>

                  <AttentionAction item={item} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1rem] border border-[#e7dfd2] bg-[#faf6ef] px-4 py-4">
            <p className="text-base font-semibold text-[#2f3e32]">
              No urgent cleanup is waiting
            </p>
            <p className="mt-1 text-sm leading-6 text-[#7b7467]">
              Keep moving through today’s habits and queue, but nothing looks blocked right now.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HomeAttentionPanel;
