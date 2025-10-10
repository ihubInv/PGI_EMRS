import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';
import { 
  useUpdateOutpatientRecordMutation,
  useGetOutpatientRecordByIdQuery 
} from '../../features/outpatient/outpatientApiSlice';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import { MARITAL_STATUS, FAMILY_TYPE, LOCALITY, RELIGION } from '../../utils/constants';

const EditOutpatientRecord = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [updateRecord, { isLoading: isUpdating }] = useUpdateOutpatientRecordMutation();
  const { data, isLoading, error } = useGetOutpatientRecordByIdQuery(id);

  const [formData, setFormData] = useState({
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

  const [errors, setErrors] = useState({});

  // Load existing data when component mounts
  useEffect(() => {
    if (data?.data?.record) {
      const record = data.data.record;
      setFormData({
        age_group: record.age_group || '',
        marital_status: record.marital_status || '',
        year_of_marriage: record.year_of_marriage || '',
        no_of_children: record.no_of_children || '',
        occupation: record.occupation || '',
        actual_occupation: record.actual_occupation || '',
        education_level: record.education_level || '',
        completed_years_of_education: record.completed_years_of_education || '',
        patient_income: record.patient_income || '',
        family_income: record.family_income || '',
        religion: record.religion || '',
        family_type: record.family_type || '',
        locality: record.locality || '',
        head_name: record.head_name || '',
        head_age: record.head_age || '',
        head_relationship: record.head_relationship || '',
        head_education: record.head_education || '',
        head_occupation: record.head_occupation || '',
        head_income: record.head_income || '',
        distance_from_hospital: record.distance_from_hospital || '',
        mobility: record.mobility || '',
        referred_by: record.referred_by || '',
        exact_source: record.exact_source || '',
        present_address: record.present_address || '',
        permanent_address: record.permanent_address || '',
        local_address: record.local_address || '',
        school_college_office: record.school_college_office || '',
        contact_number: record.contact_number || '',
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Add validation rules as needed
    if (formData.contact_number && !/^[0-9+\-\s()]+$/.test(formData.contact_number)) {
      newErrors.contact_number = 'Please enter a valid contact number';
    }

    if (formData.patient_income && isNaN(parseFloat(formData.patient_income))) {
      newErrors.patient_income = 'Please enter a valid income amount';
    }

    if (formData.family_income && isNaN(parseFloat(formData.family_income))) {
      newErrors.family_income = 'Please enter a valid income amount';
    }

    if (formData.head_income && isNaN(parseFloat(formData.head_income))) {
      newErrors.head_income = 'Please enter a valid income amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      const updateData = {
        ...formData,
        year_of_marriage: formData.year_of_marriage ? parseInt(formData.year_of_marriage) : null,
        no_of_children: formData.no_of_children ? parseInt(formData.no_of_children) : null,
        completed_years_of_education: formData.completed_years_of_education ? parseInt(formData.completed_years_of_education) : null,
        patient_income: formData.patient_income ? parseFloat(formData.patient_income) : null,
        family_income: formData.family_income ? parseFloat(formData.family_income) : null,
        head_age: formData.head_age ? parseInt(formData.head_age) : null,
        head_income: formData.head_income ? parseFloat(formData.head_income) : null,
      };

      await updateRecord({ id, ...updateData }).unwrap();
      toast.success('Outpatient record updated successfully!');
      navigate('/outpatient');
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error?.data?.message || 'Failed to update outpatient record');
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="h-96" />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert
          type="error"
          title="Error Loading Record"
          message={error?.data?.message || 'Failed to load outpatient record. Please try again.'}
        />
        <Button onClick={() => navigate('/outpatient')} variant="outline">
          <FiArrowLeft className="mr-2" />
          Back to Outpatient Records
        </Button>
      </div>
    );
  }

  const record = data?.data?.record;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/outpatient')}
            className="flex items-center"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Outpatient Record</h1>
            <p className="text-gray-600 mt-1">
              Update demographic data for {record?.patient_name}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Age Group"
                  name="age_group"
                  value={formData.age_group}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select age group' },
                    { value: '0-5', label: '0-5 years' },
                    { value: '6-12', label: '6-12 years' },
                    { value: '13-18', label: '13-18 years' },
                    { value: '19-35', label: '19-35 years' },
                    { value: '36-50', label: '36-50 years' },
                    { value: '51-65', label: '51-65 years' },
                    { value: '65+', label: '65+ years' },
                  ]}
                  error={errors.ageGroup}
                />

                <Select
                  label="Marital Status"
                  name="marital_status"
                  value={formData.marital_status}
                  onChange={handleChange}
                  options={MARITAL_STATUS}
                  error={errors.maritalStatus}
                />

                <Input
                  label="Year of Marriage"
                  type="number"
                  name="year_of_marriage"
                  value={formData.year_of_marriage}
                  onChange={handleChange}
                  placeholder="e.g., 2020"
                  min="1900"
                  max="2030"
                  error={errors.yearOfMarriage}
                />

                <Input
                  label="Number of Children"
                  type="number"
                  name="no_of_children"
                  value={formData.no_of_children}
                  onChange={handleChange}
                  placeholder="e.g., 2"
                  min="0"
                  max="20"
                  error={errors.noOfChildren}
                />
              </div>
            </div>

            {/* Education & Occupation */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Education & Occupation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="e.g., Teacher, Engineer"
                  error={errors.occupation}
                />

                <Input
                  label="Actual Occupation"
                  name="actual_occupation"
                  value={formData.actual_occupation}
                  onChange={handleChange}
                  placeholder="e.g., High School Teacher"
                  error={errors.actualOccupation}
                />

                <Select
                  label="Education Level"
                  name="education_level"
                  value={formData.education_level}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select education level' },
                    { value: 'Illiterate', label: 'Illiterate' },
                    { value: 'Primary', label: 'Primary' },
                    { value: 'Secondary', label: 'Secondary' },
                    { value: 'Higher Secondary', label: 'Higher Secondary' },
                    { value: 'Graduate', label: 'Graduate' },
                    { value: 'Post Graduate', label: 'Post Graduate' },
                    { value: 'Professional', label: 'Professional' },
                  ]}
                  error={errors.educationLevel}
                />

                <Input
                  label="Completed Years of Education"
                  type="number"
                  name="completed_years_of_education"
                  value={formData.completed_years_of_education}
                  onChange={handleChange}
                  placeholder="e.g., 12"
                  min="0"
                  max="25"
                  error={errors.completedYearsOfEducation}
                />
              </div>
            </div>

            {/* Income Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Income Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Patient Income (₹)"
                  type="number"
                  name="patient_income"
                  value={formData.patient_income}
                  onChange={handleChange}
                  placeholder="e.g., 50000"
                  min="0"
                  step="0.01"
                  error={errors.patientIncome}
                />

                <Input
                  label="Family Income (₹)"
                  type="number"
                  name="family_income"
                  value={formData.family_income}
                  onChange={handleChange}
                  placeholder="e.g., 100000"
                  min="0"
                  step="0.01"
                  error={errors.familyIncome}
                />
              </div>
            </div>

            {/* Social Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Social Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Religion"
                  name="religion"
                  value={formData.religion}
                  onChange={handleChange}
                  options={RELIGION}
                  error={errors.religion}
                />

                <Select
                  label="Family Type"
                  name="family_type"
                  value={formData.family_type}
                  onChange={handleChange}
                  options={FAMILY_TYPE}
                  error={errors.familyType}
                />

                <Select
                  label="Locality"
                  name="locality"
                  value={formData.locality}
                  onChange={handleChange}
                  options={LOCALITY}
                  error={errors.locality}
                />
              </div>
            </div>

            {/* Family Head Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Family Head Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Head Name"
                  name="head_name"
                  value={formData.head_name}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                  error={errors.headName}
                />

                <Input
                  label="Head Age"
                  type="number"
                  name="head_age"
                  value={formData.head_age}
                  onChange={handleChange}
                  placeholder="e.g., 45"
                  min="0"
                  max="150"
                  error={errors.headAge}
                />

                <Input
                  label="Relationship to Patient"
                  name="head_relationship"
                  value={formData.head_relationship}
                  onChange={handleChange}
                  placeholder="e.g., Father, Mother, Spouse"
                  error={errors.headRelationship}
                />

                <Input
                  label="Head Education"
                  name="head_education"
                  value={formData.head_education}
                  onChange={handleChange}
                  placeholder="e.g., Graduate"
                  error={errors.headEducation}
                />

                <Input
                  label="Head Occupation"
                  name="head_occupation"
                  value={formData.head_occupation}
                  onChange={handleChange}
                  placeholder="e.g., Business"
                  error={errors.headOccupation}
                />

                <Input
                  label="Head Income (₹)"
                  type="number"
                  name="head_income"
                  value={formData.head_income}
                  onChange={handleChange}
                  placeholder="e.g., 80000"
                  min="0"
                  step="0.01"
                  error={errors.headIncome}
                />
              </div>
            </div>

            {/* Contact & Location Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact & Location Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Contact Number"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="e.g., +91 9876543210"
                  error={errors.contactNumber}
                />

                <Input
                  label="Distance from Hospital"
                  name="distance_from_hospital"
                  value={formData.distance_from_hospital}
                  onChange={handleChange}
                  placeholder="e.g., 5 km"
                  error={errors.distanceFromHospital}
                />

                <Input
                  label="Mobility"
                  name="mobility"
                  value={formData.mobility}
                  onChange={handleChange}
                  placeholder="e.g., Own vehicle, Public transport"
                  error={errors.mobility}
                />

                <Input
                  label="Referred By"
                  name="referred_by"
                  value={formData.referred_by}
                  onChange={handleChange}
                  placeholder="e.g., Dr. Smith, Hospital"
                  error={errors.referredBy}
                />

                <Input
                  label="Exact Source"
                  name="exact_source"
                  value={formData.exact_source}
                  onChange={handleChange}
                  placeholder="e.g., Emergency Department"
                  error={errors.exactSource}
                />

                <Input
                  label="School/College/Office"
                  name="school_college_office"
                  value={formData.school_college_office}
                  onChange={handleChange}
                  placeholder="e.g., ABC School"
                  error={errors.schoolCollegeOffice}
                />
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
              <div className="space-y-6">
                <Textarea
                  label="Present Address"
                  name="present_address"
                  value={formData.present_address}
                  onChange={handleChange}
                  placeholder="Enter present address"
                  rows={3}
                  error={errors.presentAddress}
                />

                <Textarea
                  label="Permanent Address"
                  name="permanent_address"
                  value={formData.permanent_address}
                  onChange={handleChange}
                  placeholder="Enter permanent address"
                  rows={3}
                  error={errors.permanentAddress}
                />

                <Textarea
                  label="Local Address"
                  name="local_address"
                  value={formData.local_address}
                  onChange={handleChange}
                  placeholder="Enter local address"
                  rows={3}
                  error={errors.localAddress}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/outpatient')}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="min-w-[120px]"
              >
                {isUpdating ? 'Updating...' : 'Update Record'}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default EditOutpatientRecord;
