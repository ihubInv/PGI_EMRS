import { apiSlice } from '../../app/api/apiSlice';

export const clinicalApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Dynamic options for clinical groups
    getClinicalOptions: builder.query({
      query: (group) => `/clinical-proformas/options/${group}`,
      providesTags: (result, error, group) => [{ type: 'ClinicalOptions', id: group }],
      transformResponse: (resp) => resp?.data?.options || [],
    }),
    addClinicalOption: builder.mutation({
      query: ({ group, label }) => ({
        url: `/clinical-proformas/options/${group}`,
        method: 'POST',
        body: { label },
      }),
      invalidatesTags: (result, error, { group }) => [{ type: 'ClinicalOptions', id: group }],
    }),
    deleteClinicalOption: builder.mutation({
      query: ({ group, label }) => ({
        url: `/clinical-proformas/options/${group}`,
        method: 'DELETE',
        body: { label },
      }),
      invalidatesTags: (result, error, { group }) => [{ type: 'ClinicalOptions', id: group }],
    }),
    getAllClinicalProformas: builder.query({
      query: ({ page = 1, limit = 10, ...filters }) => ({
        url: '/clinical-proformas',
        params: { page, limit, ...filters },
      }),
      providesTags: ['Clinical'],
    }),
    getClinicalProformaById: builder.query({
      query: (id) => `/clinical-proformas/${id}`,
      providesTags: (result, error, id) => [{ type: 'Clinical', id }],
    }),
    getClinicalProformaByPatientId: builder.query({
      query: (patientId) => `/clinical-proformas/patient/${patientId}`,
      providesTags: (result, error, patientId) => [{ type: 'Clinical', id: `patient-${patientId}` }],
    }),
    createClinicalProforma: builder.mutation({
      query: (proformaData) => ({
        url: '/clinical-proformas',
        method: 'POST',
        body: proformaData,
      }),
      invalidatesTags: ['Clinical', 'Patient', 'Stats', 'ADL'],
    }),
    updateClinicalProforma: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/clinical-proformas/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Clinical', id }, 'Clinical'],
    }),
    deleteClinicalProforma: builder.mutation({
      query: (id) => ({
        url: `/clinical-proformas/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Clinical', 'Stats'],
    }),
    getClinicalStats: builder.query({
      query: () => '/clinical-proformas/stats',
      providesTags: ['Stats'],
    }),
    getMyProformas: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/clinical-proformas/my-proformas',
        params: { page, limit },
      }),
      providesTags: ['Clinical'],
    }),
    getComplexCases: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/clinical-proformas/complex-cases',
        params: { page, limit },
      }),
      providesTags: ['Clinical'],
    }),
    getCasesBySeverity: builder.query({
      query: () => '/clinical-proformas/severity-stats',
      providesTags: ['Stats'],
    }),
    getCasesByDecision: builder.query({
      query: () => '/clinical-proformas/decision-stats',
      providesTags: ['Stats'],
    }),
    getCasesByRoom: builder.query({
      query: ({ room_no, page = 1, limit = 10 }) => ({
        url: `/clinical-proformas/room/${room_no}`,
        params: { page, limit },
      }),
      providesTags: ['Clinical'],
    }),
  }),
});

export const {
  useGetAllClinicalProformasQuery,
  useGetClinicalProformaByIdQuery,
  useGetClinicalProformaByPatientIdQuery,
  useCreateClinicalProformaMutation,
  useUpdateClinicalProformaMutation,
  useDeleteClinicalProformaMutation,
  useGetClinicalStatsQuery,
  useGetMyProformasQuery,
  useGetComplexCasesQuery,
  useGetCasesBySeverityQuery,
  useGetCasesByDecisionQuery,
  useGetCasesByRoomQuery,
  useGetClinicalOptionsQuery,
  useAddClinicalOptionMutation,
  useDeleteClinicalOptionMutation,
} = clinicalApiSlice;

