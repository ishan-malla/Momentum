import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import type { LevelUpData } from "@/features/gamification/gamificationTypes";

type ToastEvent = {
  id: number;
  xpChange: number;
};

type GamificationState = {
  lastToastEvent: ToastEvent | null;
  activeLevelUp: LevelUpData | null;
  nextToastId: number;
};

const initialState: GamificationState = {
  lastToastEvent: null,
  activeLevelUp: null,
  nextToastId: 1,
};

const gamificationSlice = createSlice({
  name: "gamification",
  initialState,
  reducers: {
    pushGamificationFeedback: (
      state,
      action: PayloadAction<{
        xpChange: number;
        levelUpOccurred: boolean;
        levelUpData?: LevelUpData | null;
      }>,
    ) => {
      const { xpChange, levelUpOccurred, levelUpData } = action.payload;

      if (xpChange !== 0) {
        state.lastToastEvent = {
          id: state.nextToastId,
          xpChange,
        };
        state.nextToastId += 1;
      }

      if (levelUpOccurred && levelUpData) {
        state.activeLevelUp = levelUpData;
      }
    },
    dismissLevelUp: (state) => {
      state.activeLevelUp = null;
    },
  },
});

export const { pushGamificationFeedback, dismissLevelUp } =
  gamificationSlice.actions;

export default gamificationSlice.reducer;

export const selectGamificationToastEvent = (state: RootState) =>
  state.gamification.lastToastEvent;

export const selectActiveLevelUp = (state: RootState) =>
  state.gamification.activeLevelUp;
