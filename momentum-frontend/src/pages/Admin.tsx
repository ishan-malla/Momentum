import { useState } from "react";
import AdminBreakdownChart from "@/components/admin/AdminBreakdownChart";
import AdminUserTrendChart from "@/components/admin/AdminUserTrendChart";
import AdminValueTrendChart from "@/components/admin/AdminValueTrendChart";
import AnalyticsStatCard from "@/components/analytics/AnalyticsStatCard";
import LogoutConfirmModal from "@/components/common/LogoutConfirmModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogoutMutation } from "@/features/auth/authApiSlice";
import { useGetAdminOverviewQuery } from "@/features/admin/adminApiSlice";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const ADMIN_DAYS = 14;

const Admin = () => {
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { data, isLoading, isError, refetch } = useGetAdminOverviewQuery({
    days: ADMIN_DAYS,
  });

  const onLogout = async () => {
    try {
      await logout().unwrap();
      toast.success("Logged out");
      setIsLogoutModalOpen(false);
      navigate("/auth/login", { replace: true });
    } catch {
      toast.error("Logout failed", { description: "Please try again." });
    }
  };

  const summary = data?.summary;
  const statCards = summary
    ? [
        {
          label: "Total Users",
          value: `${summary.totalUsers}`,
          hint: `${summary.adminUsers} admin accounts and ${summary.activeUsers} active users in the last ${ADMIN_DAYS} days.`,
        },
        {
          label: "Verified Users",
          value: `${summary.verifiedUsers}`,
          hint: `${summary.totalUsers - summary.verifiedUsers} accounts still have not completed verification.`,
        },
        {
          label: "Active Users",
          value: `${summary.activeUsers}`,
          hint: "Users who earned XP recently, which is a simple signal for real engagement.",
        },
        {
          label: "XP Gained",
          value: `${summary.xpGained}`,
          hint: `Total XP awarded across habits, tasks, and pomodoro in the last ${ADMIN_DAYS} days.`,
        },
      ]
    : [];

  return (
    <div className="animate-fade-in mx-auto mt-6 w-full space-y-6 px-4 sm:px-5 xl:max-w-7xl xl:px-0">
      <section className="animate-drop-in flex items-start justify-between gap-4 rounded-[1.2rem] border border-[#ddd6c8] bg-[#fffdfa] px-5 py-5 shadow-[0_10px_26px_rgba(57,52,43,0.06)]">
        <div>
          <p className="font-secondary text-sm font-semibold uppercase tracking-[0.16em] text-[#8a826f]">
            Admin
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={() => setIsLogoutModalOpen(true)}
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </section>

      {isError ? (
        <Card className="rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-secondary text-lg font-semibold text-[#304034]">
                Couldn&apos;t load admin overview
              </p>
              <p className="text-sm text-[#7b7467]">
                Try again and I&apos;ll pull the latest platform numbers.
              </p>
            </div>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="animate-drop-in animate-delay-75 grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        {isLoading && !summary
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[130px] rounded-[1.2rem]" />
            ))
          : statCards.map((card) => <AnalyticsStatCard key={card.label} {...card} />)}
      </section>

      {data ? (
        <>
          <section className="animate-drop-in animate-delay-150 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <AdminUserTrendChart days={data.days} data={data.userTrend} />
            <AdminValueTrendChart
              title="Community XP"
              description="Positive XP awarded across the whole app over time."
              valueLabel="XP"
              valueSuffix=" XP"
              data={data.xpTrend.map((point) => ({
                label: point.label,
                value: point.xpGained,
              }))}
            />
          </section>

          <section className="animate-drop-in animate-delay-225 grid gap-5 xl:grid-cols-2">
            <AdminBreakdownChart
              title="XP Source Mix"
              description="Which product areas are contributing the most XP right now."
              valueSuffix=" XP"
              data={data.xpSourceBreakdown}
            />
            <AdminBreakdownChart
              title="Platform Usage Mix"
              description="A simple count of the system objects and sessions being created."
              data={data.platformBreakdown}
            />
          </section>
        </>
      ) : null}

      <LogoutConfirmModal
        open={isLogoutModalOpen}
        isSubmitting={isLoggingOut}
        onCancel={() => setIsLogoutModalOpen(false)}
        onConfirm={onLogout}
      />
    </div>
  );
};

export default Admin;
