import { apiSlice } from "@/api/apiSlice";

export type AdminSummary = {
  totalUsers: number;
  verifiedUsers: number;
  adminUsers: number;
  activeUsers: number;
  xpGained: number;
};

export type AdminUserTrendPoint = {
  date: string;
  label: string;
  newUsers: number;
  totalUsers: number;
};

export type AdminXpTrendPoint = {
  date: string;
  label: string;
  xpGained: number;
};

export type AdminBreakdownPoint = {
  label: string;
  value: number;
  share: number;
};

export type AdminOverviewResponse = {
  days: number;
  summary: AdminSummary;
  userTrend: AdminUserTrendPoint[];
  xpTrend: AdminXpTrendPoint[];
  xpSourceBreakdown: AdminBreakdownPoint[];
  platformBreakdown: AdminBreakdownPoint[];
};

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminOverview: builder.query<AdminOverviewResponse, { days?: number } | void>({
      query: (params) => ({
        url: "/admin/overview",
        method: "GET",
        params: params ?? undefined,
      }),
    }),
  }),
});

export const { useGetAdminOverviewQuery } = adminApiSlice;
