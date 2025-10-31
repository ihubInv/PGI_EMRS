import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  FiUser, FiUsers, FiBriefcase, FiDollarSign, FiHome, FiMapPin, FiPhone, 
  FiCalendar, FiMail, FiGlobe, FiFileText, FiHash, FiClock,
  FiHeart, FiBookOpen, FiTrendingUp, FiShield,
  FiNavigation, FiTruck, FiPhoneCall, FiEdit3, FiSave, FiX, FiLayers, FiLoader
} from 'react-icons/fi';
import { useCreatePatientMutation, useAssignPatientMutation, useSearchPatientsQuery, useCreatePatientCompleteMutation, useCheckCRNumberExistsQuery } from '../../features/patients/patientsApiSlice';
import { useGetDoctorsQuery } from '../../features/users/usersApiSlice';
import { updatePatientRegistrationForm, resetPatientRegistrationForm, selectPatientRegistrationForm } from '../../features/form/formSlice';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import { 
  MARITAL_STATUS, FAMILY_TYPE, LOCALITY, RELIGION, SEX_OPTIONS,
  AGE_GROUP_OPTIONS, OCCUPATION_OPTIONS, EDUCATION_OPTIONS, 
  MOBILITY_OPTIONS, REFERRED_BY_OPTIONS, INDIAN_STATES, UNIT_DAYS_OPTIONS
} from '../../utils/constants';

