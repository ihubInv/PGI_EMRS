import { apiSlice } from '../../app/api/apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    verify2FA: builder.mutation({
      query: (data) => ({
        url: '/users/verify-2fa',
        method: 'POST',
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/users/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    getProfile: builder.query({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: '/users/change-password',
        method: 'PUT',
        body: data,
      }),
    }),
    enable2FA: builder.mutation({
      query: () => ({
        url: '/users/enable-2fa',
        method: 'POST',
      }),
    }),
    disable2FA: builder.mutation({
      query: (data) => ({
        url: '/users/disable-2fa',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useVerify2FAMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useEnable2FAMutation,
  useDisable2FAMutation,
} = authApiSlice;

