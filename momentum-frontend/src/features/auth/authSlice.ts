import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserProgress } from "@/features/gamification/gamificationTypes";
import type { RootState } from "@/store/store";

export type User = UserProgress & {
  id: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
  friendCode?: string;
  email: string;
  role: "user" | "admin";
  isVerified: boolean;
};

export type AuthState = {
  user: User | null;
  token: string | null;
};

const initialState: AuthState = { user: null, token: null };
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthState>) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
    },
    updateCurrentUser: (state, action: PayloadAction<Partial<User>>) => {
      if (!state.user) return;
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },

    logOut: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setCredentials, updateCurrentUser, logOut } = authSlice.actions;

export default authSlice.reducer;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;