// Enhanced Radio button component with better styling
const RadioGroup = ({ label, name, value, onChange, options, className = "", inline = true, error, icon }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
        {icon && <span className="text-primary-600">{icon}</span>}
        {label}
      </label>
      <div className={`flex ${inline ? 'flex-wrap gap-4' : 'flex-col space-y-3'}`}>
        {options.map((option) => (
          <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="w-4 h-4 text-primary-600 border-2 border-gray-300 focus:ring-primary-500 focus:ring-2 rounded-full transition-all duration-200 group-hover:border-primary-400"
            />
            <span className="text-sm text-gray-700 group-hover:text-primary-700 transition-colors duration-200">{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
        <FiX className="w-3 h-3" />
        {error}
      </p>}
    </div>
  );
};

// Enhanced Input component with icons
const IconInput = ({ icon, label, loading = false, error, ...props }) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        {icon && <span className="text-primary-600">{icon}</span>}
        {label}
        {loading && (
          <FiLoader className="w-4 h-4 text-blue-500 animate-spin" />
        )}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        <input
          {...props}
          className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-gray-300 ${
            icon ? 'pl-10' : ''
          } ${props.className || ''}`}
        />
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <FiX className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

// Enhanced Date Input component
const DateInput = ({ icon, label, ...props }) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        {icon && <span className="text-primary-600">{icon}</span>}
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiCalendar className="w-5 h-5 text-gray-400" />
        </div>
        <input
          {...props}
          type="date"
          className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-gray-300 appearance-none"
        />
      </div>
    </div>
  );
};


const CreatePatient = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const formData = useSelector(selectPatientRegistrationForm);


  const [createRecord, { isLoading }] = useCreatePatientCompleteMutation();
  const [createPatient, { isLoading: isCreatingPatient }] = useCreatePatientMutation();
  const [assignPatient, { isLoading: isAssigning }] = useAssignPatientMutation();
  // const [createPatientComplete] = useCreatePatientCompleteMutation();
  const { data: usersData } = useGetDoctorsQuery({ page: 1, limit: 100 });

  // State declarations first
  const [errors, setErrors] = useState({});
  const [crValidationTimeout, setCrValidationTimeout] = useState(null);
  const [isValidatingCR, setIsValidatingCR] = useState(false);
  const [currentCRNumber, setCurrentCRNumber] = useState('');
  
  // CR number validation
  const { data: crExists, isLoading: isCheckingCR } = useCheckCRNumberExistsQuery(
    currentCRNumber,
    { skip: !currentCRNumber || currentCRNumber.length < 3 }
  );

  // Debug errors state
  useEffect(() => {
    console.log('Current errors state:', errors);
  }, [errors]);

  // CR validation effect
  useEffect(() => {
    const currentCR = formData.cr_no || formData.top_cr_no;
    
    console.log('CR validation effect:', {
      currentCR,
      crExists,
      isCheckingCR,
      currentCRNumber,
      crLength: currentCR?.length,
      crExistsType: typeof crExists,
      crExistsValue: crExists
    });

    if (currentCR && currentCR.length >= 3) {
      if (currentCR !== currentCRNumber) {
        // CR number changed, clear error immediately and reset validation
        console.log('CR number changed, clearing error immediately');
        setErrors((prev) => ({ ...prev, patientCRNo: '' }));
        setCurrentCRNumber(currentCR);
        // Don't validate yet, wait for API call
        return;
      } else if (currentCR === currentCRNumber && !isCheckingCR) {
        // Only validate if CR number is stable and not checking
        console.log('Validating CR number:', {
          currentCR,
          crExists,
          crExistsType: typeof crExists,
          crExistsValue: crExists
        });
        
        if (crExists === true) {
          // CR exists (exact match), show error
          console.log('CR number exists (exact match), showing error');
          setErrors((prev) => ({ ...prev, patientCRNo: 'CR No. already exists.' }));
        } else if (crExists === false) {
          // CR doesn't exist (exact match), clear error
          console.log('CR number does not exist (exact match), clearing error');
          setErrors((prev) => ({ ...prev, patientCRNo: '' }));
        } else {
          // crExists is undefined or null, clear error to be safe
          console.log('CR number validation result unclear, clearing error');
          setErrors((prev) => ({ ...prev, patientCRNo: '' }));
        }
      }
    } else {
      // CR too short or empty, clear error
      console.log('CR number too short or empty, clearing error');
      setErrors((prev) => ({ ...prev, patientCRNo: '' }));
      setCurrentCRNumber('');
    }
  }, [formData.cr_no, formData.top_cr_no, crExists, isCheckingCR, currentCRNumber]);

  // Function to copy permanent address to present address
  const copyPermanentToPresent = () => {
    dispatch(updatePatientRegistrationForm({
      present_address_line_1: formData.permanent_address_line_1,
      present_country: formData.permanent_country,
      present_state: formData.permanent_state,
      present_district: formData.permanent_district,
      present_city_town_village: formData.permanent_city_town_village,
      present_pin_code: formData.permanent_pin_code,
    }));
    toast.success('Present address copied from permanent address');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updatePatientRegistrationForm({ [name]: value }));
    
    // Clear any existing CR number error when user starts typing
    if (name === 'top_cr_no') {
      // Clear error immediately and force clear
      console.log('Clearing CR error immediately for top_cr_no:', value);
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
          console.log('Setting currentCRNumber for validation:', value);
          setCurrentCRNumber(value);
        }, 500);
        setCrValidationTimeout(timeout);
      }
    }
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    // Auto-fill logic for top fields
    if (name === 'top_cr_no') {
      dispatch(updatePatientRegistrationForm({ cr_no: value }));
    } else if (name === 'top_date') {
      dispatch(updatePatientRegistrationForm({ seen_in_walk_in_on: value }));
    } else if (name === 'top_name') {
      dispatch(updatePatientRegistrationForm({ name: value }));
    } else if (name === 'top_mobile_no') {
      dispatch(updatePatientRegistrationForm({ contact_number: value }));
    } else if (name === 'top_age') {
      dispatch(updatePatientRegistrationForm({ actual_age: value }));
      // Auto-select age group based on age
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
    } else if (name === 'top_sex') {
      dispatch(updatePatientRegistrationForm({ sex: value }));
    } else if (name === 'top_category') {
      dispatch(updatePatientRegistrationForm({ category: value }));
    } else if (name === 'top_father_name') {
      dispatch(updatePatientRegistrationForm({ head_name: value }));
    } else if (name === 'top_address_line_1') {
      dispatch(updatePatientRegistrationForm({ 
        address_line_1: value,
        permanent_address_line_1: value 
      }));
    } else if (name === 'top_country') {
      dispatch(updatePatientRegistrationForm({ 
        country: value,
        permanent_country: value 
      }));
    } else if (name === 'top_state') {
      dispatch(updatePatientRegistrationForm({ 
        state: value,
        permanent_state: value 
      }));
    } else if (name === 'top_district') {
      dispatch(updatePatientRegistrationForm({ 
        district: value,
        permanent_district: value 
      }));
    } else if (name === 'top_city_town_village') {
      dispatch(updatePatientRegistrationForm({ 
        city_town_village: value,
        permanent_city_town_village: value 
      }));
    } else if (name === 'top_pin_code') {
      dispatch(updatePatientRegistrationForm({ 
        pin_code: value,
        permanent_pin_code: value 
      }));
    } else if (name === 'top_department') {
      dispatch(updatePatientRegistrationForm({ department: value }));
    } else if (name === 'top_unit_consit') {
      dispatch(updatePatientRegistrationForm({ unit_consit: value }));
    } else if (name === 'top_room_no') {
      dispatch(updatePatientRegistrationForm({ room_no: value }));
    } else if (name === 'top_serial_no') {
      dispatch(updatePatientRegistrationForm({ serial_no: value }));
    } else if (name === 'top_file_no') {
      dispatch(updatePatientRegistrationForm({ file_no: value }));
    } else if (name === 'top_unit_days') {
      dispatch(updatePatientRegistrationForm({ unit_days: value }));
    }
  };

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    dispatch(updatePatientRegistrationForm({ [name]: value }));

    // Clear any existing CR number error when user starts typing
    if (name === 'cr_no') {
      // Clear error immediately and force clear
      console.log('Clearing CR error immediately for cr_no:', value);
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
          console.log('Setting currentCRNumber for validation:', value);
          setCurrentCRNumber(value);
        }, 500);
        setCrValidationTimeout(timeout);
      }
    }
    
    // Reverse auto-fill logic - update top fields when main fields are filled
    if (name === 'cr_no') {
      dispatch(updatePatientRegistrationForm({ top_cr_no: value }));
    } else if (name === 'seen_in_walk_in_on') {
      dispatch(updatePatientRegistrationForm({ top_date: value }));
    } else if (name === 'name') {
      dispatch(updatePatientRegistrationForm({ top_name: value }));
    } else if (name === 'contact_number') {
      dispatch(updatePatientRegistrationForm({ top_mobile_no: value }));
    } else if (name === 'actual_age') {
      dispatch(updatePatientRegistrationForm({ top_age: value }));
    } else if (name === 'sex') {
      dispatch(updatePatientRegistrationForm({ top_sex: value }));
    } else if (name === 'category') {
      dispatch(updatePatientRegistrationForm({ top_category: value }));
    } else if (name === 'head_name') {
      dispatch(updatePatientRegistrationForm({ top_father_name: value }));
    } else if (name === 'address_line_1') {
      dispatch(updatePatientRegistrationForm({ top_address_line_1: value }));
    } else if (name === 'country') {
      dispatch(updatePatientRegistrationForm({ top_country: value }));
    } else if (name === 'state') {
      dispatch(updatePatientRegistrationForm({ top_state: value }));
    } else if (name === 'district') {
      dispatch(updatePatientRegistrationForm({ top_district: value }));
    } else if (name === 'city_town_village') {
      dispatch(updatePatientRegistrationForm({ top_city_town_village: value }));
    } else if (name === 'pin_code') {
      dispatch(updatePatientRegistrationForm({ top_pin_code: value }));
    } else if (name === 'department') {
      dispatch(updatePatientRegistrationForm({ top_department: value }));
    } else if (name === 'unit_consit') {
      dispatch(updatePatientRegistrationForm({ top_unit_consit: value }));
    } else if (name === 'room_no') {
      dispatch(updatePatientRegistrationForm({ top_room_no: value }));
    } else if (name === 'serial_no') {
      dispatch(updatePatientRegistrationForm({ top_serial_no: value }));
    } else if (name === 'file_no') {
      dispatch(updatePatientRegistrationForm({ top_file_no: value }));
    } else if (name === 'unit_days') {
      dispatch(updatePatientRegistrationForm({ top_unit_days: value }));
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
    const patientName = formData.name || formData.top_name;
    const patientSex = formData.sex || formData.top_sex;
    const patientAge = formData.actual_age || formData.top_age;
    const patientCRNo = formData.cr_no || formData.top_cr_no;

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

  // const handleSubmit = async (e) => {
  //   debugger;
  //   e.preventDefault();

  //   if (!validate()) {
  //     toast.error('Please fix the errors in the form');
  //     return;
  //   }

  //   // Get patient data early for validation
  //   const patientName = (formData.name || formData.top_name || '').trim();
  //   const patientSex = formData.sex || formData.top_sex;
  //   const patientAge = formData.actual_age || formData.top_age;
  //   const patientCRNo = formData.cr_no || formData.top_cr_no;

  //   // Don't submit while checking CR number
  //   if (patientCRNo && isCheckingCR) {
  //     toast.error('Please wait while we check the CR number...');
  //     return;
  //   }

  //   try {
  //     // Step 1: Create patient - ensure we have valid data
  //     if (!patientName) {
  //       toast.error('Patient name is required');
  //       return;
  //     }
  //     if (!patientSex) {
  //       toast.error('Patient sex is required');
  //       return;
  //     }
  //     if (!patientAge) {
  //       toast.error('Patient age is required');
  //       return;
  //     }

  //     // Check for duplicate CR number before creating patient
  //     if (patientCRNo && crExists) {
  //       toast.error(`Patient with CR number ${patientCRNo} already exists. Please use a different CR number or go to "Existing Patients" tab.`);
  //       return;
  //     }

  //     // If CR number is provided but we couldn't check it, warn the user
  //     if (patientCRNo && crExists === undefined && !isCheckingCR) {
  //       toast.warning('Unable to verify CR number availability. Proceeding with caution...');
  //     }

  //     const patientResult = await createPatient({
  //       name: patientName,
  //       sex: patientSex,
  //       actual_age: parseInt(patientAge),
  //       assigned_room: formData.assigned_room,
  //       ...(patientCRNo && { cr_no: patientCRNo }),
  //       ...(formData.psy_no && { psy_no: formData.psy_no }),
  //     }).unwrap();

  //     const patientId = patientResult.data.patient.id;
  //     toast.success('Patient registered successfully!');

  //     // Step 2: Assign doctor if selected
  //     if (formData.assigned_doctor_id) {
  //       try {
  //         await assignPatient({
  //           patient_id: patientId,
  //           assigned_doctor: Number(formData.assigned_doctor_id),
  //           room_no: formData.assigned_room || ''
  //         }).unwrap();
  //       } catch (_) {}
  //     }

  //     // Step 3: Create outpatient record (demographic data)
  //     const demographicData = {
  //       name: patientName,
  //       sex: patientSex,
  //       actual_age: parseInt(patientAge),
  //       assigned_room: formData.assigned_room,
  //       ...(patientCRNo && { cr_no: patientCRNo }),
  //       psy_no: formData.psy_no,
  //       patient_id: parseInt(patientId),
  //       seen_in_walk_in_on: formData.seen_in_walk_in_on || formData.top_date,
  //       worked_up_on: formData.worked_up_on,
  //       special_clinic_no: formData.special_clinic_no,
  //       age_group: formData.age_group,
  //       marital_status: formData.marital_status,
  //       ...(formData.year_of_marriage && { year_of_marriage: parseInt(formData.year_of_marriage) }),
  //       ...(formData.no_of_children && { no_of_children: parseInt(formData.no_of_children) }),
  //       ...(formData.no_of_children_male && { no_of_children_male: parseInt(formData.no_of_children_male) }),
  //       ...(formData.no_of_children_female && { no_of_children_female: parseInt(formData.no_of_children_female) }),
  //       occupation: formData.occupation,
  //       actual_occupation: formData.actual_occupation,
  //       education_level: formData.education_level,
  //       ...(formData.completed_years_of_education && { completed_years_of_education: parseInt(formData.completed_years_of_education) }),
  //       ...(formData.patient_income && { patient_income: parseFloat(formData.patient_income) }),
  //       ...(formData.family_income && { family_income: parseFloat(formData.family_income) }),
  //       religion: formData.religion,
  //       family_type: formData.family_type,
  //       locality: formData.locality,
  //       head_name: formData.head_name || formData.top_father_name,
  //       ...(formData.head_age && { head_age: parseInt(formData.head_age) }),
  //       head_relationship: formData.head_relationship,
  //       head_education: formData.head_education,
  //       head_occupation: formData.head_occupation,
  //       ...(formData.head_income && { head_income: parseFloat(formData.head_income) }),
  //       distance_from_hospital: formData.distance_from_hospital,
  //       mobility: formData.mobility,
  //       referred_by: formData.referred_by,
  //       exact_source: formData.exact_source,
  //       present_address: formData.present_address,
  //       permanent_address: formData.permanent_address,
  //       local_address: formData.local_address,
  //       school_college_office: formData.school_college_office,
  //       contact_number: formData.contact_number || formData.top_mobile_no,
        
  //       // Quick Entry fields
  //       department: formData.department,
  //       unit_consit: formData.unit_consit,
  //       room_no: formData.room_no,
  //       serial_no: formData.serial_no,
  //       file_no: formData.file_no,
  //       unit_days: formData.unit_days,
        
  //       // Address fields (Quick Entry)
  //       address_line_1: formData.top_address_line_1,
  //       country: formData.top_country,
  //       state: formData.top_state,
  //       district: formData.top_district,
  //       city_town_village: formData.top_city_town_village,
  //       pin_code: formData.top_pin_code,
        
  //       // Present Address fields
  //       present_address_line_1: formData.present_address_line_1,
  //       present_country: formData.present_country,
  //       present_state: formData.present_state,
  //       present_district: formData.present_district,
  //       present_city_town_village: formData.present_city_town_village,
  //       present_pin_code: formData.present_pin_code,
        
  //       // Permanent Address fields
  //       permanent_address_line_1: formData.permanent_address_line_1,
  //       permanent_country: formData.permanent_country,
  //       permanent_state: formData.permanent_state,
  //       permanent_district: formData.permanent_district,
  //       permanent_city_town_village: formData.permanent_city_town_village,
  //       permanent_pin_code: formData.permanent_pin_code,
        
  //       // Additional fields
  //       category: formData.category,
  //       ...(formData.assigned_doctor_id && { assigned_doctor_id: parseInt(formData.assigned_doctor_id) }),
  //     };

  //     console.log('demographicData',demographicData);
  //     await createRecord(demographicData).unwrap();
  //     toast.success('patient record created successfully!');

  //     // Reset form after successful submission
  //     dispatch(resetPatientRegistrationForm());

  //     // Navigate to patients list
  //     navigate('/patients');

  //   } catch (err) {
  //     console.error('Submission error:', err);
      
  //     // Handle specific error cases
  //     if (err?.data?.message?.includes('duplicate key value violates unique constraint "patients_cr_no_key"') || 
  //         err?.data?.error?.includes('duplicate key value violates unique constraint "patients_cr_no_key"')) {
  //       toast.error('A patient with this CR number already exists. Please use a different CR number or go to "Existing Patients" tab.');
  //       // Clear the CR number field to help user
  //       dispatch(updatePatientRegistrationForm({ cr_no: '', top_cr_no: '' }));
  //     } else if (err?.data?.message?.includes('duplicate key value violates unique constraint') || 
  //                err?.data?.error?.includes('duplicate key value violates unique constraint')) {
  //       toast.error('A record with this information already exists. Please check your data and try again.');
  //     } else {
  //       toast.error(err?.data?.message || err?.data?.error || 'Failed to create record');
  //     }
  //   }
  // };



  const handleSubmit = async (e) => {
  debugger;
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

  // Get patient data early for validation
  const patientName = (formData.name || formData.top_name || '').trim();
  const patientSex = formData.sex || formData.top_sex;
  const patientAge = formData.actual_age || formData.top_age;
  const patientCRNo = formData.cr_no || formData.top_cr_no;

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

    // Note: CR number validation is handled in real-time by validateCRNumber function

    // If CR number is provided but we couldn't check it, warn the user
    // if (patientCRNo && crExists === undefined && !isCheckingCR) {
    //   toast.warning('Unable to verify CR number availability. Proceeding with caution...');
    // }

    // Step 1: Create complete patient record with ALL data (only ONE API call)
    const completePatientData = {
      name: patientName,
      sex: patientSex,
      actual_age: parseInt(patientAge),
      assigned_room: formData.assigned_room,
      ...(patientCRNo && { cr_no: patientCRNo }),
      psy_no: formData.psy_no,
      seen_in_walk_in_on: formData.seen_in_walk_in_on || formData.top_date,
      worked_up_on: formData.worked_up_on,
      special_clinic_no: formData.special_clinic_no,
        age_group: formData.age_group,
        marital_status: formData.marital_status,
      ...(formData.year_of_marriage && { year_of_marriage: parseInt(formData.year_of_marriage) }),
      ...(formData.no_of_children && { no_of_children: parseInt(formData.no_of_children) }),
      ...(formData.no_of_children_male && { no_of_children_male: parseInt(formData.no_of_children_male) }),
      ...(formData.no_of_children_female && { no_of_children_female: parseInt(formData.no_of_children_female) }),
        occupation: formData.occupation,
        actual_occupation: formData.actual_occupation,
        education_level: formData.education_level,
      ...(formData.completed_years_of_education && { completed_years_of_education: parseInt(formData.completed_years_of_education) }),
      ...(formData.patient_income && { patient_income: parseFloat(formData.patient_income) }),
      ...(formData.family_income && { family_income: parseFloat(formData.family_income) }),
        religion: formData.religion,
        family_type: formData.family_type,
        locality: formData.locality,
      head_name: formData.head_name || formData.top_father_name,
      ...(formData.head_age && { head_age: parseInt(formData.head_age) }),
        head_relationship: formData.head_relationship,
        head_education: formData.head_education,
        head_occupation: formData.head_occupation,
      ...(formData.head_income && { head_income: parseFloat(formData.head_income) }),
        distance_from_hospital: formData.distance_from_hospital,
        mobility: formData.mobility,
        referred_by: formData.referred_by,
        exact_source: formData.exact_source,
        present_address: formData.present_address,
        permanent_address: formData.permanent_address,
        local_address: formData.local_address,
        school_college_office: formData.school_college_office,
      contact_number: formData.contact_number || formData.top_mobile_no,
      
      // Quick Entry fields
      department: formData.department,
      unit_consit: formData.unit_consit,
      room_no: formData.room_no,
      serial_no: formData.serial_no,
      file_no: formData.file_no,
      unit_days: formData.unit_days,
      
      // Address fields (Quick Entry)
      address_line_1: formData.top_address_line_1,
      country: formData.top_country,
      state: formData.top_state,
      district: formData.top_district,
      city_town_village: formData.top_city_town_village,
      pin_code: formData.top_pin_code,
      
      // Present Address fields
      present_address_line_1: formData.present_address_line_1,
      present_country: formData.present_country,
      present_state: formData.present_state,
      present_district: formData.present_district,
      present_city_town_village: formData.present_city_town_village,
      present_pin_code: formData.present_pin_code,
      
      // Permanent Address fields
      permanent_address_line_1: formData.permanent_address_line_1,
      permanent_country: formData.permanent_country,
      permanent_state: formData.permanent_state,
      permanent_district: formData.permanent_district,
      permanent_city_town_village: formData.permanent_city_town_village,
      permanent_pin_code: formData.permanent_pin_code,
      
      // Additional fields
      category: formData.category,
      ...(formData.assigned_doctor_id && { assigned_doctor_id: parseInt(formData.assigned_doctor_id) }),
    };

    console.log('completePatientData', completePatientData);
    
    // Single API call to create patient with all data
    const patientResult = await createRecord(completePatientData).unwrap();
    const patientId = patientResult.data.patient.id;
    
    toast.success('Patient registered successfully!');

    // Step 2: Assign doctor if selected (separate operation)
    if (formData.assigned_doctor_id) {
      try {
        await assignPatient({
          patient_id: patientId,
          assigned_doctor: Number(formData.assigned_doctor_id),
          room_no: formData.assigned_room || ''
        }).unwrap();
      } catch (_) {}
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
      dispatch(updatePatientRegistrationForm({ cr_no: '', top_cr_no: '' }));
    } else if (err?.data?.message?.includes('duplicate key value violates unique constraint') || 
               err?.data?.error?.includes('duplicate key value violates unique constraint')) {
      toast.error('A record with this information already exists. Please check your data and try again.');
    } else {
      toast.error(err?.data?.message || err?.data?.error || 'Failed to create record');
    }
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="w-full px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-primary-800/10 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex justify-between items-center">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg">
                    <FiUser className="w-8 h-8 text-white" />
                  </div>
      <div>
                    <h1 className="text-4xl  font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                      Register New Patient
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">
                      Department of Psychiatry
                    </p>
                    <p className="text-sm text-gray-500">
                      Postgraduate Institute of Medical Education & Research, Chandigarh
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>

        {/* Quick Entry Section */}
        <Card
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FiEdit3 className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-xl font-bold text-gray-900">Quick Entry</span>
            </div>
          }
          className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="space-y-8">
            {/* First Row - Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <IconInput
                icon={<FiHash className="w-4 h-4" />}
                label="CR No."
                name="top_cr_no"
                value={formData.top_cr_no || ''}
                onChange={handleChange}
                placeholder="Enter CR number"
                error={errors.patientCRNo}
                loading={isCheckingCR && formData.top_cr_no && formData.top_cr_no.length >= 3}
                className={`bg-gradient-to-r from-blue-50 to-indigo-50 ${
                  errors.patientCRNo 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : formData.top_cr_no && formData.top_cr_no.length >= 3 && !isCheckingCR && !errors.patientCRNo
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                    : ''
                }`}
              />
              <DateInput
                icon={<FiCalendar className="w-4 h-4" />}
                label="Date"
                name="top_date"
                value={formData.top_date || ''}
                onChange={handleChange}
              />
              <IconInput
                icon={<FiUser className="w-4 h-4" />}
                label="Name"
                name="top_name"
                value={formData.top_name || ''}
                onChange={handleChange}
                placeholder="Enter patient name"
                className="bg-gradient-to-r from-green-50 to-emerald-50"
              />
              <IconInput
                icon={<FiPhone className="w-4 h-4" />}
                label="Mobile No."
                name="top_mobile_no"
                value={formData.top_mobile_no || ''}
                onChange={handleChange}
                placeholder="Enter mobile number"
                className="bg-gradient-to-r from-purple-50 to-pink-50"
              />
            </div>

            {/* Second Row - Age, Sex, Category, Father's Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <IconInput
                icon={<FiClock className="w-4 h-4" />}
                label="Age"
                name="top_age"
                value={formData.top_age || ''}
                onChange={handleChange}
                type="number"
                placeholder="Enter age"
                className="bg-gradient-to-r from-orange-50 to-yellow-50"
              />
              <div className="space-y-4">
                <RadioGroup
                  label="Sex"
                  name="top_sex"
                  value={formData.top_sex || ''}
                  onChange={handleChange}
                  options={SEX_OPTIONS}
                  icon={<FiHeart className="w-4 h-4" />}
                  className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-lg"
                  error={errors.patientSex}
              />
            </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FiShield className="w-4 h-4 text-primary-600" />
                  Category
                </label>
                <Select
                  name="top_category"
                  value={formData.top_category || ''}
                  onChange={handleChange}
                  options={[
                    { value: 'GEN', label: 'General (GEN) / Unreserved (UR)' },
                    { value: 'SC', label: 'Scheduled Caste (SC)' },
                    { value: 'ST', label: 'Scheduled Tribe (ST)' },
                    { value: 'OBC', label: 'Other Backward Class (OBC)' },
                    { value: 'EWS', label: 'Economically Weaker Section (EWS)' }
                  ]}
                  placeholder="Select category"
                  className="bg-gradient-to-r from-indigo-50 to-blue-50"
                />
              </div>
              <IconInput
                icon={<FiUsers className="w-4 h-4" />}
                label="Father's Name"
                name="top_father_name"
                value={formData.top_father_name || ''}
                onChange={handleChange}
                placeholder="Enter father's name"
                className="bg-gradient-to-r from-teal-50 to-cyan-50"
              />
            </div>
            {/* Fourth Row - Department, Unit/Consit, Room No., Serial No. */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <IconInput
                icon={<FiLayers className="w-4 h-4" />}
                label="Department"
                name="top_department"
                value={formData.top_department || ''}
                onChange={handleChange}
                placeholder="Enter department"
                className="bg-gradient-to-r from-violet-50 to-purple-50"
              />
              <IconInput
                icon={<FiUsers className="w-4 h-4" />}
                label="Unit/Consit"
                name="top_unit_consit"
                value={formData.top_unit_consit || ''}
                onChange={handleChange}
                placeholder="Enter unit/consit"
                className="bg-gradient-to-r from-amber-50 to-orange-50"
              />
              <IconInput
                icon={<FiHome className="w-4 h-4" />}
                label="Room No."
                name="top_room_no"
                value={formData.top_room_no || ''}
                onChange={handleChange}
                placeholder="Enter room number"
                className="bg-gradient-to-r from-emerald-50 to-green-50"
              />
              <IconInput
                icon={<FiHash className="w-4 h-4" />}
                label="Serial No."
                name="top_serial_no"
                value={formData.top_serial_no || ''}
                onChange={handleChange}
                placeholder="Enter serial number"
                className="bg-gradient-to-r from-red-50 to-pink-50"
              />
            </div>

            {/* Fifth Row - File No., Unit Days */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IconInput
                icon={<FiFileText className="w-4 h-4" />}
                label="File No."
                name="top_file_no"
                value={formData.top_file_no || ''}
                onChange={handleChange}
                placeholder="Enter file number"
                className="bg-gradient-to-r from-slate-50 to-gray-50"
              />
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiClock className="w-4 h-4 text-primary-600" />
                    Unit Days
                  </label>
                  <div className="text-sm text-gray-600 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-100 font-medium">
                    Mon, Tue, Wed, Thu, Fri, Sat
          </div>
                </div>
              </div>
            </div>


            {/* Address Details */}
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiMapPin className="w-6 h-6 text-primary-600" />
            </div>
                Address Details
              </h4>
              
          <div className="space-y-6">
                {/* Address Line 1 */}
                <IconInput
                  icon={<FiHome className="w-4 h-4" />}
                  label="Address Line 1 (House No., Street, Locality)"
                  name="top_address_line_1"
                  value={formData.top_address_line_1 || ''}
                onChange={handleChange}
                  placeholder="Enter house number, street, locality"
                  required
                  className="bg-gradient-to-r from-green-50 to-emerald-50"
                />

                {/* Country, State, District Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <IconInput
                    icon={<FiGlobe className="w-4 h-4" />}
                    label="Country"
                    name="top_country"
                    value={formData.top_country || ''}
                    onChange={handleChange}
                    placeholder="Enter country"
                    defaultValue="India"
                    className="bg-gradient-to-r from-blue-50 to-cyan-50"
                  />
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <FiMapPin className="w-4 h-4 text-primary-600" />
                      State
                    </label>
              <Select
                      name="top_state"
                      value={formData.top_state || ''}
                onChange={handleChange}
                      options={INDIAN_STATES}
                      placeholder="Select state"
                      required
                      className="bg-gradient-to-r from-indigo-50 to-purple-50"
                    />
                  </div>
                  <IconInput
                    icon={<FiLayers className="w-4 h-4" />}
                    label="District"
                    name="top_district"
                    value={formData.top_district || ''}
                onChange={handleChange}
                    placeholder="Enter district"
                    required
                    className="bg-gradient-to-r from-orange-50 to-yellow-50"
                  />
                </div>

                {/* City/Town/Village, Pin Code Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <IconInput
                    icon={<FiHome className="w-4 h-4" />}
                    label="City / Town / Village"
                    name="top_city_town_village"
                    value={formData.top_city_town_village || ''}
                onChange={handleChange}
                    placeholder="Enter city, town or village"
                    required
                    className="bg-gradient-to-r from-teal-50 to-cyan-50"
                  />
                  <IconInput
                    icon={<FiHash className="w-4 h-4" />}
                    label="Pin Code"
                    name="top_pin_code"
                    value={formData.top_pin_code || ''}
                    onChange={handleChange}
                    placeholder="Enter pin code"
                    type="number"
                    required
                    className="bg-gradient-to-r from-pink-50 to-rose-50"
              />
            </div>
          </div>
            </div>

       
        </div>
      </Card>

      <form onSubmit={handleSubmit}>
          {/* Basic Information */}
  <Card
    title={
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiUser className="w-6 h-6 text-primary-600" />
                </div>
                <span className="text-xl font-bold text-gray-900">Basic Information</span>
      </div>
    }
            // className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
            className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-visible"  // Added overflow-visible
            >
            <div className="space-y-8">
              {/* Patient Identification */}
    <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                  <h4 className="text-xl font-bold text-gray-900">Patient Identification</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <IconInput
                    icon={<FiHash className="w-4 h-4" />}
                    label="CR No."
                    name="cr_no"
                    value={formData.cr_no}
                    onChange={handlePatientChange}
                    placeholder="Enter CR number"
                    error={errors.patientCRNo}
                    loading={isCheckingCR && formData.cr_no && formData.cr_no.length >= 3}
                    className={`bg-gradient-to-r from-blue-50 to-indigo-50 ${
                      errors.patientCRNo 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : formData.cr_no && formData.cr_no.length >= 3 && !isCheckingCR && !errors.patientCRNo
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                        : ''
                    }`}
                  />
                  <IconInput
                    icon={<FiFileText className="w-4 h-4" />}
                    label="Psy. No."
                    name="psy_no"
                    value={formData.psy_no}
                    onChange={handlePatientChange}
                    placeholder="Enter PSY number"
                    error={errors.patientPSYNo}
                    className="bg-gradient-to-r from-green-50 to-emerald-50"
                  />
                  <IconInput
                    icon={<FiHeart className="w-4 h-4" />}
                    label="Special Clinic No."
                    name="special_clinic_no"
                    value={formData.special_clinic_no}
                    onChange={handleChange}
                    placeholder="Enter special clinic number"
                    className="bg-gradient-to-r from-purple-50 to-pink-50"
                  />
                  <IconInput
                    icon={<FiFileText className="w-4 h-4" />}
                    label="File No."
                    name="file_no"
                    value={formData.file_no}
                    onChange={handleChange}
                    placeholder="Enter file number"
                    className="bg-gradient-to-r from-orange-50 to-yellow-50"
                  />
                </div>
              </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

              {/* Patient Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                  <h4 className="text-xl font-bold text-gray-900">Patient Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <IconInput
                    icon={<FiUser className="w-4 h-4" />}
                    label="Name"
        name="name"
        value={formData.name}
        onChange={handlePatientChange}
        placeholder="Enter full name"
        error={errors.patientName}
        required
                    className="bg-gradient-to-r from-green-50 to-emerald-50"
                  />
                  <IconInput
                    icon={<FiClock className="w-4 h-4" />}
                    label="Actual Age"
          name="actual_age"
          value={formData.actual_age}
          onChange={handlePatientChange}
                    type="number"
          placeholder="Enter age"
          error={errors.patientAge}
          required
          min="0"
          max="150"
                    className="bg-gradient-to-r from-orange-50 to-yellow-50"
                  />
                  <RadioGroup
                    label="Sex M/F/Other"
                    name="sex"
                    value={formData.sex}
        onChange={handlePatientChange}
                    options={SEX_OPTIONS}
                    icon={<FiHeart className="w-4 h-4" />}
                    className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-lg"
                  />
                  <RadioGroup
                    label="Age Group"
                    name="age_group"
                    value={formData.age_group}
                    onChange={handleChange}
                    options={AGE_GROUP_OPTIONS}
                    icon={<FiClock className="w-4 h-4" />}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg"
                  />
                </div>
      </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

              {/* Appointment & Assignment */}
              
              {/* <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                  <h4 className="text-xl font-bold text-gray-900">Appointment & Assignment</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <DateInput
                    icon={<FiCalendar className="w-4 h-4" />}
                    label="Seen in Walk-in-on"
                    name="seen_in_walk_in_on"
                    value={formData.seen_in_walk_in_on}
                    onChange={handleChange}
                  />
                  <DateInput
                    icon={<FiCalendar className="w-4 h-4" />}
                    label="Worked up on"
                    name="worked_up_on"
                    value={formData.worked_up_on}
                    onChange={handleChange}
                  />
                  <div className="space-y-2 ">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <FiUser className="w-4 h-4 text-primary-600" />
                      Assign Doctor (JR/SR)
                    </label>
        <Select
          name="assigned_doctor_id"
          value={formData.assigned_doctor_id}
          onChange={handlePatientChange}
          options={(usersData?.data?.users || [])
            .filter(u => u.role === 'JR' || u.role === 'SR')
            .map(u => ({ value: String(u.id), label: `${u.name} (${u.role})` }))}
          placeholder="Select doctor (optional)"
                      className="bg-gradient-to-r from-violet-50 to-purple-50"
        />
      </div>
    </div>
              </div> */}
    <div className="space-y-6">
  <div className="flex items-center gap-3">
    <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
    <h4 className="text-xl font-bold text-gray-900">Appointment & Assignment</h4>
        </div>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <DateInput
      icon={<FiCalendar className="w-4 h-4" />}
      label="Seen in Walk-in-on"
      name="seen_in_walk_in_on"
      value={formData.seen_in_walk_in_on}
          onChange={handleChange}
        />
    <DateInput
      icon={<FiCalendar className="w-4 h-4" />}
      label="Worked up on"
      name="worked_up_on"
      value={formData.worked_up_on}
          onChange={handleChange}
    />
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <FiUser className="w-4 h-4 text-primary-600" />
        Assign Doctor (JR/SR)
      </label>
      <Select
        name="assigned_doctor_id"
        value={formData.assigned_doctor_id}
        onChange={handlePatientChange}
        options={(usersData?.data?.users || [])
          .filter(u => u.role === 'JR' || u.role === 'SR')
          .map(u => ({ value: String(u.id), label: `${u.name} (${u.role})` }))}
        placeholder="Select doctor (optional)"
        className="bg-gradient-to-r from-violet-50 to-purple-50"
        containerClassName="relative z-[9999]"
        dropdownZIndex={2147483647}
        />
      </div>
    </div>
</div>
          </div>
        </Card>

{/* Personal Information */}
<Card
  title={
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiUsers className="w-6 h-6 text-primary-600" />
                </div>
                <span className="text-xl font-bold text-gray-900">Personal Information</span>
    </div>
  }
            // className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
            className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-visible"  // Added overflow-visible
            >
            <div className="space-y-8">
              <RadioGroup
          label="Marital Status"
          name="marital_status"
          value={formData.marital_status}
          onChange={handleChange}
          options={MARITAL_STATUS}
                icon={<FiHeart className="w-4 h-4" />}
                className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-lg"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
</Card>

        {/* Occupation & Education */}
        <Card
          title={
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiBriefcase className="w-6 h-6 text-primary-600" />
                </div>
                <span className="text-xl font-bold text-gray-900">Occupation & Education</span>
            </div>
          }
            className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div className="space-y-8">
              <RadioGroup
                label="Occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                options={OCCUPATION_OPTIONS}
                icon={<FiBriefcase className="w-4 h-4" />}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg"
              />

              <IconInput
                icon={<FiEdit3 className="w-4 h-4" />}
                label="Actual Occupation"
                name="actual_occupation"
                value={formData.actual_occupation}
                onChange={handleChange}
                placeholder="Enter detailed occupation"
                className="bg-gradient-to-r from-green-50 to-emerald-50"
              />

              <div className="space-y-6">
                <label className="flex items-center gap-2 text-lg font-bold text-gray-700 mb-4">
                  <FiBookOpen className="w-5 h-5 text-primary-600" />
                  Education
                </label>
                <div className="space-y-4">
                  {/* Education options except "Not Known" */}
                  <div className="flex flex-wrap gap-4">
                    {EDUCATION_OPTIONS.slice(0, -1).map((option) => (
                      <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="radio"
                name="education_level"
                          value={option.value}
                          checked={formData.education_level === option.value}
                onChange={handleChange}
                          className="w-4 h-4 text-primary-600 border-2 border-gray-300 focus:ring-primary-500 focus:ring-2 rounded-full transition-all duration-200 group-hover:border-primary-400"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-primary-700 transition-colors duration-200">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  
                  {/* "Not Known" option with "Completed years of education" field */}
                  <div className="flex items-center gap-4 flex-wrap bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="education_level"
                        value="not_known"
                        checked={formData.education_level === 'not_known'}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-600 border-2 border-gray-300 focus:ring-primary-500 focus:ring-2 rounded-full transition-all duration-200"
                      />
                      <span className="text-sm text-gray-700 font-medium">Not Known</span>
                    </label>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 font-medium">Completed years of education:</span>
                      <input
                type="number"
                name="completed_years_of_education"
                value={formData.completed_years_of_education}
                onChange={handleChange}
                        placeholder="Years"
                min="0"
                        max="30"
                        className="w-24 px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </Card>

        {/* Financial Information */}
        <Card
          title={
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiDollarSign className="w-6 h-6 text-primary-600" />
                </div>
                <span className="text-xl font-bold text-gray-900">Financial Information</span>
            </div>
          }
            className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <IconInput
                  icon={<FiTrendingUp className="w-4 h-4" />}
                  label="Exact income of patient (₹)"
              name="patient_income"
              value={formData.patient_income}
              onChange={handleChange}
                  type="number"
              placeholder="Monthly income"
              min="0"
                  className="bg-gradient-to-r from-green-50 to-emerald-50"
                />
                <IconInput
                  icon={<FiTrendingUp className="w-4 h-4" />}
                  label="Exact income of family (₹)"
              name="family_income"
              value={formData.family_income}
              onChange={handleChange}
                  type="number"
              placeholder="Total monthly family income"
              min="0"
                  className="bg-gradient-to-r from-blue-50 to-indigo-50"
            />
              </div>
          </div>
        </Card>

        {/* Family Information */}
        <Card
          title={
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiHome className="w-6 h-6 text-primary-600" />
                </div>
                <span className="text-xl font-bold text-gray-900">Family Information</span>
            </div>
          }
            className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div className="space-y-8">
              {/* Religion Section */}
          <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                  <h4 className="text-xl font-bold text-gray-900">Religion</h4>
                </div>
                <RadioGroup
                  label=""
                name="religion"
                value={formData.religion}
                onChange={handleChange}
                options={RELIGION}
                  icon={<FiShield className="w-4 h-4" />}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Family Type Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                  <h4 className="text-xl font-bold text-gray-900">Family Type</h4>
                </div>
                <RadioGroup
                  label=""
                name="family_type"
                value={formData.family_type}
                onChange={handleChange}
                options={FAMILY_TYPE}
                  icon={<FiUsers className="w-4 h-4" />}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Locality Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                  <h4 className="text-xl font-bold text-gray-900">Locality</h4>
                </div>
                <RadioGroup
                  label=""
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                options={LOCALITY}
                  icon={<FiMapPin className="w-4 h-4" />}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg"
              />
            </div>

              <div className="border-t pt-8">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FiUsers className="w-6 h-6 text-primary-600" />
                  Head of the Family
                </h4>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <IconInput
                      icon={<FiUser className="w-4 h-4" />}
                label="Name"
                name="head_name"
                value={formData.head_name}
                onChange={handleChange}
                      placeholder="Enter head of family name"
                      className="bg-gradient-to-r from-blue-50 to-indigo-50"
              />
                    <IconInput
                      icon={<FiClock className="w-4 h-4" />}
                label="Age"
                name="head_age"
                value={formData.head_age}
                onChange={handleChange}
                      type="number"
                      placeholder="Enter age"
                min="0"
                      max="150"
                      className="bg-gradient-to-r from-orange-50 to-yellow-50"
              />
                    <IconInput
                      icon={<FiUsers className="w-4 h-4" />}
                label="Relationship"
                name="head_relationship"
                value={formData.head_relationship}
                onChange={handleChange}
                      placeholder="Enter relationship"
                      className="bg-gradient-to-r from-green-50 to-emerald-50"
              />
                    <IconInput
                      icon={<FiBookOpen className="w-4 h-4" />}
                label="Education"
                name="head_education"
                value={formData.head_education}
                onChange={handleChange}
                      placeholder="Enter education level"
                      className="bg-gradient-to-r from-purple-50 to-pink-50"
              />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <IconInput
                      icon={<FiBriefcase className="w-4 h-4" />}
                label="Occupation"
                name="head_occupation"
                value={formData.head_occupation}
                onChange={handleChange}
                      placeholder="Enter occupation"
                      className="bg-gradient-to-r from-teal-50 to-cyan-50"
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
            </div>
          </div>
        </Card>

          {/* Referral & Mobility */}
        <Card
          title={
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiMapPin className="w-6 h-6 text-primary-600" />
                </div>
                <span className="text-xl font-bold text-gray-900">Referral & Mobility</span>
            </div>
          }
            className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="space-y-6">
              <IconInput
                icon={<FiNavigation className="w-4 h-4" />}
                label="Exact distance from hospital"
                name="distance_from_hospital"
                value={formData.distance_from_hospital}
                onChange={handleChange}
                placeholder="Enter distance from hospital"
                className="bg-gradient-to-r from-blue-50 to-indigo-50"
              />

              <RadioGroup
                label="Mobility of the patient"
                name="mobility"
                value={formData.mobility}
                onChange={handleChange}
                options={MOBILITY_OPTIONS}
                icon={<FiTruck className="w-4 h-4" />}
                className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RadioGroup
                  label="Referred by"
                name="referred_by"
                value={formData.referred_by}
                onChange={handleChange}
                  options={REFERRED_BY_OPTIONS}
                  icon={<FiUsers className="w-4 h-4" />}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg"
                />
                <IconInput
                  icon={<FiEdit3 className="w-4 h-4" />}
                  label="Exact source"
                name="exact_source"
                value={formData.exact_source}
                onChange={handleChange}
                  placeholder="Enter exact source"
                  className="bg-gradient-to-r from-orange-50 to-yellow-50"
              />
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card
          title={
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiPhone className="w-6 h-6 text-primary-600" />
                </div>
                <span className="text-xl font-bold text-gray-900">Contact Information</span>
            </div>
          }
            className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div className="space-y-8">

              {/* Present Address */}
          <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <FiMapPin className="w-6 h-6 text-primary-600" />
                    </div>
                    Present Address
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyPermanentToPresent}
                    className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 border-primary-200 hover:bg-primary-50"
                  >
                    Same as Permanent Address
                  </Button>
                </div>
              
                <div className="space-y-6">
                  {/* Address Line 1 */}
                  <IconInput
                    icon={<FiHome className="w-4 h-4" />}
                    label="Address Line 1 (House No., Street, Locality)"
                    name="present_address_line_1"
                    value={formData.present_address_line_1}
              onChange={handleChange}
                    placeholder="Enter house number, street, locality"
                    required
                    className="bg-gradient-to-r from-green-50 to-emerald-50"
                  />

                  {/* Country, State, District Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <IconInput
                      icon={<FiGlobe className="w-4 h-4" />}
                      label="Country"
                      name="present_country"
                      value={formData.present_country}
              onChange={handleChange}
                      placeholder="Enter country"
                      defaultValue="India"
                      className="bg-gradient-to-r from-blue-50 to-cyan-50"
                    />
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FiMapPin className="w-4 h-4 text-primary-600" />
                        State
                      </label>
                      <Select
                        name="present_state"
                        value={formData.present_state}
                        onChange={handleChange}
                        options={INDIAN_STATES}
                        placeholder="Select state"
                        required
                        className="bg-gradient-to-r from-indigo-50 to-purple-50"
                      />
                    </div>
                    <IconInput
                      icon={<FiLayers className="w-4 h-4" />}
                      label="District"
                      name="present_district"
                      value={formData.present_district}
                      onChange={handleChange}
                      placeholder="Enter district"
                      required
                      className="bg-gradient-to-r from-orange-50 to-yellow-50"
                    />
                  </div>

                  {/* City/Town/Village, Pin Code Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <IconInput
                      icon={<FiHome className="w-4 h-4" />}
                      label="City / Town / Village"
                      name="present_city_town_village"
                      value={formData.present_city_town_village}
              onChange={handleChange}
                      placeholder="Enter city, town or village"
                      required
                      className="bg-gradient-to-r from-teal-50 to-cyan-50"
                    />
                    <IconInput
                      icon={<FiHash className="w-4 h-4" />}
                      label="Pin Code"
                      name="present_pin_code"
                      value={formData.present_pin_code}
                      onChange={handleChange}
                      placeholder="Enter pin code"
                      type="number"
                      required
                      className="bg-gradient-to-r from-pink-50 to-rose-50"
                    />
                  </div>
                </div>
            </div>

              {/* Permanent Address */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <FiMapPin className="w-6 h-6 text-primary-600" />
                  </div>
                  Permanent Address
                </h4>
              
                <div className="space-y-6">
                  {/* Address Line 1 */}
                  <IconInput
                    icon={<FiHome className="w-4 h-4" />}
                    label="Address Line 1 (House No., Street, Locality)"
                    name="permanent_address_line_1"
                    value={formData.permanent_address_line_1}
              onChange={handleChange}
                    placeholder="Enter house number, street, locality"
                    required
                    className="bg-gradient-to-r from-green-50 to-emerald-50"
                  />

                  {/* Country, State, District Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <IconInput
                      icon={<FiGlobe className="w-4 h-4" />}
                      label="Country"
                      name="permanent_country"
                      value={formData.permanent_country}
                      onChange={handleChange}
                      placeholder="Enter country"
                      defaultValue="India"
                      className="bg-gradient-to-r from-blue-50 to-cyan-50"
                    />
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FiMapPin className="w-4 h-4 text-primary-600" />
                        State
                      </label>
                      <Select
                        name="permanent_state"
                        value={formData.permanent_state}
                        onChange={handleChange}
                        options={INDIAN_STATES}
                        placeholder="Select state"
                        required
                        className="bg-gradient-to-r from-indigo-50 to-purple-50"
                      />
                    </div>
                    <IconInput
                      icon={<FiLayers className="w-4 h-4" />}
                      label="District"
                      name="permanent_district"
                      value={formData.permanent_district}
                      onChange={handleChange}
                      placeholder="Enter district"
                      required
                      className="bg-gradient-to-r from-orange-50 to-yellow-50"
                    />
                  </div>

                  {/* City/Town/Village, Pin Code Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <IconInput
                      icon={<FiHome className="w-4 h-4" />}
                      label="City / Town / Village"
                      name="permanent_city_town_village"
                      value={formData.permanent_city_town_village}
                      onChange={handleChange}
                      placeholder="Enter city, town or village"
                      required
                      className="bg-gradient-to-r from-teal-50 to-cyan-50"
                    />
                    <IconInput
                      icon={<FiHash className="w-4 h-4" />}
                      label="Pin Code"
                      name="permanent_pin_code"
                      value={formData.permanent_pin_code}
                      onChange={handleChange}
                      placeholder="Enter pin code"
                      type="number"
                      required
                      className="bg-gradient-to-r from-pink-50 to-rose-50"
                    />
                  </div>
                </div>
            </div>

              {/* Additional Contact Information */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <FiEdit3 className="w-4 h-4 text-primary-600" />
                      Local Address (School/College/Office/Other)
                    </label>
                    <Textarea
                      name="local_address"
                      value={formData.local_address}
                      onChange={handleChange}
                      placeholder="Enter local address"
                      rows={3}
                      className="bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    />
                  </div>
                  <IconInput
                    icon={<FiPhone className="w-4 h-4" />}
              label="Contact Number"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
                    placeholder="Enter contact number"
                    className="bg-gradient-to-r from-blue-50 to-indigo-50"
                  />
                </div>

                <IconInput
                  icon={<FiLayers className="w-4 h-4" />}
                  label="School/College/Office"
                  name="school_college_office"
                  value={formData.school_college_office}
                  onChange={handleChange}
                  placeholder="Enter school/college/office name"
                  className="bg-gradient-to-r from-purple-50 to-pink-50"
                />
              </div>
          </div>
        </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/patients')}
              className="px-8 py-3 bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200 hover:bg-gray-100 transition-all duration-200"
            >
              <FiX className="mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading || isCreatingPatient || isAssigning}
              disabled={isLoading || isCreatingPatient || isAssigning}
              className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <FiSave className="mr-2" />
              {isLoading || isCreatingPatient || isAssigning ? 'Creating Record...' : 'Register Patient'}
            </Button>
          </div>
      </form>
      </div>
    </div>
  );
};

export default CreatePatient;