import { apiSlice } from '../../app/api/apiSlice';

export const adlApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllADLFiles: builder.query({
      query: ({ page = 1, limit = 10, ...filters }) => ({
        url: '/adl-files',
        params: { page, limit, ...filters },
      }),
      providesTags: ['ADL'],
    }),
    getADLFileById: builder.query({
      query: (id) => `/adl-files/${id}`,
      providesTags: (result, error, id) => [{ type: 'ADL', id }],
    }),
    getADLFileByADLNo: builder.query({
      query: (adlNo) => `/adl-files/adl-no/${adlNo}`,
      providesTags: (result, error, adlNo) => [{ type: 'ADL', id: adlNo }],
    }),
    getADLFileByPatientId: builder.query({
      query: (patientId) => `/adl-files/patient/${patientId}`,
      providesTags: (result, error, patientId) => [{ type: 'ADL', id: `patient-${patientId}` }],
    }),
    updateADLFile: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/adl-files/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'ADL', id }, 'ADL'],
    }),
    retrieveFile: builder.mutation({
      query: (id) => ({
        url: `/adl-files/${id}/retrieve`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'ADL', id }, 'ADL', 'Stats'],
    }),
    returnFile: builder.mutation({
      query: (id) => ({
        url: `/adl-files/${id}/return`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'ADL', id }, 'ADL', 'Stats'],
    }),
    archiveFile: builder.mutation({
      query: (id) => ({
        url: `/adl-files/${id}/archive`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'ADL', id }, 'ADL', 'Stats'],
    }),
    getFileMovementHistory: builder.query({
      query: (id) => `/adl-files/${id}/movements`,
      providesTags: (result, error, id) => [{ type: 'ADL', id: `movements-${id}` }],
    }),
    getFilesToRetrieve: builder.query({
      query: () => '/adl-files/to-retrieve',
      providesTags: ['ADL'],
    }),
    getActiveFiles: builder.query({
      query: () => '/adl-files/active',
      providesTags: ['ADL'],
    }),
    getADLStats: builder.query({
      query: () => '/adl-files/stats',
      providesTags: ['Stats'],
    }),
    getFilesByStatus: builder.query({
      query: () => '/adl-files/stats/by-status',
      providesTags: ['Stats'],
    }),
  }),
});

export const {
  useGetAllADLFilesQuery,
  useGetADLFileByIdQuery,
  useGetADLFileByADLNoQuery,
  useGetADLFileByPatientIdQuery,
  useUpdateADLFileMutation,
  useRetrieveFileMutation,
  useReturnFileMutation,
  useArchiveFileMutation,
  useGetFileMovementHistoryQuery,
  useGetFilesToRetrieveQuery,
  useGetActiveFilesQuery,
  useGetADLStatsQuery,
  useGetFilesByStatusQuery,
} = adlApiSlice;

