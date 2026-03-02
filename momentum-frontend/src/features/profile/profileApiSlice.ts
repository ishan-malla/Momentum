import { apiSlice } from "@/api/apiSlice";
import type { RootState } from "@/store/store";
import type { User } from "@/features/auth/authSlice";
import { setCredentials } from "@/features/auth/authSlice";

type ProfileMutationResponse = {
  message: string;
  profile: User;
};

const syncProfileInAuthStore = async (
  dispatch: (action: unknown) => void,
  getState: () => unknown,
  queryFulfilled: Promise<{ data: ProfileMutationResponse }>,
) => {
  try {
    const { data } = await queryFulfilled;
    const token = (getState() as RootState).auth.token;
    if (!token) return;
    dispatch(setCredentials({ user: data.profile, token }));
  } catch {
    // no-op
  }
};

export const profileApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadAvatar: builder.mutation<ProfileMutationResponse, { imageDataUrl: string }>({
      query: (body) => ({
        url: "/profile/avatar",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, getState, queryFulfilled }) {
        await syncProfileInAuthStore(dispatch, getState, queryFulfilled);
      },
    }),
    removeAvatar: builder.mutation<ProfileMutationResponse, void>({
      query: () => ({
        url: "/profile/avatar",
        method: "DELETE",
      }),
      async onQueryStarted(_arg, { dispatch, getState, queryFulfilled }) {
        await syncProfileInAuthStore(dispatch, getState, queryFulfilled);
      },
    }),
  }),
});

export const { useUploadAvatarMutation, useRemoveAvatarMutation } = profileApiSlice;
