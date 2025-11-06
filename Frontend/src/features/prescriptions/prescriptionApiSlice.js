import { apiSlice } from '../../app/api/apiSlice';

export const prescriptionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPrescriptionsByProformaId: builder.query({
      query: (proformaId) => `/prescriptions/proforma/${proformaId}`,
      providesTags: (result, error, proformaId) => [
        { type: 'Prescription', id: `proforma-${proformaId}` },
        'Prescription',
      ],
    }),
    getPrescriptionById: builder.query({
      query: (id) => `/prescriptions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Prescription', id }],
    }),
    createPrescription: builder.mutation({
      query: (prescriptionData) => ({
        url: '/prescriptions',
        method: 'POST',
        body: prescriptionData,
      }),
      invalidatesTags: (result, error, { clinical_proforma_id }) => [
        { type: 'Prescription', id: `proforma-${clinical_proforma_id}` },
        'Prescription',
      ],
    }),
    createBulkPrescriptions: builder.mutation({
      query: ({ clinical_proforma_id, prescriptions }) => ({
        url: '/prescriptions/bulk',
        method: 'POST',
        body: { clinical_proforma_id, prescriptions },
      }),
      invalidatesTags: (result, error, { clinical_proforma_id }) => [
        { type: 'Prescription', id: `proforma-${clinical_proforma_id}` },
        'Prescription',
      ],
    }),
    updatePrescription: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/prescriptions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Prescription', id }, 'Prescription'],
    }),
    deletePrescription: builder.mutation({
      query: (id) => ({
        url: `/prescriptions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Prescription'],
    }),
  }),
});

export const {
  useGetPrescriptionsByProformaIdQuery,
  useGetPrescriptionByIdQuery,
  useCreatePrescriptionMutation,
  useCreateBulkPrescriptionsMutation,
  useUpdatePrescriptionMutation,
  useDeletePrescriptionMutation,
} = prescriptionApiSlice;

