import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {  FiX, FiEdit } from 'react-icons/fi';
import {
  useGetPatientByIdQuery,
  useUpdatePatientMutation,
  useAssignPatientMutation,
} from '../../features/patients/patientsApiSlice';
import { useGetClinicalProformaByPatientIdQuery } from '../../features/clinical/clinicalApiSlice';
import { useGetADLFileByPatientIdQuery } from '../../features/adl/adlApiSlice';
import { useGetDoctorsQuery } from '../../features/users/usersApiSlice';
import { selectCurrentUser } from '../../features/auth/authSlice';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import PatientDetailsView from './PatientDetailsView';
import PatientDetailsEdit from './PatientDetailsEdit';



const PatientDetails = () => {
  const { id } = useParams();
  const user = useSelector(selectCurrentUser);
  
  // Parse and validate patient ID from URL
  const patientId = id ? parseInt(id, 10) : null;
  
  // Validate ID is a valid number
  if (!patientId || isNaN(patientId) || patientId <= 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Invalid patient ID in URL</p>
        <Button 
          className="mt-4" 
          onClick={() => navigate('/patients')}
        >
          Back to Patients
        </Button>
      </div>
    );
  }
  
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const returnTab = searchParams.get('returnTab'); // Get returnTab from URL
  const [isEditing, setIsEditing] = useState(false);

  // Check for edit query parameter on mount
  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setIsEditing(true);
      // Remove the edit parameter from URL
      searchParams.delete('edit');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  // Ensure queries refetch when ID changes by using skip option if id is invalid
  const { data: patientData, isLoading: patientLoading, error: patientError } = useGetPatientByIdQuery(patientId, {
    skip: !patientId || isNaN(patientId) || patientId <= 0, // Skip query if id is not available or invalid
  });
  const { data: clinicalData } = useGetClinicalProformaByPatientIdQuery(patientId, {
    skip: !patientId || isNaN(patientId) || patientId <= 0,
  });
  const { data: adlData } = useGetADLFileByPatientIdQuery(patientId, {
    skip: !patientId || isNaN(patientId) || patientId <= 0,
  });
  
  const { data: usersData } = useGetDoctorsQuery({ page: 1, limit: 100 });

  const [updatePatient] = useUpdatePatientMutation();

  const [assignPatient] = useAssignPatientMutation();

  const [formData, setFormData] = useState({
    // Basic patient info
    name: '',
    sex: '',
    actual_age: '',
    assigned_room: '',
    assigned_doctor_id: '',
    contact_number: '',
    
    // Personal information
    age_group: '',
    marital_status: '',
    year_of_marriage: '',
    no_of_children: '',
    no_of_children_male: '',
    no_of_children_female: '',
    
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
    seen_in_walk_in_on: '',
    worked_up_on: '',
    
    // Contact Information (legacy fields)
    present_address: '',
    permanent_address: '',
    local_address: '',
    school_college_office: '',
    
    // Address Information (detailed)
    present_address_line_1: '',
    present_address_line_2: '',
    present_city_town_village: '',
    present_district: '',
    present_state: '',
    present_pin_code: '',
    present_country: '',
    
    permanent_address_line_1: '',
    permanent_address_line_2: '',
    permanent_city_town_village: '',
    permanent_district: '',
    permanent_state: '',
    permanent_pin_code: '',
    permanent_country: '',
    
    address_line_1: '',
    address_line_2: '',
    city_town_village: '',
    district: '',
    state: '',
    pin_code: '',
    country: '',
    
    // Registration Details
    department: '',
    unit_consit: '',
    room_no: '',
    serial_no: '',
    file_no: '',
    unit_days: '',
    
    // Additional Fields
    category: '',
    special_clinic_no: '',
  });

  // Reset form data when patient ID changes
  useEffect(() => {
    if (!patientId) return;
    
    console.log(`[PatientDetails] Resetting form data for patient ID: ${patientId}`);
    
    // Reset form data to initial state when ID changes
    setFormData({
      // Basic patient info
      name: '',
      sex: '',
      actual_age: '',
      assigned_room: '',
      assigned_doctor_id: '',
      contact_number: '',
      
      // Personal information
      age_group: '',
      marital_status: '',
      year_of_marriage: '',
      no_of_children: '',
      no_of_children_male: '',
      no_of_children_female: '',
      
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
      seen_in_walk_in_on: '',
      worked_up_on: '',
      
      // Contact Information (legacy fields)
      present_address: '',
      permanent_address: '',
      local_address: '',
      school_college_office: '',
      
      // Address Information (detailed)
      present_address_line_1: '',
      present_address_line_2: '',
      present_city_town_village: '',
      present_district: '',
      present_state: '',
      present_pin_code: '',
      present_country: '',
      
      permanent_address_line_1: '',
      permanent_address_line_2: '',
      permanent_city_town_village: '',
      permanent_district: '',
      permanent_state: '',
      permanent_pin_code: '',
      permanent_country: '',
      
      address_line_1: '',
      address_line_2: '',
      city_town_village: '',
      district: '',
      state: '',
      pin_code: '',
      country: '',
      
      // Registration Details
      department: '',
      unit_consit: '',
      room_no: '',
      serial_no: '',
      file_no: '',
      unit_days: '',
      
      // Additional Fields
      category: '',
      special_clinic_no: '',
    });
  }, [patientId]); // Reset when patientId changes

  // Update form data when patient data changes
  // This ensures ALL patient fields from the database are populated into formData
  useEffect(() => {
    if (patientData?.data?.patient) {
      const patient = patientData.data.patient;
      
      // Verify the patient ID matches the URL ID to prevent showing wrong patient data
      const patientDataId = patient.id ? parseInt(patient.id, 10) : null;
      if (patientDataId && patientDataId !== patientId) {
        console.error(`[PatientDetails] CRITICAL: Patient ID mismatch! URL ID: ${patientId}, Patient data ID: ${patientDataId}`);
        toast.error(`Data mismatch: Expected patient ID ${patientId}, but received ${patientDataId}`);
        return; // Don't update form data if IDs don't match
      }
      
      console.log(`[PatientDetails] Updating form data for patient ID: ${patientDataId || patientId}`);
      
      // Patient data updated - use patient data directly with fallbacks to empty string
      // This ensures all fields are available in formData for display
      setFormData(prev => ({
        ...prev,
        // Basic info
        name: patient.name ?? '',
        sex: patient.sex ?? '',
        actual_age: patient.actual_age ?? '',
        assigned_room: patient.assigned_room ?? '',
        assigned_doctor_id: patient.assigned_doctor_id ? String(patient.assigned_doctor_id) : '',
        contact_number: patient.contact_number ?? '',
        
        // Personal information
        age_group: patient.age_group ?? prev.age_group ?? '',
        marital_status: patient.marital_status ?? prev.marital_status ?? '',
        year_of_marriage: patient.year_of_marriage ?? prev.year_of_marriage ?? '',
        no_of_children: patient.no_of_children ?? prev.no_of_children ?? '',
        no_of_children_male: patient.no_of_children_male ?? prev.no_of_children_male ?? '',
        no_of_children_female: patient.no_of_children_female ?? prev.no_of_children_female ?? '',
        
        // Occupation & Education
        occupation: patient.occupation ?? prev.occupation ?? '',
        actual_occupation: patient.actual_occupation ?? prev.actual_occupation ?? '',
        education_level: patient.education_level ?? prev.education_level ?? '',
        completed_years_of_education: patient.completed_years_of_education ?? prev.completed_years_of_education ?? '',
        
        // Financial Information
        patient_income: patient.patient_income ?? prev.patient_income ?? '',
        family_income: patient.family_income ?? prev.family_income ?? '',
        
        // Family Information
        religion: patient.religion ?? prev.religion ?? '',
        family_type: patient.family_type ?? prev.family_type ?? '',
        locality: patient.locality ?? prev.locality ?? '',
        head_name: patient.head_name ?? prev.head_name ?? '',
        head_age: patient.head_age ?? prev.head_age ?? '',
        head_relationship: patient.head_relationship ?? prev.head_relationship ?? '',
        head_education: patient.head_education ?? prev.head_education ?? '',
        head_occupation: patient.head_occupation ?? prev.head_occupation ?? '',
        head_income: patient.head_income ?? prev.head_income ?? '',
        
        // Referral & Mobility
        distance_from_hospital: patient.distance_from_hospital ?? prev.distance_from_hospital ?? '',
        mobility: patient.mobility ?? prev.mobility ?? '',
        referred_by: patient.referred_by ?? prev.referred_by ?? '',
        exact_source: patient.exact_source ?? prev.exact_source ?? '',
        seen_in_walk_in_on: patient.seen_in_walk_in_on ?? prev.seen_in_walk_in_on ?? '',
        worked_up_on: patient.worked_up_on ?? prev.worked_up_on ?? '',
        
        // Legacy address fields
        present_address: patient.present_address ?? patient.present_address_line_1 ?? prev.present_address ?? '',
        permanent_address: patient.permanent_address ?? patient.permanent_address_line_1 ?? prev.permanent_address ?? '',
        local_address: patient.local_address ?? prev.local_address ?? '',
        school_college_office: patient.school_college_office ?? prev.school_college_office ?? '',
        
        // Detailed address fields - Present Address
        present_address_line_1: patient.present_address_line_1 ?? prev.present_address_line_1 ?? '',
        present_address_line_2: patient.present_address_line_2 ?? prev.present_address_line_2 ?? '',
        present_city_town_village: patient.present_city_town_village ?? prev.present_city_town_village ?? '',
        present_district: patient.present_district ?? prev.present_district ?? '',
        present_state: patient.present_state ?? prev.present_state ?? '',
        present_pin_code: patient.present_pin_code ?? prev.present_pin_code ?? '',
        present_country: patient.present_country ?? prev.present_country ?? '',
        
        // Detailed address fields - Permanent Address
        permanent_address_line_1: patient.permanent_address_line_1 ?? prev.permanent_address_line_1 ?? '',
        permanent_address_line_2: patient.permanent_address_line_2 ?? prev.permanent_address_line_2 ?? '',
        permanent_city_town_village: patient.permanent_city_town_village ?? prev.permanent_city_town_village ?? '',
        permanent_district: patient.permanent_district ?? prev.permanent_district ?? '',
        permanent_state: patient.permanent_state ?? prev.permanent_state ?? '',
        permanent_pin_code: patient.permanent_pin_code ?? prev.permanent_pin_code ?? '',
        permanent_country: patient.permanent_country ?? prev.permanent_country ?? '',
        
        // Detailed address fields - Quick Entry Address
        address_line_1: patient.address_line_1 ?? prev.address_line_1 ?? '',
        address_line_2: patient.address_line_2 ?? prev.address_line_2 ?? '',
        city_town_village: patient.city_town_village ?? prev.city_town_village ?? '',
        district: patient.district ?? prev.district ?? '',
        state: patient.state ?? prev.state ?? '',
        pin_code: patient.pin_code ?? prev.pin_code ?? '',
        country: patient.country ?? prev.country ?? '',
        
        // Registration details
        department: patient.department ?? prev.department ?? '',
        unit_consit: patient.unit_consit ?? prev.unit_consit ?? '',
        room_no: patient.room_no ?? prev.room_no ?? '',
        serial_no: patient.serial_no ?? prev.serial_no ?? '',
        file_no: patient.file_no ?? prev.file_no ?? '',
        unit_days: patient.unit_days ?? prev.unit_days ?? '',
        
        // Additional fields
        category: patient.category ?? prev.category ?? '',
        special_clinic_no: patient.special_clinic_no ?? prev.special_clinic_no ?? '',
      }));
    }
  }, [patientData, patientId]); // Add patientId as dependency

  // Update form data when outpatient record data changes
  useEffect(() => {
    if (patientData?.data?.record) {
      const record = patientData.data.record;
      
      // Verify the record belongs to the current patient
      const recordPatientId = record.patient_id ? parseInt(record.patient_id, 10) : null;
      if (recordPatientId && recordPatientId !== patientId) {
        console.warn(`[PatientDetails] Record patient ID mismatch: URL ID is ${patientId}, but record patient_id is ${recordPatientId}`);
        return; // Don't update form data if IDs don't match
      }
      
      console.log('[PatientDetails] Updating form data from outpatient record');
      setFormData(prev => ({
        ...prev,
        age_group: record.age_group || prev.age_group || '',
        marital_status: record.marital_status || prev.marital_status || '',
        year_of_marriage: record.year_of_marriage || prev.year_of_marriage || '',
        no_of_children: record.no_of_children || prev.no_of_children || '',
        occupation: record.occupation || prev.occupation || '',
        actual_occupation: record.actual_occupation || prev.actual_occupation || '',
        education_level: record.education_level || prev.education_level || '',
        completed_years_of_education: record.completed_years_of_education || prev.completed_years_of_education || '',
        patient_income: record.patient_income || prev.patient_income || '',
        family_income: record.family_income || prev.family_income || '',
        religion: record.religion || prev.religion || '',
        family_type: record.family_type || prev.family_type || '',
        locality: record.locality || prev.locality || '',
        head_name: record.head_name || prev.head_name || '',
        head_age: record.head_age || prev.head_age || '',
        head_relationship: record.head_relationship || prev.head_relationship || '',
        head_education: record.head_education || prev.head_education || '',
        head_occupation: record.head_occupation || prev.head_occupation || '',
        head_income: record.head_income || prev.head_income || '',
        distance_from_hospital: record.distance_from_hospital || prev.distance_from_hospital || '',
        mobility: record.mobility || prev.mobility || '',
        referred_by: record.referred_by || prev.referred_by || '',
        exact_source: record.exact_source || prev.exact_source || '',
        present_address: record.present_address || prev.present_address || '',
        permanent_address: record.permanent_address || prev.permanent_address || '',
        local_address: record.local_address || prev.local_address || '',
        school_college_office: record.school_college_office || prev.school_college_office || '',
        contact_number: record.contact_number || prev.contact_number || '',
      }));
    }
  }, [patientData, patientId]); // Add patientId as dependency



