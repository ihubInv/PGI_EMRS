import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCreateOutpatientRecordMutation } from '../../features/outpatient/outpatientApiSlice';
import { useCreatePatientMutation, useSearchPatientsQuery } from '../../features/patients/patientsApiSlice';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import { MARITAL_STATUS, FAMILY_TYPE, LOCALITY, RELIGION, SEX_OPTIONS } from '../../utils/constants';

const CreateOutpatientRecord = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientIdFromQuery = searchParams.get('patient_id');

  const [createRecord, { isLoading }] = useCreateOutpatientRecordMutation();
  const [createPatient, { isLoading: isCreatingPatient }] = useCreatePatientMutation();
  const [patientSearch, setPatientSearch] = useState('');
  const { data: patientsData } = useSearchPatientsQuery(
    { search: patientSearch, limit: 10 },
    { skip: !patientSearch }
  );

  const [isNewPatient, setIsNewPatient] = useState(!patientIdFromQuery);
  const [patientData, setPatientData] = useState({
    name: '',
    sex: '',
    actual_age: '',
    assigned_room: '',
  });

  const [formData, setFormData] = useState({
    patient_id: patientIdFromQuery || '',
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (isNewPatient) {
      if (!patientData.name.trim()) newErrors.patientName = 'Name is required';
      if (!patientData.sex) newErrors.patientSex = 'Sex is required';
      if (!patientData.actual_age) newErrors.patientAge = 'Age is required';
    } else {
      if (!formData.patient_id) newErrors.patient_id = 'Patient is required';
    }
    
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
      let patientId = formData.patient_id;

      // Step 1: Create patient if new
      if (isNewPatient) {
        const patientResult = await createPatient({
          ...patientData,
          actual_age: parseInt(patientData.actual_age),
        }).unwrap();
        patientId = patientResult.data.patient.id;
        toast.success('Patient registered successfully!');
      }

      // Step 2: Create outpatient record
      const submitData = {
        ...formData,
        patient_id: parseInt(patientId),
        year_of_marriage: formData.year_of_marriage ? parseInt(formData.year_of_marriage) : null,
        no_of_children: formData.no_of_children ? parseInt(formData.no_of_children) : null,
        completed_years_of_education: formData.completed_years_of_education ? parseInt(formData.completed_years_of_education) : null,
        patient_income: formData.patient_income ? parseFloat(formData.patient_income) : null,
        family_income: formData.family_income ? parseFloat(formData.family_income) : null,
        head_age: formData.head_age ? parseInt(formData.head_age) : null,
        head_income: formData.head_income ? parseFloat(formData.head_income) : null,
      };

      const result = await createRecord(submitData).unwrap();
      toast.success('Outpatient record created successfully!');
      navigate(`/outpatient/${result.data.record.id}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create outpatient record');
    }
  };

  const patientOptions = patientsData?.data?.patients?.map(p => ({
    value: p.id,
    label: `${p.name} (${p.cr_no})`,
  })) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New Outpatient Record</h1>
        <p className="text-gray-600 mt-1">Complete demographic and social information</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Patient Selection or Registration */}
        <Card title="Patient Information" className="mb-6">
          <div className="space-y-6">
            {/* Toggle between new and existing patient */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="patientType"
                  checked={isNewPatient}
                  onChange={() => setIsNewPatient(true)}
                  className="mr-2"
                />
                <span className="font-medium">Register New Patient</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="patientType"
                  checked={!isNewPatient}
                  onChange={() => setIsNewPatient(false)}
                  className="mr-2"
                />
                <span className="font-medium">Select Existing Patient</span>
              </label>
            </div>

            {isNewPatient ? (
              /* New Patient Registration Form */
              <div className="space-y-6 p-4 border-2 border-dashed border-primary-300 rounded-lg">
                <h4 className="font-medium text-lg text-primary-700">New Patient Registration</h4>
                
                <Input
                  label="Patient Name"
                  name="name"
                  value={patientData.name}
                  onChange={handlePatientChange}
                  placeholder="Enter full name"
                  error={errors.patientName}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Sex"
                    name="sex"
                    value={patientData.sex}
                    onChange={handlePatientChange}
                    options={SEX_OPTIONS}
                    error={errors.patientSex}
                    required
                  />

                  <Input
                    label="Age"
                    type="number"
                    name="actual_age"
                    value={patientData.actual_age}
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
                  value={patientData.assigned_room}
                  onChange={handlePatientChange}
                  placeholder="e.g., Ward A-101"
                />
              </div>
            ) : (
              /* Existing Patient Selection */
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Search Patient <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Search by name or CR number..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
                {patientOptions.length > 0 && (
                  <Select
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleChange}
                    options={patientOptions}
                    placeholder="Select patient"
                    error={errors.patient_id}
                    required
                  />
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Personal Information */}
        <Card title="Personal Information" className="mb-6">
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
        <Card title="Occupation & Education" className="mb-6">
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
        <Card title="Financial Information" className="mb-6">
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
        <Card title="Family Information" className="mb-6">
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
        <Card title="Referral & Mobility" className="mb-6">
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
        <Card title="Contact Information" className="mb-6">
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
              onClick={() => navigate('/outpatient')}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isLoading || isCreatingPatient}>
              {isNewPatient ? 'Register Patient & Create Record' : 'Create Outpatient Record'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateOutpatientRecord;

