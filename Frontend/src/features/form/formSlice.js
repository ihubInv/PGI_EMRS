import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  patientRegistration: {
    // Patient Info
    name: '',
    sex: '',
    actual_age: '',
    assigned_room: '',
    assigned_doctor_id: '',
    cr_no: '',
    psy_no: '',

    // Personal Information
    age_group: '',
    marital_status: '',
    year_of_marriage: '',
    no_of_children: '',

    // Occupation & Education
    occupation: '',
    actual_occupation: '',
    education_level: '',
    completed_years_of_education: '',

    // Financial Information
    patient_income: '',
    family_income: '',

    // Family Information
    religion: '',
    family_type: '',
    locality: '',
    head_name: '',
    head_age: '',
    head_relationship: '',
    head_education: '',
    head_occupation: '',
    head_income: '',

    // Referral & Mobility
    distance_from_hospital: '',
    mobility: '',
    referred_by: '',
    exact_source: '',

    // Contact Information
    present_address: '',
    permanent_address: '',
    local_address: '',
    school_college_office: '',
    contact_number: '',
  },
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    updatePatientRegistrationForm: (state, action) => {
      state.patientRegistration = {
        ...state.patientRegistration,
        ...action.payload,
      };
    },
    resetPatientRegistrationForm: (state) => {
      state.patientRegistration = initialState.patientRegistration;
    },
  },
});

export const { updatePatientRegistrationForm, resetPatientRegistrationForm } = formSlice.actions;

export const selectPatientRegistrationForm = (state) => state.form.patientRegistration;

export default formSlice.reducer;
