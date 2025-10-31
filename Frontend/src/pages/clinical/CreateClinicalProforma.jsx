import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCreateClinicalProformaMutation } from '../../features/clinical/clinicalApiSlice';
import { useSearchPatientsQuery, useGetPatientByIdQuery } from '../../features/patients/patientsApiSlice';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import { FiEdit3, FiClipboard, FiCheckSquare, FiList, FiActivity, FiHeart, FiUser, FiFileText, FiPlus, FiX, FiSave, FiClock, FiPackage, FiChevronDown, FiChevronUp, FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { VISIT_TYPES, CASE_SEVERITY, DOCTOR_DECISION } from '../../utils/constants';
import { useGetClinicalOptionsQuery, useAddClinicalOptionMutation, useDeleteClinicalOptionMutation } from '../../features/clinical/clinicalApiSlice';
import icd11Codes from '../../assets/ICD11_Codes.json';

// Reusable checkbox group with inline add-input and toggle Add/Save button
const CheckboxGroup = ({ label, name, value = [], onChange, options = [], rightInlineExtra = null }) => {
  const [localOptions, setLocalOptions] = useState(options);
  const [showAdd, setShowAdd] = useState(false);
  const [customOption, setCustomOption] = useState('');
  const { data: remoteOptions } = useGetClinicalOptionsQuery(name);
  const [addOption] = useAddClinicalOptionMutation();
  const [deleteOption] = useDeleteClinicalOptionMutation();

  const iconByGroup = {
    mood: <FiHeart className="w-6 h-6 text-rose-600" />,
    behaviour: <FiActivity className="w-6 h-6 text-violet-600" />,
    speech: <FiUser className="w-6 h-6 text-sky-600" />,
    thought: <FiClipboard className="w-6 h-6 text-indigo-600" />,
    perception: <FiList className="w-6 h-6 text-cyan-600" />,
    somatic: <FiActivity className="w-6 h-6 text-emerald-600" />,
    bio_functions: <FiCheckSquare className="w-6 h-6 text-emerald-600" />,
    adjustment: <FiList className="w-6 h-6 text-amber-600" />,
    cognitive_function: <FiActivity className="w-6 h-6 text-fuchsia-600" />,
    fits: <FiActivity className="w-6 h-6 text-red-600" />,
    sexual_problem: <FiHeart className="w-6 h-6 text-pink-600" />,
    substance_use: <FiList className="w-6 h-6 text-teal-600" />,
    associated_medical_surgical: <FiFileText className="w-6 h-6 text-indigo-600" />,
    mse_behaviour: <FiActivity className="w-6 h-6 text-violet-600" />,
    mse_affect: <FiHeart className="w-6 h-6 text-rose-600" />,
    mse_thought: <FiClipboard className="w-6 h-6 text-indigo-600" />,
    mse_perception: <FiList className="w-6 h-6 text-cyan-600" />,
    mse_cognitive_function: <FiActivity className="w-6 h-6 text-fuchsia-600" />,
  };

  useEffect(() => {
    setLocalOptions(Array.from(new Set([...(remoteOptions || []), ...(options || [])])));
  }, [remoteOptions, options]);

  const toggle = (opt) => {
    const exists = value.includes(opt);
    const next = exists ? value.filter(v => v !== opt) : [...value, opt];
    onChange({ target: { name, value: next } });
  };

  const handleDelete = (opt) => {
    // Remove from available options
    setLocalOptions((prev) => prev.filter((o) => o !== opt));
    // If currently selected, unselect it as well
    if (value.includes(opt)) {
      const next = value.filter((v) => v !== opt);
      onChange({ target: { name, value: next } });
    }
    deleteOption({ group: name, label: opt }).catch(() => {});
  };

  const handleAddClick = () => {
    setShowAdd(true);
  };

  const handleCancelAdd = () => {
    setShowAdd(false);
    setCustomOption('');
  };

  const handleSaveAdd = () => {
    const opt = customOption.trim();
    if (!opt) {
      setShowAdd(false);
      return;
    }
    setLocalOptions((prev) => (prev.includes(opt) ? prev : [...prev, opt]));
    const next = value.includes(opt) ? value : [...value, opt];
    onChange({ target: { name, value: next } });
    setCustomOption('');
    setShowAdd(false);
    addOption({ group: name, label: opt }).catch(() => {});
  };

  return (
//     <div className="space-y-2">
//       {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
//       <div className="flex flex-wrap gap-3">
   
//         {localOptions.map((opt) => (
//           <div key={opt} className="relative inline-flex items-center group">
//             <button
//               type="button"
//               onClick={() => handleDelete(opt)}
//               className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100 group-hover:pointer-events-auto hover:bg-red-600"
//               aria-label={`Remove ${opt}`}
//             >
//               <FiX className="w-3 h-3" />
//             </button>
//             <label
//               className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors duration-150 cursor-pointer
//                 ${value.includes(opt)
//                   ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
//                   : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-800'}`}
//             >
//               <input
//                 type="checkbox"
//                 checked={value.includes(opt)}
//                 onChange={() => toggle(opt)}
//                 className="h-4 w-4 text-primary-600 rounded"
//               />
//               <span>{opt}</span>
//             </label>
//           </div>
//         ))}
//       </div>
//       <div className="mt-2 flex items-center gap-2">
//         {showAdd && (
//           <Input
//             placeholder="Enter option name"
//             value={customOption}
//             onChange={(e) => setCustomOption(e.target.value)}
//             className="max-w-xs"
            
//           />
//         )}
//         {/* <Button type="button" onClick={addOrToggle} className='bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'>{showAdd ? 'Save' : 'Add'}</Button> */}
//         <div className="flex justify-end gap-3">
//   {showAdd ? (
//     <>
//       {/* Cancel Button */}
//       <Button
//         type="button"
//         onClick={handleCancelAdd}
//         className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 px-4 py-2 rounded-md flex items-center gap-2"
//       >
//         <FiX className="w-4 h-4" /> Cancel
//       </Button>

//       {/* Save Button */}
//       <Button
//         type="button"
//         onClick={handleSaveAdd}
//         className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 px-4 py-2 rounded-md flex items-center gap-2"
//       >
//         <FiSave className="w-4 h-4" /> Save
//       </Button>
//     </>
//   ) : (
//     /* Add Button (default state) */
//     <Button
//       type="button"
//       onClick={handleAddClick}
//       // className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 px-4 py-2 rounded-md flex items-center gap-2"
//       className="bg-white text-black border border-gray-300 px-4 py-2 rounded-md flex items-center gap-2 transition-all duration-200 hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600 hover:text-white hover:shadow-lg hover:shadow-green-500/30"
//     >
//       <FiPlus className="w-4 h-4" /> Add
//     </Button>
//   )}
// </div>



//       </div>
//     </div>

<div className="space-y-2">
{label && (
  <div className="flex items-center gap-3 text-base font-semibold text-gray-800">
    <span>{iconByGroup[name] || <FiList className="w-6 h-6 text-gray-500" />}</span>
    <span>{label}</span>
  </div>
)}

{/* Options + Add button inline */}
<div className="flex flex-wrap items-center gap-3">
  {/* Options */}
  {localOptions.map((opt) => (
    <div key={opt} className="relative inline-flex items-center group">
      <button
        type="button"
        onClick={() => handleDelete(opt)}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100 group-hover:pointer-events-auto hover:bg-red-600"
        aria-label={`Remove ${opt}`}
      >
        <FiX className="w-3 h-3" />
      </button>

      <label
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors duration-150 cursor-pointer
          ${
            value.includes(opt)
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-gray-200 bg-white hover:bg-gray-50 text-gray-800"
          }`}
      >
            <input
              type="checkbox"
          checked={value.includes(opt)}
              onChange={() => toggle(opt)}
          className="h-4 w-4 text-primary-600 rounded"
            />
        <span>{opt}</span>
          </label>
    </div>
        ))}
  {rightInlineExtra && (
    <div className="inline-flex items-center">
      {rightInlineExtra}
      </div>
  )}

  {/* Add Section */}
  <div className="flex items-center gap-2">
    {showAdd && (
      <Input
        placeholder="Enter option name"
        value={customOption}
        onChange={(e) => setCustomOption(e.target.value)}
        className="max-w-xs"
      />
    )}

    {showAdd ? (
      <>
        {/* Cancel Button */}
        <Button
          type="button"
          onClick={handleCancelAdd}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 px-3 py-1.5 rounded-md flex items-center gap-2 text-sm"
        >
          <FiX className="w-4 h-4" /> Cancel
        </Button>

        {/* Save Button */}
        <Button
          type="button"
          onClick={handleSaveAdd}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 px-3 py-1.5 rounded-md flex items-center gap-2 text-sm"
        >
          <FiSave className="w-4 h-4" /> Save
        </Button>
      </>
    ) : (
      <Button
        type="button"
        onClick={handleAddClick}
          className="bg-white text-black border border-gray-300 px-4 py-2 rounded-md flex items-center gap-2 transition-all duration-200 hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600 hover:text-white hover:shadow-lg hover:shadow-green-500/30"

      >
        <FiPlus className="w-4 h-4" /> Add
      </Button>
    )}
      </div>
</div>
    </div>
  );
};
 
// Hierarchical ICD-11 Code Selector Component
const ICD11CodeSelector = ({ value, onChange, error }) => {
  const [selectedPath, setSelectedPath] = useState([]); // Array of selected items at each level
  const [selectedCode, setSelectedCode] = useState(value || '');

  // Helper function to find children of a given parent at a specific level
  const getChildren = (levelIndex, parentItem) => {
    if (levelIndex === 0) {
      // Level 0: top-level items (level === 0)
      return icd11Codes.filter(item => item.level === 0);
    }
    
    if (!parentItem && levelIndex > 0) return [];
    
    const level = levelIndex;
    
    // Find children based on hierarchy
    return icd11Codes.filter(item => {
      if (item.level !== level) return false;
      
      if (level === 1) {
        // Level 1 children have parent_code matching level 0 code
        const level0Code = selectedPath[0]?.code || '';
        return item.parent_code === level0Code;
      } else if (level === 2) {
        // Level 2 items can have:
        // - parent_code matching level 0 code
        // - parent_code matching level 1 code (if level 1 has a code)
        // - empty parent_code (shown within level 0 context, but filter by code pattern)
        const level0Code = selectedPath[0]?.code || '';
        const level1Item = selectedPath[1];
        const level1Code = level1Item?.code || '';
        
        // If we have a level 1 selection with a code, match by that
        if (level1Code && item.parent_code === level1Code) return true;
        
        // Match by level 0 code
        if (item.parent_code === level0Code) return true;
        
        // If level 2 has empty parent_code, show it within level 0 context
        // Use code pattern matching to filter relevant items
        if (item.parent_code === '' && level0Code && item.code) {
          // For "06", level 2 codes start with "6" (e.g., "6A00", "6A02")
          if (level0Code === '06' && item.code.startsWith('6')) return true;
          // For other level 0 codes, check if code starts with level 0 code
          if (item.code.startsWith(level0Code)) return true;
        }
        return false;
      } else {
        // Level 3+: match by parent_code to previous level's code
        const prevLevelItem = selectedPath[levelIndex - 1];
        if (!prevLevelItem) return false;
        
        const prevLevelCode = prevLevelItem.code || '';
        return item.parent_code === prevLevelCode;
      }
    });
  };

  // Initialize selectedPath from value if provided
  useEffect(() => {
    if (value && !selectedPath.length && value !== selectedCode) {
      // Try to find the code in the JSON and build path
      const codeItem = icd11Codes.find(item => item.code === value);
      if (codeItem) {
        const path = [];
        let current = codeItem;
        
        // Build path backwards by finding parents
        while (current) {
          path.unshift(current);
          
          // Find parent
          let parent = null;
          if (current.parent_code) {
            // Try to find parent by code match
            parent = icd11Codes.find(item => item.code === current.parent_code);
            
            // If not found, try to find by level (e.g., level 0 item with code matching parent_code)
            if (!parent && current.level > 0) {
              if (current.level === 1) {
                parent = icd11Codes.find(item => item.level === 0 && item.code === current.parent_code);
              } else if (current.level === 2) {
                // Level 2 might have empty parent_code, check level 1 or 0
                parent = icd11Codes.find(item => 
                  (item.level === 1 && item.parent_code === current.parent_code) ||
                  (item.level === 0 && item.code === current.parent_code)
                );
              } else {
                parent = icd11Codes.find(item => item.code === current.parent_code);
              }
            }
          }
          
          current = parent;
        }
        
        if (path.length > 0) {
          setSelectedPath(path);
          setSelectedCode(value);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Sync selectedCode with value prop
  useEffect(() => {
    if (value !== selectedCode) {
      setSelectedCode(value || '');
    }
  }, [value]);

  const handleLevelChange = (levelIndex, selectedItem) => {
    const newPath = selectedPath.slice(0, levelIndex);
    if (selectedItem) {
      newPath[levelIndex] = selectedItem;
    }
    setSelectedPath(newPath);

    // Find the deepest code in the path
    let deepestCode = '';
    for (let i = newPath.length - 1; i >= 0; i--) {
      if (newPath[i]?.code) {
        deepestCode = newPath[i].code;
        break;
      }
    }

    setSelectedCode(deepestCode);
    onChange({ target: { name: 'icd_code', value: deepestCode } });
  };

  const renderDropdown = (levelIndex) => {
    const parentItem = levelIndex > 0 ? selectedPath[levelIndex - 1] : null;
    const children = getChildren(levelIndex, parentItem);
    if (children.length === 0 && levelIndex > 0) return null;

    const selectedItem = selectedPath[levelIndex];
    
    const labelText = levelIndex === 0 ? 'Category' : 
                     levelIndex === 1 ? 'Subcategory' :
                     levelIndex === 2 ? 'Code Group' : 'Specific Code';
    
    return (
      <div key={levelIndex} className="flex-shrink-0 min-w-[200px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {labelText}
        </label>
        <Select
          value={selectedItem ? JSON.stringify(selectedItem) : ''}
          onChange={(e) => {
            const item = e.target.value ? JSON.parse(e.target.value) : null;
            handleLevelChange(levelIndex, item);
          }}
          options={[
            { value: '', label: `Select ${labelText}` },
            ...children.map(item => ({
              value: JSON.stringify(item),
              label: `${item.code || '(Category)'} - ${item.title}`
            }))
          ]}
          error={levelIndex === 0 && error}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        ICD Code
      </label>
      
      {/* Horizontal flex container for dropdowns */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Render level 0 dropdown */}
        {renderDropdown(0)}
        
        {/* Render level 1 dropdown if level 0 is selected */}
        {selectedPath[0] && renderDropdown(1)}
        
        {/* Render level 2 dropdown if level 1 is selected */}
        {selectedPath[1] && renderDropdown(2)}
        
        {/* Render level 3 dropdown if level 2 is selected and has children */}
        {selectedPath[2] && selectedPath[2].has_children && renderDropdown(3)}
        
        {/* Render level 4+ dropdowns if needed */}
        {selectedPath[3] && selectedPath[3].has_children && renderDropdown(4)}
        {selectedPath[4] && selectedPath[4].has_children && renderDropdown(5)}
      </div>
      
      {/* Display selected code */}
      {selectedCode && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Selected ICD-11 Code:</strong> <span className="font-mono font-semibold">{selectedCode}</span>
            {selectedPath[selectedPath.length - 1] && (
              <span className="ml-2 text-blue-600">
                - {selectedPath[selectedPath.length - 1].title}
              </span>
            )}
          </p>
          {selectedPath[selectedPath.length - 1]?.description && (
            <p className="text-xs text-blue-600 mt-1 italic">
              {selectedPath[selectedPath.length - 1].description.substring(0, 200)}
              {selectedPath[selectedPath.length - 1].description.length > 200 ? '...' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const CreateClinicalProforma = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientIdFromQuery = searchParams.get('patient_id');
  const returnTab = searchParams.get('returnTab'); // Get returnTab from URL

  const [createProforma, { isLoading }] = useCreateClinicalProformaMutation();
  const [patientSearch, setPatientSearch] = useState('');
  const { data: patientsData } = useSearchPatientsQuery(
    { search: patientSearch, limit: 10 },
    { skip: !patientSearch }
  );

  const [formData, setFormData] = useState({
    patient_id: patientIdFromQuery || '',
    visit_date: new Date().toISOString().split('T')[0],
    visit_type: 'first_visit',
    room_no: '',
    assigned_doctor: '',
    informant_present: true,
    nature_of_information: '',
    onset_duration: '',
    course: '',
    precipitating_factor: '',
    illness_duration: '',
    current_episode_since: '',
    mood: [],
    behaviour: [],
    speech: [],
    thought: [],
    perception: [],
    somatic: [],
    bio_functions: [],
    adjustment: [],
    cognitive_function: [],
    fits: [],
    sexual_problem: [],
    substance_use: [],
    past_history: '',
    family_history: '',
    associated_medical_surgical: [],
    mse_behaviour: [],
    mse_affect: [],
    mse_thought: [],
    mse_delusions: '',
    mse_perception: [],
    mse_cognitive_function: [],
    gpe: '',
    diagnosis: '',
    icd_code: '',
    disposal: '',
    workup_appointment: '',
    referred_to: '',
    treatment_prescribed: '',
    doctor_decision: 'simple_case',
    case_severity: 'mild',
    requires_adl_file: false,
    adl_reasoning: '',
  });

  // Fetch full patient data when patient_id is selected (moved after formData declaration)
  const { data: fullPatientData } = useGetPatientByIdQuery(
    formData.patient_id,
    { skip: !formData.patient_id }
  );

  const [errors, setErrors] = useState({});
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  
  // Always 4 steps: Basic Info, Clinical Proforma, Additional Detail (conditional), Prescribe Medication
  const totalSteps = 4;
  
  // Determine if step 3 (ADL) should be shown
  const showADLStep = formData.doctor_decision === 'complex_case';
  
  // Card expand/collapse states (all start minimized)
  const [expandedCards, setExpandedCards] = useState({
    basicInfo: false,
    informant: false,
    onset: false,
    presentIllness: false,
    pastHistory: false,
    familyHistory: false,
    personalHistory: false,
    complaints: false,
    mse: false,
    additionalHistory: false,
    gpe: false,
    diagnosis: false,
    adl: false,
    patientInfo: false, // New patient information card
  });
  
  const toggleCard = (cardName) => {
    setExpandedCards(prev => ({ ...prev, [cardName]: !prev[cardName] }));
  };

  useEffect(() => {
    if (formData.doctor_decision === 'complex_case') {
      setFormData(prev => ({ ...prev, requires_adl_file: true }));
    } else {
      // If changed from complex to simple, reset ADL fields
      setFormData(prev => ({ 
        ...prev, 
        requires_adl_file: false,
        adl_reasoning: ''
      }));
    }
    // If we're on step 3 (ADL) and case becomes simple, skip to step 4
    if (currentStep === 3 && !showADLStep) {
      setCurrentStep(4);
    }
  }, [formData.doctor_decision, showADLStep, currentStep]);

  // Auto-populate ALL patient details when patient data is fetched
  useEffect(() => {
    if (fullPatientData?.data?.patient) {
      const patient = fullPatientData.data.patient;
      setFormData(prev => ({
        ...prev,
        // Auto-populate room number if available (don't override if user already entered)
        room_no: prev.room_no || patient.assigned_room || '',
        // Auto-populate assigned doctor if available
        assigned_doctor: prev.assigned_doctor || (patient.assigned_doctor_id ? patient.assigned_doctor_id.toString() : ''),
        // If patient has visit history, set visit_type to follow_up
        visit_type: patient.last_assigned_date ? 'follow_up' : prev.visit_type,
      }));
    }
  }, [fullPatientData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate specific step
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.patient_id) {
        newErrors.patient_id = 'Patient is required';
      }
      if (!formData.visit_date) {
        newErrors.visit_date = 'Visit date is required';
      }
    }

    if (step === 3 && formData.doctor_decision === 'complex_case') {
      if (!formData.adl_reasoning) {
        newErrors.adl_reasoning = 'ADL reasoning is required for complex cases';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.patient_id) {
      newErrors.patient_id = 'Patient is required';
    }
    if (!formData.visit_date) {
      newErrors.visit_date = 'Visit date is required';
    }
    if (formData.doctor_decision === 'complex_case' && !formData.adl_reasoning) {
      newErrors.adl_reasoning = 'ADL reasoning is required for complex cases';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation functions
  const handleNext = () => {
    if (validateStep(currentStep)) {
      let nextStep = currentStep + 1;
      
      // Skip step 3 if it's not needed (simple case)
      if (nextStep === 3 && !showADLStep) {
        nextStep = 4;
      }
      
      if (nextStep <= totalSteps) {
        setCurrentStep(nextStep);
        // Scroll to top on step change
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Scroll to top on step change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToStep = (step) => {
    // Skip step 3 if it's not available (simple case)
    if (step === 3 && !showADLStep) {
      return; // Don't allow navigation to step 3 if it's hidden
    }
    
    // Only allow going to valid steps
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Get step labels
  const getStepLabel = (step) => {
    switch(step) {
      case 1: return 'Basic Information';
      case 2: return 'Clinical Proforma';
      case 3: return 'Additional Detail (ADL)';
      case 4: return 'Prescribe Medication';
      default: return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      const join = (arr) => Array.isArray(arr) ? arr.join(', ') : arr;
      // Check if prescription exists in localStorage for this patient
      let storedPrescriptions = JSON.parse(localStorage.getItem('patient_prescriptions') || '{}');
      const patientPrescriptions = storedPrescriptions[formData.patient_id];
      const prescriptionText = patientPrescriptions?.prescription_text || formData.treatment_prescribed || '';

      const submitData = {
        ...formData,
        patient_id: parseInt(formData.patient_id),
        mood: join(formData.mood),
        behaviour: join(formData.behaviour),
        speech: join(formData.speech),
        thought: join(formData.thought),
        perception: join(formData.perception),
        somatic: join(formData.somatic),
        bio_functions: join(formData.bio_functions),
        adjustment: join(formData.adjustment),
        cognitive_function: join(formData.cognitive_function),
        fits: join(formData.fits),
        sexual_problem: join(formData.sexual_problem),
        substance_use: join(formData.substance_use),
        associated_medical_surgical: join(formData.associated_medical_surgical),
        mse_behaviour: join(formData.mse_behaviour),
        mse_affect: join(formData.mse_affect),
        mse_thought: join(formData.mse_thought),
        mse_perception: join(formData.mse_perception),
        mse_cognitive_function: join(formData.mse_cognitive_function),
        treatment_prescribed: prescriptionText,
      };

      const result = await createProforma(submitData).unwrap();
      
      // Clear saved prescription from localStorage after successful submission
      if (storedPrescriptions[formData.patient_id]) {
        delete storedPrescriptions[formData.patient_id];
        localStorage.setItem('patient_prescriptions', JSON.stringify(storedPrescriptions));
      }
      
      toast.success('Clinical proforma created successfully!');
      
      if (result.data?.adl_file?.created) {
        toast.info(`ADL File created: ${result.data.adl_file.adl_no}`);
      }
      
      // Navigate to proforma details, or back to Today Patients if returnTab exists
      if (returnTab) {
        navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
      } else {
        navigate(`/clinical/${result.data.proforma.id}`);
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create clinical proforma');
    }
  };

  // Auto-select patient when exact CR match found
  useEffect(() => {
    if (!patientsData?.data?.patients || formData.patient_id) return;
    
    const patients = patientsData.data.patients;
    
    // If searching for a CR number, auto-select exact match
    if (patientSearch && patientSearch.startsWith('CR')) {
      const exactMatch = patients.find(p => 
        p.cr_no === patientSearch || p.cr_no === patientSearch.toUpperCase()
      );
      
      if (exactMatch) {
        setFormData(prev => ({ 
          ...prev, 
          patient_id: exactMatch.id.toString(),
          visit_type: 'follow_up' // Previous patient, so follow-up visit
        }));
        toast.success(`Patient found: ${exactMatch.name} (${exactMatch.cr_no})`);
      }
    } else if (patients.length === 1) {
      // Auto-select if only one result found
      setFormData(prev => ({ 
        ...prev, 
        patient_id: patients[0].id.toString(),
        visit_type: 'follow_up'
      }));
    }
  }, [patientsData, patientSearch]);

  // Create patient options (prioritize exact CR matches)
  const patientOptions = (() => {
    if (!patientsData?.data?.patients) return [];
    
    const patients = patientsData.data.patients;
    
    // If searching for CR number, prioritize exact match
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
    
    // Default: return all patients with CR numbers
    return patients.slice(0, 5).map(p => ({
      value: p.id,
      label: `${p.name} (${p.cr_no})`,
    }));
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-teal-50">
      <div className="w-full px-6 py-8 space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/10 to-indigo-600/10 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-fuchsia-600 to-indigo-600 rounded-2xl shadow-lg">
                <FiClipboard className="w-8 h-8 text-white" />
              </div>
      <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-600 to-indigo-800 bg-clip-text text-transparent">
                  Clinical Proforma
                </h1>
                <p className="text-gray-600 mt-1">Walk-in Clinical Proforma</p>
              </div>
            </div>
          </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step Indicator */}
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="px-4 py-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].filter(step => step !== 3 || showADLStep).map((step, index, arr) => {
                const isActive = currentStep === step;
                const isCompleted = currentStep > step || (currentStep === 4 && step === 3 && !showADLStep);
                const isAccessible = currentStep >= step;
                
                return (
                  <React.Fragment key={step}>
                    <div className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <button
                          type="button"
                          onClick={() => goToStep(step)}
                          disabled={!isAccessible}
                          className={`relative flex items-center justify-center w-12 h-12 rounded-full font-semibold text-sm transition-all duration-300 ${
                            isActive
                              ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-lg scale-110'
                              : isCompleted
                              ? 'bg-emerald-500 text-white shadow-md'
                              : isAccessible
                              ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isCompleted ? (
                            <FiCheck className="w-6 h-6" />
                          ) : (
                            step
                          )}
                        </button>
                        <div className={`mt-2 text-xs font-medium text-center max-w-[120px] ${
                          isActive ? 'text-fuchsia-600 font-bold' : 'text-gray-600'
                        }`}>
                          {getStepLabel(step)}
                        </div>
                      </div>
                    </div>
                    {index < arr.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                        currentStep > step ? 'bg-emerald-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <React.Fragment>
            <div className="space-y-6">
            <Card
            title={
              <div className="flex items-center justify-between w-full cursor-pointer" onClick={() => toggleCard('basicInfo')}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-100 rounded-lg">
                    <FiUser className="w-6 h-6 text-sky-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Basic Information</span>
                </div>
                {expandedCards.basicInfo ? (
                  <FiChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </div>
            }
            className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
          >
          {expandedCards.basicInfo && (
          <div className="space-y-6">
            {/* If patient_id is provided, show patient details. Otherwise, show search field */}
            {formData.patient_id && fullPatientData?.data?.patient ? (
              // Patient selected via ID - show patient info as read-only
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  label="Patient ID"
                  name="patient_id"
                  value={formData.patient_id}
                  disabled
                />
                <Input
                  label="Patient Name"
                  value={fullPatientData.data.patient.name || ''}
                  disabled
                />
                <Input
                  label="CR Number"
                  value={fullPatientData.data.patient.cr_no || ''}
                  disabled
                />
                <Input
                  label="Age / Sex"
                  value={`${fullPatientData.data.patient.actual_age || ''} / ${fullPatientData.data.patient.sex || ''}`}
                  disabled
                />
                {fullPatientData.data.patient.psy_no && (
                  <Input
                    label="PSY Number"
                    value={fullPatientData.data.patient.psy_no}
                    disabled
                  />
                )}
              </div>
            ) : (
              // No patient ID - show search field
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Patient by CR Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    placeholder="e.g., 2024123456 (CR2024123456)"
                    value={patientSearch.startsWith('CR') ? patientSearch.slice(2) : patientSearch}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPatientSearch(value.startsWith('CR') ? value : `CR${value}`);
                    }}
                    className="pl-10"
                  />
                  <span className="absolute left-3 top-3 text-gray-500 font-semibold text-sm">CR</span>
                </div>
                
                {patientSearch && patientSearch.length < 8 && (
                  <p className="text-xs text-gray-500 mt-1">Enter at least 8 characters to search</p>
                )}
                
                {patientOptions.length > 0 && (
                  <Select
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleChange}
                    options={patientOptions}
                    placeholder="Select patient"
                    error={errors.patient_id}
                    required
                    className="mt-2"
                  />
                )}
                
                {/* No results */}
                {patientSearch.length >= 8 && !patientsData?.data?.patients?.length && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      🔍 No patient found with CR number: <strong>{patientSearch}</strong>
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Make sure the patient has been registered first by MWO
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Visit Date"
                type="date"
                name="visit_date"
                value={formData.visit_date}
                onChange={handleChange}
                error={errors.visit_date}
                required
              />

              <Select
                label="Visit Type"
                name="visit_type"
                value={formData.visit_type}
                onChange={handleChange}
                options={VISIT_TYPES}
                required
              />

              <Input
                label="Room Number / Ward"
                name="room_no"
                value={formData.room_no}
                onChange={handleChange}
                placeholder="e.g., Ward A-101"
              />
            </div>
          </div>
          )}
          </Card>

            {/* Informant Present/Absent */}
          
            </div>
          
          {/* Step 1 Navigation */}
          <Card className="mt-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (returnTab) {
                    navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
                  } else {
                    navigate('/clinical-today-patients');
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2"
              >
                Next Step
                <FiArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
          </React.Fragment>
        )}

        {/* Step 2: Clinical Proforma */}
        {currentStep === 2 && (
          <React.Fragment>
          <div className="space-y-6">
            {/* Present Illness Card */}

            <Card
              title={
                <div className="flex items-center justify-between w-full cursor-pointer" onClick={() => toggleCard('informant')}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-100 rounded-lg">
                      <FiUser className="w-6 h-6 text-sky-600" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">Informant</span>
                  </div>
                  {expandedCards.informant ? (
                    <FiChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <FiChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              }
              className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
            >
              {expandedCards.informant && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                      <FiUser className="w-5 h-5 text-sky-600" />
                      <span>Informant Present/Absent</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { v: true, t: 'Present' },
                        { v: false, t: 'Absent' },
                      ].map(({ v, t }) => (
                        <label key={t} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                          formData.informant_present === v ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}>
                          <input
                            type="radio"
                            name="informant_present"
                            checked={formData.informant_present === v}
                            onChange={() => handleChange({ target: { name: 'informant_present', value: v } })}
                            className="h-4 w-4 text-primary-600"
                          />
                          <span className="font-medium">{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Nature of Information (Radio) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                      <FiClipboard className="w-5 h-5 text-indigo-600" />
                      <span>Nature of information</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {['Reliable','Unreliable','Adequate','Inadequate'].map((opt) => (
                        <label key={opt} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                          formData.nature_of_information === opt ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}>
                          <input
                            type="radio"
                            name="nature_of_information"
                            value={opt}
                            checked={formData.nature_of_information === opt}
                            onChange={handleChange}
                            className="h-4 w-4 text-primary-600"
                          />
                          <span className="font-medium">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>

            <Card
              title={
                <div className="flex items-center justify-between w-full cursor-pointer" onClick={() => toggleCard('presentIllness')}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <FiActivity className="w-6 h-6 text-amber-600" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">Present Illness</span>
                  </div>
                  {expandedCards.presentIllness ? (
                    <FiChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <FiChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              }
              className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
            >
              {expandedCards.presentIllness && (
                <div className="space-y-6">
                  {/* Onset and Course */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Onset (Radio) */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                  <FiActivity className="w-5 h-5 text-violet-600" />
                  <span>Onset</span>
                </div>
                <div className="flex flex-col md:flex-row md:flex-wrap gap-3">
                  {[{v:'<1_week',t:'1. < 1 week'}, {v:'1w_1m',t:'2. 1 week – 1 month'}, {v:'>1_month',t:'3. > 1 month'}, {v:'not_known',t:'4. Not known'}].map(({v,t}) => (
                    <label key={v} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                      formData.onset_duration === v ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                name="onset_duration"
                        value={v}
                        checked={formData.onset_duration === v}
                onChange={handleChange}
                        className="h-4 w-4 text-primary-600"
                      />
                      <span className="font-medium">{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Course (Radio) */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                  <FiList className="w-5 h-5 text-amber-600" />
                  <span>Course</span>
                </div>
                <div className="flex flex-col md:flex-row md:flex-wrap gap-3">
                  {['Continuous','Episodic','Fluctuating','Deteriorating','Improving'].map((opt) => (
                    <label key={opt} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                      formData.course === opt ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                name="course"
                        value={opt}
                        checked={formData.course === opt}
                onChange={handleChange}
                        className="h-4 w-4 text-primary-600"
              />
                      <span className="font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Precipitating factor and Total duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                  <FiEdit3 className="w-5 h-5 text-rose-600" />
                  <span>Precipitating factor</span>
                </div>
            <Textarea
              name="precipitating_factor"
              value={formData.precipitating_factor}
              onChange={handleChange}
              rows={3}
                  placeholder="Describe key precipitating factors"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                  <FiClock className="w-5 h-5 text-amber-600" />
                  <span>Total duration of illness</span>
                </div>
              <Input
                name="illness_duration"
                value={formData.illness_duration}
                onChange={handleChange}
                placeholder="e.g., 6 months"
              />
              </div>
            </div>

            {/* Current episode duration / Worsening since (free text) */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                <FiClock className="w-5 h-5 text-indigo-600" />
                <span>Current episode duration / Worsening since</span>
              </div>
              <Input
                name="current_episode_since"
                value={formData.current_episode_since}
                onChange={handleChange}
                placeholder="e.g., 2 weeks, since last month, progressively worsening"
                type="text"
              />
                  </div>
                </div>
              )}
            </Card>

          {/* Complaints / History of Presenting Illness (All checkboxes with Add option) */}
          <Card
            title={
              <div className="flex items-center justify-between w-full cursor-pointer" onClick={() => toggleCard('complaints')}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <FiList className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Complaints / History of Presenting Illness</span>
                </div>
                {expandedCards.complaints ? (
                  <FiChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </div>
            }
            className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
          >
          {expandedCards.complaints && (
          <div className="space-y-6">
            <CheckboxGroup label="Mood" name="mood" value={formData.mood} onChange={handleChange} options={[ 'Anxious','Sad','Cheerful','Agitated','Fearful','Irritable' ]} />
            <CheckboxGroup label="Behaviour" name="behaviour" value={formData.behaviour} onChange={handleChange} options={[ 'Suspiciousness','Talking/Smiling to self','Hallucinatory behaviour','Increased goal-directed activity','Compulsions','Apathy','Anhedonia','Avolution','Stupor','Posturing','Stereotypy','Ambitendency','Disinhibition','Impulsivity','Anger outbursts','Suicide/self-harm attempts' ]} />
            <CheckboxGroup label="Speech" name="speech" value={formData.speech} onChange={handleChange} options={[ 'Irrelevant','Incoherent','Pressure','Alogia','Mutism' ]} />
            <CheckboxGroup label="Thought" name="thought" value={formData.thought} onChange={handleChange} options={[ 'Reference','Persecution','Grandiose','Love Infidelity','Bizarre','Pessimism','Worthlessness','Guilt','Poverty','Nihilism','Hypochondriasis','Wish to die','Active suicidal ideation','Plans','Worries','Obsessions','Phobias','Panic attacks' ]} />
            <CheckboxGroup label="Perception" name="perception" value={formData.perception} onChange={handleChange} options={[ 'Hallucination - Auditory','Hallucination - Visual','Hallucination - Tactile','Hallucination - Olfactory','Passivity','Depersonalization','Derealization' ]} />
            <CheckboxGroup label="Somatic" name="somatic" value={formData.somatic} onChange={handleChange} options={[ 'Pains','Numbness','Weakness','Fatigue','Tremors','Palpitations','Dyspnoea','Dizziness' ]} />
            <CheckboxGroup label="Bio-functions" name="bio_functions" value={formData.bio_functions} onChange={handleChange} options={[ 'Sleep','Appetite','Bowel/Bladder','Self-care' ]} />
            <CheckboxGroup label="Adjustment" name="adjustment" value={formData.adjustment} onChange={handleChange} options={[ 'Work output','Socialization' ]} />
            <CheckboxGroup label="Cognitive function" name="cognitive_function" value={formData.cognitive_function} onChange={handleChange} options={[ 'Disorientation','Inattention','Impaired Memory','Intelligence' ]} />
            <CheckboxGroup label="Fits" name="fits" value={formData.fits} onChange={handleChange} options={[ 'Epileptic','Dissociative','Mixed','Not clear' ]} />
            <CheckboxGroup label="Sexual problem" name="sexual_problem" value={formData.sexual_problem} onChange={handleChange} options={[ 'Dhat','Poor erection','Early ejaculation','Decreased desire','Perversion','Homosexuality','Gender dysphoria' ]} />
            <CheckboxGroup label="Substance Use" name="substance_use" value={formData.substance_use} onChange={handleChange} options={[ 'Alcohol','Opioid','Cannabis','Benzodiazepines','Tobacco' ]} />
          </div>
          )}
        </Card>

        {/* Mental State Examination */}
          <Card
            title={
              <div className="flex items-center justify-between w-full cursor-pointer" onClick={() => toggleCard('mse')}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-100 rounded-lg">
                    <FiActivity className="w-6 h-6 text-violet-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Mental State Examination (MSE)</span>
                </div>
                {expandedCards.mse ? (
                  <FiChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </div>
            }
            className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
          >
          {expandedCards.mse && (
          <div className="space-y-6">
            <CheckboxGroup label="Behaviour" name="mse_behaviour" value={formData.mse_behaviour} onChange={handleChange} options={[ 'Uncooperative','Unkempt','Fearful','Odd','Suspicious','Retarded','Excited','Aggressive','Apathetic','Catatonic','Demonstrative' ]} />
            <CheckboxGroup label="Affect & Mood" name="mse_affect" value={formData.mse_affect} onChange={handleChange} options={[ 'Sad','Anxious','Elated','Inappropriate','Blunted','Labile' ]} />
            <CheckboxGroup
              label="Thought (Flow, Form, Content)"
              name="mse_thought"
              value={formData.mse_thought}
              onChange={handleChange}
              options={[ 'Depressive','Suicidal','Obsessions','Hypochondriacal','Preoccupations','Worries' ]}
              rightInlineExtra={
                <Input
              name="mse_delusions"
                  value={formData.mse_delusions}
                  onChange={handleChange}
                  placeholder="Delusions / Ideas of (optional)"
                  className="max-w-xs"
                />
              }
            />
            <CheckboxGroup label="Perception" name="mse_perception" value={formData.mse_perception} onChange={handleChange} options={[ 'Hallucinations - Auditory','Hallucinations - Visual','Hallucinations - Tactile','Hallucinations - Olfactory','Illusions','Depersonalization','Derealization' ]} />
            <CheckboxGroup label="Cognitive functions" name="mse_cognitive_function" value={formData.mse_cognitive_function} onChange={handleChange} options={[ 'Impaired','Not impaired' ]} />
          </div>
          )}
        </Card>

          {/* Additional History (checkbox-based) */}
          <Card
            title={
              <div className="flex items-center justify-between w-full cursor-pointer" onClick={() => toggleCard('additionalHistory')}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <FiCheckSquare className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Additional History</span>
                </div>
                {expandedCards.additionalHistory ? (
                  <FiChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </div>
            }
            className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
          >
          {expandedCards.additionalHistory && (
          <div className="space-y-6">
            <CheckboxGroup label="Bio-Functions (Sleep, Appetite, etc.)" name="bio_functions" value={formData.bio_functions} onChange={handleChange} options={[ 'Sleep','Appetite','Bowel/Bladder','Self-care' ]} />
            <CheckboxGroup label="Substance Use" name="substance_use" value={formData.substance_use} onChange={handleChange} options={[ 'Alcohol','Opioid','Cannabis','Benzodiazepines','Tobacco' ]} />
            <CheckboxGroup label="Past Psychiatric History" name="past_history" value={Array.isArray(formData.past_history) ? formData.past_history : []} onChange={handleChange} options={[]} />
            <CheckboxGroup label="Family History" name="family_history" value={Array.isArray(formData.family_history) ? formData.family_history : []} onChange={handleChange} options={[]} />
            <CheckboxGroup label="Associated Medical/Surgical Illness" name="associated_medical_surgical" value={formData.associated_medical_surgical} onChange={handleChange} options={[ 'Hypertension','Diabetes','Dyslipidemia','Thyroid dysfunction' ]} />
          </div>
          )}
        </Card>

        {/* General Physical Examination */}
          <Card
            title={
              <div className="flex items-center justify-between w-full cursor-pointer" onClick={() => toggleCard('gpe')}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <FiHeart className="w-6 h-6 text-rose-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">General Physical Examination</span>
                </div>
                {expandedCards.gpe ? (
                  <FiChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </div>
            }
            className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
          >
          {expandedCards.gpe && (
          <div className="space-y-6">
          <Textarea
            label="GPE Findings"
            name="gpe"
            value={formData.gpe}
            onChange={handleChange}
            placeholder="BP, Pulse, Weight, BMI, General appearance, Systemic examination..."
            rows={4}
          />
          </div>
          )}
        </Card>

        {/* Diagnosis & Management */}
          <Card
            title={
              <div className="flex items-center justify-between w-full cursor-pointer" onClick={() => toggleCard('diagnosis')}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <FiFileText className="w-6 h-6 text-cyan-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Diagnosis & Management</span>
                </div>
                {expandedCards.diagnosis ? (
                  <FiChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </div>
            }
            className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
          >
          {expandedCards.diagnosis && (
          <div className="space-y-6">
            <Textarea
              label="Diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="Primary and secondary diagnoses..."
              rows={3}
              required
            />

            <ICD11CodeSelector
              value={formData.icd_code}
              onChange={handleChange}
              error={errors.icd_code}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Case Severity"
                name="case_severity"
                value={formData.case_severity}
                onChange={handleChange}
                options={CASE_SEVERITY}
                required
              />

              <Select
                label="Doctor Decision"
                name="doctor_decision"
                value={formData.doctor_decision}
                onChange={handleChange}
                options={DOCTOR_DECISION}
                required
              />
            </div>

            <Textarea
              label="Disposal & Referral"
              name="disposal"
              value={formData.disposal}
              onChange={handleChange}
              placeholder="Admission, discharge, follow-up..."
              rows={2}
            />

            <Input
              label="Workup Appointment"
              type="date"
              name="workup_appointment"
              value={formData.workup_appointment}
              onChange={handleChange}
            />

            <Textarea
              label="Referred To"
              name="referred_to"
              value={formData.referred_to}
              onChange={handleChange}
              placeholder="Other departments or specialists..."
              rows={2}
            />
          </div>
          )}
        </Card>
        
        {/* Step 2 Navigation */}
        <Card className="mt-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <div className="flex justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              className="flex items-center gap-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              Next Step
              <FiArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
            </div>
          </React.Fragment>
        )}

        {/* Step 3: Additional Detail (ADL) - Only shown for complex cases */}
        {currentStep === 3 && showADLStep && (
          <React.Fragment>
            <div className="space-y-6">
            <Card title="Additional Detail (ADL File Requirements)" className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div className="space-y-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requires_adl_file"
                  name="requires_adl_file"
                  checked={formData.requires_adl_file}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 rounded"
                />
                <label htmlFor="requires_adl_file" className="ml-2 text-sm text-gray-700">
                  Requires ADL File (Auto-checked for complex cases)
                </label>
              </div>

              <Textarea
                label="ADL Reasoning"
                name="adl_reasoning"
                value={formData.adl_reasoning}
                onChange={handleChange}
                placeholder="Explain why this case requires an ADL file..."
                rows={4}
                required
                error={errors.adl_reasoning}
              />
            </div>
          </Card>
          
          {/* Step 3 Navigation */}
          <Card className="mt-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="flex items-center gap-2"
              >
                <FiArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2"
              >
                Next Step
                <FiArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
            </div>
          </React.Fragment>
        )}

        {/* Step 4: Prescribe Medication */}
        {currentStep === 4 && (
          <React.Fragment>
          <div className="space-y-6">
            <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="text-center py-12">
                <div className="p-4 bg-green-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <FiPackage className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Prescribe Medication</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Complete the clinical proforma first, then proceed to prescribe medications for the patient.
                </p>
                {formData.patient_id ? (
                  <div className="space-y-4">
                    <Button
                      type="button"
                      onClick={() => navigate(`/clinical/prescribe-medication?patient_id=${formData.patient_id}&returnTab=${returnTab || ''}`)}
                      className="flex items-center gap-2 mx-auto bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 px-8 py-3 text-lg"
                      size="lg"
                    >
                      <FiPackage className="w-5 h-5" />
                      Go to Prescribe Medication
                    </Button>
                    <p className="text-sm text-gray-500 mt-4">
                      You can also prescribe medication after saving this proforma.
                    </p>
                  </div>
                ) : (
                  <p className="text-red-600 font-medium">
                    Patient must be selected in Step 1 to prescribe medication.
                  </p>
                )}
              </div>
            </Card>
            
            {/* Step 4 Navigation */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="flex justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex items-center gap-2"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (returnTab) {
                        navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
                      } else {
                        navigate('/clinical-today-patients');
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    loading={isLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700"
                  >
                    <FiSave className="w-4 h-4" />
                    Create Clinical Proforma
                  </Button>
                </div>
              </div>
            </Card>
          </div>
          </React.Fragment>
        )}
      </form>
      </div>
    </div>
  );
};

export default CreateClinicalProforma;

