import { api } from "../api";

export interface UpdateProfileRequest {
  name: string;
  email: string;
  theme?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateThemeRequest {
  theme: string;
}

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<any, UpdateProfileRequest>({
      query: (userData) => ({
        url: "users/profile",
        method: "PUT",
        body: userData,
      }),
    }),
    updateTheme: builder.mutation<{ theme: string }, UpdateThemeRequest>({
      query: (themeData) => ({
        url: "users/theme",
        method: "PUT",
        body: themeData,
      }),
    }),
    updatePassword: builder.mutation<void, UpdatePasswordRequest>({
      query: (passwordData) => ({
        url: "users/password",
        method: "PUT",
        body: passwordData,
      }),
    }),
    deleteAccount: builder.mutation<void, void>({
      query: () => ({
        url: "users/account",
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useUpdateThemeMutation,
  useUpdatePasswordMutation,
  useDeleteAccountMutation,
} = userApi;