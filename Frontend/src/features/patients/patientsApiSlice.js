import { apiSlice } from '../../app/api/apiSlice';

export const patientsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllPatients: builder.query({
      query: ({ page = 1, limit = 10, ...filters }) => ({
        url: '/patients',
        params: { page, limit, ...filters },
      }),
      providesTags: ['Patient'],
    }),
    getPatientById: builder.query({
      query: (id) => `/patients/${id}`,
      providesTags: (result, error, id) => [{ type: 'Patient', id }],
    }),
    searchPatients: builder.query({
      query: ({ search, page = 1, limit = 10 }) => ({
        url: '/patients/search',
        params: { search, page, limit },
      }),
      providesTags: ['Patient'],
    }),
    createPatient: builder.mutation({
      query: (patientData) => ({
        url: '/patients',
        method: 'POST',
        body: patientData,
      }),
      invalidatesTags: ['Patient', 'Stats'],
    }),
    updatePatient: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/patients/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Patient', id }, 'Patient'],
    }),
    deletePatient: builder.mutation({
      query: (id) => ({
        url: `/patients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Patient', 'Stats'],
    }),
    getPatientStats: builder.query({
      query: () => '/patients/stats',
      providesTags: ['Stats'],
    }),
    getComplexPatients: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/patients/complex',
        params: { page, limit },
      }),
      providesTags: ['Patient'],
    }),
  }),
});

export const {
  useGetAllPatientsQuery,
  useGetPatientByIdQuery,
  useSearchPatientsQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useGetPatientStatsQuery,
  useGetComplexPatientsQuery,
} = patientsApiSlice;

