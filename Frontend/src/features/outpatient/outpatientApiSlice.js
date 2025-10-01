import { apiSlice } from '../../app/api/apiSlice';

export const outpatientApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllOutpatientRecords: builder.query({
      query: ({ page = 1, limit = 10, ...filters }) => ({
        url: '/outpatient-record',
        params: { page, limit, ...filters },
      }),
      providesTags: ['Outpatient'],
    }),
    getOutpatientRecordById: builder.query({
      query: (id) => `/outpatient-record/${id}`,
      providesTags: (result, error, id) => [{ type: 'Outpatient', id }],
    }),
    getOutpatientRecordByPatientId: builder.query({
      query: (patientId) => `/outpatient-record/patient/${patientId}`,
      providesTags: (result, error, patientId) => [{ type: 'Outpatient', id: `patient-${patientId}` }],
    }),
    createOutpatientRecord: builder.mutation({
      query: (recordData) => ({
        url: '/outpatient-record',
        method: 'POST',
        body: recordData,
      }),
      invalidatesTags: ['Outpatient', 'Patient', 'Stats'],
    }),
    updateOutpatientRecord: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/outpatient-record/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Outpatient', id }, 'Outpatient'],
    }),
    deleteOutpatientRecord: builder.mutation({
      query: (id) => ({
        url: `/outpatient-record/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Outpatient', 'Stats'],
    }),
    getOutpatientStats: builder.query({
      query: () => '/outpatient-record/stats',
      providesTags: ['Stats'],
    }),
    getMyRecords: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/outpatient-record/my-records',
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

