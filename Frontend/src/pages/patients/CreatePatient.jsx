import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  FiUser, FiUsers, FiBriefcase, FiDollarSign, FiHome, FiMapPin, FiPhone,
  FiCalendar, FiGlobe, FiFileText, FiHash, FiClock,
  FiHeart, FiBookOpen, FiTrendingUp, FiShield,
  FiNavigation, FiTruck, FiEdit3, FiSave, FiX, FiLayers, FiLoader,
  FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { useCreatePatientMutation, useAssignPatientMutation, useCreatePatientCompleteMutation, useCheckCRNumberExistsQuery } from '../../features/patients/patientsApiSlice';
import { useGetDoctorsQuery } from '../../features/users/usersApiSlice';
import { updatePatientRegistrationForm, resetPatientRegistrationForm, selectPatientRegistrationForm } from '../../features/form/formSlice';
import Card from '../../components/Card';
import Select from '../../components/Select';
import Button from '../../components/Button';
import DatePicker from '../../components/CustomDatePicker';
import {
  MARITAL_STATUS, FAMILY_TYPE_OPTIONS, LOCALITY_OPTIONS, RELIGION_OPTIONS, SEX_OPTIONS,
  AGE_GROUP_OPTIONS, OCCUPATION_OPTIONS, EDUCATION_OPTIONS,
  MOBILITY_OPTIONS, REFERRED_BY_OPTIONS, INDIAN_STATES, UNIT_DAYS_OPTIONS,
  isJR, isSR, HEAD_RELATIONSHIP_OPTIONS, CATEGORY_OPTIONS
} from '../../utils/constants';

// Enhanced Input component with glassmorphism styling
const IconInput = ({ icon, label, loading = false, error, defaultValue, ...props }) => {
  // Remove defaultValue if value is provided to avoid controlled/uncontrolled warning
  const inputProps = props.value !== undefined ? { ...props } : { ...props, defaultValue };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
        {icon && <span className="text-primary-600">{icon}</span>}
        {label}
        {loading && (
          <FiLoader className="w-4 h-4 text-blue-500 animate-spin" />
        )}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <span className="text-gray-500">{icon}</span>
          </div>
        )}
        <input
          {...inputProps}
          className={`w-full px-4 py-3 ${icon ? 'pl-11' : 'pl-4'} bg-white/60 backdrop-blur-md border-2 border-gray-300/60 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white/80 transition-all duration-300 hover:bg-white/70 hover:border-primary-400/70 placeholder:text-gray-400 text-gray-900 font-medium ${inputProps.className || ''}`}
        />
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-medium">
          <FiX className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};



