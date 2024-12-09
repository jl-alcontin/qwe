import { api } from '../api';
import { updateTheme } from '../slices/authSlice';

export const themeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentTheme: builder.query<{ theme: string }, void>({
      query: () => 'users/theme',
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(updateTheme(data.theme));
        } catch (error) {
          console.error('Failed to fetch theme:', error);
        }
      },
    }),
    updateTheme: builder.mutation<{ theme: string }, { theme: string }>({
      query: (data) => ({
        url: 'users/theme',
        method: 'PUT',
        body: data,
      }),
      async onQueryStarted({ theme }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(updateTheme(theme));
        } catch (error) {
          console.error('Failed to update theme:', error);
        }
      },
    }),
  }),
});

export const {
  useGetCurrentThemeQuery,
  useUpdateThemeMutation,
} = themeApi;