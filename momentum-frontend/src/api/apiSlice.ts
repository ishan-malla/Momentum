import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";
import { logOut, setCredentials } from "@/features/auth/authSlice";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  "http://localhost:3000/api";

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

type RefreshResponse = {
  user: RootState["auth"]["user"];
  token: string;
};

type BaseQueryResult = Awaited<ReturnType<typeof baseQuery>>;

let refreshPromise: Promise<BaseQueryResult> | null = null;

const refreshSession = async (
  api: { dispatch: (action: unknown) => void; getState: () => unknown },
  extraOptions: unknown,
) => {
  if (!refreshPromise) {
    refreshPromise = Promise.resolve(
      baseQuery(
        { url: "/auth/refresh", method: "POST" },
        api as Parameters<typeof baseQuery>[1],
        extraOptions as Parameters<typeof baseQuery>[2],
      ),
    ).finally(() => {
      refreshPromise = null;
    });
  }

  const refreshResult = await refreshPromise!;
  if (refreshResult.data) {
    const data = refreshResult.data as RefreshResponse;
    api.dispatch(setCredentials({ user: data.user, token: data.token }));
  }

  return refreshResult;
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshResult = await refreshSession(api, extraOptions);

    if (refreshResult.data) {
      result = await baseQuery(args, api, extraOptions);
    } else {
      const state = api.getState() as RootState;
      if (!state.auth.token) {
        api.dispatch(logOut());
      }
    }
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Habits", "Pomodoro", "Tasks", "Friends"],
  endpoints: () => ({}),
});