const CreatePatient = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const formData = useSelector(selectPatientRegistrationForm);
  const [createRecord, { isLoading }] = useCreatePatientCompleteMutation();
  const [assignPatient, { isLoading: isAssigning }] = useAssignPatientMutation();
  const { data: usersData } = useGetDoctorsQuery({ page: 1, limit: 100 });

  // State declarations first
  const [errors, setErrors] = useState({});
  const [crValidationTimeout, setCrValidationTimeout] = useState(null);
  const [currentCRNumber, setCurrentCRNumber] = useState('');
  const [expandedPatientDetails, setExpandedPatientDetails] = useState(true);

  // CR number validation
  const { data: crExists, isLoading: isCheckingCR } = useCheckCRNumberExistsQuery(
    currentCRNumber,
    { skip: !currentCRNumber || currentCRNumber.length < 3 }
  );


  // CR validation effect
  useEffect(() => {
    const currentCR = formData.cr_no;

    if (currentCR && currentCR.length >= 3) {
      if (currentCR !== currentCRNumber) {
        // CR number changed, clear error immediately and reset validation
        setErrors((prev) => ({ ...prev, patientCRNo: '' }));
        setCurrentCRNumber(currentCR);
        // Don't validate yet, wait for API call
        return;
      } else if (currentCR === currentCRNumber && !isCheckingCR) {
        // Only validate if CR number is stable and not checking


        if (crExists === true) {
          // CR exists (exact match), show error

          setErrors((prev) => ({ ...prev, patientCRNo: 'CR No. already exists.' }));
        } else if (crExists === false) {
          // CR doesn't exist (exact match), clear error

          setErrors((prev) => ({ ...prev, patientCRNo: '' }));
        } else {
          // crExists is undefined or null, clear error to be safe

          setErrors((prev) => ({ ...prev, patientCRNo: '' }));
        }
      }
    } else {
      // CR too short or empty, clear error

      setErrors((prev) => ({ ...prev, patientCRNo: '' }));
      setCurrentCRNumber('');
    }
  }, [formData.cr_no, crExists, isCheckingCR, currentCRNumber]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updatePatientRegistrationForm({ [name]: value }));

    // Clear any existing CR number error when user starts typing
    if (name === 'cr_no') {
      // Clear error immediately and force clear

      setErrors((prev) => ({ ...prev, patientCRNo: '' }));

      // Clear any existing timeout
      if (crValidationTimeout) {
        clearTimeout(crValidationTimeout);
      }

      // Reset current CR number to force new validation
      setCurrentCRNumber('');

      // Set current CR number for validation with debounce
      if (value.length >= 3) {
        const timeout = setTimeout(() => {

          setCurrentCRNumber(value);
        }, 500);
        setCrValidationTimeout(timeout);
      }
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Auto-select age group based on age
    if (name === 'age') {
      const age = parseInt(value);
      if (!isNaN(age)) {
        let ageGroup = '';
        if (age >= 0 && age <= 15) ageGroup = '0-15';
        else if (age >= 16 && age <= 30) ageGroup = '15-30';
        else if (age >= 31 && age <= 45) ageGroup = '30-45';
        else if (age >= 46 && age <= 60) ageGroup = '45-60';
        else if (age >= 61) ageGroup = '60+';

        if (ageGroup) {
          dispatch(updatePatientRegistrationForm({ age_group: ageGroup }));
        }
      }
    }
  };


  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    dispatch(updatePatientRegistrationForm({ [name]: value }));

    // Clear any existing CR number error when user starts typing
    if (name === 'cr_no') {
      // Clear error immediately and force clear

      setErrors((prev) => ({ ...prev, patientCRNo: '' }));

      // Clear any existing timeout
      if (crValidationTimeout) {
        clearTimeout(crValidationTimeout);
      }

      // Reset current CR number to force new validation
      setCurrentCRNumber('');

      // Set current CR number for validation with debounce
      if (value.length >= 3) {
        const timeout = setTimeout(() => {
          setCurrentCRNumber(value);
        }, 500);
        setCrValidationTimeout(timeout);
      }
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (crValidationTimeout) {
        clearTimeout(crValidationTimeout);
      }
    };
  }, [crValidationTimeout]);

  const validate = () => {
    const newErrors = {};

    // Validate new patient data - check both main form and quick entry fields
    const patientName = formData.name || '';
    const patientSex = formData.sex || '';
    const patientAge = formData.age || '';
    const patientCRNo = formData.cr_no || '';

    if (!patientName || !patientName.trim()) newErrors.patientName = 'Name is required';
    if (!patientSex) newErrors.patientSex = 'Sex is required';
    if (!patientAge) newErrors.patientAge = 'Age is required';

    // CR number validation
    if (patientCRNo) {
      if (patientCRNo.length < 3) {
        newErrors.patientCRNo = 'CR number must be at least 3 characters long';
      }
      // Note: Real-time CR validation is handled by validateCRNumber function
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

    // Get patient data early for validation
    const patientName = (formData.name || '').trim();
    const patientSex = formData.sex || '';
    const patientAge = formData.age || '';
    const patientCRNo = formData.cr_no || '';

    // Don't submit while checking CR number
    if (patientCRNo && isCheckingCR) {
      toast.error('Please wait while we check the CR number...');
      return;
    }

    try {
      // Validate required fields
      if (!patientName) {
        toast.error('Patient name is required');
        return;
      }
      if (!patientSex) {
        toast.error('Patient sex is required');
        return;
      }
      if (!patientAge) {
        toast.error('Patient age is required');
        return;
      }

      const parseIntSafe = (val) => {
        if (val === '' || val === undefined || val === null) return null;
        const parsed = parseInt(val);
        return isNaN(parsed) ? null : parsed;
      };

      // Helper function to safely parse floats (returns null if invalid)
      const parseFloatSafe = (val) => {
        if (val === '' || val === undefined || val === null) return null;
        const parsed = parseFloat(val);
        return isNaN(parsed) ? null : parsed;
      };

      const assignedDoctor = usersData?.data?.users?.find(
        user => user.id === formData.assigned_doctor_id
      );
      
      const assignedDoctorName = assignedDoctor ? assignedDoctor.name : 'Unknown Doctor';
      
      console.log('Assigned Doctor Name:', assignedDoctorName);
      
      const completePatientData = {
        // Required basic fields
      
        name: patientName,
        sex: patientSex,
        father_name: formData.father_name || null,
        age: parseIntSafe(patientAge),
        date: formData.date || null,
        assigned_room: formData.assigned_room || null,
        assigned_doctor_id: formData.assigned_doctor_id || null,
        assigned_doctor_name: assignedDoctorName || null,
        ...(patientCRNo && { cr_no: patientCRNo }),
        psy_no: formData.psy_no || null,
        seen_in_walk_in_on: formData.seen_in_walk_in_on || formData.date || null,
        worked_up_on: formData.worked_up_on || null,
        special_clinic_no: formData.special_clinic_no || null,

        // Personal Information
        age_group: formData.age_group || null,
        marital_status: formData.marital_status || null,
        year_of_marriage: parseIntSafe(formData.year_of_marriage),
        no_of_children_male: parseIntSafe(formData.no_of_children_male),
        no_of_children_female: parseIntSafe(formData.no_of_children_female),

        // Occupation & Education
        occupation: formData.occupation || null,
        education: formData.education || null,

        // Financial Information
        income: parseFloatSafe(formData.income),

        // Family Information
        religion: formData.religion || null,
        family_type: formData.family_type || null,
        locality: formData.locality || null,
        head_name: formData.head_name || null,
        head_age: parseIntSafe(formData.head_age),
        head_relationship: formData.head_relationship || null,
        head_education: formData.head_education || null,
        head_occupation: formData.head_occupation || null,
        head_income: parseFloatSafe(formData.head_income),

        // Referral & Mobility
        distance_from_hospital: formData.distance_from_hospital || null,
        mobility: formData.mobility || null,
        referred_by: formData.referred_by || null,

        // Contact Information
        contact_number: formData.contact_number || null,

        // Quick Entry fields
        department: formData.department || null,
        unit_consit: formData.unit_consit || null,
        room_no: formData.room_no || null,
        serial_no: formData.serial_no || null,
        file_no: formData.file_no || null,
        unit_days: formData.unit_days || null,

        // Address fields
        address_line: formData.address_line || null,
        country: formData.country || null,
        state: formData.state || null,
        district: formData.district || null,
        city: formData.city || null,
        pin_code: formData.pin_code || null,

        // Additional fields
        category: formData.category || null,
      };

      // Single API call to create patient with all data
      const patientResult = await createRecord(completePatientData).unwrap();
      const patientId = patientResult.data.patient.id;

      toast.success('Patient registered successfully!');

      // Step 2: Assign doctor if selected (separate operation)
      // assigned_doctor_id is UUID (string), not integer
      const doctorId = formData.assigned_doctor_id 
      if (doctorId) {
        try {
          await assignPatient({
            patient_id: patientId,
            assigned_doctor_id: doctorId,
            room_no: formData.assigned_room || ''
          }).unwrap();
          toast.success('Patient assigned to doctor successfully!');
        } catch (err) {
          console.error('Error assigning patient to doctor:', err);
          // Don't show error toast as patient was already created successfully
        }
      }

      // Reset form after successful submission
      dispatch(resetPatientRegistrationForm());

      // Navigate to patients list
      navigate('/patients');

    } catch (err) {
      console.error('Submission error:', err);

      // Handle specific error cases
      if (err?.data?.message?.includes('duplicate key value violates unique constraint "patients_cr_no_key"') ||
        err?.data?.error?.includes('duplicate key value violates unique constraint "patients_cr_no_key"')) {
        toast.error('CR number is already registered');
        dispatch(updatePatientRegistrationForm({ cr_no: '' }));
      } else if (err?.data?.message?.includes('duplicate key value violates unique constraint') ||
        err?.data?.error?.includes('duplicate key value violates unique constraint')) {
        toast.error('A record with this information already exists. Please check your data and try again.');
      } else {
        toast.error(err?.data?.message || err?.data?.error || 'Failed to create record');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-100/40 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-6 lg:space-y-8">

        {/* Patient Details Card - Collapsible */}
        <Card className="shadow-lg border-0 bg-white">
          <div
            className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => setExpandedPatientDetails(!expandedPatientDetails)}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiUser className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Patient Details</h3>
                <p className="text-sm text-gray-500 mt-1">Quick Entry, Basic Information, Family Information, Referral & Mobility</p>
              </div>
            </div>
            {expandedPatientDetails ? (
              <FiChevronUp className="h-6 w-6 text-gray-500" />
            ) : (
              <FiChevronDown className="h-6 w-6 text-gray-500" />
            )}
          </div>

          {expandedPatientDetails && (
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                {/* Quick Entry Section with Glassmorphism */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
                  <Card
                    title={
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                          <FiEdit3 className="w-6 h-6 text-indigo-600" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Quick Entry</span>
                      </div>
                    }
                    className="relative mb-8 shadow-2xl border border-white/30 bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden">
            <div className="space-y-8">
              {/* First Row - Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <IconInput
                  icon={<FiHash className="w-4 h-4" />}
                  label="CR No."
                  name="cr_no"
                  value={formData.cr_no || ''}
                  onChange={handleChange}
                  placeholder="Enter CR number"
                  error={errors.patientCRNo}
                  loading={isCheckingCR && formData.cr_no && formData.cr_no.length >= 3}
                  className={`${errors.patientCRNo
                    ? 'border-red-400/50 focus:border-red-500 focus:ring-red-500/50 bg-red-50/30'
                    : formData.cr_no && formData.cr_no.length >= 3 && !isCheckingCR && !errors.patientCRNo
                      ? 'border-green-400/50 focus:border-green-500 focus:ring-green-500/50 bg-green-50/30'
                      : ''
                    }`}
                />
                <IconInput
                  icon={<FiUser className="w-4 h-4" />}
                  label="Name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  placeholder="Enter patient name"
                  className=""
                />
                <DatePicker
                  icon={<FiCalendar className="w-4 h-4" />}
                  label="Date"
                  name="date"
                  value={formData.date || ''}
                  onChange={handleChange}
                  defaultToday={true}
                />
                
                <IconInput
                  icon={<FiPhone className="w-4 h-4" />}
                  label="Mobile No."
                  name="contact_number"
                  value={formData.contact_number || ''}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  className=""
                />
              </div>

              {/* Second Row - Age, Sex, Category, Father's Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <IconInput
                  icon={<FiClock className="w-4 h-4" />}
                  label="Age"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleChange}
                  type="number"
                  placeholder="Enter age"
                  className=""
                />
                <div className="space-y-2">
                  <Select
                    label="Sex"
                    name="sex"
                    value={formData.sex || ''}
                    onChange={handleChange}
                    options={SEX_OPTIONS}
                    placeholder="Select sex"
                    error={errors.patientSex}
                    searchable={true}
                    className="bg-white/60 backdrop-blur-md border-2 border-gray-300/60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <FiShield className="w-4 h-4 text-primary-600" />
                    Category
                  </label>
                  <Select
                    name="category"
                    value={formData.category || ''}
                    onChange={handleChange}
                    options={CATEGORY_OPTIONS}
                    placeholder="Select category"
                    searchable={true}
                    className="bg-white/60 backdrop-blur-md border-2 border-gray-300/60"
                  />
                </div>
                <IconInput
                  icon={<FiUsers className="w-4 h-4" />}
                  label="Father's Name"
                  name="father_name"
                  value={formData.father_name || ''}
                  onChange={handleChange}
                  placeholder="Enter father's name"
                  className=""
                />
              </div>
              {/* Fourth Row - Department, Unit/Consit, Room No., Serial No. */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <IconInput
                  icon={<FiLayers className="w-4 h-4" />}
                  label="Department"
                  name="department"
                  value={formData.department || ''}
                  onChange={handleChange}
                  placeholder="Enter department"
                  className=""
                />
                <IconInput
                  icon={<FiUsers className="w-4 h-4" />}
                  label="Unit/Consit"
                  name="unit_consit"
                  value={formData.unit_consit || ''}
                  onChange={handleChange}
                  placeholder="Enter unit/consit"
                  className=""
                />
                <IconInput
                  icon={<FiHome className="w-4 h-4" />}
                  label="Room No."
                  name="room_no"
                  value={formData.room_no || ''}
                  onChange={handleChange}
                  placeholder="Enter room number"
                  className=""
                />
                <IconInput
                  icon={<FiHash className="w-4 h-4" />}
                  label="Serial No."
                  name="serial_no"
                  value={formData.serial_no || ''}
                  onChange={handleChange}
                  placeholder="Enter serial number"
                  className=""
                />
              </div>

              {/* Fifth Row - File No., Unit Days */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <IconInput
                  icon={<FiFileText className="w-4 h-4" />}
                  label="File No."
                  name="file_no"
                  value={formData.file_no || ''}
                  onChange={handleChange}
                  placeholder="Enter file number"
                  className=""
                />
                <div className="space-y-2">
                  <Select
                    label="Unit Days"
                    name="unit_days"
                    value={formData.unit_days || ''}
                    onChange={handleChange}
                    options={UNIT_DAYS_OPTIONS}
                    placeholder="Select unit days"
                    searchable={true}
                    className="bg-white/60 backdrop-blur-md border-2 border-gray-300/60"
                  />
                </div>
              </div>


              {/* Address Details */}
              <div className="space-y-6 pt-6 border-t border-white/30">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-md">
                    <FiMapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  Address Details
                </h4>

                <div className="space-y-6">
                  {/* Address Line */}
                  <IconInput
                    icon={<FiHome className="w-4 h-4" />}
                    label="Address Line (House No., Street, Locality)"
                    name="address_line"
                    value={formData.address_line || ''}
                    onChange={handleChange}
                    placeholder="Enter house number, street, locality"
                    required
                    className=""
                  />

                  {/* Location Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <IconInput
                      icon={<FiGlobe className="w-4 h-4" />}
                      label="Country"
                      name="country"
                      value={formData.country || ''}
                      onChange={handleChange}
                      placeholder="Enter country"
                      className=""
                    />
                    <IconInput
                      icon={<FiMapPin className="w-4 h-4" />}
                      label="State"
                      name="state"
                      value={formData.state || ''}
                      onChange={handleChange}
                      placeholder="Enter state"
                      required
                      className=""
                    />
                    <IconInput
                      icon={<FiLayers className="w-4 h-4" />}
                      label="District"
                      name="district"
                      value={formData.district || ''}
                      onChange={handleChange}
                      placeholder="Enter district"
                      required
                      className=""
                    />
                    <IconInput
                      icon={<FiHome className="w-4 h-4" />}
                      label="City/Town/Village"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleChange}
                      placeholder="Enter city, town or village"
                      required
                      className=""
                    />
                  </div>

                  {/* Pin Code Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <IconInput
                      icon={<FiHash className="w-4 h-4" />}
                      label="Pin Code"
                      name="pin_code"
                      value={formData.pin_code || ''}
                      onChange={handleChange}
                      placeholder="Enter pin code"
                      type="number"
                      required
                      className=""
                    />
                  </div>
                </div>
              </div>


            </div>
          </Card>
        </div>

          {/* Basic Information with Glassmorphism */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-3xl blur-xl"></div>
            <Card
              title={
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                    <FiUser className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Basic Information</span>
                </div>
              }
              className="relative mb-8 shadow-2xl border border-white/30 bg-white/70 backdrop-blur-xl rounded-3xl overflow-visible"
            >
              <div className="space-y-8">
                {/* Patient Identification */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    <IconInput
                      icon={<FiFileText className="w-4 h-4" />}
                      label="Psy. No."
                      name="psy_no"
                      value={formData.psy_no}
                      onChange={handlePatientChange}
                      placeholder="Enter PSY number"
                      error={errors.patientPSYNo}
                      className=""
                    />
                    <IconInput
                      icon={<FiHeart className="w-4 h-4" />}
                      label="Special Clinic No."
                      name="special_clinic_no"
                      value={formData.special_clinic_no}
                      onChange={handleChange}
                      placeholder="Enter special clinic number"
                      className=""
                    />
                    <Select
                      label="Age Group"
                      name="age_group"
                      value={formData.age_group || ''}
                      onChange={handleChange}
                      options={AGE_GROUP_OPTIONS}
                      placeholder="Select age group"
                      searchable={true}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50"
                    />
                    <Select
                      label="Family Type"
                      name="family_type"
                      value={formData.family_type || ''}
                      onChange={handleChange}
                      options={FAMILY_TYPE_OPTIONS}
                      placeholder="Select family type"
                      searchable={true}
                      className="bg-gradient-to-r from-teal-50 to-cyan-50"
                    />
                    <Select
                      label="Locality"
                      name="locality"
                      value={formData.locality || ''}
                      onChange={handleChange}
                      options={LOCALITY_OPTIONS}
                      placeholder="Select locality"
                      searchable={true}
                      className="bg-gradient-to-r from-teal-50 to-cyan-50"
                    />
                    <Select
                      label="Religion"
                      name="religion"
                      value={formData.religion || ''}
                      onChange={handleChange}
                      options={RELIGION_OPTIONS}
                      placeholder="Select religion"
                      searchable={true}
                      className="bg-gradient-to-r from-teal-50 to-cyan-50"
                    />
                    <IconInput
                      icon={<FiTrendingUp className="w-4 h-4" />}
                      label="Income (₹)"
                      name="income"
                      value={formData.income}
                      onChange={handleChange}
                      type="number"
                      placeholder="Monthly income"
                      min="0"
                      className="bg-gradient-to-r from-teal-50 to-cyan-50"
                    />


                    <Select
                      icon={<FiBriefcase className="w-4 h-4" />}
                      label=" Occupation"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      options={OCCUPATION_OPTIONS}
                      placeholder="Select education"
                      searchable={true}
                      className="bg-gradient-to-r from-green-50 to-emerald-50"
                    />
                    {/* <div className="space-y-2"> */}
                    <Select
                      icon={<FiBookOpen className="w-4 h-4" />}
                      label="Education"
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      options={EDUCATION_OPTIONS}
                      placeholder="Select education"
                      searchable={true}
                      className="bg-gradient-to-r from-green-50 to-emerald-50"
                    />
                    {/* </div> */}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/30 my-6"></div>



                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                    <h4 className="text-xl font-bold text-gray-900">Appointment & Assignment</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DatePicker
                      icon={<FiCalendar className="w-4 h-4" />}
                      label="Seen in Walk-in-on"
                      name="seen_in_walk_in_on"
                      value={formData.seen_in_walk_in_on}
                      onChange={handleChange}
                      defaultToday={true}
                    />
                    <DatePicker
                      icon={<FiCalendar className="w-4 h-4" />}
                      label="Worked up on"
                      name="worked_up_on"
                      value={formData.worked_up_on}
                      onChange={handleChange}
                      defaultToday={true}
                    />
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FiUser className="w-4 h-4 text-primary-600" />
                        Assigned Doctor
                      </label>
                      <Select
                        name="assigned_doctor_id"
                        value={formData.assigned_doctor_id}
                        onChange={handlePatientChange}
                        options={(usersData?.data?.users || [])
                          .map(u => ({
                            value: String(u.id),
                            label: `${u.name} (${isJR(u.role) ? 'JR' : isSR(u.role) ? 'SR' : u.role})`
                          }))}
                        placeholder="Select doctor (optional)"
                        searchable={true}
                        className="bg-gradient-to-r from-violet-50 to-purple-50"
                        containerClassName="relative z-[9999]"
                        dropdownZIndex={2147483647}
                      />
                    </div>
                    <div className="space-y-2">
                      <IconInput
                        icon={<FiHome className="w-4 h-4" />}
                        label="Assigned Room"
                        name="assigned_room"
                        value={formData.assigned_room || ''}
                        onChange={handleChange}
                        placeholder="Enter assigned room"
                        className="bg-gradient-to-r from-teal-50 to-cyan-50"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                    <h4 className="text-xl font-bold text-gray-900">Marital Status</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Select
                      label="Marital Status"
                      name="marital_status"
                      value={formData.marital_status || ''}
                      onChange={handleChange}
                      options={MARITAL_STATUS}
                      placeholder="Select marital status"
                      searchable={true}
                      className="bg-gradient-to-r from-pink-50 to-rose-50"
                    />
                    <IconInput
                      icon={<FiCalendar className="w-4 h-4" />}
                      label="Year of marriage"
                      name="year_of_marriage"
                      value={formData.year_of_marriage}
                      onChange={handleChange}
                      type="number"
                      placeholder="Enter year of marriage"
                      min="1900"
                      max={new Date().getFullYear()}
                      className="bg-gradient-to-r from-purple-50 to-pink-50"
                    />


                    <IconInput
                      icon={<FiUsers className="w-4 h-4" />}
                      label="No. of Children: M"
                      name="no_of_children_male"
                      value={formData.no_of_children_male}
                      onChange={handleChange}
                      type="number"
                      placeholder="Male"
                      min="0"
                      max="20"
                      className="bg-gradient-to-r from-blue-50 to-indigo-50"
                    />
                    <IconInput
                      icon={<FiUsers className="w-4 h-4" />}
                      label="No. of Children: F"
                      name="no_of_children_female"
                      value={formData.no_of_children_female}
                      onChange={handleChange}
                      type="number"
                      placeholder="Female"
                      min="0"
                      max="20"
                      className="bg-gradient-to-r from-pink-50 to-rose-50"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Family Information with Glassmorphism */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-fuchsia-500/10 rounded-3xl blur-xl"></div>
            <Card
              title={
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-violet-500/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                    <FiHome className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Family Information</span>
                </div>
              }
              className="relative mb-8 shadow-2xl border border-white/30 bg-white/70 backdrop-blur-xl rounded-3xl">
              <div className="space-y-8">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FiUsers className="w-6 h-6 text-primary-600" />
                  Head of the Family
                </h4>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <IconInput
                      icon={<FiUser className="w-4 h-4" />}
                      label="Family Head Name"
                      name="head_name"
                      value={formData.head_name}
                      onChange={handleChange}
                      placeholder="Enter head of family name"
                      className="bg-gradient-to-r from-blue-50 to-indigo-50"
                    />
                    <IconInput
                      icon={<FiClock className="w-4 h-4" />}
                      label=" Family Head  Age"
                      name="head_age"
                      value={formData.head_age}
                      onChange={handleChange}
                      type="number"
                      placeholder="Enter age"
                      min="0"
                      max="150"
                      className="bg-gradient-to-r from-orange-50 to-yellow-50"
                    />
                    <div className="space-y-2">
                      <Select
                        label="Relationship With Family Head"
                        name="head_relationship"
                        value={formData.head_relationship || ''}
                        onChange={handleChange}
                        options={HEAD_RELATIONSHIP_OPTIONS}
                        placeholder="Select relationship"
                        searchable={true}
                        className="bg-gradient-to-r from-green-50 to-emerald-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Select
                        icon={<FiBookOpen className="w-4 h-4" />}
                        label="Family Head Education"
                        name="head_education"
                        value={formData.head_education}
                        onChange={handleChange}
                        options={EDUCATION_OPTIONS}
                        placeholder="Select education"
                        searchable={true}
                        className="bg-gradient-to-r from-green-50 to-emerald-50"
                      />
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <Select
                      icon={<FiBriefcase className="w-4 h-4" />}
                      label=" Family Head Occupation"
                      name="head_occupation"
                      value={formData.head_occupation}
                      onChange={handleChange}
                      options={OCCUPATION_OPTIONS}
                      placeholder="Select education"
                      searchable={true}
                      className="bg-gradient-to-r from-green-50 to-emerald-50"
                    />
                    <IconInput
                      icon={<FiTrendingUp className="w-4 h-4" />}
                      label="Income (₹)"
                      name="head_income"
                      value={formData.head_income}
                      onChange={handleChange}
                      type="number"
                      placeholder="Monthly income"
                      min="0"
                      className="bg-gradient-to-r from-amber-50 to-orange-50"
                    />
                  </div>
                </div>
                {/* </div> */}
              </div>
            </Card>
          </div>

          {/* Referral & Mobility with Glassmorphism */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-sky-500/10 to-blue-500/10 rounded-3xl blur-xl"></div>
            <Card
              title={
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-sky-500/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                    <FiMapPin className="w-6 h-6 text-cyan-600" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Referral & Mobility</span>
                </div>
              }
              className="relative mb-8 shadow-2xl border border-white/30 bg-white/70 backdrop-blur-xl rounded-3xl">
              <div className="space-y-6">
                <IconInput
                  icon={<FiNavigation className="w-4 h-4" />}
                  label="Exact distance from hospital"
                  name="distance_from_hospital"
                  value={formData.distance_from_hospital}
                  onChange={handleChange}
                  placeholder="Enter distance from hospital"
                  className=""
                />

                <div className="space-y-2">
                  <Select
                    label="Mobility of the patient"
                    name="mobility"
                    value={formData.mobility || ''}
                    onChange={handleChange}
                    options={MOBILITY_OPTIONS}
                    placeholder="Select mobility"
                    searchable={true}
                    className="bg-white/60 backdrop-blur-md border-2 border-gray-300/60"
                  />
                </div>

                <div className="space-y-2">
                  <Select
                    label="Referred by"
                    name="referred_by"
                    value={formData.referred_by || ''}
                    onChange={handleChange}
                    options={REFERRED_BY_OPTIONS}
                    placeholder="Select referred by"
                    searchable={true}
                    className="bg-white/60 backdrop-blur-md border-2 border-gray-300/60"
                  />
                </div>
              </div>
            </Card>
          </div>


          {/* Submit Button with Glassmorphism */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-indigo-500/20 to-blue-500/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-2xl border border-white/30">
              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/patients')}
                  className="px-6 lg:px-8 py-3 bg-white/60 backdrop-blur-md border border-white/30 hover:bg-white/80 hover:border-gray-300/50 text-gray-800 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <FiX className="mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isLoading || isAssigning}
                  disabled={isLoading || isAssigning}
                  className="px-6 lg:px-8 py-3 bg-gradient-to-r from-primary-600 via-indigo-600 to-blue-600 hover:from-primary-700 hover:via-indigo-700 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <FiSave className="mr-2" />
                  {isLoading || isAssigning ? 'Creating Record...' : 'Register Patient'}
                </Button>
              </div>
            </div>
          </div>
        </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CreatePatient;