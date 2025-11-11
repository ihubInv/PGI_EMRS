import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCreateClinicalProformaMutation, useUpdateClinicalProformaMutation } from '../../features/clinical/clinicalApiSlice';
import { useGetADLFileByIdQuery, useUpdateADLFileMutation } from '../../features/adl/adlApiSlice';
import { useSearchPatientsQuery, useGetPatientByIdQuery } from '../../features/patients/patientsApiSlice';
import { useGetDoctorsQuery } from '../../features/users/usersApiSlice';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import { FiEdit3, FiClipboard, FiCheckSquare, FiList, FiActivity, FiHeart, FiUser, FiFileText, FiPlus, FiX, FiSave, FiClock, FiChevronDown, FiChevronUp, FiArrowRight, FiArrowLeft, FiCheck, FiTrash2 } from 'react-icons/fi';
import { VISIT_TYPES, CASE_SEVERITY, DOCTOR_DECISION, isJR, isSR } from '../../utils/constants';
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

const CreateClinicalProforma = ({ 
  editMode = false, 
  existingProforma = null, 
  existingAdlFile = null,
  proformaId = null 
} = {}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientIdFromQuery = searchParams.get('patient_id');
  const returnTab = searchParams.get('returnTab'); // Get returnTab from URL

  const [createProforma, { isLoading: isCreating }] = useCreateClinicalProformaMutation();
  const [updateProforma, { isLoading: isUpdating }] = useUpdateClinicalProformaMutation();
  
  // Track created proforma ID for step-wise saving
  // In edit mode, set it immediately from props
  const [savedProformaId, setSavedProformaId] = useState(editMode && proformaId ? proformaId : null);
  const [patientSearch, setPatientSearch] = useState('');
  const { data: patientsData } = useSearchPatientsQuery(
    { search: patientSearch, limit: 10 },
    { skip: !patientSearch }
  );
  
  // Fetch doctors list for assignment by MWO
  const { data: doctorsData } = useGetDoctorsQuery({ page: 1, limit: 100 });
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
    // History of Present Illness - Expanded
    history_narrative: '',
    history_specific_enquiry: '',
    history_drug_intake: '',
    history_treatment_place: '',
    history_treatment_dates: '',
    history_treatment_drugs: '',
    history_treatment_response: '',
    // Multiple Informants
    informants: [{ relationship: '', name: '', reliability: '' }],
    // Complaints and Duration
    complaints_patient: [{ complaint: '', duration: '' }],
    complaints_informant: [{ complaint: '', duration: '' }],
    // Past History - Detailed
    past_history_medical: '',
    past_history_psychiatric_dates: '',
    past_history_psychiatric_diagnosis: '',
    past_history_psychiatric_treatment: '',
    past_history_psychiatric_interim: '',
    past_history_psychiatric_recovery: '',
    // Family History - Detailed
    family_history_father_age: '',
    family_history_father_education: '',
    family_history_father_occupation: '',
    family_history_father_personality: '',
    family_history_father_deceased: false,
    family_history_father_death_age: '',
    family_history_father_death_date: '',
    family_history_father_death_cause: '',
    family_history_mother_age: '',
    family_history_mother_education: '',
    family_history_mother_occupation: '',
    family_history_mother_personality: '',
    family_history_mother_deceased: false,
    family_history_mother_death_age: '',
    family_history_mother_death_date: '',
    family_history_mother_death_cause: '',
    family_history_siblings: [{ age: '', sex: '', education: '', occupation: '', marital_status: '' }],
    // Diagnostic Formulation
    diagnostic_formulation_summary: '',
    diagnostic_formulation_features: '',
    diagnostic_formulation_psychodynamic: '',
    // Premorbid Personality
    premorbid_personality_passive_active: '',
    premorbid_personality_assertive: '',
    premorbid_personality_introvert_extrovert: '',
    premorbid_personality_traits: [],
    premorbid_personality_hobbies: '',
    premorbid_personality_habits: '',
    premorbid_personality_alcohol_drugs: '',
    // Physical Examination - Comprehensive
    physical_appearance: '',
    physical_body_build: '',
    physical_pallor: false,
    physical_icterus: false,
    physical_oedema: false,
    physical_lymphadenopathy: false,
    physical_pulse: '',
    physical_bp: '',
    physical_height: '',
    physical_weight: '',
    physical_waist: '',
    physical_fundus: '',
    physical_cvs_apex: '',
    physical_cvs_regularity: '',
    physical_cvs_heart_sounds: '',
    physical_cvs_murmurs: '',
    physical_chest_expansion: '',
    physical_chest_percussion: '',
    physical_chest_adventitious: '',
    physical_abdomen_tenderness: '',
    physical_abdomen_mass: '',
    physical_abdomen_bowel_sounds: '',
    physical_cns_cranial: '',
    physical_cns_motor_sensory: '',
    physical_cns_rigidity: '',
    physical_cns_involuntary: '',
    physical_cns_superficial_reflexes: '',
    physical_cns_dtrs: '',
    physical_cns_plantar: '',
    physical_cns_cerebellar: '',
    // Mental Status Examination - Expanded
    mse_general_demeanour: '',
    mse_general_tidy: '',
    mse_general_awareness: '',
    mse_general_cooperation: '',
    mse_psychomotor_verbalization: '',
    mse_psychomotor_pressure: '',
    mse_psychomotor_tension: '',
    mse_psychomotor_posture: '',
    mse_psychomotor_mannerism: '',
    mse_psychomotor_catatonic: '',
    mse_affect_subjective: '',
    mse_affect_tone: '',
    mse_affect_resting: '',
    mse_affect_fluctuation: '',
    mse_thought_flow: '',
    mse_thought_form: '',
    mse_thought_content: '',
    mse_cognitive_consciousness: '',
    mse_cognitive_orientation_time: '',
    mse_cognitive_orientation_place: '',
    mse_cognitive_orientation_person: '',
    mse_cognitive_memory_immediate: '',
    mse_cognitive_memory_recent: '',
    mse_cognitive_memory_remote: '',
    mse_cognitive_subtraction: '',
    mse_cognitive_digit_span: '',
    mse_cognitive_counting: '',
    mse_cognitive_general_knowledge: '',
    mse_cognitive_calculation: '',
    mse_cognitive_similarities: '',
    mse_cognitive_proverbs: '',
    mse_insight_understanding: '',
    mse_insight_judgement: '',
    // Educational History
    education_start_age: '',
    education_highest_class: '',
    education_performance: '',
    education_disciplinary: '',
    education_peer_relationship: '',
    education_hobbies: '',
    education_special_abilities: '',
    education_discontinue_reason: '',
    // Occupational History
    occupation_jobs: [{ job: '', dates: '', adjustment: '', difficulties: '', promotions: '', change_reason: '' }],
    // Sexual and Marital History
    sexual_menarche_age: '',
    sexual_menarche_reaction: '',
    sexual_education: '',
    sexual_masturbation: '',
    sexual_contact: '',
    sexual_premarital_extramarital: '',
    sexual_marriage_arranged: '',
    sexual_marriage_date: '',
    sexual_spouse_age: '',
    sexual_spouse_occupation: '',
    sexual_adjustment_general: '',
    sexual_adjustment_sexual: '',
    sexual_children: [{ age: '', sex: '' }],
    sexual_problems: '',
    // Religion
    religion_type: '',
    religion_participation: '',
    religion_changes: '',
    // Present Living Situation
    living_residents: [{ name: '', relationship: '', age: '' }],
    living_income_sharing: '',
    living_expenses: '',
    living_kitchen: '',
    living_domestic_conflicts: '',
    living_social_class: '',
    living_inlaws: [{ name: '', relationship: '', age: '' }],
    // General Home Situation and Early Development
    home_situation_childhood: '',
    home_situation_parents_relationship: '',
    home_situation_socioeconomic: '',
    home_situation_interpersonal: '',
    personal_birth_date: '',
    personal_birth_place: '',
    personal_delivery_type: '',
    personal_complications_prenatal: '',
    personal_complications_natal: '',
    personal_complications_postnatal: '',
    development_weaning_age: '',
    development_first_words: '',
    development_three_words: '',
    development_walking: '',
    development_neurotic_traits: '',
    development_nail_biting: '',
    development_bedwetting: '',
    development_phobias: '',
    development_childhood_illness: '',
    // Provisional Diagnosis and Treatment Plan
    provisional_diagnosis: '',
    treatment_plan: '',
    // Comments of the Consultant
    consultant_comments: '',
  });

  // Fetch full patient data when patient_id is selected (moved after formData declaration)
  const { data: fullPatientData } = useGetPatientByIdQuery(
    formData.patient_id,
    { skip: !formData.patient_id }
  );

  const [errors, setErrors] = useState({});

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  
  // Prescription state management
  const [prescriptions, setPrescriptions] = useState([
    { medicine: '', dosage: '', when: '', frequency: '', duration: '', qty: '', details: '', notes: '' }
  ]);

  
  
  // Always 3 steps: Basic Info, Clinical Proforma, Additional Detail (conditional)
  const totalSteps = 3;
  
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
      // Automatically enable ADL file requirement for complex cases
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

  // Track ADL file ID for fetching ADL data when Step 3 loads
  // In edit mode, set it from existing proforma if available
  const [adlFileId, setAdlFileId] = useState(
    editMode && existingProforma?.adl_file_id ? existingProforma.adl_file_id : null
  );
  
  // Fetch ADL file data when Step 3 loads and adl_file_id exists
  const { data: adlFileData } = useGetADLFileByIdQuery(adlFileId, { skip: !adlFileId || currentStep !== 3 });
  const [updateADLFile] = useUpdateADLFileMutation();
  
  // Track if data has been loaded in edit mode to prevent overwriting user input
  const proformaDataLoadedRef = useRef(false);
  const adlDataLoadedRef = useRef(false);
  
  // Helper function to normalize array fields (handles JSONB fields that might be strings or arrays)
  const normalizeArrayField = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
      } catch {
        return value ? [value] : [];
      }
    }
    return value ? [value] : [];
  };

  // Helper function to normalize object array fields (for JSONB fields like prescriptions, informants, etc.)
  const normalizeObjectArrayField = (value, defaultStructure = {}) => {
    if (Array.isArray(value)) {
      return value.length > 0 ? value : [defaultStructure];
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.length > 0 ? parsed : [defaultStructure];
        }
        return parsed ? [parsed] : [defaultStructure];
      } catch {
        return [defaultStructure];
      }
    }
    return [defaultStructure];
  };

  // ✅ Load existing proforma and ADL file data into form when in edit mode
  useEffect(() => {
    // Only load once - don't reload if user has already made changes
    if (editMode && existingProforma && !proformaDataLoadedRef.current) {
      // Map all proforma fields to formData
      const proformaFormData = {
        patient_id: existingProforma.patient_id?.toString() || '',
        visit_date: existingProforma.visit_date || new Date().toISOString().split('T')[0],
        visit_type: existingProforma.visit_type || 'first_visit',
        room_no: existingProforma.room_no || '',
        assigned_doctor: existingProforma.assigned_doctor?.toString() || '',
        informant_present: existingProforma.informant_present ?? true,
        nature_of_information: existingProforma.nature_of_information || '',
        onset_duration: existingProforma.onset_duration || '',
        course: existingProforma.course || '',
        precipitating_factor: existingProforma.precipitating_factor || '',
        illness_duration: existingProforma.illness_duration || '',
        current_episode_since: existingProforma.current_episode_since || '',
        mood: normalizeArrayField(existingProforma.mood),
        behaviour: normalizeArrayField(existingProforma.behaviour),
        speech: normalizeArrayField(existingProforma.speech),
        thought: normalizeArrayField(existingProforma.thought),
        perception: normalizeArrayField(existingProforma.perception),
        somatic: normalizeArrayField(existingProforma.somatic),
        bio_functions: normalizeArrayField(existingProforma.bio_functions),
        adjustment: normalizeArrayField(existingProforma.adjustment),
        cognitive_function: normalizeArrayField(existingProforma.cognitive_function),
        fits: normalizeArrayField(existingProforma.fits),
        sexual_problem: normalizeArrayField(existingProforma.sexual_problem),
        substance_use: normalizeArrayField(existingProforma.substance_use),
        past_history: existingProforma.past_history || '',
        family_history: existingProforma.family_history || '',
        associated_medical_surgical: normalizeArrayField(existingProforma.associated_medical_surgical),
        mse_behaviour: normalizeArrayField(existingProforma.mse_behaviour),
        mse_affect: normalizeArrayField(existingProforma.mse_affect),
        mse_thought: existingProforma.mse_thought || '',
        mse_delusions: existingProforma.mse_delusions || '',
        mse_perception: normalizeArrayField(existingProforma.mse_perception),
        mse_cognitive_function: normalizeArrayField(existingProforma.mse_cognitive_function),
        gpe: existingProforma.gpe || '',
        diagnosis: existingProforma.diagnosis || '',
        icd_code: existingProforma.icd_code || '',
        disposal: existingProforma.disposal || '',
        workup_appointment: existingProforma.workup_appointment || '',
        referred_to: existingProforma.referred_to || '',
        treatment_prescribed: existingProforma.treatment_prescribed || '',
        doctor_decision: existingProforma.doctor_decision || 'simple_case',
        case_severity: existingProforma.case_severity || '',
        requires_adl_file: existingProforma.requires_adl_file || false,
        adl_reasoning: existingProforma.adl_reasoning || '',
      };
      
      setFormData(prev => ({ ...prev, ...proformaFormData }));
      
      // Set ADL file ID if it exists
      if (existingProforma.adl_file_id) {
        setAdlFileId(existingProforma.adl_file_id);
      }
      
      // Load prescriptions if they exist (prescriptions is JSONB array)
      if (existingProforma.prescriptions) {
        const normalizedPrescriptions = normalizeObjectArrayField(
          existingProforma.prescriptions,
          { medicine: '', dosage: '', when: '', frequency: '', duration: '', qty: '', details: '', notes: '' }
        );
        setPrescriptions(normalizedPrescriptions);
      }
      
      // Mark proforma data as loaded
      proformaDataLoadedRef.current = true;
    }
  }, [editMode, existingProforma]);
  
  // ✅ Load ADL file data into form when in edit mode
  useEffect(() => {
    // Only load once - don't reload if user has already made changes
    if (editMode && existingAdlFile && !adlDataLoadedRef.current) {
      // Map all ADL file fields to formData (excluding metadata fields)
      const adlFormData = {};
      
      // JSONB fields that need special handling
      const jsonbFields = {
        'informants': { relationship: '', name: '', reliability: '' },
        'complaints_patient': { complaint: '', duration: '' },
        'complaints_informant': { complaint: '', duration: '' },
        'family_history_siblings': { age: '', sex: '', education: '', occupation: '', marital_status: '' },
        'premorbid_personality_traits': [],
        'occupation_jobs': { job: '', dates: '', adjustment: '', difficulties: '', promotions: '', change_reason: '' },
        'sexual_children': { age: '', sex: '' },
        'living_residents': { name: '', relationship: '', age: '' },
        'living_inlaws': { name: '', relationship: '', age: '' }
      };
      
      Object.keys(existingAdlFile).forEach(key => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' && 
            key !== 'patient_id' && key !== 'adl_no' && key !== 'created_by' &&
            key !== 'clinical_proforma_id' && key !== 'file_status' && 
            key !== 'file_created_date' && key !== 'total_visits' && key !== 'is_active' &&
            key !== 'last_accessed_date' && key !== 'last_accessed_by' && key !== 'notes') {
          
          // Handle JSONB fields
          if (jsonbFields.hasOwnProperty(key)) {
            adlFormData[key] = normalizeObjectArrayField(existingAdlFile[key], jsonbFields[key]);
          } else {
            // Regular fields
            adlFormData[key] = existingAdlFile[key] ?? '';
          }
        }
      });
      
      setFormData(prev => ({ ...prev, ...adlFormData }));
      
      // Mark ADL data as loaded
      adlDataLoadedRef.current = true;
    }
  }, [editMode, existingAdlFile]);
  
  // ✅ Prefill Step 3 form when ADL file data is loaded
  useEffect(() => {
    if (currentStep === 3 && adlFileData?.data?.adlFile && Object.keys(formData).some(key => 
      key.includes('history_') || key.includes('informants') || key.includes('physical_') ||
      key.includes('mse_') || key.includes('education_') || key.includes('occupation_') ||
      key.includes('sexual_') || key.includes('living_') || key.includes('personal_') ||
      key.includes('development_') || key.includes('diagnostic_') || key.includes('premorbid_')
    )) {
      const adlFile = adlFileData.data.adlFile;
      // Only prefill if formData is empty for these fields (don't overwrite user input)
      const hasExistingData = Object.keys(formData).some(key => 
        (key.includes('history_') || key.includes('informants') || key.includes('physical_') ||
         key.includes('mse_') || key.includes('education_') || key.includes('occupation_') ||
         key.includes('sexual_') || key.includes('living_') || key.includes('personal_') ||
         key.includes('development_') || key.includes('diagnostic_') || key.includes('premorbid_')) &&
        formData[key] !== undefined && formData[key] !== null && formData[key] !== ''
      );
      
      if (!hasExistingData) {
        Object.keys(adlFile).forEach(key => {
          if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' && 
              key !== 'patient_id' && key !== 'adl_no' && key !== 'created_by' &&
              key !== 'clinical_proforma_id' && key !== 'file_status' && 
              key !== 'file_created_date' && key !== 'total_visits' && key !== 'is_active' &&
              adlFile[key] !== undefined && adlFile[key] !== null && adlFile[key] !== '') {
            setFormData(prev => {
              // Only set if current value is empty
              if (prev[key] === undefined || prev[key] === null || prev[key] === '') {
                return { ...prev, [key]: adlFile[key] };
              }
              return prev;
            });
          }
        });
      }
    }
  }, [currentStep, adlFileData, formData]);

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

  // Helper function to prepare form data for API
  const prepareFormData = (step) => {
    const join = (arr) => Array.isArray(arr) ? arr.join(', ') : arr;
    
    const baseData = {
      patient_id: parseInt(formData.patient_id),
      visit_date: formData.visit_date,
      visit_type: formData.visit_type,
      room_no: formData.room_no,
      assigned_doctor: formData.assigned_doctor ? parseInt(formData.assigned_doctor) : null,
    };

    // Step 1: Basic Information
    if (step === 1) {
      return baseData;
    }

    // Step 2: Clinical Proforma (add clinical data)
    if (step === 2) {
      return {
        ...baseData,
        informant_present: formData.informant_present,
        nature_of_information: formData.nature_of_information,
        onset_duration: formData.onset_duration,
        course: formData.course,
        precipitating_factor: formData.precipitating_factor,
        illness_duration: formData.illness_duration,
        current_episode_since: formData.current_episode_since,
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
        past_history: formData.past_history,
        family_history: formData.family_history,
        associated_medical_surgical: join(formData.associated_medical_surgical),
        mse_behaviour: join(formData.mse_behaviour),
        mse_affect: join(formData.mse_affect),
        mse_thought: join(formData.mse_thought),
        mse_delusions: formData.mse_delusions,
        mse_perception: join(formData.mse_perception),
        mse_cognitive_function: join(formData.mse_cognitive_function),
        gpe: formData.gpe,
        diagnosis: formData.diagnosis,
        icd_code: formData.icd_code,
        disposal: formData.disposal,
        workup_appointment: formData.workup_appointment,
        referred_to: formData.referred_to,
        doctor_decision: formData.doctor_decision,
        case_severity: formData.case_severity,
        requires_adl_file: formData.requires_adl_file,
        adl_reasoning: formData.adl_reasoning,
      };
    }

    // Step 3: ADL Details (only for complex cases)
    if (step === 3) {
      return {
        // Include all previous data plus ADL fields
        ...baseData,
        informant_present: formData.informant_present,
        nature_of_information: formData.nature_of_information,
        onset_duration: formData.onset_duration,
        course: formData.course,
        precipitating_factor: formData.precipitating_factor,
        illness_duration: formData.illness_duration,
        current_episode_since: formData.current_episode_since,
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
        past_history: formData.past_history,
        family_history: formData.family_history,
        associated_medical_surgical: join(formData.associated_medical_surgical),
        mse_behaviour: join(formData.mse_behaviour),
        mse_affect: join(formData.mse_affect),
        mse_thought: join(formData.mse_thought),
        mse_delusions: formData.mse_delusions,
        mse_perception: join(formData.mse_perception),
        mse_cognitive_function: join(formData.mse_cognitive_function),
        gpe: formData.gpe,
        diagnosis: formData.diagnosis,
        icd_code: formData.icd_code,
        disposal: formData.disposal,
        workup_appointment: formData.workup_appointment,
        referred_to: formData.referred_to,
        doctor_decision: formData.doctor_decision,
        case_severity: formData.case_severity,
        requires_adl_file: formData.requires_adl_file,
        adl_reasoning: formData.adl_reasoning,
        // All ADL-related fields
        history_narrative: formData.history_narrative,
        history_specific_enquiry: formData.history_specific_enquiry,
        history_drug_intake: formData.history_drug_intake,
        history_treatment_place: formData.history_treatment_place,
        history_treatment_dates: formData.history_treatment_dates,
        history_treatment_drugs: formData.history_treatment_drugs,
        history_treatment_response: formData.history_treatment_response,
        informants: formData.informants,
        complaints_patient: formData.complaints_patient,
        complaints_informant: formData.complaints_informant,
        past_history_medical: formData.past_history_medical,
        past_history_psychiatric_dates: formData.past_history_psychiatric_dates,
        past_history_psychiatric_diagnosis: formData.past_history_psychiatric_diagnosis,
        past_history_psychiatric_treatment: formData.past_history_psychiatric_treatment,
        past_history_psychiatric_interim: formData.past_history_psychiatric_interim,
        past_history_psychiatric_recovery: formData.past_history_psychiatric_recovery,
        family_history_father_age: formData.family_history_father_age,
        family_history_father_education: formData.family_history_father_education,
        family_history_father_occupation: formData.family_history_father_occupation,
        family_history_father_personality: formData.family_history_father_personality,
        family_history_father_deceased: formData.family_history_father_deceased,
        family_history_father_death_age: formData.family_history_father_death_age,
        family_history_father_death_date: formData.family_history_father_death_date,
        family_history_father_death_cause: formData.family_history_father_death_cause,
        family_history_mother_age: formData.family_history_mother_age,
        family_history_mother_education: formData.family_history_mother_education,
        family_history_mother_occupation: formData.family_history_mother_occupation,
        family_history_mother_personality: formData.family_history_mother_personality,
        family_history_mother_deceased: formData.family_history_mother_deceased,
        family_history_mother_death_age: formData.family_history_mother_death_age,
        family_history_mother_death_date: formData.family_history_mother_death_date,
        family_history_mother_death_cause: formData.family_history_mother_death_cause,
        family_history_siblings: formData.family_history_siblings,
        diagnostic_formulation_summary: formData.diagnostic_formulation_summary,
        diagnostic_formulation_features: formData.diagnostic_formulation_features,
        diagnostic_formulation_psychodynamic: formData.diagnostic_formulation_psychodynamic,
        premorbid_personality_passive_active: formData.premorbid_personality_passive_active,
        premorbid_personality_assertive: formData.premorbid_personality_assertive,
        premorbid_personality_introvert_extrovert: formData.premorbid_personality_introvert_extrovert,
        premorbid_personality_traits: formData.premorbid_personality_traits,
        premorbid_personality_hobbies: formData.premorbid_personality_hobbies,
        premorbid_personality_habits: formData.premorbid_personality_habits,
        premorbid_personality_alcohol_drugs: formData.premorbid_personality_alcohol_drugs,
        physical_appearance: formData.physical_appearance,
        physical_body_build: formData.physical_body_build,
        physical_pallor: formData.physical_pallor,
        physical_icterus: formData.physical_icterus,
        physical_oedema: formData.physical_oedema,
        physical_lymphadenopathy: formData.physical_lymphadenopathy,
        physical_pulse: formData.physical_pulse,
        physical_bp: formData.physical_bp,
        physical_height: formData.physical_height,
        physical_weight: formData.physical_weight,
        physical_waist: formData.physical_waist,
        physical_fundus: formData.physical_fundus,
        physical_cvs_apex: formData.physical_cvs_apex,
        physical_cvs_regularity: formData.physical_cvs_regularity,
        physical_cvs_heart_sounds: formData.physical_cvs_heart_sounds,
        physical_cvs_murmurs: formData.physical_cvs_murmurs,
        physical_chest_expansion: formData.physical_chest_expansion,
        physical_chest_percussion: formData.physical_chest_percussion,
        physical_chest_adventitious: formData.physical_chest_adventitious,
        physical_abdomen_tenderness: formData.physical_abdomen_tenderness,
        physical_abdomen_mass: formData.physical_abdomen_mass,
        physical_abdomen_bowel_sounds: formData.physical_abdomen_bowel_sounds,
        physical_cns_cranial: formData.physical_cns_cranial,
        physical_cns_motor_sensory: formData.physical_cns_motor_sensory,
        physical_cns_rigidity: formData.physical_cns_rigidity,
        physical_cns_involuntary: formData.physical_cns_involuntary,
        physical_cns_superficial_reflexes: formData.physical_cns_superficial_reflexes,
        physical_cns_dtrs: formData.physical_cns_dtrs,
        physical_cns_plantar: formData.physical_cns_plantar,
        physical_cns_cerebellar: formData.physical_cns_cerebellar,
        mse_general_demeanour: formData.mse_general_demeanour,
        mse_general_tidy: formData.mse_general_tidy,
        mse_general_awareness: formData.mse_general_awareness,
        mse_general_cooperation: formData.mse_general_cooperation,
        mse_psychomotor_verbalization: formData.mse_psychomotor_verbalization,
        mse_psychomotor_pressure: formData.mse_psychomotor_pressure,
        mse_psychomotor_tension: formData.mse_psychomotor_tension,
        mse_psychomotor_posture: formData.mse_psychomotor_posture,
        mse_psychomotor_mannerism: formData.mse_psychomotor_mannerism,
        mse_psychomotor_catatonic: formData.mse_psychomotor_catatonic,
        mse_affect_subjective: formData.mse_affect_subjective,
        mse_affect_tone: formData.mse_affect_tone,
        mse_affect_resting: formData.mse_affect_resting,
        mse_affect_fluctuation: formData.mse_affect_fluctuation,
        mse_thought_flow: formData.mse_thought_flow,
        mse_thought_form: formData.mse_thought_form,
        mse_thought_content: formData.mse_thought_content,
        mse_cognitive_consciousness: formData.mse_cognitive_consciousness,
        mse_cognitive_orientation_time: formData.mse_cognitive_orientation_time,
        mse_cognitive_orientation_place: formData.mse_cognitive_orientation_place,
        mse_cognitive_orientation_person: formData.mse_cognitive_orientation_person,
        mse_cognitive_memory_immediate: formData.mse_cognitive_memory_immediate,
        mse_cognitive_memory_recent: formData.mse_cognitive_memory_recent,
        mse_cognitive_memory_remote: formData.mse_cognitive_memory_remote,
        mse_cognitive_subtraction: formData.mse_cognitive_subtraction,
        mse_cognitive_digit_span: formData.mse_cognitive_digit_span,
        mse_cognitive_counting: formData.mse_cognitive_counting,
        mse_cognitive_general_knowledge: formData.mse_cognitive_general_knowledge,
        mse_cognitive_calculation: formData.mse_cognitive_calculation,
        mse_cognitive_similarities: formData.mse_cognitive_similarities,
        mse_cognitive_proverbs: formData.mse_cognitive_proverbs,
        mse_insight_understanding: formData.mse_insight_understanding,
        mse_insight_judgement: formData.mse_insight_judgement,
        education_start_age: formData.education_start_age,
        education_highest_class: formData.education_highest_class,
        education_performance: formData.education_performance,
        education_disciplinary: formData.education_disciplinary,
        education_peer_relationship: formData.education_peer_relationship,
        education_hobbies: formData.education_hobbies,
        education_special_abilities: formData.education_special_abilities,
        education_discontinue_reason: formData.education_discontinue_reason,
        occupation_jobs: formData.occupation_jobs,
        sexual_menarche_age: formData.sexual_menarche_age,
        sexual_menarche_reaction: formData.sexual_menarche_reaction,
        sexual_education: formData.sexual_education,
        sexual_masturbation: formData.sexual_masturbation,
        sexual_contact: formData.sexual_contact,
        sexual_premarital_extramarital: formData.sexual_premarital_extramarital,
        sexual_marriage_arranged: formData.sexual_marriage_arranged,
        sexual_marriage_date: formData.sexual_marriage_date,
        sexual_spouse_age: formData.sexual_spouse_age,
        sexual_spouse_occupation: formData.sexual_spouse_occupation,
        sexual_adjustment_general: formData.sexual_adjustment_general,
        sexual_adjustment_sexual: formData.sexual_adjustment_sexual,
        sexual_children: formData.sexual_children,
        sexual_problems: formData.sexual_problems,
        religion_type: formData.religion_type,
        religion_participation: formData.religion_participation,
        religion_changes: formData.religion_changes,
        living_residents: formData.living_residents,
        living_income_sharing: formData.living_income_sharing,
        living_expenses: formData.living_expenses,
        living_kitchen: formData.living_kitchen,
        living_domestic_conflicts: formData.living_domestic_conflicts,
        living_social_class: formData.living_social_class,
        living_inlaws: formData.living_inlaws,
        home_situation_childhood: formData.home_situation_childhood,
        home_situation_parents_relationship: formData.home_situation_parents_relationship,
        home_situation_socioeconomic: formData.home_situation_socioeconomic,
        home_situation_interpersonal: formData.home_situation_interpersonal,
        personal_birth_date: formData.personal_birth_date,
        personal_birth_place: formData.personal_birth_place,
        personal_delivery_type: formData.personal_delivery_type,
        personal_complications_prenatal: formData.personal_complications_prenatal,
        personal_complications_natal: formData.personal_complications_natal,
        personal_complications_postnatal: formData.personal_complications_postnatal,
        development_weaning_age: formData.development_weaning_age,
        development_first_words: formData.development_first_words,
        development_three_words: formData.development_three_words,
        development_walking: formData.development_walking,
        development_neurotic_traits: formData.development_neurotic_traits,
        development_nail_biting: formData.development_nail_biting,
        development_bedwetting: formData.development_bedwetting,
        development_phobias: formData.development_phobias,
        development_childhood_illness: formData.development_childhood_illness,
        provisional_diagnosis: formData.provisional_diagnosis,
        treatment_plan: formData.treatment_plan,
        consultant_comments: formData.consultant_comments,
      };
    }

    return baseData;
  };

  // Save current step data to API
  const saveCurrentStep = async (step) => {
    try {
      const stepData = prepareFormData(step);
      
      // ✅ Step 3: Update ADL file directly if it exists
      if (step === 3 && adlFileId) {
        try {
          // Extract only complex case fields for ADL update
          const complexCaseFields = [
            'history_narrative', 'history_specific_enquiry', 'history_drug_intake',
            'history_treatment_place', 'history_treatment_dates', 'history_treatment_drugs', 'history_treatment_response',
            'informants', 'complaints_patient', 'complaints_informant',
            'past_history_medical', 'past_history_psychiatric_dates', 'past_history_psychiatric_diagnosis',
            'past_history_psychiatric_treatment', 'past_history_psychiatric_interim', 'past_history_psychiatric_recovery',
            'family_history_father_age', 'family_history_father_education', 'family_history_father_occupation',
            'family_history_father_personality', 'family_history_father_deceased', 'family_history_father_death_age',
            'family_history_father_death_date', 'family_history_father_death_cause',
            'family_history_mother_age', 'family_history_mother_education', 'family_history_mother_occupation',
            'family_history_mother_personality', 'family_history_mother_deceased', 'family_history_mother_death_age',
            'family_history_mother_death_date', 'family_history_mother_death_cause', 'family_history_siblings',
            'diagnostic_formulation_summary', 'diagnostic_formulation_features', 'diagnostic_formulation_psychodynamic',
            'premorbid_personality_passive_active', 'premorbid_personality_assertive', 'premorbid_personality_introvert_extrovert',
            'premorbid_personality_traits', 'premorbid_personality_hobbies', 'premorbid_personality_habits', 'premorbid_personality_alcohol_drugs',
            'physical_appearance', 'physical_body_build', 'physical_pallor', 'physical_icterus', 'physical_oedema', 'physical_lymphadenopathy',
            'physical_pulse', 'physical_bp', 'physical_height', 'physical_weight', 'physical_waist', 'physical_fundus',
            'physical_cvs_apex', 'physical_cvs_regularity', 'physical_cvs_heart_sounds', 'physical_cvs_murmurs',
            'physical_chest_expansion', 'physical_chest_percussion', 'physical_chest_adventitious',
            'physical_abdomen_tenderness', 'physical_abdomen_mass', 'physical_abdomen_bowel_sounds',
            'physical_cns_cranial', 'physical_cns_motor_sensory', 'physical_cns_rigidity', 'physical_cns_involuntary',
            'physical_cns_superficial_reflexes', 'physical_cns_dtrs', 'physical_cns_plantar', 'physical_cns_cerebellar',
            'mse_general_demeanour', 'mse_general_tidy', 'mse_general_awareness', 'mse_general_cooperation',
            'mse_psychomotor_verbalization', 'mse_psychomotor_pressure', 'mse_psychomotor_tension', 'mse_psychomotor_posture',
            'mse_psychomotor_mannerism', 'mse_psychomotor_catatonic', 'mse_affect_subjective', 'mse_affect_tone',
            'mse_affect_resting', 'mse_affect_fluctuation', 'mse_thought_flow', 'mse_thought_form', 'mse_thought_content',
            'mse_cognitive_consciousness', 'mse_cognitive_orientation_time', 'mse_cognitive_orientation_place',
            'mse_cognitive_orientation_person', 'mse_cognitive_memory_immediate', 'mse_cognitive_memory_recent',
            'mse_cognitive_memory_remote', 'mse_cognitive_subtraction', 'mse_cognitive_digit_span', 'mse_cognitive_counting',
            'mse_cognitive_general_knowledge', 'mse_cognitive_calculation', 'mse_cognitive_similarities', 'mse_cognitive_proverbs',
            'mse_insight_understanding', 'mse_insight_judgement',
            'education_start_age', 'education_highest_class', 'education_performance', 'education_disciplinary',
            'education_peer_relationship', 'education_hobbies', 'education_special_abilities', 'education_discontinue_reason',
            'occupation_jobs', 'sexual_menarche_age', 'sexual_menarche_reaction', 'sexual_education', 'sexual_masturbation',
            'sexual_contact', 'sexual_premarital_extramarital', 'sexual_marriage_arranged', 'sexual_marriage_date',
            'sexual_spouse_age', 'sexual_spouse_occupation', 'sexual_adjustment_general', 'sexual_adjustment_sexual',
            'sexual_children', 'sexual_problems', 'religion_type', 'religion_participation', 'religion_changes',
            'living_residents', 'living_income_sharing', 'living_expenses', 'living_kitchen', 'living_domestic_conflicts',
            'living_social_class', 'living_inlaws', 'home_situation_childhood', 'home_situation_parents_relationship',
            'home_situation_socioeconomic', 'home_situation_interpersonal', 'personal_birth_date', 'personal_birth_place',
            'personal_delivery_type', 'personal_complications_prenatal', 'personal_complications_natal', 'personal_complications_postnatal',
            'development_weaning_age', 'development_first_words', 'development_three_words', 'development_walking',
            'development_neurotic_traits', 'development_nail_biting', 'development_bedwetting', 'development_phobias',
            'development_childhood_illness', 'provisional_diagnosis', 'treatment_plan', 'consultant_comments'
          ];
          
          const adlUpdateData = {};
          complexCaseFields.forEach(field => {
            if (stepData[field] !== undefined && stepData[field] !== null) {
              adlUpdateData[field] = stepData[field];
            }
          });
          
          if (Object.keys(adlUpdateData).length > 0) {
            await updateADLFile({ id: adlFileId, ...adlUpdateData }).unwrap();
          }
        } catch (adlError) {
          console.error('[CreateClinicalProforma] Failed to update ADL file directly:', adlError);
          // Continue with clinical_proforma update even if ADL update fails
        }
      }
      
      if (savedProformaId) {
        // Update existing proforma
        const result = await updateProforma({ id: savedProformaId, ...stepData }).unwrap();
        toast.success(`${getStepLabel(step)} saved successfully!`);
        
        // Handle ADL file update response
        const proforma = result.data?.clinical_proforma || result.data?.proforma || result.data?.clinical;
        const adlFile = result.data?.adl_file || result.data?.adl;
        
        if (step === 3 && adlFile) {
          toast.info(`ADL File ${adlFile.adl_no || 'updated'} - Data saved to adl_files table`);
        }
        
        // ✅ If Step 2 is saved and complex_case with ADL file, auto-open Step 3 and prefill
        if (step === 2 && adlFile && proforma?.doctor_decision === 'complex_case') {
          // Set ADL file ID for fetching later if needed
          if (adlFile.id) {
            setAdlFileId(adlFile.id);
          }
          
          // Prefill ADL form fields with adl_file data
          if (adlFile) {
            Object.keys(adlFile).forEach(key => {
              if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' && 
                  key !== 'patient_id' && key !== 'adl_no' && key !== 'created_by' &&
                  key !== 'clinical_proforma_id' && key !== 'file_status' && 
                  key !== 'file_created_date' && key !== 'total_visits' && key !== 'is_active') {
                // Only set if formData doesn't already have a value (don't overwrite user input)
                if (formData[key] === undefined || formData[key] === null || formData[key] === '') {
                  setFormData(prev => ({ ...prev, [key]: adlFile[key] }));
                }
              }
            });
          }
          
          // Auto-open Step 3
          setTimeout(() => {
            setCurrentStep(3);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.info('ADL form opened automatically. Please complete the additional details.');
          }, 500);
        } else if (step === 2 && proforma?.adl_file_id) {
          // If editing existing proforma with ADL file, set ID for fetching
          setAdlFileId(proforma.adl_file_id);
        }
        
        return proforma;
      } else {
        // Create new proforma (for step 1)
        const result = await createProforma(stepData).unwrap();
        const proforma = result.data?.clinical_proforma || result.data?.proforma || result.data?.clinical;
        setSavedProformaId(proforma?.id);
        toast.success(`${getStepLabel(step)} saved successfully!`);
        
        // ✅ Handle ADL file creation response - auto-open Step 3 and prefill
        const adlFile = result.data?.adl_file || result.data?.adl;
        if (adlFile && step === 2 && proforma?.doctor_decision === 'complex_case') {
          // Set ADL file ID for fetching later if needed
          if (adlFile.id) {
            setAdlFileId(adlFile.id);
          }
          
          // Prefill ADL form fields with adl_file data
          Object.keys(adlFile).forEach(key => {
            if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' && 
                key !== 'patient_id' && key !== 'adl_no' && key !== 'created_by' &&
                key !== 'clinical_proforma_id' && key !== 'file_status' && 
                key !== 'file_created_date' && key !== 'total_visits' && key !== 'is_active') {
              // Only set if formData doesn't already have a value
              if (formData[key] === undefined || formData[key] === null || formData[key] === '') {
                setFormData(prev => ({ ...prev, [key]: adlFile[key] }));
              }
            }
          });
          
          // Auto-open Step 3
          setTimeout(() => {
            setCurrentStep(3);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.info(`ADL File created: ${adlFile.adl_no || 'ADL-XXXXXX'}. Please complete the additional details.`);
          }, 500);
        } else if (adlFile && (step === 2 || step === 3)) {
          // Set ADL file ID for future fetches
          if (adlFile.id) {
            setAdlFileId(adlFile.id);
          }
          toast.info(`ADL File created: ${adlFile.adl_no || 'ADL-XXXXXX'} - Data saved to adl_files table`);
        }
        return proforma;
      }
    } catch (err) {
      toast.error(err?.data?.message || `Failed to save ${getStepLabel(step)}`);
      throw err;
    }
  };

  // Navigation functions
  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    try {
      // Save current step data before moving to next
      await saveCurrentStep(currentStep);
      
      let nextStep = currentStep + 1;
      
      // Skip step 3 if it's not needed (simple case)
      if (nextStep === 3 && !showADLStep) {
        // For simple cases, we're done after Step 2 - submit the form
        // Create a synthetic event for form submission
        const syntheticEvent = { preventDefault: () => {} };
        handleSubmit(syntheticEvent);
        return;
      }
      
      if (nextStep <= totalSteps) {
        setCurrentStep(nextStep);
        // Scroll to top on step change
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      // Error already handled in saveCurrentStep, don't proceed to next step
      console.error('Failed to save step:', error);
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
      
      // Format prescriptions: filter out empty rows and create formatted text
      const validPrescriptions = prescriptions.filter(p => 
        p.medicine || p.dosage || p.frequency || p.details || p.when || p.duration || p.qty || p.notes
      );
      
      // Create prescription text from valid prescriptions
      const prescriptionText = validPrescriptions.length > 0
        ? validPrescriptions
            .map((p, idx) => 
              `${idx + 1}. ${p.medicine || ''} | ${p.dosage || ''} | ${p.when || ''} | ${p.frequency || ''} | ${p.duration || ''} | ${p.qty || ''} | ${p.details || ''} | ${p.notes || ''}`
            )
            .join('\n')
        : (formData.treatment_prescribed || '');

      // Prepare final data with all fields including prescription
      const finalData = prepareFormData(3); // Get all data from step 3 (most complete)
      const submitData = {
        ...finalData,
        treatment_prescribed: prescriptionText,
        prescriptions: validPrescriptions, // Include structured prescription data
      };

      // If proforma already exists (from previous steps), update it
      if (savedProformaId) {
      await updateProforma({ id: savedProformaId, ...submitData }).unwrap();
        
        // Clear saved prescription from localStorage after successful submission
        try {
          const storedPrescriptions = JSON.parse(localStorage.getItem('patient_prescriptions') || '{}');
          if (storedPrescriptions[formData.patient_id]) {
            delete storedPrescriptions[formData.patient_id];
            localStorage.setItem('patient_prescriptions', JSON.stringify(storedPrescriptions));
          }
        } catch (e) {
          // Ignore localStorage errors
        }
        
        toast.success(editMode ? 'Clinical proforma updated successfully!' : 'Clinical proforma completed successfully!');
        
        // Navigate to proforma details, or back to Today Patients if returnTab exists
        if (returnTab) {
          navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
        } else {
          navigate(`/clinical/${savedProformaId}${editMode && returnTab ? '?returnTab=' + returnTab : ''}`);
        }
      } else {
        // This shouldn't happen if step-wise saving works, but handle it as fallback
        const result = await createProforma(submitData).unwrap();
        
        // Clear saved prescription from localStorage after successful submission
        try {
          const storedPrescriptions = JSON.parse(localStorage.getItem('patient_prescriptions') || '{}');
          if (storedPrescriptions[formData.patient_id]) {
            delete storedPrescriptions[formData.patient_id];
            localStorage.setItem('patient_prescriptions', JSON.stringify(storedPrescriptions));
          }
        } catch (e) {
          // Ignore localStorage errors
        }
        
        toast.success('Clinical proforma created successfully!');
        
        // Handle ADL file creation in final submit
        const proforma = result.data?.proforma || result.data?.clinical;
        const adlFile = result.data?.adl_file || result.data?.adl;
        if (adlFile && (adlFile.adl_no || adlFile.created)) {
          toast.info(`ADL File created: ${adlFile.adl_no || 'ADL-XXXXXX'}`);
        }
        
        // Navigate to proforma details, or back to Today Patients if returnTab exists
        if (returnTab) {
          navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
        } else {
          navigate(`/clinical/${proforma?.id || savedProformaId}`);
        }
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save clinical proforma');
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
                  {editMode ? 'Edit Clinical Proforma' : 'Clinical Proforma'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {editMode ? 'Update existing clinical proforma' : 'Walk-in Clinical Proforma'}
                </p>
              </div>
            </div>
          </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step Indicator */}
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="px-4 py-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3].filter(step => step !== 3 || showADLStep).map((step, index, arr) => {
                const isActive = currentStep === step;
                const isCompleted = currentStep > step;
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

              <Select
                label="Assign Doctor by MWO"
                name="assigned_doctor"
                value={formData.assigned_doctor}
                onChange={handleChange}
                options={(doctorsData?.data?.users || []).map(doctor => ({
                  value: String(doctor.id),
                  label: `${doctor.name} (${isJR(doctor.role) ? 'JR' : isSR(doctor.role) ? 'SR' : doctor.role})`
                }))}
                placeholder="Select doctor (optional)"
                error={errors.assigned_doctor}
                disabled
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
                disabled={isCreating || isUpdating}
                className="flex items-center gap-2"
              >
                {isCreating || isUpdating ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    Next Step
                    <FiArrowRight className="w-4 h-4" />
                  </>
                )}
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
            <div className="flex gap-3">
              {showADLStep ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  Next Step
                  <FiArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <>
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
                    loading={isCreating || isUpdating}
                    disabled={isCreating || isUpdating}
                    className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700"
                  >
                    <FiSave className="w-4 h-4" />
                    {isCreating || isUpdating ? 'Saving...' : (editMode ? 'Update Clinical Proforma' : 'Create Clinical Proforma')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
            </div>
          </React.Fragment>
        )}

        {/* Step 3: Additional Detail (ADL) - Only shown for complex cases */}
        {currentStep === 3 && showADLStep && (
          <React.Fragment>
            <div className="space-y-6">
            
            {/* Multiple Informants */}
            <Card title="Informants" className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                {formData.informants.map((informant, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-700">Informant {index + 1}</h4>
                      {formData.informants.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newInformants = formData.informants.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, informants: newInformants }));
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiX className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Relationship"
                        value={informant.relationship}
                        onChange={(e) => {
                          const newInformants = [...formData.informants];
                          newInformants[index].relationship = e.target.value;
                          setFormData(prev => ({ ...prev, informants: newInformants }));
                        }}
                        placeholder="e.g., Father, Mother, Spouse"
                      />
                      <Input
                        label="Name"
                        value={informant.name}
                        onChange={(e) => {
                          const newInformants = [...formData.informants];
                          newInformants[index].name = e.target.value;
                          setFormData(prev => ({ ...prev, informants: newInformants }));
                        }}
                        placeholder="Full name"
                      />
                      <Input
                        label="Reliability / Ability to report, familiarity with patient"
                        value={informant.reliability}
                        onChange={(e) => {
                          const newInformants = [...formData.informants];
                          newInformants[index].reliability = e.target.value;
                          setFormData(prev => ({ ...prev, informants: newInformants }));
                        }}
                        placeholder="Assessment of reliability"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      informants: [...prev.informants, { relationship: '', name: '', reliability: '' }]
                    }));
                  }}
                  className="flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Informant
                </Button>
                </div>
            </Card>

            {/* Complaints and Duration */}
            <Card title="Complaints and Duration" className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Chief Complaints as per patient</h4>
                  {formData.complaints_patient.map((complaint, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                      <div className="md:col-span-2">
                        <Input
                          label={`Complaint ${index + 1}`}
                          value={complaint.complaint}
                          onChange={(e) => {
                            const newComplaints = [...formData.complaints_patient];
                            newComplaints[index].complaint = e.target.value;
                            setFormData(prev => ({ ...prev, complaints_patient: newComplaints }));
                          }}
                          placeholder="Enter complaint"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          label="Duration"
                          value={complaint.duration}
                          onChange={(e) => {
                            const newComplaints = [...formData.complaints_patient];
                            newComplaints[index].duration = e.target.value;
                            setFormData(prev => ({ ...prev, complaints_patient: newComplaints }));
                          }}
                          placeholder="e.g., 6 months"
                        />
                      </div>
                      <div className="flex items-end">
                        {formData.complaints_patient.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newComplaints = formData.complaints_patient.filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, complaints_patient: newComplaints }));
                            }}
                            className="text-red-600"
                          >
                            <FiX />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        complaints_patient: [...prev.complaints_patient, { complaint: '', duration: '' }]
                      }));
                    }}
                    className="flex items-center gap-2 mb-6"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Complaint
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Chief Complaints as per informant</h4>
                  {formData.complaints_informant.map((complaint, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                      <div className="md:col-span-2">
                        <Input
                          label={`Complaint ${index + 1}`}
                          value={complaint.complaint}
                          onChange={(e) => {
                            const newComplaints = [...formData.complaints_informant];
                            newComplaints[index].complaint = e.target.value;
                            setFormData(prev => ({ ...prev, complaints_informant: newComplaints }));
                          }}
                          placeholder="Enter complaint"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          label="Duration"
                          value={complaint.duration}
                          onChange={(e) => {
                            const newComplaints = [...formData.complaints_informant];
                            newComplaints[index].duration = e.target.value;
                            setFormData(prev => ({ ...prev, complaints_informant: newComplaints }));
                          }}
                          placeholder="e.g., 6 months"
                        />
                      </div>
                      <div className="flex items-end">
                        {formData.complaints_informant.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newComplaints = formData.complaints_informant.filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, complaints_informant: newComplaints }));
                            }}
                            className="text-red-600"
                          >
                            <FiX />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        complaints_informant: [...prev.complaints_informant, { complaint: '', duration: '' }]
                      }));
                    }}
                    className="flex items-center gap-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Complaint
                  </Button>
                </div>
              </div>
            </Card>

            {/* History of Present Illness - Expanded */}
            <Card title="History of Present Illness" className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Should Include:</h3>
                  <div className="space-y-4">
                    <Textarea
                      label="A. Spontaneous narrative account"
                      name="history_narrative"
                      value={formData.history_narrative}
                      onChange={handleChange}
                      placeholder="Patient's spontaneous account of the illness..."
                      rows={4}
                    />
                    
                    <Textarea
                      label="B. Specific enquiry about mood, sleep, appetite, anxiety symptoms, suicidal risk, social interaction, job efficiency, personal hygiene, memory, etc. Enquiry from informants regarding delusions, hallucinations in psychotic patients"
                      name="history_specific_enquiry"
                      value={formData.history_specific_enquiry}
                      onChange={handleChange}
                      placeholder="Detailed specific enquiries..."
                      rows={5}
                    />
                    
                    <Textarea
                      label="C. Intake of dependence producing and prescription drugs"
                      name="history_drug_intake"
                      value={formData.history_drug_intake}
                      onChange={handleChange}
                      placeholder="List all dependence producing substances and prescription drugs..."
                      rows={3}
                    />
                    
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-800 mb-3">D. Treatment received so far in this illness</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Place"
                          name="history_treatment_place"
                          value={formData.history_treatment_place}
                          onChange={handleChange}
                          placeholder="Location of treatment"
                        />
                        <Input
                          label="Dates"
                          name="history_treatment_dates"
                          value={formData.history_treatment_dates}
                          onChange={handleChange}
                          placeholder="Treatment dates"
                        />
                        <Textarea
                          label="Drugs"
                          name="history_treatment_drugs"
                          value={formData.history_treatment_drugs}
                          onChange={handleChange}
                          placeholder="Medications administered"
                          rows={2}
                          className="md:col-span-2"
                        />
                        <Textarea
                          label="Response"
                          name="history_treatment_response"
                          value={formData.history_treatment_response}
                          onChange={handleChange}
                          placeholder="Patient's response to treatment"
                          rows={2}
                          className="md:col-span-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Past History - Detailed */}
            <Card title="Past History" className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">A. Medical</h4>
            <Textarea
                    label="Including injuries and operations"
                    name="past_history_medical"
                    value={formData.past_history_medical}
              onChange={handleChange}
                    placeholder="Past medical history, injuries, operations..."
                    rows={3}
                  />
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">B. Psychiatric</h4>
                  <div className="space-y-4">
                    <Input
                      label="Dates"
                      name="past_history_psychiatric_dates"
                      value={formData.past_history_psychiatric_dates}
                      onChange={handleChange}
                      placeholder="Dates of previous psychiatric illness/treatment"
                    />
                    <Textarea
                      label="Diagnosis or salient features"
                      name="past_history_psychiatric_diagnosis"
                      value={formData.past_history_psychiatric_diagnosis}
                      onChange={handleChange}
                      placeholder="Previous psychiatric diagnoses or key features"
              rows={2}
            />
                    <Textarea
                      label="Treatment"
                      name="past_history_psychiatric_treatment"
                      value={formData.past_history_psychiatric_treatment}
                      onChange={handleChange}
                      placeholder="Treatment received"
                      rows={2}
                    />
                    <Textarea
                      label="Interim history of previous psychiatric illness"
                      name="past_history_psychiatric_interim"
                      value={formData.past_history_psychiatric_interim}
                      onChange={handleChange}
                      placeholder="History between episodes"
                      rows={2}
                    />
                    <Textarea
                      label="Specific enquiry into completeness of recovery and socialization/personal care in the interim period"
                      name="past_history_psychiatric_recovery"
                      value={formData.past_history_psychiatric_recovery}
                      onChange={handleChange}
                      placeholder="Recovery assessment, socialization, personal care during interim"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Family History - Detailed */}
            <Card title="Family History" className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Father</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
                      label="Age"
                      value={formData.family_history_father_age}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_age: e.target.value }))}
                      placeholder="Age"
                    />
                    <Input
                      label="Education"
                      value={formData.family_history_father_education}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_education: e.target.value }))}
                      placeholder="Education level"
                    />
                    <Input
                      label="Occupation"
                      value={formData.family_history_father_occupation}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_occupation: e.target.value }))}
                      placeholder="Occupation"
                    />
                    <Textarea
                      label="General personality and relationship with patient"
                      value={formData.family_history_father_personality}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_personality: e.target.value }))}
                      placeholder="Personality and relationship details"
                      rows={2}
                      className="md:col-span-2"
                    />
                    <div className="flex items-center gap-2 md:col-span-2">
                      <input
                        type="checkbox"
                        checked={formData.family_history_father_deceased}
                        onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_deceased: e.target.checked }))}
                        className="h-4 w-4 text-primary-600 rounded"
                      />
                      <label className="text-sm text-gray-700">Deceased</label>
                    </div>
                    {formData.family_history_father_deceased && (
                      <>
                        <Input
                          label="Age at death"
                          value={formData.family_history_father_death_age}
                          onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_death_age: e.target.value }))}
                          placeholder="Age"
                        />
                        <Input
                          label="Date of death"
              type="date"
                          value={formData.family_history_father_death_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_death_date: e.target.value }))}
                        />
                        <Textarea
                          label="Cause of death"
                          value={formData.family_history_father_death_cause}
                          onChange={(e) => setFormData(prev => ({ ...prev, family_history_father_death_cause: e.target.value }))}
                          placeholder="Cause of death"
                          rows={2}
                          className="md:col-span-2"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Mother</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Age"
                      value={formData.family_history_mother_age}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_age: e.target.value }))}
                      placeholder="Age"
                    />
                    <Input
                      label="Education"
                      value={formData.family_history_mother_education}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_education: e.target.value }))}
                      placeholder="Education level"
                    />
                    <Input
                      label="Occupation"
                      value={formData.family_history_mother_occupation}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_occupation: e.target.value }))}
                      placeholder="Occupation"
                    />
                    <Textarea
                      label="General personality and relationship with patient"
                      value={formData.family_history_mother_personality}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_personality: e.target.value }))}
                      placeholder="Personality and relationship details"
                      rows={2}
                      className="md:col-span-2"
                    />
                    <div className="flex items-center gap-2 md:col-span-2">
                      <input
                        type="checkbox"
                        checked={formData.family_history_mother_deceased}
                        onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_deceased: e.target.checked }))}
                        className="h-4 w-4 text-primary-600 rounded"
                      />
                      <label className="text-sm text-gray-700">Deceased</label>
                    </div>
                    {formData.family_history_mother_deceased && (
                      <>
                        <Input
                          label="Age at death"
                          value={formData.family_history_mother_death_age}
                          onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_death_age: e.target.value }))}
                          placeholder="Age"
                        />
                        <Input
                          label="Date of death"
                          type="date"
                          value={formData.family_history_mother_death_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_death_date: e.target.value }))}
                        />
                        <Textarea
                          label="Cause of death"
                          value={formData.family_history_mother_death_cause}
                          onChange={(e) => setFormData(prev => ({ ...prev, family_history_mother_death_cause: e.target.value }))}
                          placeholder="Cause of death"
                          rows={2}
                          className="md:col-span-2"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Siblings</h4>
                  {formData.family_history_siblings.map((sibling, index) => (
                    <div key={index} className="border-b pb-4 mb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-700">Sibling {index + 1}</h5>
                        {formData.family_history_siblings.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newSiblings = formData.family_history_siblings.filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                            }}
                            className="text-red-600"
                          >
                            <FiX className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <Input
                          label="Age"
                          value={sibling.age}
                          onChange={(e) => {
                            const newSiblings = [...formData.family_history_siblings];
                            newSiblings[index].age = e.target.value;
                            setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                          }}
                          placeholder="Age"
                        />
                        <Select
                          label="Sex"
                          value={sibling.sex}
                          onChange={(e) => {
                            const newSiblings = [...formData.family_history_siblings];
                            newSiblings[index].sex = e.target.value;
                            setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                          }}
                          options={[{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }, { value: '', label: 'Select' }]}
                        />
                        <Input
                          label="Education"
                          value={sibling.education}
                          onChange={(e) => {
                            const newSiblings = [...formData.family_history_siblings];
                            newSiblings[index].education = e.target.value;
                            setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                          }}
                          placeholder="Education"
                        />
                        <Input
                          label="Occupation"
                          value={sibling.occupation}
                          onChange={(e) => {
                            const newSiblings = [...formData.family_history_siblings];
                            newSiblings[index].occupation = e.target.value;
                            setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                          }}
                          placeholder="Occupation"
                        />
                        <Select
                          label="Marital Status"
                          value={sibling.marital_status}
                          onChange={(e) => {
                            const newSiblings = [...formData.family_history_siblings];
                            newSiblings[index].marital_status = e.target.value;
                            setFormData(prev => ({ ...prev, family_history_siblings: newSiblings }));
                          }}
                          options={[{ value: 'Single', label: 'Single' }, { value: 'Married', label: 'Married' }, { value: 'Divorced', label: 'Divorced' }, { value: 'Widowed', label: 'Widowed' }, { value: '', label: 'Select' }]}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        family_history_siblings: [...prev.family_history_siblings, { age: '', sex: '', education: '', occupation: '', marital_status: '' }]
                      }));
                    }}
                    className="flex items-center gap-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Sibling
                  </Button>
                </div>
              </div>
            </Card>

            {/* General Home Situation and Early Development */}
            <Card title="General Home Situation and Early Development" className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">General home situation</h4>
                  <div className="space-y-4">
                    <Textarea
                      label="Patient's childhood"
                      name="home_situation_childhood"
                      value={formData.home_situation_childhood}
                      onChange={handleChange}
                      placeholder="Childhood environment and experiences..."
                      rows={3}
                    />
                    <Textarea
                      label="Relationship between parents"
                      name="home_situation_parents_relationship"
                      value={formData.home_situation_parents_relationship}
                      onChange={handleChange}
                      placeholder="Parental relationship..."
                      rows={2}
                    />
                    <Textarea
                      label="Socio-economic status"
                      name="home_situation_socioeconomic"
                      value={formData.home_situation_socioeconomic}
                      onChange={handleChange}
                      placeholder="Socio-economic background..."
                      rows={2}
                    />
                    <Textarea
                      label="Inter-personal relationship"
                      name="home_situation_interpersonal"
                      value={formData.home_situation_interpersonal}
                      onChange={handleChange}
                      placeholder="Interpersonal dynamics in the family..."
                      rows={2}
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Personal history</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Date and place of birth"
                      name="personal_birth_date"
                      value={formData.personal_birth_date}
                      onChange={handleChange}
                      placeholder="Birth date"
                    />
                    <Input
                      name="personal_birth_place"
                      value={formData.personal_birth_place}
                      onChange={handleChange}
                      placeholder="Birth place"
                    />
                    <Select
                      label="Home or hospital delivery"
                      name="personal_delivery_type"
                      value={formData.personal_delivery_type}
                      onChange={handleChange}
                      options={[{ value: '', label: 'Select' }, { value: 'Home', label: 'Home' }, { value: 'Hospital', label: 'Hospital' }]}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <Textarea
                      label="Prenatal complications, if any"
                      name="personal_complications_prenatal"
                      value={formData.personal_complications_prenatal}
                      onChange={handleChange}
                      placeholder="Prenatal complications..."
                      rows={2}
                    />
                    <Textarea
                      label="Natal complications, if any"
                      name="personal_complications_natal"
                      value={formData.personal_complications_natal}
                      onChange={handleChange}
                      placeholder="Natal complications..."
                      rows={2}
                    />
                    <Textarea
                      label="Postnatal complications, if any"
                      name="personal_complications_postnatal"
                      value={formData.personal_complications_postnatal}
                      onChange={handleChange}
                      placeholder="Postnatal complications..."
                      rows={2}
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Early development</h4>
                  <div className="space-y-4">
                    <Input
                      label="Age at weaning"
                      name="development_weaning_age"
                      value={formData.development_weaning_age}
                      onChange={handleChange}
                      placeholder="Age"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Age at first words"
                        name="development_first_words"
                        value={formData.development_first_words}
                        onChange={handleChange}
                        placeholder="Age"
                      />
                      <Input
                        label="Age at three-word sentences"
                        name="development_three_words"
                        value={formData.development_three_words}
                        onChange={handleChange}
                        placeholder="Age"
                      />
                      <Input
                        label="Age at walking"
                        name="development_walking"
                        value={formData.development_walking}
                        onChange={handleChange}
                        placeholder="Age"
                      />
                    </div>
                    <Textarea
                      label="Neurotic traits"
                      name="development_neurotic_traits"
                      value={formData.development_neurotic_traits}
                      onChange={handleChange}
                      placeholder="Neurotic traits observed..."
                      rows={2}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Textarea
                        label="Nail-biting"
                        name="development_nail_biting"
                        value={formData.development_nail_biting}
                        onChange={handleChange}
                        placeholder="History..."
                        rows={2}
                      />
                      <Textarea
                        label="Bedwetting"
                        name="development_bedwetting"
                        value={formData.development_bedwetting}
                        onChange={handleChange}
                        placeholder="History..."
                        rows={2}
                      />
                      <Textarea
                        label="Phobias"
                        name="development_phobias"
                        value={formData.development_phobias}
                        onChange={handleChange}
                        placeholder="Phobias..."
                        rows={2}
                      />
                    </div>
                    <Textarea
                      label="Illness and injuries in childhood"
                      name="development_childhood_illness"
                      value={formData.development_childhood_illness}
                      onChange={handleChange}
                      placeholder="Childhood illnesses and injuries..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Educational History */}
            <Card title="Educational History" className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                <Input
                  label="Age at starting schooling"
                  name="education_start_age"
                  value={formData.education_start_age}
                  onChange={handleChange}
                  placeholder="Age"
                />
                <Input
                  label="Highest class completed"
                  name="education_highest_class"
                  value={formData.education_highest_class}
                  onChange={handleChange}
                  placeholder="Class/grade"
                />
                <Textarea
                  label="Performance in school (give chronologically for each important exam)"
                  name="education_performance"
                  value={formData.education_performance}
                  onChange={handleChange}
                  placeholder="Performance details..."
                  rows={4}
                />
                <Textarea
                  label="Disciplinary problems"
                  name="education_disciplinary"
                  value={formData.education_disciplinary}
                  onChange={handleChange}
                  placeholder="Any disciplinary issues..."
                  rows={2}
                />
                <Textarea
                  label="Peer relationship and group participation"
                  name="education_peer_relationship"
                  value={formData.education_peer_relationship}
                  onChange={handleChange}
                  placeholder="Relationships and participation..."
                  rows={2}
                />
                <Input
                  label="Hobbies"
                  name="education_hobbies"
                  value={formData.education_hobbies}
                  onChange={handleChange}
                  placeholder="Hobbies during school"
                />
                <Input
                  label="Special abilities"
                  name="education_special_abilities"
                  value={formData.education_special_abilities}
                  onChange={handleChange}
                  placeholder="Special talents/abilities"
                />
                <Textarea
                  label="Reasons for discontinuing"
                  name="education_discontinue_reason"
                  value={formData.education_discontinue_reason}
                  onChange={handleChange}
                  placeholder="If education was discontinued, reasons..."
                  rows={2}
                />
              </div>
            </Card>

            {/* Occupational History */}
            <Card title="Occupational History" className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 mb-3">Jobs held in chronological order</h4>
                {formData.occupation_jobs.map((job, index) => (
                  <div key={index} className="border-b pb-4 mb-4 last:border-b-0 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-700">Job {index + 1}</h5>
                      {formData.occupation_jobs.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newJobs = formData.occupation_jobs.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                          }}
                          className="text-red-600"
                        >
                          <FiX className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Job"
                        value={job.job}
                        onChange={(e) => {
                          const newJobs = [...formData.occupation_jobs];
                          newJobs[index].job = e.target.value;
                          setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                        }}
                        placeholder="Job title/description"
                      />
                      <Input
                        label="Dates"
                        value={job.dates}
                        onChange={(e) => {
                          const newJobs = [...formData.occupation_jobs];
                          newJobs[index].dates = e.target.value;
                          setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                        }}
                        placeholder="Start - End dates"
                      />
                      <Textarea
                        label="Adjustment with peers and superiors"
                        value={job.adjustment}
                        onChange={(e) => {
                          const newJobs = [...formData.occupation_jobs];
                          newJobs[index].adjustment = e.target.value;
                          setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                        }}
                        placeholder="Work relationships..."
                        rows={2}
                      />
                      <Textarea
                        label="Specific difficulties"
                        value={job.difficulties}
                        onChange={(e) => {
                          const newJobs = [...formData.occupation_jobs];
                          newJobs[index].difficulties = e.target.value;
                          setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                        }}
                        placeholder="Work-related difficulties..."
                        rows={2}
                      />
                      <Textarea
                        label="Promotions"
                        value={job.promotions}
                        onChange={(e) => {
                          const newJobs = [...formData.occupation_jobs];
                          newJobs[index].promotions = e.target.value;
                          setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                        }}
                        placeholder="Promotions received..."
                        rows={2}
                      />
                      <Textarea
                        label="Reasons for change of jobs"
                        value={job.change_reason}
                        onChange={(e) => {
                          const newJobs = [...formData.occupation_jobs];
                          newJobs[index].change_reason = e.target.value;
                          setFormData(prev => ({ ...prev, occupation_jobs: newJobs }));
                        }}
                        placeholder="Reason for leaving..."
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      occupation_jobs: [...prev.occupation_jobs, { job: '', dates: '', adjustment: '', difficulties: '', promotions: '', change_reason: '' }]
                    }));
                  }}
                  className="flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Job
                </Button>
              </div>
            </Card>

            {/* Sexual and Marital History */}
            <Card title="Sexual and Marital History" className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                <Input
                  label="Age at menarche"
                  name="sexual_menarche_age"
                  value={formData.sexual_menarche_age}
                  onChange={handleChange}
                  placeholder="Age"
                />
                <Textarea
                  label="Reaction to it and menstrual cycles"
                  name="sexual_menarche_reaction"
                  value={formData.sexual_menarche_reaction}
                  onChange={handleChange}
                  placeholder="Reaction and menstrual history..."
                  rows={2}
                />
                <Textarea
                  label="Sex education"
                  name="sexual_education"
                  value={formData.sexual_education}
                  onChange={handleChange}
                  placeholder="Sex education received..."
                  rows={2}
                />
                <Textarea
                  label="Masturbation"
                  name="sexual_masturbation"
                  value={formData.sexual_masturbation}
                  onChange={handleChange}
                  placeholder="History..."
                  rows={2}
                />
                <Textarea
                  label="Early childhood and later sexual contact"
                  name="sexual_contact"
                  value={formData.sexual_contact}
                  onChange={handleChange}
                  placeholder="History of sexual contact..."
                  rows={2}
                />
                <Textarea
                  label="Premarital and extramarital relationship"
                  name="sexual_premarital_extramarital"
                  value={formData.sexual_premarital_extramarital}
                  onChange={handleChange}
                  placeholder="Relationship history..."
                  rows={2}
                />
                <Input
                  label="Marriage how arranged"
                  name="sexual_marriage_arranged"
                  value={formData.sexual_marriage_arranged}
                  onChange={handleChange}
                  placeholder="Arranged/Love marriage"
                />
                <Input
                  label="Date of marriage"
                  type="date"
                  name="sexual_marriage_date"
                  value={formData.sexual_marriage_date}
                  onChange={handleChange}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Age and occupation of the spouse"
                    name="sexual_spouse_age"
                    value={formData.sexual_spouse_age}
                    onChange={handleChange}
                    placeholder="Spouse age"
                  />
                  <Input
                    name="sexual_spouse_occupation"
                    value={formData.sexual_spouse_occupation}
                    onChange={handleChange}
                    placeholder="Spouse occupation"
                  />
                </div>
                <Textarea
                  label="General and sexual adjustment"
                  name="sexual_adjustment_general"
                  value={formData.sexual_adjustment_general}
                  onChange={handleChange}
                  placeholder="General adjustment..."
                  rows={2}
                />
                <Textarea
                  label="Sexual adjustment"
                  name="sexual_adjustment_sexual"
                  value={formData.sexual_adjustment_sexual}
                  onChange={handleChange}
                  placeholder="Sexual adjustment..."
                  rows={2}
                />
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Ages and sex of children</h5>
                  {formData.sexual_children.map((child, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                      <Input
                        label={`Child ${index + 1} - Age`}
                        value={child.age}
                        onChange={(e) => {
                          const newChildren = [...formData.sexual_children];
                          newChildren[index].age = e.target.value;
                          setFormData(prev => ({ ...prev, sexual_children: newChildren }));
                        }}
                        placeholder="Age"
                      />
                      <Select
                        label="Sex"
                        value={child.sex}
                        onChange={(e) => {
                          const newChildren = [...formData.sexual_children];
                          newChildren[index].sex = e.target.value;
                          setFormData(prev => ({ ...prev, sexual_children: newChildren }));
                        }}
                        options={[{ value: '', label: 'Select' }, { value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }]}
                      />
                      <div className="flex items-end">
                        {formData.sexual_children.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newChildren = formData.sexual_children.filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, sexual_children: newChildren }));
                            }}
                            className="text-red-600"
                          >
                            <FiX />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        sexual_children: [...prev.sexual_children, { age: '', sex: '' }]
                      }));
                    }}
                    className="flex items-center gap-2 mt-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Child
                  </Button>
                </div>
                <Textarea
                  label="Sexual problems"
                  name="sexual_problems"
                  value={formData.sexual_problems}
                  onChange={handleChange}
                  placeholder="Any sexual problems..."
                  rows={2}
                />
              </div>
            </Card>

            {/* Religion */}
            <Card title="Religion" className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                <Input
                  label="Religion and sex"
                  name="religion_type"
                  value={formData.religion_type}
                  onChange={handleChange}
                  placeholder="Religion"
                />
                <Input
                  label="Level of participation"
                  name="religion_participation"
                  value={formData.religion_participation}
                  onChange={handleChange}
                  placeholder="Active/Moderate/Nominal/Non-practicing"
                />
                <Textarea
                  label="Any sudden changes in religion"
                  name="religion_changes"
                  value={formData.religion_changes}
                  onChange={handleChange}
                  placeholder="Any changes in religious practices..."
                  rows={2}
                />
              </div>
            </Card>

            {/* Present Living Situation */}
            <Card title="Present Living Situation" className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">The residents, who all live with the patient</h5>
                  {formData.living_residents.map((resident, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                      <Input
                        label={`Resident ${index + 1} - Name`}
                        value={resident.name}
                        onChange={(e) => {
                          const newResidents = [...formData.living_residents];
                          newResidents[index].name = e.target.value;
                          setFormData(prev => ({ ...prev, living_residents: newResidents }));
                        }}
                        placeholder="Name"
                      />
                      <Input
                        label="Relationship"
                        value={resident.relationship}
                        onChange={(e) => {
                          const newResidents = [...formData.living_residents];
                          newResidents[index].relationship = e.target.value;
                          setFormData(prev => ({ ...prev, living_residents: newResidents }));
                        }}
                        placeholder="Relationship"
                      />
                      <Input
                        label="Age"
                        value={resident.age}
                        onChange={(e) => {
                          const newResidents = [...formData.living_residents];
                          newResidents[index].age = e.target.value;
                          setFormData(prev => ({ ...prev, living_residents: newResidents }));
                        }}
                        placeholder="Age"
                      />
                      <div className="flex items-end">
                        {formData.living_residents.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newResidents = formData.living_residents.filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, living_residents: newResidents }));
                            }}
                            className="text-red-600"
                          >
                            <FiX />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        living_residents: [...prev.living_residents, { name: '', relationship: '', age: '' }]
                      }));
                    }}
                    className="flex items-center gap-2 mt-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Resident
                  </Button>
                </div>
                <Textarea
                  label="Sharing of income"
                  name="living_income_sharing"
                  value={formData.living_income_sharing}
                  onChange={handleChange}
                  placeholder="How income is shared..."
                  rows={2}
                />
                <Textarea
                  label="Expenses"
                  name="living_expenses"
                  value={formData.living_expenses}
                  onChange={handleChange}
                  placeholder="Expense management..."
                  rows={2}
                />
                <Textarea
                  label="Kitchen"
                  name="living_kitchen"
                  value={formData.living_kitchen}
                  onChange={handleChange}
                  placeholder="Kitchen arrangements (shared/separate)..."
                  rows={2}
                />
                <Textarea
                  label="Domestic conflicts"
                  name="living_domestic_conflicts"
                  value={formData.living_domestic_conflicts}
                  onChange={handleChange}
                  placeholder="Any domestic conflicts..."
                  rows={2}
                />
                <Input
                  label="Overall social class"
                  name="living_social_class"
                  value={formData.living_social_class}
                  onChange={handleChange}
                  placeholder="Upper/Middle/Lower"
                />
                <div className="border-t pt-4">
                  <h5 className="font-medium text-gray-700 mb-2">In case of married women: details of the members in the in-law family</h5>
                  {formData.living_inlaws.map((inlaw, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                      <Input
                        label={`In-law ${index + 1} - Name`}
                        value={inlaw.name}
                        onChange={(e) => {
                          const newInlaws = [...formData.living_inlaws];
                          newInlaws[index].name = e.target.value;
                          setFormData(prev => ({ ...prev, living_inlaws: newInlaws }));
                        }}
                        placeholder="Name"
                      />
                      <Input
                        label="Relationship"
                        value={inlaw.relationship}
                        onChange={(e) => {
                          const newInlaws = [...formData.living_inlaws];
                          newInlaws[index].relationship = e.target.value;
                          setFormData(prev => ({ ...prev, living_inlaws: newInlaws }));
                        }}
                        placeholder="Relationship"
                      />
                      <Input
                        label="Age"
                        value={inlaw.age}
                        onChange={(e) => {
                          const newInlaws = [...formData.living_inlaws];
                          newInlaws[index].age = e.target.value;
                          setFormData(prev => ({ ...prev, living_inlaws: newInlaws }));
                        }}
                        placeholder="Age"
                      />
                      <div className="flex items-end">
                        {formData.living_inlaws.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newInlaws = formData.living_inlaws.filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, living_inlaws: newInlaws }));
                            }}
                            className="text-red-600"
                          >
                            <FiX />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        living_inlaws: [...prev.living_inlaws, { name: '', relationship: '', age: '' }]
                      }));
                    }}
                    className="flex items-center gap-2 mt-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add In-law Member
                  </Button>
                </div>
              </div>
            </Card>

            {/* Premorbid Personality */}
            <Card title="Premorbid Personality" className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">A. Personality traits, habits and hobbies</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select
                        label="Passive vs Active"
                        name="premorbid_personality_passive_active"
                        value={formData.premorbid_personality_passive_active}
                        onChange={handleChange}
                        options={[{ value: '', label: 'Select' }, { value: 'Passive', label: 'Passive' }, { value: 'Active', label: 'Active' }]}
                      />
                      <Input
                        label="Assertive"
                        name="premorbid_personality_assertive"
                        value={formData.premorbid_personality_assertive}
                        onChange={handleChange}
                        placeholder="Assertiveness level"
                      />
                      <Select
                        label="Introvert vs Extrovert"
                        name="premorbid_personality_introvert_extrovert"
                        value={formData.premorbid_personality_introvert_extrovert}
                        onChange={handleChange}
                        options={[{ value: '', label: 'Select' }, { value: 'Introvert', label: 'Introvert' }, { value: 'Extrovert', label: 'Extrovert' }]}
                      />
                    </div>
                    <CheckboxGroup
                      label="If sociable, anxious and worrisome, complacent, suspicious"
                      name="premorbid_personality_traits"
                      value={formData.premorbid_personality_traits}
                      onChange={handleChange}
                      options={['Sociable', 'Anxious', 'Worrisome', 'Complacent', 'Suspicious']}
                    />
            <Textarea
                      label="Hobbies and interests"
                      name="premorbid_personality_hobbies"
                      value={formData.premorbid_personality_hobbies}
              onChange={handleChange}
                      placeholder="Hobbies and interests..."
              rows={2}
            />
                    <Textarea
                      label="Eating, sleep and excretory habits, anything remarkable?"
                      name="premorbid_personality_habits"
                      value={formData.premorbid_personality_habits}
                      onChange={handleChange}
                      placeholder="Habits details..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">B. Alcohol and drug abuse</h4>
                  <Textarea
                    name="premorbid_personality_alcohol_drugs"
                    value={formData.premorbid_personality_alcohol_drugs}
                    onChange={handleChange}
                    placeholder="History of alcohol and drug abuse..."
                    rows={3}
                  />
                </div>
          </div>
        </Card>

            {/* Physical Examination - Comprehensive */}
            <Card title="Physical Examination" className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">General</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Appearance"
                      name="physical_appearance"
                      value={formData.physical_appearance}
                      onChange={handleChange}
                      placeholder="General appearance"
                    />
                    <Input
                      label="Body build and nutrition"
                      name="physical_body_build"
                      value={formData.physical_body_build}
                      onChange={handleChange}
                      placeholder="Body build and nutrition status"
                    />
                    <div className="flex flex-wrap gap-4 md:col-span-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.physical_pallor}
                          onChange={(e) => setFormData(prev => ({ ...prev, physical_pallor: e.target.checked }))}
                          className="h-4 w-4 text-primary-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Pallor</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.physical_icterus}
                          onChange={(e) => setFormData(prev => ({ ...prev, physical_icterus: e.target.checked }))}
                          className="h-4 w-4 text-primary-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Icterus</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.physical_oedema}
                          onChange={(e) => setFormData(prev => ({ ...prev, physical_oedema: e.target.checked }))}
                          className="h-4 w-4 text-primary-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Oedema</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.physical_lymphadenopathy}
                          onChange={(e) => setFormData(prev => ({ ...prev, physical_lymphadenopathy: e.target.checked }))}
                          className="h-4 w-4 text-primary-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Lymphadenopathy</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Pulse"
                      name="physical_pulse"
                      value={formData.physical_pulse}
                      onChange={handleChange}
                      placeholder="e.g., 72 bpm"
                    />
                    <Input
                      label="B.P."
                      name="physical_bp"
                      value={formData.physical_bp}
                      onChange={handleChange}
                      placeholder="e.g., 120/80"
                    />
                    <Input
                      label="Height"
                      name="physical_height"
                      value={formData.physical_height}
                      onChange={handleChange}
                      placeholder="cm"
                    />
                    <Input
                      label="Weight"
                      name="physical_weight"
                      value={formData.physical_weight}
                      onChange={handleChange}
                      placeholder="kg"
                    />
                    <Input
                      label="Waist circumference"
                      name="physical_waist"
                      value={formData.physical_waist}
                      onChange={handleChange}
                      placeholder="cm"
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <Textarea
                    label="Fundus"
                    name="physical_fundus"
                    value={formData.physical_fundus}
                    onChange={handleChange}
                    placeholder="Fundus examination findings..."
                    rows={2}
                  />
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">CVS (Cardiovascular System)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Apex beat"
                      name="physical_cvs_apex"
                      value={formData.physical_cvs_apex}
                      onChange={handleChange}
                      placeholder="Apex beat location"
                    />
                    <Input
                      label="Regularity"
                      name="physical_cvs_regularity"
                      value={formData.physical_cvs_regularity}
                      onChange={handleChange}
                      placeholder="Regular/Irregular"
                    />
                    <Input
                      label="Heart sounds"
                      name="physical_cvs_heart_sounds"
                      value={formData.physical_cvs_heart_sounds}
                      onChange={handleChange}
                      placeholder="Heart sounds assessment"
                    />
                    <Input
                      label="Murmurs"
                      name="physical_cvs_murmurs"
                      value={formData.physical_cvs_murmurs}
                      onChange={handleChange}
                      placeholder="Murmurs (if present)"
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Chest</h4>
                  <div className="space-y-4">
                    <Input
                      label="Expansion on the two sides"
                      name="physical_chest_expansion"
                      value={formData.physical_chest_expansion}
                      onChange={handleChange}
                      placeholder="Chest expansion assessment"
                    />
                    <Input
                      label="Percussion"
                      name="physical_chest_percussion"
                      value={formData.physical_chest_percussion}
                      onChange={handleChange}
                      placeholder="Percussion findings"
                    />
                    <Input
                      label="Adventitious sounds"
                      name="physical_chest_adventitious"
                      value={formData.physical_chest_adventitious}
                      onChange={handleChange}
                      placeholder="Adventitious sounds (if present)"
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Abdomen</h4>
                  <div className="space-y-4">
                    <Input
                      label="Tenderness"
                      name="physical_abdomen_tenderness"
                      value={formData.physical_abdomen_tenderness}
                      onChange={handleChange}
                      placeholder="Tenderness location/assessment"
                    />
                    <Input
                      label="Mass"
                      name="physical_abdomen_mass"
                      value={formData.physical_abdomen_mass}
                      onChange={handleChange}
                      placeholder="Palpable mass (if present)"
                    />
                    <Input
                      label="Bowel sounds"
                      name="physical_abdomen_bowel_sounds"
                      value={formData.physical_abdomen_bowel_sounds}
                      onChange={handleChange}
                      placeholder="Normal/Hypoactive/Hyperactive"
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">CNS (Central Nervous System)</h4>
                  <div className="space-y-4">
                    <Textarea
                      label="Cranial nerves"
                      name="physical_cns_cranial"
                      value={formData.physical_cns_cranial}
                      onChange={handleChange}
                      placeholder="Cranial nerves examination..."
                      rows={2}
                    />
                    <Textarea
                      label="Motor and sensory system"
                      name="physical_cns_motor_sensory"
                      value={formData.physical_cns_motor_sensory}
                      onChange={handleChange}
                      placeholder="Motor and sensory examination..."
                      rows={2}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Rigidity"
                        name="physical_cns_rigidity"
                        value={formData.physical_cns_rigidity}
                        onChange={handleChange}
                        placeholder="Rigidity assessment"
                      />
                      <Input
                        label="Involuntary movements"
                        name="physical_cns_involuntary"
                        value={formData.physical_cns_involuntary}
                        onChange={handleChange}
                        placeholder="Involuntary movements (if present)"
                      />
                    </div>
                    <Textarea
                      label="Superficial reflexes"
                      name="physical_cns_superficial_reflexes"
                      value={formData.physical_cns_superficial_reflexes}
                      onChange={handleChange}
                      placeholder="Superficial reflexes findings..."
                      rows={2}
                    />
                    <Textarea
                      label="DTRs (Deep Tendon Reflexes)"
                      name="physical_cns_dtrs"
                      value={formData.physical_cns_dtrs}
                      onChange={handleChange}
                      placeholder="Deep tendon reflexes..."
                      rows={2}
                    />
                    <Input
                      label="Plantar"
                      name="physical_cns_plantar"
                      value={formData.physical_cns_plantar}
                      onChange={handleChange}
                      placeholder="Flexor/Extensor"
                    />
                    <Textarea
                      label="Cerebellar Functions"
                      name="physical_cns_cerebellar"
                      value={formData.physical_cns_cerebellar}
                      onChange={handleChange}
                      placeholder="Cerebellar functions assessment..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Mental Status Examination - Expanded */}
            <Card title="Mental Status Examination (Expanded)" className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">1. General Appearance, attitude and behaviour</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Textarea
                      label="General demeanour"
                      name="mse_general_demeanour"
                      value={formData.mse_general_demeanour}
                      onChange={handleChange}
                      placeholder="General demeanour..."
                      rows={2}
                    />
                    <Input
                      label="Tidy/Well-kempt"
                      name="mse_general_tidy"
                      value={formData.mse_general_tidy}
                      onChange={handleChange}
                      placeholder="Assessment"
                    />
                    <Input
                      label="Awareness of surroundings"
                      name="mse_general_awareness"
                      value={formData.mse_general_awareness}
                      onChange={handleChange}
                      placeholder="Level of awareness"
                    />
                    <Input
                      label="Co-operation in the examination"
                      name="mse_general_cooperation"
                      value={formData.mse_general_cooperation}
                      onChange={handleChange}
                      placeholder="Co-operation level"
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">2. Psychomotor Activity</h4>
                  <div className="space-y-4">
                    <Input
                      label="Speed and amount of verbalization"
                      name="mse_psychomotor_verbalization"
                      value={formData.mse_psychomotor_verbalization}
                      onChange={handleChange}
                      placeholder="Assessment"
                    />
                    <Input
                      label="Pressure of thought and flight of ideas"
                      name="mse_psychomotor_pressure"
                      value={formData.mse_psychomotor_pressure}
                      onChange={handleChange}
                      placeholder="Assessment"
                    />
                    <Input
                      label="Motoric tension"
                      name="mse_psychomotor_tension"
                      value={formData.mse_psychomotor_tension}
                      onChange={handleChange}
                      placeholder="Assessment"
                    />
                    <Input
                      label="Posture and movement"
                      name="mse_psychomotor_posture"
                      value={formData.mse_psychomotor_posture}
                      onChange={handleChange}
                      placeholder="Assessment"
                    />
                    <Input
                      label="Mannerism, Grimacing, Posturing, Catatonic features"
                      name="mse_psychomotor_catatonic"
                      value={formData.mse_psychomotor_catatonic}
                      onChange={handleChange}
                      placeholder="Assessment"
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">3. Affect</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Subjective feeling"
                      name="mse_affect_subjective"
                      value={formData.mse_affect_subjective}
                      onChange={handleChange}
                      placeholder="Patient's subjective feeling"
                    />
                    <Input
                      label="Tone"
                      name="mse_affect_tone"
                      value={formData.mse_affect_tone}
                      onChange={handleChange}
                      placeholder="Affective tone"
                    />
                    <Textarea
                      label="Objective assessment of resting affect, and its fluctuation in the context of topics being discussed"
                      name="mse_affect_resting"
                      value={formData.mse_affect_resting}
                      onChange={handleChange}
                      placeholder="Assessment (Flat, Anxious, Depressed, Elated, Inappropriate and labile affect)"
                      rows={3}
                      className="md:col-span-2"
                    />
                    <Input
                      label="Fluctuation"
                      name="mse_affect_fluctuation"
                      value={formData.mse_affect_fluctuation}
                      onChange={handleChange}
                      placeholder="Affect fluctuation assessment"
                      className="md:col-span-2"
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">4. Thought</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Flow"
                      name="mse_thought_flow"
                      value={formData.mse_thought_flow}
                      onChange={handleChange}
                      placeholder="Thought flow"
                    />
                    <Input
                      label="Form"
                      name="mse_thought_form"
                      value={formData.mse_thought_form}
                      onChange={handleChange}
                      placeholder="Thought form"
                    />
                    <Input
                      label="Content"
                      name="mse_thought_content"
                      value={formData.mse_thought_content}
                      onChange={handleChange}
                      placeholder="Thought content"
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">5. Perception</h4>
                  <p className="text-sm text-gray-600 mb-3">(Covered in main MSE section above)</p>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">6. Cognitive functions</h4>
                  <div className="space-y-4">
                    <Input
                      label="Level of consciousness"
                      name="mse_cognitive_consciousness"
                      value={formData.mse_cognitive_consciousness}
                      onChange={handleChange}
                      placeholder="Assessment"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Orientation - Time"
                        name="mse_cognitive_orientation_time"
                        value={formData.mse_cognitive_orientation_time}
                        onChange={handleChange}
                        placeholder="Time orientation"
                      />
                      <Input
                        label="Orientation - Place"
                        name="mse_cognitive_orientation_place"
                        value={formData.mse_cognitive_orientation_place}
                        onChange={handleChange}
                        placeholder="Place orientation"
                      />
                      <Input
                        label="Orientation - Person"
                        name="mse_cognitive_orientation_person"
                        value={formData.mse_cognitive_orientation_person}
                        onChange={handleChange}
                        placeholder="Person orientation"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Memory - Immediate"
                        name="mse_cognitive_memory_immediate"
                        value={formData.mse_cognitive_memory_immediate}
                        onChange={handleChange}
                        placeholder="Immediate memory"
                      />
                      <Input
                        label="Memory - Recent"
                        name="mse_cognitive_memory_recent"
                        value={formData.mse_cognitive_memory_recent}
                        onChange={handleChange}
                        placeholder="Recent memory"
                      />
                      <Input
                        label="Memory - Remote"
                        name="mse_cognitive_memory_remote"
                        value={formData.mse_cognitive_memory_remote}
                        onChange={handleChange}
                        placeholder="Remote memory"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Subtraction"
                        name="mse_cognitive_subtraction"
                        value={formData.mse_cognitive_subtraction}
                        onChange={handleChange}
                        placeholder="Assessment"
                      />
                      <Input
                        label="Digit-span"
                        name="mse_cognitive_digit_span"
                        value={formData.mse_cognitive_digit_span}
                        onChange={handleChange}
                        placeholder="Assessment"
                      />
                      <Input
                        label="Counting forwards and backwards"
                        name="mse_cognitive_counting"
                        value={formData.mse_cognitive_counting}
                        onChange={handleChange}
                        placeholder="Assessment"
                      />
                      <Input
                        label="General Knowledge"
                        name="mse_cognitive_general_knowledge"
                        value={formData.mse_cognitive_general_knowledge}
                        onChange={handleChange}
                        placeholder="Assessment"
                      />
                      <Input
                        label="Calculation"
                        name="mse_cognitive_calculation"
                        value={formData.mse_cognitive_calculation}
                        onChange={handleChange}
                        placeholder="Assessment"
                      />
                      <Input
                        label="Similarities"
                        name="mse_cognitive_similarities"
                        value={formData.mse_cognitive_similarities}
                        onChange={handleChange}
                        placeholder="Assessment"
                      />
                    </div>
                    <Textarea
                      label="Proverb interpretation"
                      name="mse_cognitive_proverbs"
                      value={formData.mse_cognitive_proverbs}
                      onChange={handleChange}
                      placeholder="Proverb interpretation assessment..."
                      rows={2}
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">7. Insight and judgement</h4>
                  <div className="space-y-4">
                    <Textarea
                      label="Patient's understanding and assessment of the illness (nature, course, treatment, outcome)"
                      name="mse_insight_understanding"
                      value={formData.mse_insight_understanding}
                      onChange={handleChange}
                      placeholder="Insight assessment..."
                      rows={3}
                    />
                    <Textarea
                      label="Appropriateness of judgement in face of realistic problems"
                      name="mse_insight_judgement"
                      value={formData.mse_insight_judgement}
                      onChange={handleChange}
                      placeholder="Judgement assessment..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Diagnostic Formulation */}
            <Card title="Diagnostic Formulation" className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                <Textarea
                  label="1. Summary of patient's problems"
                  name="diagnostic_formulation_summary"
                  value={formData.diagnostic_formulation_summary}
              onChange={handleChange}
                  placeholder="Concise summary of patient's problems..."
                  rows={4}
                />
                <Textarea
                  label="2. Salient features of genetic, constitutional, familial and environmental influences"
                  name="diagnostic_formulation_features"
                  value={formData.diagnostic_formulation_features}
                  onChange={handleChange}
                  placeholder="Genetic, constitutional, familial and environmental factors..."
                  rows={4}
                />
                <Textarea
                  label="3. Psychodynamic formulation"
                  name="diagnostic_formulation_psychodynamic"
                  value={formData.diagnostic_formulation_psychodynamic}
                  onChange={handleChange}
                  placeholder="Psychodynamic assessment and formulation..."
                  rows={5}
                />
              </div>
            </Card>

            {/* Provisional Diagnosis and Treatment Plan */}
            <Card title="Provisional Diagnosis and Treatment Plan" className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                <Textarea
                  label="Provisional Diagnosis"
                  name="provisional_diagnosis"
                  value={formData.provisional_diagnosis}
                  onChange={handleChange}
                  placeholder="Enter provisional diagnosis based on the clinical assessment..."
                  rows={4}
                />
                <Textarea
                  label="Treatment Plan"
                  name="treatment_plan"
                  value={formData.treatment_plan}
                  onChange={handleChange}
                  placeholder="Detailed treatment plan including medications, therapy, interventions, and follow-up recommendations..."
                  rows={5}
                />
              </div>
            </Card>

            {/* Comments of the Consultant */}
            <Card title="Comments of the Consultant" className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                <Textarea
                  label="Consultant's Comments"
                  name="consultant_comments"
                  value={formData.consultant_comments}
                  onChange={handleChange}
                  placeholder="Consultant's detailed comments, observations, and recommendations..."
                  rows={6}
                />
              </div>
            </Card>

            {/* ADL File Requirements */}
            <Card title="ADL File Requirements" className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
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
                  loading={isCreating || isUpdating}
                  disabled={isCreating || isUpdating}
                  className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700"
                >
                  <FiSave className="w-4 h-4" />
                  {isCreating || isUpdating ? 'Saving...' : (editMode ? 'Update Clinical Proforma' : 'Create Clinical Proforma')}
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

