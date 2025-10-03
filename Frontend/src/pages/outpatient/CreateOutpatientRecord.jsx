import React, { useState, useEffect } from 'react';
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
  const { data: patientsData, error: searchError, isLoading: searching } = useSearchPatientsQuery(
    { search: patientSearch, limit: 10 },
    { skip: !patientSearch || patientSearch.length < 2 }
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
    visit_type: 'first_visit', // Add visit type
    assigned_doctor: '', // Add doctor assignment
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Auto-detect follow-up visit when patient is selected
    if (name === 'patient_id' && value) {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value, 
        visit_type: 'follow_up' // Always follow-up for existing patients
      }));
    }
  };

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (isNewPatient) {
      // Validate new patient data
      if (!patientData.name.trim()) newErrors.patientName = 'Name is required';
      if (!patientData.sex) newErrors.patientSex = 'Sex is required';
      if (!patientData.actual_age) newErrors.patientAge = 'Age is required';
    } else {
      // Validate existing patient selection (for follow-up visits)
      if (!formData.patient_id) newErrors.patient_id = 'Patient is required';
      // Note: MWO only creates demographic records, doctor assignment happens later
      // Note: visit_type is automatically set to 'follow_up' for existing patients
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

      // Step 2: Create outpatient record (demographic data) - MWO ONLY
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
      
      // Navigate to outpatient records list (NOT clinical proforma)
      navigate('/outpatient');
      
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create record');
      console.error('Submission error:', err);
    }
  };

  // Auto-select patient when exact match found
  useEffect(() => {
    if (!patientsData?.data?.patients || formData.patient_id) return;
    
    const patients = patientsData.data.patients;
    
    // Auto-select if exact CR match found OR any single match
    if (patientSearch && patientSearch.startsWith('CR')) {
      const exactMatch = patients.find(p => 
        p.cr_no === patientSearch || p.cr_no === patientSearch.toUpperCase()
      );
      
      if (exactMatch) {
        setFormData(prev => ({ 
          ...prev, 
          patient_id: exactMatch.id.toString(),
          visit_type: 'follow_up',
          assigned_doctor: exactMatch.assigned_doctor || exactMatch.doctor_name || '' // Auto-assign existing doctor
        }));
      }
    } else if (patients.length === 1) {
      // Auto-select if only one result found
      setFormData(prev => ({ 
        ...prev, 
        patient_id: patients[0].id.toString(),
        visit_type: 'follow_up',
        assigned_doctor: patients[0].assigned_doctor || patients[0].doctor_name || '' // Auto-assign existing doctor
      }));
    }
  }, [patientsData, patientSearch]);

  // Create patient options with exact matches prioritized
  const patientOptions = (() => {
    if (!patientsData?.data?.patients) return [];
    
    const patients = patientsData.data.patients;
    
    // If searching for a CR number, prioritize exact match
    if (patientSearch && patientSearch.startsWith('CR')) {
      const exactMatch = patients.find(p => 
        p.cr_no === patientSearch || p.cr_no === patientSearch.toUpperCase()
      );
      
      if (exactMatch) {
        return [{
          value: exactMatch.id,
          label: `${exactMatch.name} (${exactMatch.cr_no}) - EXACT MATCH`,
        }];
      }
    }
    
    // Default: return all patients with limit
    return patients.slice(0, 5).map(p => ({
    value: p.id,
    label: `${p.name} (${p.cr_no})`,
    }));
  })();

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
                  onChange={() => {
                    setIsNewPatient(true);
                    setFormData(prev => ({ ...prev, visit_type: 'first_visit' }));
                  }}
                  className="mr-2"
                />
                <span className="font-medium">Register New Patient</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="patientType"
                  checked={!isNewPatient}
                  onChange={() => {
                    setIsNewPatient(false);
                    setFormData(prev => ({ ...prev, visit_type: 'follow_up' }));
                  }}
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
              <div className="space-y-6 p-4 border-2 border-dashed border-green-300 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-bold">✓</span>
                  </div>
                  <h4 className="font-medium text-lg text-green-700">Select Existing Patient</h4>
                </div>
                
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Since this patient already exists in our system, all demographic details are already available. 
                    You only need to select the patient and specify the visit type.
                  </p>
                </div>

              <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Patient <span className="text-red-500">*</span>
                </label>
                    <div className="space-y-2">
                      <Input
                        placeholder="Type CR number, PSY number, ADL number, or patient name..."
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        className="text-sm"
                      />
                      {patientSearch.length >= 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ 
                              ...prev, 
                              patient_id: '', 
                              visit_type: 'first_visit' 
                            }));
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          Clear selection & search again
                        </button>
                      )}
                    </div>
                    {patientSearch && patientSearch.length < 2 && (
                      <p className="text-xs text-gray-500 mt-1">Enter at least 2 characters to search</p>
                    )}
                  </div>

                  {/* Show selected patient info */}
                  {formData.patient_id && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-sm font-bold">✓</span>
                        </div>
                        <div>
                          <p className="text-sm text-green-800 font-medium">
                            Patient Auto-Selected Successfully
                          </p>
                          <p className="text-xs text-green-600">
                            Found matching patient in the system
                          </p>
                        </div>
                      </div>

                      {/* Show patient details */}
                      {(() => {
                        const selectedPatient = patientsData?.data?.patients?.find(p => p.id.toString() === formData.patient_id);
                        return selectedPatient ? (
                          <div className="mt-3 p-3 bg-white border border-green-100 rounded">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-gray-800">Patient Details</h4>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    patient_id: '',
                                    visit_type: 'first_visit' 
                                  }));
                                  setPatientSearch('');
                                }}
                                className="text-xs text-red-600 hover:text-red-800 underline"
                              >
                                Change Patient
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Name:</span>
                                <span className="ml-2 text-green-700">{selectedPatient.name}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">CR Number:</span>
                                <span className="ml-2 text-green-700 font-mono">{selectedPatient.cr_no}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Sex:</span>
                                <span className="ml-2 text-green-700">{selectedPatient.sex}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Age:</span>
                                <span className="ml-2 text-green-700">{selectedPatient.actual_age}</span>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                  
                  {/* Click to search different patient */}
                  {!formData.patient_id && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600 text-center">
                        Type a CR number or patient name to search and auto-select
                      </p>
                    </div>
                  )}

                    {/* Loading state */}
                    {patientSearch.length >= 2 && searching && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          🔍 Searching for patients...
                        </p>
                      </div>
                    )}

                    {/* Error state */}
                    {searchError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          ❌ Error searching patients: {searchError?.data?.message || searchError.message}
                        </p>
                      </div>
                    )}


                    {/* No results */}
                    {patientSearch.length >= 2 && !searching && !searchError && !patientsData?.data?.patients?.length && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          🔍 No patients found matching "{patientSearch}". Try a different search term.
                        </p>
                      </div>
                    )}
                </div>

                {/* Visit Type Selection */}
                {formData.patient_id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-green-800 mb-2">
                        Visit Type <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-sm font-bold">✓</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-green-800">Follow-up Visit</span>
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Auto-selected
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-white border border-green-100 rounded">
                        <p className="text-xs text-green-700">
                          📋 This patient is returning for follow-up consultation. Since the patient already exists in our system, this is automatically set as a follow-up visit.
                        </p>
                      </div>
                    </div>

                    {/* ADL File Status Check */}
                    {(() => {
                      const selectedPatient = patientsData?.data?.patients?.find(p => p.id.toString() === formData.patient_id);
                      const hasADLFile = selectedPatient?.adl_no || selectedPatient?.has_adl_file;
                      
                      return (
                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasADLFile ? 'bg-orange-100' : 'bg-gray-100'}`}>
                              <span className={`text-sm font-bold ${hasADLFile ? 'text-orange-600' : 'text-gray-600'}`}>
                                📁
                              </span>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                ADL File Status
                              </label>
                              <p className={`text-sm ${hasADLFile ? 'text-orange-700' : 'text-gray-600'}`}>
                                {hasADLFile ? 
                                  `Patient already has ADL file (${selectedPatient.adl_no})` : 
                                  'Patient does not have an ADL file'
                                }
                              </p>
                            </div>
                          </div>
                          
                          {hasADLFile && (
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                              <p className="text-xs text-orange-700">
                                ✓ This patient already has an ADL file in the system
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    
                    {/* MWO Information */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-sm font-bold">🏥</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-green-800">Next Steps after MWO Registration</h4>
                          </div>
                        </div>
                        <p className="text-xs text-green-700">
                          ✓ Patient demographics have been recorded by MWO<br/>
                          ✓ Patient has been assigned CR and PSY numbers<br/>
                          → Next: Patient will be directed to Room 205/206 for doctor consultation
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Only show demographic form for new patients */}
        {isNewPatient && (
          <>
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

          </>
        )}

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
              {isNewPatient ? 'Register Patient & Create Record' : 'Create Visit Record'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateOutpatientRecord;

