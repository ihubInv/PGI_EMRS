import { apiSlice } from '../../app/api/apiSlice';

export const outpatientApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllOutpatientRecords: builder.query({
      query: ({ page = 1, limit = 10, ...filters }) => ({
        url: '/outpatient-records',
        params: { page, limit, ...filters },
      }),
      providesTags: ['Outpatient'],
    }),
    getOutpatientRecordById: builder.query({
      query: (id) => `/outpatient-records/${id}`,
      providesTags: (result, error, id) => [{ type: 'Outpatient', id }],
    }),
    getOutpatientRecordByPatientId: builder.query({
      query: (patientId) => `/outpatient-records/patient/${patientId}`,
      providesTags: (result, error, patientId) => [{ type: 'Outpatient', id: `patient-${patientId}` }],
    }),
    createOutpatientRecord: builder.mutation({
      query: (recordData) => ({
        url: '/outpatient-records',
        method: 'POST',
        body: recordData,
      }),
      invalidatesTags: ['Outpatient', 'Patient', 'Stats'],
    }),
    updateOutpatientRecord: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/outpatient-records/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Outpatient', id }, 'Outpatient'],
    }),
    deleteOutpatientRecord: builder.mutation({
      query: (id) => ({
        url: `/outpatient-records/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Outpatient', 'Stats'],
    }),
    getOutpatientStats: builder.query({
      query: () => '/outpatient-records/stats',
      providesTags: ['Stats'],
    }),
    getMyRecords: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/outpatient-records/my-records',
        params: { page, limit },
      }),
      providesTags: ['Outpatient'],
    }),
  }),
});

export const {
  useGetAllOutpatientRecordsQuery,
  useGetOutpatientRecordByIdQuery,
  useGetOutpatientRecordByPatientIdQuery,
  useCreateOutpatientRecordMutation,
  useUpdateOutpatientRecordMutation,
  useDeleteOutpatientRecordMutation,
  useGetOutpatientStatsQuery,
  useGetMyRecordsQuery,
} = outpatientApiSlice;

