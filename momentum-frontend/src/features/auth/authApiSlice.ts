import { apiSlice } from "@/api/apiSlice";
import type { User } from "./authSlice";
import { setCredentials, logOut } from "./authSlice";
import type { RootState } from "@/store/store";

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  message: string;
  user: User;
  token: string;
};

export type SignupResponse = {
  message: string;
  user: User;
};

export type SignupRequest = {
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
};

export type verifyOTPRequest = {
  email: string;
  otp: string;
};

export type ResendOtpRequest = {
  email: string;
};

export type ForgetPasswordRequest = {
  email: string;
};

export type VerifyResetOtpRequest = {
  email: string;
  otp: string;
};

export type ResetPasswordRequest = {
  email: string;
  newPassword: string;
};

export type ProfileResponse = {
  profile: User;
};

export type ProfileStatsResponse = {
  progress: Pick<User, "level" | "xp" | "totalXp" | "levelGoal">;
  periods: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
};

export type UpdateProfileRequest = {
  username?: string;
  bio?: string;
};

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    signup: builder.mutation<SignupResponse, SignupRequest>({
      query: (credentials) => ({
        url: "/auth/signup",
        method: "POST",
        body: credentials,
      }),
    }),
    refresh: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ user: data.user, token: data.token }));
        } catch {
          dispatch(logOut());
        }
      },
    }),

    verifyOTP: builder.mutation<AuthResponse, verifyOTPRequest>({
      query: (body) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ user: data.user, token: data.token }));
        } catch {
          // no-op
        }
      },
    }),
    resendOTP: builder.mutation<{ message: string }, ResendOtpRequest>({
      query: (body) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body,
      }),
    }),
    forgetPassword: builder.mutation<
      { message: string },
      ForgetPasswordRequest
    >({
      query: (body) => ({
        url: "/auth/forget-password",
        method: "POST",
        body,
      }),
    }),
    verifyResetOTP: builder.mutation<
      { message: string },
      VerifyResetOtpRequest
    >({
      query: (body) => ({
        url: "/auth/verify-reset-otp",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
    getProfile: builder.query<ProfileResponse, void>({
      query: () => ({
        url: "/profile",
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),
    getProfileStats: builder.query<ProfileStatsResponse, void>({
      query: () => ({
        url: "/profile/stats",
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation<
      { message: string; profile: User },
      UpdateProfileRequest
    >({
      query: (body) => ({
        url: "/profile",
        method: "PATCH",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const token = (getState() as RootState).auth.token;
          if (!token) return;
          dispatch(setCredentials({ user: data.profile, token }));
        } catch {
          // no-op
        }
      },
      invalidatesTags: ["Profile"],
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logOut());
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useRefreshMutation,
  useLogoutMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useForgetPasswordMutation,
  useVerifyResetOTPMutation,
  useResetPasswordMutation,
  useGetProfileQuery,
  useGetProfileStatsQuery,
  useUpdateProfileMutation,
} = authApiSlice;
