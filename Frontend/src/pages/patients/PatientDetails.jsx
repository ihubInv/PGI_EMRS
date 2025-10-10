import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSave, FiX, FiEdit } from 'react-icons/fi';
import {
  useGetPatientByIdQuery,
  useUpdatePatientMutation,
  useAssignPatientMutation,
} from '../../features/patients/patientsApiSlice';
import { useGetClinicalProformaByPatientIdQuery } from '../../features/clinical/clinicalApiSlice';
import { useGetADLFileByPatientIdQuery } from '../../features/adl/adlApiSlice';
import { useGetOutpatientRecordByPatientIdQuery, useUpdateOutpatientRecordMutation } from '../../features/outpatient/outpatientApiSlice';
import { useGetDoctorsQuery } from '../../features/users/usersApiSlice';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import PatientDetailsView from './PatientDetailsView';
import PatientDetailsEdit from './PatientDetailsEdit';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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

  const { data: patientData, isLoading: patientLoading } = useGetPatientByIdQuery(id);
  const { data: clinicalData } = useGetClinicalProformaByPatientIdQuery(id);
  const { data: adlData } = useGetADLFileByPatientIdQuery(id);
  const { data: outpatientData } = useGetOutpatientRecordByPatientIdQuery(id);
  const { data: usersData } = useGetDoctorsQuery({ page: 1, limit: 100 });

  const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation();
  const [updateDemographic, { isLoading: isUpdatingDemographic }] = useUpdateOutpatientRecordMutation();
  const [assignPatient, { isLoading: isAssigning }] = useAssignPatientMutation();

  const [formData, setFormData] = useState({
    name: '',
    sex: '',
    actual_age: '',
    assigned_room: '',
    assigned_doctor_id: '',
    age_group: '',
    marital_status: '',
    year_of_marriage: '',
    no_of_children: '',
    occupation: '',
    actual_occupation: '',
    education_level: '',
    completed_years_of_education: '',
    patient_income: '',
    family_income: '',
    religion: '',
    family_type: '',
    locality: '',
    head_name: '',
    head_age: '',
    head_relationship: '',
    head_education: '',
    head_occupation: '',
    head_income: '',
    distance_from_hospital: '',
    mobility: '',
    referred_by: '',
    exact_source: '',
    present_address: '',
    permanent_address: '',
    local_address: '',
    school_college_office: '',
    contact_number: '',
  });

  useEffect(() => {
    if (patientData?.data?.patient) {
      const patient = patientData.data.patient;
      setFormData(prev => ({
        ...prev,
        name: patient.name || '',
        sex: patient.sex || '',
        actual_age: patient.actual_age || '',
        assigned_room: patient.assigned_room || '',
        assigned_doctor_id: patient.assigned_doctor_id ? String(patient.assigned_doctor_id) : '',
      }));
    }
  }, [patientData]);

  useEffect(() => {
    if (outpatientData?.data?.record) {
      const demo = outpatientData.data.record;
      setFormData(prev => ({
        ...prev,
        age_group: demo.age_group || '',
        marital_status: demo.marital_status || '',
        year_of_marriage: demo.year_of_marriage || '',
        no_of_children: demo.no_of_children || '',
        occupation: demo.occupation || '',
        actual_occupation: demo.actual_occupation || '',
        education_level: demo.education_level || '',
        completed_years_of_education: demo.completed_years_of_education || '',
        patient_income: demo.patient_income || '',
        family_income: demo.family_income || '',
        religion: demo.religion || '',
        family_type: demo.family_type || '',
        locality: demo.locality || '',
        head_name: demo.head_name || '',
        head_age: demo.head_age || '',
        head_relationship: demo.head_relationship || '',
        head_education: demo.head_education || '',
        head_occupation: demo.head_occupation || '',
        head_income: demo.head_income || '',
        distance_from_hospital: demo.distance_from_hospital || '',
        mobility: demo.mobility || '',
        referred_by: demo.referred_by || '',
        exact_source: demo.exact_source || '',
        present_address: demo.present_address || '',
        permanent_address: demo.permanent_address || '',
        local_address: demo.local_address || '',
        school_college_office: demo.school_college_office || '',
        contact_number: demo.contact_number || '',
      }));
    }
  }, [outpatientData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updatePatient({
        id,
        name: formData.name,
        sex: formData.sex,
        actual_age: parseInt(formData.actual_age),
        assigned_room: formData.assigned_room,
      }).unwrap();

      if (outpatientData?.data?.record?.id) {
        const demographicPayload = {
          id: outpatientData.data.record.id,
          age_group: formData.age_group,
          marital_status: formData.marital_status,
          year_of_marriage: formData.year_of_marriage ? parseInt(formData.year_of_marriage) : null,
          no_of_children: formData.no_of_children ? parseInt(formData.no_of_children) : null,
          occupation: formData.occupation,
          actual_occupation: formData.actual_occupation,
          education_level: formData.education_level,
          completed_years_of_education: formData.completed_years_of_education ? parseInt(formData.completed_years_of_education) : null,
          patient_income: formData.patient_income ? parseFloat(formData.patient_income) : null,
          family_income: formData.family_income ? parseFloat(formData.family_income) : null,
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
          present_address: formData.present_address,
          permanent_address: formData.permanent_address,
          local_address: formData.local_address,
          school_college_office: formData.school_college_office,
          contact_number: formData.contact_number,
        };
        await updateDemographic(demographicPayload).unwrap();
      }

      if (formData.assigned_doctor_id) {
        try {
          await assignPatient({
            patient_id: Number(id),
            assigned_doctor: Number(formData.assigned_doctor_id),
            room_no: formData.assigned_room || ''
          }).unwrap();
        } catch (_) {}
      }

      toast.success('Patient updated successfully!');
      setIsEditing(false);
      navigate('/patients');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update patient');
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
        <Link to="/patients">
          <Button className="mt-4">Back to Patients</Button>
        </Link>
      </div>
    );
  }

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
            patient={patient}
            formData={formData}
            clinicalData={clinicalData}
            adlData={adlData}
            outpatientData={outpatientData}
          />

          {/* Action buttons below the view content */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={() => navigate("/patients")}>
              <FiX className="mr-2" /> Cancel
            </Button>
            <Button onClick={() => setIsEditing(true)}>
              <FiEdit className="mr-2" /> Edit
            </Button>
          </div>
        </>
      ) : (
        <>
          <PatientDetailsEdit
            formData={formData}
            handleChange={handleChange}
            usersData={usersData}
          />

          {/* Action buttons below the form in edit mode */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={() => navigate("/patients")}>
              <FiX className="mr-2" /> Cancel
            </Button>
            <Button onClick={handleSave} loading={isUpdating || isUpdatingDemographic || isAssigning}>
              <FiSave className="mr-2" /> Save Changes
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientDetails;
