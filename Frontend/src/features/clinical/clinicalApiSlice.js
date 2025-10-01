import { apiSlice } from '../../app/api/apiSlice';

export const clinicalApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllClinicalProformas: builder.query({
      query: ({ page = 1, limit = 10, ...filters }) => ({
        url: '/clinical-proforma',
        params: { page, limit, ...filters },
      }),
      providesTags: ['Clinical'],
    }),
    getClinicalProformaById: builder.query({
      query: (id) => `/clinical-proforma/${id}`,
      providesTags: (result, error, id) => [{ type: 'Clinical', id }],
    }),
    getClinicalProformaByPatientId: builder.query({
      query: (patientId) => `/clinical-proforma/patient/${patientId}`,
      providesTags: (result, error, patientId) => [{ type: 'Clinical', id: `patient-${patientId}` }],
    }),
    createClinicalProforma: builder.mutation({
      query: (proformaData) => ({
        url: '/clinical-proforma',
        method: 'POST',
        body: proformaData,
      }),
      invalidatesTags: ['Clinical', 'Patient', 'Stats', 'ADL'],
    }),
    updateClinicalProforma: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/clinical-proforma/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Clinical', id }, 'Clinical'],
    }),
    deleteClinicalProforma: builder.mutation({
      query: (id) => ({
        url: `/clinical-proforma/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Clinical', 'Stats'],
    }),
    getClinicalStats: builder.query({
      query: () => '/clinical-proforma/stats',
      providesTags: ['Stats'],
    }),
    getMyProformas: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/clinical-proforma/my-proformas',
        params: { page, limit },
      }),
      providesTags: ['Clinical'],
    }),
    getComplexCases: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/clinical-proforma/complex-cases',
        params: { page, limit },
      }),
      providesTags: ['Clinical'],
    }),
    getCasesBySeverity: builder.query({
      query: () => '/clinical-proforma/stats/severity',
      providesTags: ['Stats'],
    }),
    getCasesByDecision: builder.query({
      query: () => '/clinical-proforma/stats/decision',
      providesTags: ['Stats'],
    }),
    getCasesByRoom: builder.query({
      query: ({ room_no, page = 1, limit = 10 }) => ({
        url: `/clinical-proforma/room/${room_no}`,
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
} = clinicalApiSlice;

