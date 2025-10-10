import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiUser, FiUsers, FiBriefcase, FiDollarSign, FiHome, FiMapPin, FiPhone } from 'react-icons/fi';
import { useCreateOutpatientRecordMutation } from '../../features/outpatient/outpatientApiSlice';
import { useCreatePatientMutation, useAssignPatientMutation, useSearchPatientsQuery } from '../../features/patients/patientsApiSlice';
import { useGetDoctorsQuery } from '../../features/users/usersApiSlice';
import { updatePatientRegistrationForm, resetPatientRegistrationForm, selectPatientRegistrationForm } from '../../features/form/formSlice';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import { MARITAL_STATUS, FAMILY_TYPE, LOCALITY, RELIGION, SEX_OPTIONS } from '../../utils/constants';

const CreateOutpatientRecord = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const formData = useSelector(selectPatientRegistrationForm);

  const [createRecord, { isLoading }] = useCreateOutpatientRecordMutation();
  const [createPatient, { isLoading: isCreatingPatient }] = useCreatePatientMutation();
  const [assignPatient, { isLoading: isAssigning }] = useAssignPatientMutation();
  const { data: usersData } = useGetDoctorsQuery({ page: 1, limit: 100 });

  // Search for existing patient by CR number
  const [crSearchTerm, setCrSearchTerm] = useState('');
  const { data: crSearchData } = useSearchPatientsQuery(
    { search: crSearchTerm, limit: 5 },
    { skip: !crSearchTerm || crSearchTerm.length < 2 }
  );

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updatePatientRegistrationForm({ [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    dispatch(updatePatientRegistrationForm({ [name]: value }));

    // Trigger search when CR number is entered
    if (name === 'cr_no' && value.length >= 2) {
      setCrSearchTerm(value);
    } else if (name === 'cr_no' && value.length < 2) {
      setCrSearchTerm('');
      setErrors((prev) => ({ ...prev, patientCRNo: '' }));
    }
  };

  // Check if CR number already exists
  useEffect(() => {
    if (crSearchData?.data?.patients && formData.cr_no && formData.cr_no.length >= 2) {
      const existingPatient = crSearchData.data.patients.find(
        (p) => p.cr_no?.toLowerCase() === formData.cr_no.toLowerCase()
      );

      if (existingPatient) {
        setErrors((prev) => ({
          ...prev,
          patientCRNo: `Patient already exists: ${existingPatient.name} (CR: ${existingPatient.cr_no}). Please go to "Existing Patients" tab to create a visit record.`,
        }));
      }
    }
  }, [crSearchData, formData.cr_no]);

  const validate = () => {
    const newErrors = {};

    // Validate new patient data
    if (!formData.name.trim()) newErrors.patientName = 'Name is required';
    if (!formData.sex) newErrors.patientSex = 'Sex is required';
    if (!formData.actual_age) newErrors.patientAge = 'Age is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      // Step 1: Create patient
      const patientResult = await createPatient({
        name: formData.name,
        sex: formData.sex,
        actual_age: parseInt(formData.actual_age),
        assigned_room: formData.assigned_room,
        cr_no: formData.cr_no,
        psy_no: formData.psy_no,
      }).unwrap();

      const patientId = patientResult.data.patient.id;
      toast.success('Patient registered successfully!');

      // Step 2: Assign doctor if selected
      if (formData.assigned_doctor_id) {
        try {
          await assignPatient({
            patient_id: patientId,
            assigned_doctor: Number(formData.assigned_doctor_id),
            room_no: formData.assigned_room || ''
          }).unwrap();
        } catch (_) {}
      }

      // Step 3: Create outpatient record (demographic data)
      const demographicData = {
        patient_id: parseInt(patientId),
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

      await createRecord(demographicData).unwrap();
      toast.success('Outpatient record created successfully!');

      // Reset form after successful submission
      dispatch(resetPatientRegistrationForm());

      // Navigate to patients list
      navigate('/patients');

    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create record');
      console.error('Submission error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Register New Patient</h1>
        <p className="text-gray-600 mt-1">Complete patient registration and demographic information</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Patient Information */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <FiUser className="h-5 w-5 text-primary-600" />
              <span>Patient Information</span>
            </div>
          }
          className="mb-6">
          <div className="space-y-6">
            <Input
              label="Patient Name"
              name="name"
              value={formData.name}
              onChange={handlePatientChange}
              placeholder="Enter full name"
              error={errors.patientName}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Sex"
                name="sex"
                value={formData.sex}
                onChange={handlePatientChange}
                options={SEX_OPTIONS}
                error={errors.patientSex}
                required
              />

              <Input
                label="Age"
                type="number"
                name="actual_age"
                value={formData.actual_age}
                onChange={handlePatientChange}
                placeholder="Enter age"
                error={errors.patientAge}
                required
                min="0"
                max="150"
              />
            </div>

            <Input
              label="Assigned Room"
              name="assigned_room"
              value={formData.assigned_room}
              onChange={handlePatientChange}
              placeholder="e.g., Ward A-101"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="CR Number"
                name="cr_no"
                value={formData.cr_no}
                onChange={handlePatientChange}
                placeholder="e.g., CR2024000001"
                error={errors.patientCRNo}
              />

              <Input
                label="PSY Number"
                name="psy_no"
                value={formData.psy_no}
                onChange={handlePatientChange}
                placeholder="e.g., PSY2024000001"
                error={errors.patientPSYNo}
              />
            </div>

            <Select
              label="Assign Doctor (JR/SR)"
              name="assigned_doctor_id"
              value={formData.assigned_doctor_id}
              onChange={handlePatientChange}
              options={(usersData?.data?.users || [])
                .filter(u => u.role === 'JR' || u.role === 'SR')
                .map(u => ({ value: String(u.id), label: `${u.name} (${u.role})` }))}
              placeholder="Select doctor (optional)"
            />
          </div>
        </Card>

        {/* Personal Information */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <FiUser className="h-5 w-5 text-primary-600" />
              <span>Personal Information</span>
            </div>
          }
          className="mb-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Age Group"
                name="age_group"
                value={formData.age_group}
                onChange={handleChange}
                placeholder="e.g., 25-30"
              />

              <Select
                label="Marital Status"
                name="marital_status"
                value={formData.marital_status}
                onChange={handleChange}
                options={MARITAL_STATUS}
              />

              <Input
                label="Year of Marriage"
                type="number"
                name="year_of_marriage"
                value={formData.year_of_marriage}
                onChange={handleChange}
              />

              <Input
                label="Number of Children"
                type="number"
                name="no_of_children"
                value={formData.no_of_children}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
        </Card>

        {/* Occupation & Education */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <FiBriefcase className="h-5 w-5 text-primary-600" />
              <span>Occupation & Education</span>
            </div>
          }
          className="mb-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="Current occupation"
              />

              <Input
                label="Actual Occupation"
                name="actual_occupation"
                value={formData.actual_occupation}
                onChange={handleChange}
                placeholder="Actual work details"
              />

              <Input
                label="Education Level"
                name="education_level"
                value={formData.education_level}
                onChange={handleChange}
                placeholder="e.g., Graduate, Post-Graduate"
              />

              <Input
                label="Years of Education"
                type="number"
                name="completed_years_of_education"
                value={formData.completed_years_of_education}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
        </Card>

        {/* Financial Information */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <FiDollarSign className="h-5 w-5 text-primary-600" />
              <span>Financial Information</span>
            </div>
          }
          className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Patient Income (₹)"
              type="number"
              name="patient_income"
              value={formData.patient_income}
              onChange={handleChange}
              placeholder="Monthly income"
              min="0"
            />

            <Input
              label="Family Income (₹)"
              type="number"
              name="family_income"
              value={formData.family_income}
              onChange={handleChange}
              placeholder="Total monthly family income"
              min="0"
            />
          </div>
        </Card>

        {/* Family Information */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <FiUsers className="h-5 w-5 text-primary-600" />
              <span>Family Information</span>
            </div>
          }
          className="mb-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Religion"
                name="religion"
                value={formData.religion}
                onChange={handleChange}
                options={RELIGION}
              />

              <Select
                label="Family Type"
                name="family_type"
                value={formData.family_type}
                onChange={handleChange}
                options={FAMILY_TYPE}
              />

              <Select
                label="Locality"
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                options={LOCALITY}
              />
            </div>

            <h4 className="font-medium text-gray-900 mt-4">Head of Family</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Name"
                name="head_name"
                value={formData.head_name}
                onChange={handleChange}
              />

              <Input
                label="Age"
                type="number"
                name="head_age"
                value={formData.head_age}
                onChange={handleChange}
                min="0"
              />

              <Input
                label="Relationship"
                name="head_relationship"
                value={formData.head_relationship}
                onChange={handleChange}
                placeholder="e.g., Self, Father, Spouse"
              />

              <Input
                label="Education"
                name="head_education"
                value={formData.head_education}
                onChange={handleChange}
              />

              <Input
                label="Occupation"
                name="head_occupation"
                value={formData.head_occupation}
                onChange={handleChange}
              />

              <Input
                label="Income (₹)"
                type="number"
                name="head_income"
                value={formData.head_income}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
        </Card>

        {/* Referral Information */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <FiMapPin className="h-5 w-5 text-primary-600" />
              <span>Referral & Mobility</span>
            </div>
          }
          className="mb-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Distance from Hospital"
                name="distance_from_hospital"
                value={formData.distance_from_hospital}
                onChange={handleChange}
                placeholder="e.g., 15 km"
              />

              <Input
                label="Mobility"
                name="mobility"
                value={formData.mobility}
                onChange={handleChange}
                placeholder="e.g., Own vehicle, Public transport"
              />

              <Input
                label="Referred By"
                name="referred_by"
                value={formData.referred_by}
                onChange={handleChange}
                placeholder="Doctor/Hospital name"
              />

              <Input
                label="Exact Source"
                name="exact_source"
                value={formData.exact_source}
                onChange={handleChange}
                placeholder="How they learned about us"
              />
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <FiPhone className="h-5 w-5 text-primary-600" />
              <span>Contact Information</span>
            </div>
          }
          className="mb-6">
          <div className="space-y-6">
            <Textarea
              label="Present Address"
              name="present_address"
              value={formData.present_address}
              onChange={handleChange}
              rows={2}
            />

            <Textarea
              label="Permanent Address"
              name="permanent_address"
              value={formData.permanent_address}
              onChange={handleChange}
              rows={2}
            />

            <Textarea
              label="Local Address"
              name="local_address"
              value={formData.local_address}
              onChange={handleChange}
              rows={2}
            />

            <Input
              label="School/College/Office"
              name="school_college_office"
              value={formData.school_college_office}
              onChange={handleChange}
            />

            <Input
              label="Contact Number"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              placeholder="e.g., +91 9876543210"
            />
          </div>
        </Card>

        {/* Submit Buttons */}
        <Card>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/patients')}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isLoading || isCreatingPatient || isAssigning}>
              Register Patient & Create Record
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateOutpatientRecord;
