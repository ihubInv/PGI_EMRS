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
    verifyLoginOTP: builder.mutation({
      query: (data) => ({
        url: '/users/verify-login-otp',
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
      invalidatesTags: ['User'],
    }),
    disable2FA: builder.mutation({
      query: (data) => ({
        url: '/users/disable-2fa',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useVerifyLoginOTPMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useEnable2FAMutation,
  useDisable2FAMutation,
} = authApiSlice;

