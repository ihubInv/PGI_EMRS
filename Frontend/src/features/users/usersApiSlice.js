import { apiSlice } from '../../app/api/apiSlice';

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: ({ page = 1, limit = 10, ...filters }) => ({
        url: '/users',
        params: { page, limit, ...filters },
      }),
      providesTags: ['User'],
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    createUser: builder.mutation({
      query: (userData) => ({
        url: '/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User', 'Stats'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'Stats'],
    }),
    getUserStats: builder.query({
      query: () => '/users/stats',
      providesTags: ['Stats'],
    }),
    activateUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/activate`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }, 'User'],
    }),
    deactivateUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/deactivate`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }, 'User'],
    }),
    resetUserPassword: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/${id}/reset-password`,
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserStatsQuery,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useResetUserPasswordMutation,
} = usersApiSlice;

