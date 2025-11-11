import { useState, useMemo, useEffect } from 'react';
import { 
  FiUser, FiUsers, FiBriefcase, FiDollarSign, FiMapPin, FiPhone, FiFileText, 
  FiFolder,  FiCalendar, FiHome, FiActivity, FiHeart, FiClock, 
  FiShield,  FiLayers, FiHash,  FiEdit3, FiBookOpen,
  FiNavigation,  FiUserCheck, FiInfo, FiChevronDown, FiChevronUp, FiTag,
  FiPackage
} from 'react-icons/fi';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { 
  SEX_OPTIONS, MARITAL_STATUS, FAMILY_TYPE, LOCALITY, RELIGION, 
  AGE_GROUP_OPTIONS, OCCUPATION_OPTIONS, EDUCATION_OPTIONS, 
  MOBILITY_OPTIONS, REFERRED_BY_OPTIONS, INDIAN_STATES, UNIT_DAYS_OPTIONS 
} from '../../utils/constants';
import { isJR, isSR, isMWO, isAdmin, isJrSr } from '../../utils/constants';
import { useGetPrescriptionsByProformaIdQuery } from '../../features/prescriptions/prescriptionApiSlice';
import {
  useUpdatePatientMutation,
} from '../../features/patients/patientsApiSlice';
import {
  useUpdateClinicalProformaMutation,
} from '../../features/clinical/clinicalApiSlice';
import {
  useUpdateADLFileMutation,
} from '../../features/adl/adlApiSlice';
import { toast } from 'react-toastify';

// Enhanced Radio button component
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
        <FiInfo className="w-3 h-3" />
        {error}
      </p>}
    </div>
  );
};

