import { Card, CardContent } from "@/components/ui/card";

type AnalyticsStatCardProps = {
  label: string;
  value: string;
  hint: string;
};

const AnalyticsStatCard = ({
  label,
  value,
  hint,
}: AnalyticsStatCardProps) => {
  return (
    <Card className="gap-0 rounded-[1.2rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
      <CardContent className="space-y-2 p-4">
        <p className="text-[11px] font-secondary uppercase tracking-[0.14em] text-[#9c8b6d]">
          {label}
        </p>
        <p className="font-heading text-[2rem] font-semibold leading-none text-[#2f3e32]">
          {value}
        </p>
        <p className="text-sm text-[#7b7467]">{hint}</p>
      </CardContent>
    </Card>
  );
};

export default AnalyticsStatCard;