const handleSave = async () => {
  try {
    const patientPayload = {
      id: patientId,
      name: formData.name,
      sex: formData.sex,
      actual_age: parseInt(formData.actual_age),
      assigned_room: formData.assigned_room,
      contact_number: formData.contact_number,

      // Patient details
      age_group: formData.age_group,
      marital_status: formData.marital_status,
      year_of_marriage: formData.year_of_marriage ? parseInt(formData.year_of_marriage) : null,
      no_of_children: formData.no_of_children ? parseInt(formData.no_of_children) : null,
      no_of_children_male: formData.no_of_children_male ? parseInt(formData.no_of_children_male) : null,
      no_of_children_female: formData.no_of_children_female ? parseInt(formData.no_of_children_female) : null,
      occupation: formData.occupation,
      actual_occupation: formData.actual_occupation,
      education_level: formData.education_level,
      completed_years_of_education: formData.completed_years_of_education ? parseInt(formData.completed_years_of_education) : null,
      patient_income: formData.patient_income ? parseFloat(formData.patient_income) : null,
      family_income: formData.family_income ? parseFloat(formData.family_income) : null,

      // Addresses
      present_address_line_1: formData.present_address_line_1,
      present_city_town_village: formData.present_city_town_village,
      present_district: formData.present_district,
      present_state: formData.present_state,
      present_pin_code: formData.present_pin_code,
      present_country: formData.present_country,

      permanent_address_line_1: formData.permanent_address_line_1,
      permanent_city_town_village: formData.permanent_city_town_village,
      permanent_district: formData.permanent_district,
      permanent_state: formData.permanent_state,
      permanent_pin_code: formData.permanent_pin_code,
      permanent_country: formData.permanent_country,

      address_line_1: formData.address_line_1,
      city_town_village: formData.city_town_village,
      district: formData.district,
      state: formData.state,
      pin_code: formData.pin_code,
      country: formData.country,

      // Additional info
      religion: formData.religion,
      family_type: formData.family_type,
      locality: formData.locality,
      head_name: formData.head_name,
      head_age: formData.head_age ? parseInt(formData.head_age) : null,
      head_relationship: formData.head_relationship,
      head_education: formData.head_education,
      head_occupation: formData.head_occupation,
      head_income: formData.head_income ? parseFloat(formData.head_income) : null,
      distance_from_hospital: formData.distance_from_hospital,
      mobility: formData.mobility,
      referred_by: formData.referred_by,
      exact_source: formData.exact_source,
      seen_in_walk_in_on: formData.seen_in_walk_in_on,
      worked_up_on: formData.worked_up_on,
      school_college_office: formData.school_college_office,

      // Registration details
      department: formData.department,
      unit_consit: formData.unit_consit,
      room_no: formData.room_no,
      serial_no: formData.serial_no,
      file_no: formData.file_no,
      unit_days: formData.unit_days,
      category: formData.category,
      special_clinic_no: formData.special_clinic_no,
    };

    // ✅ Update patient
    await updatePatient(patientPayload).unwrap();

    // ✅ Assign doctor if present
    if (formData.assigned_doctor_id) {
      try {
        await assignPatient({
          patient_id: patientId,
          assigned_doctor: Number(formData.assigned_doctor_id),
          room_no: formData.assigned_room || "",
        }).unwrap();
      } catch (_) {
        console.warn("Doctor assignment failed");
      }
    }

    toast.success("Patient updated successfully!");
    setIsEditing(false);

    // Navigate back to Today Patients with preserved tab if returnTab exists
    if (returnTab) {
      navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
    } else {
    navigate(`/patients`);
    }

  } catch (err) {
    toast.error(err?.data?.message || "Failed to update patient");
  }
};


  if (patientLoading) {
    return <LoadingSpinner size="lg" className="h-96" />;
  }

  const patient = patientData?.data?.patient;

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Patient not found</p>
        <Button 
          className="mt-4" 
          onClick={() => {
            if (returnTab) {
              navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
            } else {
              navigate('/patients');
            }
          }}
        >
          Back to Patients
        </Button>
      </div>
    );
  }

  // Verify patient ID matches URL ID before rendering
  const returnedPatientId = patient.id ? parseInt(patient.id, 10) : null;
  if (returnedPatientId && returnedPatientId !== patientId) {
    console.error(`[PatientDetails] CRITICAL: Patient ID mismatch! URL ID: ${patientId}, Patient ID: ${returnedPatientId}`);
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error: Patient ID mismatch. Expected ID {patientId}, but received {returnedPatientId}. Please refresh the page.</p>
        <Button 
          className="mt-4" 
          onClick={() => {
            if (returnTab) {
              navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
            } else {
              navigate('/patients');
            }
          }}
        >
          Back to Patients
        </Button>
      </div>
    );
  }

  // Merge patient data with formData to ensure all fields are available
  // This ensures that any fields in formData (from patient table or outpatient record) are included
  const mergedPatient = {
    ...patient,
    ...formData,
    // Ensure basic fields from patient object take precedence and match URL ID
    id: patient.id || patientId,
    cr_no: patient.cr_no,
    psy_no: patient.psy_no,
    adl_no: patient.adl_no,
    name: patient.name || formData.name,
    sex: patient.sex || formData.sex,
    actual_age: patient.actual_age || formData.actual_age,
    assigned_room: patient.assigned_room || formData.assigned_room,
    assigned_doctor_id: patient.assigned_doctor_id || formData.assigned_doctor_id,
    assigned_doctor_name: patient.assigned_doctor_name,
    assigned_doctor_role: patient.assigned_doctor_role,
    case_complexity: patient.case_complexity,
    has_adl_file: patient.has_adl_file,
    file_status: patient.file_status,
    is_active: patient.is_active,
    filled_by_name: patient.filled_by_name,
    created_at: patient.created_at,
    updated_at: patient.updated_at,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Patient Details' : 'Patient Details'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Update patient information' : 'View and manage patient information'}
            </p>
          </div>
        </div>
      </div>

      {/* Conditionally render View or Edit component */}
      {!isEditing ? (
        <>
        
          <PatientDetailsView
            patient={mergedPatient}
            formData={formData}
            clinicalData={clinicalData}
            adlData={adlData}
            patientData={patientData}
            userRole={user?.role}
          />

          {/* Action buttons below the view content */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={() => {
                if (returnTab) {
                  navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
                } else {
                  navigate("/patients");
                }
              }}
            >
              <FiX className="mr-2" /> Cancel
            </Button>
            <Button onClick={() => setIsEditing(true)}>
              <FiEdit className="mr-2" /> Edit
            </Button>
          </div>
        </>
      ) : (
        <PatientDetailsEdit
          patient={mergedPatient}
          formData={formData}
          clinicalData={clinicalData}
          adlData={adlData}
          usersData={usersData}
          userRole={user?.role}
          onSave={() => {
            setIsEditing(false);
            // Optionally refresh data or navigate
            if (returnTab) {
              navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
            }
          }}
          onCancel={() => {
            setIsEditing(false);
            if (returnTab) {
              navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
            } else {
              navigate("/patients");
            }
          }}
        />
      )}
    </div>
  );
};

export default PatientDetails;