// Enhanced Input component with icons
const IconInput = ({ icon, label, ...props }) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        {icon && <span className="text-primary-600">{icon}</span>}
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        <input
          {...props}
          className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-gray-300 ${
            icon ? 'pl-10' : ''
          } ${props.className || ''}`}
        />
      </div>
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
          className="w-full px-4 py-2 pl-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-gray-300 appearance-none"
        />
      </div>
    </div>
  );
};

const PatientDetailsEdit = ({ patient, formData, clinicalData, adlData, usersData, userRole, onSave, onCancel }) => {
  const [expandedCards, setExpandedCards] = useState({
    patient: false,
    clinical: false,
    adl: false,
    prescriptions: false
  });

  const toggleCard = (cardName) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardName]: !prev[cardName]
    }));
  };

  // Mutation hooks
  const [updatePatient, { isLoading: isUpdatingPatient }] = useUpdatePatientMutation();
  const [updateClinicalProforma, { isLoading: isUpdatingClinical }] = useUpdateClinicalProformaMutation();
  const [updateADLFile, { isLoading: isUpdatingADL }] = useUpdateADLFileMutation();

  // Local state for form data
  const [localFormData, setLocalFormData] = useState(formData || {});
  const [clinicalFormData, setClinicalFormData] = useState({});
  const [adlFormData, setAdlFormData] = useState({});

  // Filter ADL files for this patient
  const patientAdlFiles=adlData?.data?.adlFiles || [];
  
  // Get clinical proformas for this patient
  const patientProformas = clinicalData?.data?.proformas || [];

  // Fetch prescriptions for all proformas
  const proformaIds = patientProformas.map(p => p.id).filter(Boolean);
  
  // Fetch prescriptions for each proforma - using hooks in a stable array
  // Note: This is safe as long as proformaIds array length is stable
  const prescriptionResults = proformaIds.map(proformaId => 
    useGetPrescriptionsByProformaIdQuery(proformaId, { skip: !proformaId })
  );

  // Combine all prescriptions and group by proforma/visit date
  const allPrescriptions = useMemo(() => {
    const prescriptions = [];
    prescriptionResults.forEach((result, index) => {
      if (result.data?.data?.prescriptions) {
        const proformaId = proformaIds[index];
        const proforma = patientProformas.find(p => p.id === proformaId);
        result.data.data.prescriptions.forEach(prescription => {
          prescriptions.push({
            ...prescription,
            proforma_id: proformaId,
            visit_date: proforma?.visit_date || proforma?.created_at,
            visit_type: proforma?.visit_type
          });
        });
      }
    });
    // Sort by visit date (most recent first)
    return prescriptions.sort((a, b) => {
      const dateA = new Date(a.visit_date || 0);
      const dateB = new Date(b.visit_date || 0);
      return dateB - dateA;
    });
  }, [prescriptionResults, patientProformas, proformaIds]);

  // Group prescriptions by visit date
  const prescriptionsByVisit = useMemo(() => {
    const grouped = {};
    allPrescriptions.forEach(prescription => {
      const visitDate = prescription.visit_date 
        ? formatDate(prescription.visit_date) 
        : 'Unknown Date';
      if (!grouped[visitDate]) {
        grouped[visitDate] = {
          date: prescription.visit_date,
          visitType: prescription.visit_type,
          prescriptions: []
        };
      }
      grouped[visitDate].prescriptions.push(prescription);
    });
    return grouped;
  }, [allPrescriptions]);

  // Check if user can view prescriptions (Admin or JR/SR, not MWO)
  const canViewPrescriptions = !isMWO(userRole) && (isAdmin(userRole) || isJrSr(userRole));

  // Initialize clinical and ADL form data
  useEffect(() => {
    if (patientProformas.length > 0) {
      // Use the first/latest proforma for editing
      const latestProforma = patientProformas[0];
      setClinicalFormData({
        id: latestProforma.id,
        visit_date: latestProforma.visit_date || '',
        visit_type: latestProforma.visit_type || '',
        room_no: latestProforma.room_no || '',
        case_severity: latestProforma.case_severity || '',
        decision: latestProforma.decision || '',
        diagnosis: latestProforma.diagnosis || '',
      });
    }
  }, [patientProformas]);

  useEffect(() => {
    if (patientAdlFiles.length > 0) {
      // Use the first/latest ADL file for editing
      const latestADL = patientAdlFiles[0];
      
      // Parse JSON fields if they're strings
      const parseJSONField = (field) => {
        if (!field) return [];
        if (Array.isArray(field)) return field;
        try {
          return typeof field === 'string' ? JSON.parse(field) : field;
        } catch {
          return [];
        }
      };

      setAdlFormData({
        id: latestADL.id,
        // Basic fields
        adl_no: latestADL.adl_no || '',
        file_status: latestADL.file_status || '',
        physical_file_location: latestADL.physical_file_location || '',
        notes: latestADL.notes || '',
        // Complaints
        complaints_patient: parseJSONField(latestADL.complaints_patient),
        complaints_informant: parseJSONField(latestADL.complaints_informant),
        informants: parseJSONField(latestADL.informants),
        // History
        history_narrative: latestADL.history_narrative || '',
        history_specific_enquiry: latestADL.history_specific_enquiry || '',
        history_drug_intake: latestADL.history_drug_intake || '',
        history_treatment_place: latestADL.history_treatment_place || '',
        history_treatment_drugs: latestADL.history_treatment_drugs || '',
        history_treatment_response: latestADL.history_treatment_response || '',
        // Past History
        past_history_medical: latestADL.past_history_medical || '',
        past_history_psychiatric_diagnosis: latestADL.past_history_psychiatric_diagnosis || '',
        past_history_psychiatric_treatment: latestADL.past_history_psychiatric_treatment || '',
        past_history_psychiatric_interim: latestADL.past_history_psychiatric_interim || '',
        // Family History
        family_history_father_age: latestADL.family_history_father_age || '',
        family_history_father_education: latestADL.family_history_father_education || '',
        family_history_father_occupation: latestADL.family_history_father_occupation || '',
        family_history_father_personality: latestADL.family_history_father_personality || '',
        family_history_father_deceased: latestADL.family_history_father_deceased || false,
        family_history_mother_age: latestADL.family_history_mother_age || '',
        family_history_mother_education: latestADL.family_history_mother_education || '',
        family_history_mother_occupation: latestADL.family_history_mother_occupation || '',
        family_history_mother_personality: latestADL.family_history_mother_personality || '',
        family_history_mother_deceased: latestADL.family_history_mother_deceased || false,
        family_history_siblings: parseJSONField(latestADL.family_history_siblings),
        // MSE
        mse_general_demeanour: latestADL.mse_general_demeanour || '',
        mse_affect_subjective: latestADL.mse_affect_subjective || '',
        mse_thought_flow: latestADL.mse_thought_flow || '',
        mse_cognitive_consciousness: latestADL.mse_cognitive_consciousness || '',
        mse_cognitive_orientation_time: latestADL.mse_cognitive_orientation_time || '',
        mse_cognitive_orientation_place: latestADL.mse_cognitive_orientation_place || '',
        mse_insight_understanding: latestADL.mse_insight_understanding || '',
        mse_insight_judgement: latestADL.mse_insight_judgement || '',
        // Diagnostic
        diagnostic_formulation_summary: latestADL.diagnostic_formulation_summary || '',
        diagnostic_formulation_features: latestADL.diagnostic_formulation_features || '',
        diagnostic_formulation_psychodynamic: latestADL.diagnostic_formulation_psychodynamic || '',
        provisional_diagnosis: latestADL.provisional_diagnosis || '',
        treatment_plan: latestADL.treatment_plan || '',
        consultant_comments: latestADL.consultant_comments || '',
      });
    }
  }, [patientAdlFiles]);

  // Update local form data when prop changes
  useEffect(() => {
    if (formData) {
      setLocalFormData(formData);
    }
  }, [formData]);

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setLocalFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClinicalChange = (e) => {
    const { name, value } = e.target;
    setClinicalFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleADLChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setAdlFormData(prev => ({ ...prev, [name]: e.target.checked }));
    } else {
      setAdlFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleADLArrayChange = (fieldName, index, subField, value) => {
    setAdlFormData(prev => {
      const array = [...(prev[fieldName] || [])];
      if (!array[index]) array[index] = {};
      array[index][subField] = value;
      return { ...prev, [fieldName]: array };
    });
  };

  const handleSaveAll = async () => {
    try {
      // Save patient data
      if (patient?.id) {
        const patientPayload = {
          id: patient.id,
          name: localFormData.name,
          sex: localFormData.sex,
          actual_age: localFormData.actual_age ? parseInt(localFormData.actual_age) : null,
          assigned_room: localFormData.assigned_room,
          contact_number: localFormData.contact_number,
          age_group: localFormData.age_group,
          marital_status: localFormData.marital_status,
          year_of_marriage: localFormData.year_of_marriage ? parseInt(localFormData.year_of_marriage) : null,
          no_of_children: localFormData.no_of_children ? parseInt(localFormData.no_of_children) : null,
          no_of_children_male: localFormData.no_of_children_male ? parseInt(localFormData.no_of_children_male) : null,
          no_of_children_female: localFormData.no_of_children_female ? parseInt(localFormData.no_of_children_female) : null,
          dob: localFormData.dob || null,
          occupation: localFormData.occupation,
          actual_occupation: localFormData.actual_occupation,
          education_level: localFormData.education_level,
          completed_years_of_education: localFormData.completed_years_of_education ? parseInt(localFormData.completed_years_of_education) : null,
          patient_income: localFormData.patient_income ? parseFloat(localFormData.patient_income) : null,
          family_income: localFormData.family_income ? parseFloat(localFormData.family_income) : null,
          religion: localFormData.religion,
          family_type: localFormData.family_type,
          locality: localFormData.locality,
          head_name: localFormData.head_name,
          head_age: localFormData.head_age ? parseInt(localFormData.head_age) : null,
          head_relationship: localFormData.head_relationship,
          head_education: localFormData.head_education,
          head_occupation: localFormData.head_occupation,
          head_income: localFormData.head_income ? parseFloat(localFormData.head_income) : null,
          distance_from_hospital: localFormData.distance_from_hospital,
          mobility: localFormData.mobility,
          referred_by: localFormData.referred_by,
          exact_source: localFormData.exact_source,
          seen_in_walk_in_on: localFormData.seen_in_walk_in_on,
          worked_up_on: localFormData.worked_up_on,
          present_address: localFormData.present_address,
          permanent_address: localFormData.permanent_address,
          local_address: localFormData.local_address,
          school_college_office: localFormData.school_college_office,
          present_address_line_1: localFormData.present_address_line_1,
          present_address_line_2: localFormData.present_address_line_2,
          present_city_town_village: localFormData.present_city_town_village,
          present_district: localFormData.present_district,
          present_state: localFormData.present_state,
          present_pin_code: localFormData.present_pin_code,
          present_country: localFormData.present_country,
          permanent_address_line_1: localFormData.permanent_address_line_1,
          permanent_address_line_2: localFormData.permanent_address_line_2,
          permanent_city_town_village: localFormData.permanent_city_town_village,
          permanent_district: localFormData.permanent_district,
          permanent_state: localFormData.permanent_state,
          permanent_pin_code: localFormData.permanent_pin_code,
          permanent_country: localFormData.permanent_country,
          address_line_1: localFormData.address_line_1,
          address_line_2: localFormData.address_line_2,
          city_town_village: localFormData.city_town_village,
          district: localFormData.district,
          state: localFormData.state,
          pin_code: localFormData.pin_code,
          country: localFormData.country,
          department: localFormData.department,
          unit_consit: localFormData.unit_consit,
          room_no: localFormData.room_no,
          serial_no: localFormData.serial_no,
          file_no: localFormData.file_no,
          unit_days: localFormData.unit_days,
          category: localFormData.category,
          special_clinic_no: localFormData.special_clinic_no,
          distance_from_hospital: localFormData.distance_from_hospital,
          mobility: localFormData.mobility,
          referred_by: localFormData.referred_by,
          exact_source: localFormData.exact_source,
          seen_in_walk_in_on: localFormData.seen_in_walk_in_on,
          worked_up_on: localFormData.worked_up_on,
          school_college_office: localFormData.school_college_office,
          local_address: localFormData.local_address,
        };

        await updatePatient(patientPayload).unwrap();
        toast.success('Patient details updated successfully');
      }

      // Save clinical proforma data
      if (clinicalFormData.id) {
        await updateClinicalProforma(clinicalFormData).unwrap();
        toast.success('Clinical proforma updated successfully');
      }

      // Save ADL file data
      if (adlFormData.id) {
        const adlPayload = {
          id: adlFormData.id,
          file_status: adlFormData.file_status,
          physical_file_location: adlFormData.physical_file_location,
          notes: adlFormData.notes,
          complaints_patient: JSON.stringify(adlFormData.complaints_patient),
          complaints_informant: JSON.stringify(adlFormData.complaints_informant),
          informants: JSON.stringify(adlFormData.informants),
          history_narrative: adlFormData.history_narrative,
          history_specific_enquiry: adlFormData.history_specific_enquiry,
          history_drug_intake: adlFormData.history_drug_intake,
          history_treatment_place: adlFormData.history_treatment_place,
          history_treatment_drugs: adlFormData.history_treatment_drugs,
          history_treatment_response: adlFormData.history_treatment_response,
          past_history_medical: adlFormData.past_history_medical,
          past_history_psychiatric_diagnosis: adlFormData.past_history_psychiatric_diagnosis,
          past_history_psychiatric_treatment: adlFormData.past_history_psychiatric_treatment,
          past_history_psychiatric_interim: adlFormData.past_history_psychiatric_interim,
          family_history_father_age: adlFormData.family_history_father_age,
          family_history_father_education: adlFormData.family_history_father_education,
          family_history_father_occupation: adlFormData.family_history_father_occupation,
          family_history_father_personality: adlFormData.family_history_father_personality,
          family_history_father_deceased: adlFormData.family_history_father_deceased,
          family_history_mother_age: adlFormData.family_history_mother_age,
          family_history_mother_education: adlFormData.family_history_mother_education,
          family_history_mother_occupation: adlFormData.family_history_mother_occupation,
          family_history_mother_personality: adlFormData.family_history_mother_personality,
          family_history_mother_deceased: adlFormData.family_history_mother_deceased,
          family_history_siblings: JSON.stringify(adlFormData.family_history_siblings),
          mse_general_demeanour: adlFormData.mse_general_demeanour,
          mse_affect_subjective: adlFormData.mse_affect_subjective,
          mse_thought_flow: adlFormData.mse_thought_flow,
          mse_cognitive_consciousness: adlFormData.mse_cognitive_consciousness,
          mse_cognitive_orientation_time: adlFormData.mse_cognitive_orientation_time,
          mse_cognitive_orientation_place: adlFormData.mse_cognitive_orientation_place,
          mse_insight_understanding: adlFormData.mse_insight_understanding,
          mse_insight_judgement: adlFormData.mse_insight_judgement,
          diagnostic_formulation_summary: adlFormData.diagnostic_formulation_summary,
          diagnostic_formulation_features: adlFormData.diagnostic_formulation_features,
          diagnostic_formulation_psychodynamic: adlFormData.diagnostic_formulation_psychodynamic,
          provisional_diagnosis: adlFormData.provisional_diagnosis,
          treatment_plan: adlFormData.treatment_plan,
          consultant_comments: adlFormData.consultant_comments,
        };

        await updateADLFile(adlPayload).unwrap();
        toast.success('ADL file updated successfully');
      }

      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error(error?.data?.message || 'Failed to save changes');
    }
  };

  const isLoading = isUpdatingPatient || isUpdatingClinical || isUpdatingADL;

  return (
    <div className="space-y-6">
      {/* Card 1: Patient Details */}
      <Card className="shadow-lg border-0 bg-white">
        <div 
          className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => toggleCard('patient')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiUser className="h-6 w-6 text-blue-600" />
          </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Patient Details</h3>
              <p className="text-sm text-gray-500 mt-1">{patient?.name || 'N/A'} - {patient?.cr_no || 'N/A'}</p>
        </div>
              </div>
          {expandedCards.patient ? (
            <FiChevronUp className="h-6 w-6 text-gray-500" />
          ) : (
            <FiChevronDown className="h-6 w-6 text-gray-500" />
          )}
            </div>

        {expandedCards.patient && (
          <div className="p-6">
          <div className="space-y-8">
              {/* Basic Information Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <IconInput
                  icon={<FiUser className="w-4 h-4" />}
                    label="Name"
                  name="name"
                    value={localFormData.name || ''}
                    onChange={handlePatientChange}
                  required
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">CR Number</label>
                    <p className="text-base font-semibold text-gray-900">{patient?.cr_no || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">PSY Number</label>
                    <p className="text-base font-semibold text-gray-900">{patient?.psy_no || 'N/A'}</p>
                  </div>
                <RadioGroup
                  label="Sex"
                  name="sex"
                    value={localFormData.sex || ''}
                    onChange={handlePatientChange}
                  options={SEX_OPTIONS}
                  icon={<FiHeart className="w-4 h-4" />}
                />
                <IconInput
                  icon={<FiClock className="w-4 h-4" />}
                  label="Age"
                  type="number"
                  name="actual_age"
                    value={localFormData.actual_age || ''}
                    onChange={handlePatientChange}
                  min="0"
                  max="150"
                />
                  <RadioGroup
                    label="Age Group"
                    name="age_group"
                    value={localFormData.age_group || ''}
                    onChange={handlePatientChange}
                    options={AGE_GROUP_OPTIONS}
                    icon={<FiUsers className="w-4 h-4" />}
                  />
                <IconInput
                  icon={<FiHome className="w-4 h-4" />}
                    label="Room"
                  name="assigned_room"
                    value={localFormData.assigned_room || ''}
                    onChange={handlePatientChange}
                  />
                  <IconInput
                    icon={<FiPhone className="w-4 h-4" />}
                    label="Contact Number"
                    name="contact_number"
                    value={localFormData.contact_number || ''}
                    onChange={handlePatientChange}
                />
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Status</label>
                    <Badge 
                      className={`${
                        patient?.is_active 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      } text-sm font-medium`}
                    >
                      {patient?.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Status Information Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Status Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Assigned Doctor</label>
                  <Select
                    name="assigned_doctor_id"
                      value={localFormData.assigned_doctor_id || ''}
                      onChange={handlePatientChange}
                    options={(usersData?.data?.users || [])
                        .filter(u => isJR(u.role) || isSR(u.role))
                      .map(u => ({ value: String(u.id), label: `${u.name} (${u.role})` }))}
                    placeholder="Select doctor (optional)"
                  />
                </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Case Complexity</label>
                    <Badge 
                      className={`${
                        patient?.case_complexity === 'complex' 
                          ? 'bg-orange-100 text-orange-800 border-orange-200' 
                          : 'bg-green-100 text-green-800 border-green-200'
                      } text-sm font-medium`}
                    >
                      {patient?.case_complexity === 'complex' ? 'Complex' : 'Simple'}
                    </Badge>
              </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">ADL File</label>
                    <Badge 
                      className={`${
                        patient?.has_adl_file 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      } text-sm font-medium`}
                    >
                      {patient?.has_adl_file ? 'Available' : 'Not Available'}
                    </Badge>
            </div>
          </div>
              </div>

              {/* Personal Information Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RadioGroup
              label="Marital Status"
              name="marital_status"
                    value={localFormData.marital_status || ''}
                    onChange={handlePatientChange}
              options={MARITAL_STATUS}
              icon={<FiHeart className="w-4 h-4" />}
              />
              <IconInput
                icon={<FiCalendar className="w-4 h-4" />}
                label="Year of Marriage"
                type="number"
                name="year_of_marriage"
                    value={localFormData.year_of_marriage || ''}
                    onChange={handlePatientChange}
                min="1900"
                max={new Date().getFullYear()}
              />
              <IconInput
                icon={<FiUsers className="w-4 h-4" />}
                label="Number of Children"
                type="number"
                name="no_of_children"
                    value={localFormData.no_of_children || ''}
                    onChange={handlePatientChange}
                min="0"
              />
              <IconInput
                icon={<FiUsers className="w-4 h-4" />}
                    label="Number of Children (Male)"
                type="number"
                name="no_of_children_male"
                    value={localFormData.no_of_children_male || ''}
                    onChange={handlePatientChange}
                min="0"
              />
              <IconInput
                icon={<FiUsers className="w-4 h-4" />}
                    label="Number of Children (Female)"
                type="number"
                name="no_of_children_female"
                    value={localFormData.no_of_children_female || ''}
                    onChange={handlePatientChange}
                min="0"
              />
                  <DateInput
                    icon={<FiCalendar className="w-4 h-4" />}
                    label="Date of Birth"
                    name="dob"
                    value={patient?.dob ? patient.dob.split('T')[0] : ''}
                    onChange={handlePatientChange}
                  />
            <RadioGroup
              label="Occupation"
              name="occupation"
                    value={localFormData.occupation || ''}
                    onChange={handlePatientChange}
              options={OCCUPATION_OPTIONS}
              icon={<FiBriefcase className="w-4 h-4" />}
            />
            <IconInput
              icon={<FiEdit3 className="w-4 h-4" />}
              label="Actual Occupation"
              name="actual_occupation"
                    value={localFormData.actual_occupation || ''}
                    onChange={handlePatientChange}
                  />
                  <RadioGroup
                    label="Education Level"
                        name="education_level"
                    value={localFormData.education_level || ''}
                    onChange={handlePatientChange}
                    options={EDUCATION_OPTIONS}
                    icon={<FiBookOpen className="w-4 h-4" />}
                  />
                </div>
                  </div>

        {/* Financial Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Financial Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IconInput
                    icon={<FiDollarSign className="w-4 h-4" />}
                label="Patient Income (₹)"
                type="number"
                name="patient_income"
                    value={localFormData.patient_income || ''}
                    onChange={handlePatientChange}
                min="0"
              />
              <IconInput
                    icon={<FiDollarSign className="w-4 h-4" />}
                label="Family Income (₹)"
                type="number"
                name="family_income"
                    value={localFormData.family_income || ''}
                    onChange={handlePatientChange}
                min="0"
              />
            </div>
          </div>

        {/* Family Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Family Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <RadioGroup
                    label="Religion"
                name="religion"
                    value={localFormData.religion || ''}
                    onChange={handlePatientChange}
                options={RELIGION}
                icon={<FiShield className="w-4 h-4" />}
                  />
              <RadioGroup
                    label="Family Type"
                name="family_type"
                    value={localFormData.family_type || ''}
                    onChange={handlePatientChange}
                options={FAMILY_TYPE}
                icon={<FiUsers className="w-4 h-4" />}
                  />
              <RadioGroup
                    label="Locality"
                name="locality"
                    value={localFormData.locality || ''}
                    onChange={handlePatientChange}
                options={LOCALITY}
                icon={<FiMapPin className="w-4 h-4" />}
                  />
                  <IconInput
                    icon={<FiUser className="w-4 h-4" />}
                    label="Head of Family Name"
                    name="head_name"
                    value={localFormData.head_name || ''}
                    onChange={handlePatientChange}
                  />
                  <IconInput
                    icon={<FiClock className="w-4 h-4" />}
                    label="Head Age"
                    type="number"
                    name="head_age"
                    value={localFormData.head_age || ''}
                    onChange={handlePatientChange}
                    min="0"
                    max="150"
                  />
                  <IconInput
                    icon={<FiUsers className="w-4 h-4" />}
                    label="Head Relationship"
                    name="head_relationship"
                    value={localFormData.head_relationship || ''}
                    onChange={handlePatientChange}
                  />
                  <IconInput
                    icon={<FiBookOpen className="w-4 h-4" />}
                    label="Head Education"
                    name="head_education"
                    value={localFormData.head_education || ''}
                    onChange={handlePatientChange}
                  />
                  <IconInput
                    icon={<FiBriefcase className="w-4 h-4" />}
                    label="Head Occupation"
                    name="head_occupation"
                    value={localFormData.head_occupation || ''}
                    onChange={handlePatientChange}
                  />
                  <IconInput
                    icon={<FiDollarSign className="w-4 h-4" />}
                    label="Head Income (₹)"
                    type="number"
                    name="head_income"
                    value={localFormData.head_income || ''}
                    onChange={handlePatientChange}
                    min="0"
                  />
                  <IconInput
                    icon={<FiUser className="w-4 h-4" />}
                    label="Head Relationship"
                    name="head_relationship"
                    value={localFormData.head_relationship || ''}
                    onChange={handlePatientChange}
                  />
                  <IconInput
                    icon={<FiBookOpen className="w-4 h-4" />}
                    label="Head Education"
                    name="head_education"
                    value={localFormData.head_education || ''}
                    onChange={handlePatientChange}
                  />
                </div>
              </div>

              {/* Referral & Mobility Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Referral & Mobility Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <IconInput
                    icon={<FiMapPin className="w-4 h-4" />}
              label="Distance from Hospital"
              name="distance_from_hospital"
                    value={localFormData.distance_from_hospital || ''}
                    onChange={handlePatientChange}
            />
            <RadioGroup
              label="Mobility"
              name="mobility"
                    value={localFormData.mobility || ''}
                    onChange={handlePatientChange}
              options={MOBILITY_OPTIONS}
                    icon={<FiNavigation className="w-4 h-4" />}
            />
              <RadioGroup
                label="Referred By"
                name="referred_by"
                    value={localFormData.referred_by || ''}
                    onChange={handlePatientChange}
                options={REFERRED_BY_OPTIONS}
                    icon={<FiUserCheck className="w-4 h-4" />}
              />
              <IconInput
                    icon={<FiInfo className="w-4 h-4" />}
                label="Exact Source"
                name="exact_source"
                    value={localFormData.exact_source || ''}
                    onChange={handlePatientChange}
                  />
              <DateInput
                icon={<FiCalendar className="w-4 h-4" />}
                label="Seen in Walk-in On"
                name="seen_in_walk_in_on"
                    value={localFormData.seen_in_walk_in_on ? localFormData.seen_in_walk_in_on.split('T')[0] : ''}
                    onChange={handlePatientChange}
              />
              <DateInput
                icon={<FiCalendar className="w-4 h-4" />}
                label="Worked Up On"
                name="worked_up_on"
                    value={localFormData.worked_up_on ? localFormData.worked_up_on.split('T')[0] : ''}
                    onChange={handlePatientChange}
                  />
                  <IconInput
                    icon={<FiHome className="w-4 h-4" />}
                    label="School/College/Office"
                    name="school_college_office"
                    value={localFormData.school_college_office || ''}
                    onChange={handlePatientChange}
              />
            </div>
          </div>

              {/* Registration Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Registration Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <IconInput
                    icon={<FiBriefcase className="w-4 h-4" />}
                    label="Department"
                    name="department"
                    value={localFormData.department || ''}
                    onChange={handlePatientChange}
                  />
                  <IconInput
                    icon={<FiLayers className="w-4 h-4" />}
                    label="Unit/Constituent"
                    name="unit_consit"
                    value={localFormData.unit_consit || ''}
                    onChange={handlePatientChange}
                  />
                  <IconInput
                    icon={<FiHome className="w-4 h-4" />}
                    label="Room Number"
                    name="room_no"
                    value={localFormData.room_no || ''}
                    onChange={handlePatientChange}
                  />
                  <IconInput
                    icon={<FiHash className="w-4 h-4" />}
                    label="Serial Number"
                    name="serial_no"
                    value={localFormData.serial_no || ''}
                    onChange={handlePatientChange}
                  />
                  <IconInput
                    icon={<FiFileText className="w-4 h-4" />}
                    label="File Number"
                    name="file_no"
                    value={localFormData.file_no || ''}
                    onChange={handlePatientChange}
                  />
                  <IconInput
                    icon={<FiClock className="w-4 h-4" />}
                    label="Unit Days"
                    name="unit_days"
                    value={localFormData.unit_days || ''}
                    onChange={handlePatientChange}
                  />
                  <IconInput
                    icon={<FiTag className="w-4 h-4" />}
                    label="Category"
                    name="category"
                    value={localFormData.category || ''}
                    onChange={handlePatientChange}
                  />
              </div>
            </div>

              {/* Additional Address Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Additional Address Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Local Address</label>
                <Textarea
                      name="local_address"
                      value={localFormData.local_address || ''}
                      onChange={handlePatientChange}
                  rows={3}
                      className="w-full"
                />
              </div>
              </div>
            </div>

              {/* Address Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Address Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Present Address</label>
                <Textarea
                      name="present_address"
                      value={localFormData.present_address || ''}
                      onChange={handlePatientChange}
                  rows={3}
                      className="w-full"
                />
              </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Permanent Address</label>
                    <Textarea
                      name="permanent_address"
                      value={localFormData.permanent_address || ''}
                      onChange={handlePatientChange}
                      rows={3}
                      className="w-full"
              />
            </div>
          </div>
              </div>
            </div>
          </div>
        )}
        </Card>

      {/* Card 2: Clinical Proforma - Hide for MWO */}
      {!isMWO(userRole) && patientProformas.length > 0 && (
        <Card className="shadow-lg border-0 bg-white">
          <div 
            className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => toggleCard('clinical')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiFileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Clinical Proforma</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {patientProformas.length} record{patientProformas.length > 1 ? 's' : ''} found
                </p>
            </div>
            </div>
            {expandedCards.clinical ? (
              <FiChevronUp className="h-6 w-6 text-gray-500" />
            ) : (
              <FiChevronDown className="h-6 w-6 text-gray-500" />
            )}
          </div>

          {expandedCards.clinical && (
            <div className="p-6">
            <div className="space-y-6">
                {patientProformas.map((proforma, index) => (
                  <div key={proforma.id || index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900">Visit #{index + 1}</h4>
                      <span className="text-sm text-gray-500">{proforma.visit_date ? formatDate(proforma.visit_date) : 'N/A'}</span>
                </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <DateInput
                        icon={<FiCalendar className="w-4 h-4" />}
                        label="Visit Date"
                        name="visit_date"
                        value={clinicalFormData.visit_date || ''}
                        onChange={handleClinicalChange}
                  />
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">Visit Type</label>
                        <Select
                          name="visit_type"
                          value={clinicalFormData.visit_type || ''}
                          onChange={handleClinicalChange}
                          options={[
                            { value: 'first_visit', label: 'First Visit' },
                            { value: 'follow_up', label: 'Follow-up' }
                          ]}
                  />
                </div>
                <IconInput
                  icon={<FiHome className="w-4 h-4" />}
                        label="Room Number"
                        name="room_no"
                        value={clinicalFormData.room_no || ''}
                        onChange={handleClinicalChange}
                />
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">Case Severity</label>
                  <Select
                          name="case_severity"
                          value={clinicalFormData.case_severity || ''}
                          onChange={handleClinicalChange}
                          options={[
                            { value: 'mild', label: 'Mild' },
                            { value: 'moderate', label: 'Moderate' },
                            { value: 'severe', label: 'Severe' }
                          ]}
                  />
                </div>
                <IconInput
                        icon={<FiFileText className="w-4 h-4" />}
                        label="Decision"
                        name="decision"
                        value={clinicalFormData.decision || ''}
                        onChange={handleClinicalChange}
                      />
                    </div>

                    <div className="mt-6">
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Diagnosis</label>
                      <Textarea
                        name="diagnosis"
                        value={clinicalFormData.diagnosis || ''}
                        onChange={handleClinicalChange}
                        rows={4}
                        className="w-full"
                />
              </div>
            </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Card 3: Additional Details (ADL File) - Only show if ADL file exists, Hide for MWO */}
      {!isMWO(userRole) && patientAdlFiles.length > 0 && (
        <Card className="shadow-lg border-0 bg-white">
          <div 
            className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => toggleCard('adl')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiFolder className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Additional Details (ADL File)</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {patientAdlFiles.length} file{patientAdlFiles.length > 1 ? 's' : ''} found
                </p>
              </div>
            </div>
            {expandedCards.adl ? (
              <FiChevronUp className="h-6 w-6 text-gray-500" />
            ) : (
              <FiChevronDown className="h-6 w-6 text-gray-500" />
            )}
          </div>

          {expandedCards.adl && (
            <div className="p-6">
              <div className="space-y-8">
                {patientAdlFiles.map((file, index) => (
                  <div key={file.id || index} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-300">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">ADL File #{index + 1}</h4>
                        {file.adl_no && (
                          <p className="text-sm text-gray-600 mt-1">ADL Number: {file.adl_no}</p>
                        )}
                </div>
                      <div className="text-right">
                        <div>
                          <label className="text-sm font-medium text-gray-600 mb-2 block">File Status</label>
                          <Select
                            name="file_status"
                            value={adlFormData.file_status || ''}
                            onChange={handleADLChange}
                            options={[
                              { value: 'created', label: 'Created' },
                              { value: 'stored', label: 'Stored' },
                              { value: 'retrieved', label: 'Retrieved' },
                              { value: 'active', label: 'Active' },
                              { value: 'archived', label: 'Archived' }
                            ]}
                  />
                </div>
                </div>
                    </div>

                    <div className="space-y-8">
                      {/* Basic Information */}
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Basic Information</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <IconInput
                            icon={<FiMapPin className="w-4 h-4" />}
                            label="Physical Location"
                            name="physical_file_location"
                            value={adlFormData.physical_file_location || ''}
                            onChange={handleADLChange}
                  />
                </div>
                      </div>

                      {/* Complaints */}
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Complaints</h5>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600 mb-2 block">Patient Complaints</label>
                            {(adlFormData.complaints_patient || []).map((complaint, idx) => (
                              <div key={idx} className="bg-blue-50 p-3 rounded border border-blue-200 mb-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <IconInput
                                    label="Complaint"
                                    name={`complaint_${idx}`}
                                    value={complaint.complaint || ''}
                                    onChange={(e) => handleADLArrayChange('complaints_patient', idx, 'complaint', e.target.value)}
                />
                <IconInput
                                    label="Duration"
                                    name={`duration_${idx}`}
                                    value={complaint.duration || ''}
                                    onChange={(e) => handleADLArrayChange('complaints_patient', idx, 'duration', e.target.value)}
                />
              </div>
            </div>
                            ))}
                </div>
                        </div>
                      </div>

                      {/* History of Present Illness */}
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">History of Present Illness</h5>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600 mb-2 block">Narrative History</label>
                  <Textarea
                              name="history_narrative"
                              value={adlFormData.history_narrative || ''}
                              onChange={handleADLChange}
                              rows={4}
                              className="w-full"
                  />
                </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600 mb-2 block">Specific Enquiry</label>
                  <Textarea
                              name="history_specific_enquiry"
                              value={adlFormData.history_specific_enquiry || ''}
                              onChange={handleADLChange}
                              rows={4}
                              className="w-full"
                  />
                </div>
                <IconInput
                            icon={<FiFileText className="w-4 h-4" />}
                            label="Drug Intake"
                            name="history_drug_intake"
                            value={adlFormData.history_drug_intake || ''}
                            onChange={handleADLChange}
                          />
                        </div>
                      </div>

                      {/* Mental Status Examination */}
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Mental Status Examination (MSE)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <IconInput
                            icon={<FiUser className="w-4 h-4" />}
                            label="General Demeanour"
                            name="mse_general_demeanour"
                            value={adlFormData.mse_general_demeanour || ''}
                            onChange={handleADLChange}
                  />
                <IconInput
                            icon={<FiHeart className="w-4 h-4" />}
                            label="Affect (Subjective)"
                            name="mse_affect_subjective"
                            value={adlFormData.mse_affect_subjective || ''}
                            onChange={handleADLChange}
                />
                <IconInput
                            icon={<FiFileText className="w-4 h-4" />}
                            label="Thought Flow"
                            name="mse_thought_flow"
                            value={adlFormData.mse_thought_flow || ''}
                            onChange={handleADLChange}
                          />
              <IconInput
                            icon={<FiActivity className="w-4 h-4" />}
                            label="Consciousness"
                            name="mse_cognitive_consciousness"
                            value={adlFormData.mse_cognitive_consciousness || ''}
                            onChange={handleADLChange}
              />
              <IconInput
                            icon={<FiClock className="w-4 h-4" />}
                            label="Orientation (Time)"
                            name="mse_cognitive_orientation_time"
                            value={adlFormData.mse_cognitive_orientation_time || ''}
                            onChange={handleADLChange}
              />
              <IconInput
                            icon={<FiMapPin className="w-4 h-4" />}
                            label="Orientation (Place)"
                            name="mse_cognitive_orientation_place"
                            value={adlFormData.mse_cognitive_orientation_place || ''}
                            onChange={handleADLChange}
              />
              <IconInput
                            icon={<FiInfo className="w-4 h-4" />}
                            label="Insight (Understanding)"
                            name="mse_insight_understanding"
                            value={adlFormData.mse_insight_understanding || ''}
                            onChange={handleADLChange}
              />
              <IconInput
                            icon={<FiShield className="w-4 h-4" />}
                            label="Insight (Judgement)"
                            name="mse_insight_judgement"
                            value={adlFormData.mse_insight_judgement || ''}
                            onChange={handleADLChange}
                          />
                        </div>
                      </div>

                      {/* Diagnostic Formulation */}
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Diagnostic Formulation</h5>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600 mb-2 block">Summary</label>
                            <Textarea
                              name="diagnostic_formulation_summary"
                              value={adlFormData.diagnostic_formulation_summary || ''}
                              onChange={handleADLChange}
                              rows={4}
                              className="w-full"
                />
              </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600 mb-2 block">Features</label>
                            <Textarea
                              name="diagnostic_formulation_features"
                              value={adlFormData.diagnostic_formulation_features || ''}
                              onChange={handleADLChange}
                              rows={4}
                              className="w-full"
                            />
            </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600 mb-2 block">Psychodynamic</label>
                            <Textarea
                              name="diagnostic_formulation_psychodynamic"
                              value={adlFormData.diagnostic_formulation_psychodynamic || ''}
                              onChange={handleADLChange}
                              rows={4}
                              className="w-full"
                            />
          </div>
                        </div>
                      </div>

                      {/* Provisional Diagnosis */}
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Provisional Diagnosis</h5>
                        <Textarea
                          name="provisional_diagnosis"
                          value={adlFormData.provisional_diagnosis || ''}
                          onChange={handleADLChange}
                          rows={3}
                          className="w-full"
                        />
              </div>

                      {/* Treatment Plan */}
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Treatment Plan</h5>
                        <Textarea
                          name="treatment_plan"
                          value={adlFormData.treatment_plan || ''}
                          onChange={handleADLChange}
                          rows={4}
                          className="w-full"
                        />
            </div>

                      {/* Consultant Comments */}
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Consultant Comments</h5>
                        <Textarea
                          name="consultant_comments"
                          value={adlFormData.consultant_comments || ''}
                          onChange={handleADLChange}
                          rows={4}
                          className="w-full"
              />
                      </div>

                      {/* Notes */}
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Additional Notes</h5>
                        <Textarea
                          name="notes"
                          value={adlFormData.notes || ''}
                          onChange={handleADLChange}
                          rows={3}
                          className="w-full"
              />
            </div>
          </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Card 4: Prescription History - Only show for Admin and JR/SR, not MWO */}
      {canViewPrescriptions && (
        <Card className="shadow-lg border-0 bg-white">
          <div 
            className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => toggleCard('prescriptions')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <FiPackage className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Prescription History</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {allPrescriptions.length > 0 
                    ? `${allPrescriptions.length} prescription${allPrescriptions.length > 1 ? 's' : ''} across ${Object.keys(prescriptionsByVisit).length} visit${Object.keys(prescriptionsByVisit).length > 1 ? 's' : ''}`
                    : 'No prescriptions found'}
                </p>
              </div>
            </div>
            {expandedCards.prescriptions ? (
              <FiChevronUp className="h-6 w-6 text-gray-500" />
            ) : (
              <FiChevronDown className="h-6 w-6 text-gray-500" />
            )}
          </div>

          {expandedCards.prescriptions && (
            <div className="p-6">
              {allPrescriptions.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(prescriptionsByVisit).map(([visitDate, visitData]) => (
                    <div key={visitDate} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">Visit on {visitDate}</h4>
                          {visitData.visitType && (
                            <p className="text-sm text-gray-600 mt-1">
                              {visitData.visitType === 'first_visit' ? 'First Visit' : 'Follow-up Visit'}
                            </p>
                          )}
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-sm font-medium">
                          {visitData.prescriptions.length} {visitData.prescriptions.length === 1 ? 'Medication' : 'Medications'}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        {visitData.prescriptions.map((prescription, idx) => (
                          <div key={prescription.id || idx} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Medicine</label>
                                <p className="text-base font-bold text-gray-900 mt-1">{prescription.medicine || 'N/A'}</p>
                              </div>
                              {prescription.dosage && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Dosage</label>
                                  <p className="text-base font-semibold text-gray-900 mt-1">{prescription.dosage}</p>
                                </div>
                              )}
                              {prescription.when_to_take && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">When to Take</label>
                                  <p className="text-base font-semibold text-gray-900 mt-1">{prescription.when_to_take}</p>
                                </div>
                              )}
                              {prescription.frequency && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Frequency</label>
                                  <p className="text-base font-semibold text-gray-900 mt-1">{prescription.frequency}</p>
                                </div>
                              )}
                              {prescription.duration && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Duration</label>
                                  <p className="text-base font-semibold text-gray-900 mt-1">{prescription.duration}</p>
                                </div>
                              )}
                              {prescription.quantity && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Quantity</label>
                                  <p className="text-base font-semibold text-gray-900 mt-1">{prescription.quantity}</p>
                                </div>
                              )}
                            </div>
                            {(prescription.details || prescription.notes) && (
                              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                                {prescription.details && (
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Details</label>
                                    <p className="text-sm text-gray-900 mt-1">{prescription.details}</p>
                                  </div>
                                )}
                                {prescription.notes && (
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Notes</label>
                                    <p className="text-sm text-gray-900 mt-1">{prescription.notes}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            {prescription.created_at && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500">Prescribed on: {formatDateTime(prescription.created_at)}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FiPackage className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base">No prescription history found</p>
                  <p className="text-sm text-gray-400 mt-1">Prescriptions will appear here once medications are prescribed</p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveAll}
          disabled={isLoading}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
};

export default PatientDetailsEdit;
