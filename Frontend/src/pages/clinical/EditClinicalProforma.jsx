import React, { useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  useGetClinicalProformaByIdQuery,
  useUpdateClinicalProformaMutation
} from '../../features/clinical/clinicalApiSlice';
import { useGetADLFileByIdQuery, useUpdateADLFileMutation } from '../../features/adl/adlApiSlice';
import CreateClinicalProforma from './CreateClinicalProforma';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { FiArrowLeft, FiAlertCircle } from 'react-icons/fi';


const EditClinicalProforma = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTab = searchParams.get('returnTab');

  // Fetch clinical proforma data
  const { 
    data: proformaData, 
    isLoading: isLoadingProforma, 
    isError: isErrorProforma,
    error: proformaError 
  } = useGetClinicalProformaByIdQuery(id);

  const proforma = proformaData?.data?.proforma;
  const isComplexCase = proforma?.doctor_decision === 'complex_case' && proforma?.adl_file_id;

  // Fetch ADL file data if this is a complex case
  const { 
    data: adlFileData, 
    isLoading: isLoadingADL 
  } = useGetADLFileByIdQuery(
    proforma?.adl_file_id,
    { skip: !isComplexCase }
  );

  const adlFile = adlFileData?.data?.adlFile || adlFileData?.data?.file;

  // Update mutations
  const [updateProforma, { isLoading: isUpdating }] = useUpdateClinicalProformaMutation();
  const [updateADLFile] = useUpdateADLFileMutation();

  // Prepare initial form data - MUST be called before any conditional returns (Rules of Hooks)
  const initialFormData = useMemo(() => {
    if (!proforma) return null;

    // Helper functions
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

    const baseData = {
      patient_id: proforma.patient_id?.toString() || '',
      visit_date: proforma.visit_date || new Date().toISOString().split('T')[0],
      visit_type: proforma.visit_type || 'first_visit',
      room_no: proforma.room_no || '',
      assigned_doctor: proforma.assigned_doctor?.toString() || '',
      informant_present: proforma.informant_present ?? true,
      nature_of_information: proforma.nature_of_information || '',
      onset_duration: proforma.onset_duration || '',
      course: proforma.course || '',
      precipitating_factor: proforma.precipitating_factor || '',
      illness_duration: proforma.illness_duration || '',
      current_episode_since: proforma.current_episode_since || '',
      mood: normalizeArrayField(proforma.mood),
      behaviour: normalizeArrayField(proforma.behaviour),
      speech: normalizeArrayField(proforma.speech),
      thought: normalizeArrayField(proforma.thought),
      perception: normalizeArrayField(proforma.perception),
      somatic: normalizeArrayField(proforma.somatic),
      bio_functions: normalizeArrayField(proforma.bio_functions),
      adjustment: normalizeArrayField(proforma.adjustment),
      cognitive_function: normalizeArrayField(proforma.cognitive_function),
      fits: normalizeArrayField(proforma.fits),
      sexual_problem: normalizeArrayField(proforma.sexual_problem),
      substance_use: normalizeArrayField(proforma.substance_use),
      past_history: proforma.past_history || '',
      family_history: proforma.family_history || '',
      associated_medical_surgical: normalizeArrayField(proforma.associated_medical_surgical),
      mse_behaviour: normalizeArrayField(proforma.mse_behaviour),
      mse_affect: normalizeArrayField(proforma.mse_affect),
      mse_thought: proforma.mse_thought || '',
      mse_delusions: proforma.mse_delusions || '',
      mse_perception: normalizeArrayField(proforma.mse_perception),
      mse_cognitive_function: normalizeArrayField(proforma.mse_cognitive_function),
      gpe: proforma.gpe || '',
      diagnosis: proforma.diagnosis || '',
      icd_code: proforma.icd_code || '',
      disposal: proforma.disposal || '',
      workup_appointment: proforma.workup_appointment || '',
      referred_to: proforma.referred_to || '',
      treatment_prescribed: proforma.treatment_prescribed || '',
      doctor_decision: proforma.doctor_decision || 'simple_case',
      case_severity: proforma.case_severity || '',
      requires_adl_file: proforma.requires_adl_file || false,
      adl_reasoning: proforma.adl_reasoning || '',
      // Default values for ADL fields
      history_narrative: '',
      history_specific_enquiry: '',
      history_drug_intake: '',
      history_treatment_place: '',
      history_treatment_dates: '',
      history_treatment_drugs: '',
      history_treatment_response: '',
      informants: [{ relationship: '', name: '', reliability: '' }],
      complaints_patient: [{ complaint: '', duration: '' }],
      complaints_informant: [{ complaint: '', duration: '' }],
      past_history_medical: '',
      past_history_psychiatric_dates: '',
      past_history_psychiatric_diagnosis: '',
      past_history_psychiatric_treatment: '',
      past_history_psychiatric_interim: '',
      past_history_psychiatric_recovery: '',
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
      diagnostic_formulation_summary: '',
      diagnostic_formulation_features: '',
      diagnostic_formulation_psychodynamic: '',
      premorbid_personality_passive_active: '',
      premorbid_personality_assertive: '',
      premorbid_personality_introvert_extrovert: '',
      premorbid_personality_traits: [],
      premorbid_personality_hobbies: '',
      premorbid_personality_habits: '',
      premorbid_personality_alcohol_drugs: '',
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
      education_start_age: '',
      education_highest_class: '',
      education_performance: '',
      education_disciplinary: '',
      education_peer_relationship: '',
      education_hobbies: '',
      education_special_abilities: '',
      education_discontinue_reason: '',
      occupation_jobs: [{ job: '', dates: '', adjustment: '', difficulties: '', promotions: '', change_reason: '' }],
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
      religion_type: '',
      religion_participation: '',
      religion_changes: '',
      living_residents: [{ name: '', relationship: '', age: '' }],
      living_income_sharing: '',
      living_expenses: '',
      living_kitchen: '',
      living_domestic_conflicts: '',
      living_social_class: '',
      living_inlaws: [{ name: '', relationship: '', age: '' }],
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
      provisional_diagnosis: '',
      treatment_plan: '',
      consultant_comments: '',
      prescriptions: proforma.prescriptions || [],
    };

    // Merge ADL file data if available
    if (adlFile) {
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

      Object.keys(adlFile).forEach(key => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' && 
            key !== 'patient_id' && key !== 'adl_no' && key !== 'created_by' &&
            key !== 'clinical_proforma_id' && key !== 'file_status' && 
            key !== 'file_created_date' && key !== 'total_visits' && key !== 'is_active' &&
            key !== 'last_accessed_date' && key !== 'last_accessed_by' && key !== 'notes') {
          
          if (jsonbFields.hasOwnProperty(key)) {
            baseData[key] = normalizeObjectArrayField(adlFile[key], jsonbFields[key]);
          } else {
            baseData[key] = adlFile[key] ?? baseData[key] ?? '';
          }
        }
      });
    }

    return baseData;
  }, [proforma, adlFile]);

  // Loading state - AFTER all hooks
  if (isLoadingProforma || (isComplexCase && isLoadingADL)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (isErrorProforma) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-12">
            <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Clinical Proforma</h2>
            <p className="text-gray-600 mb-6">
              {proformaError?.data?.message || 'Failed to load clinical proforma data'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FiArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
              >
                Retry
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Not found state
  if (!proforma || !initialFormData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-12">
            <FiAlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Clinical Proforma Not Found</h2>
            <p className="text-gray-600 mb-6">
              The clinical proforma you're trying to edit doesn't exist or has been deleted.
            </p>
            <Button
              onClick={() => navigate('/clinical')}
              variant="primary"
              className="flex items-center gap-2 mx-auto"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Clinical Proformas
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Handle update
  const handleUpdate = async (updateData) => {
    try {
      // Extract complex case fields for ADL update if needed
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
      const proformaUpdateData = { ...updateData };
      
      // Separate complex case fields for ADL update
      complexCaseFields.forEach(field => {
        if (proformaUpdateData[field] !== undefined) {
          adlUpdateData[field] = proformaUpdateData[field];
          delete proformaUpdateData[field];
        }
      });

      // Update clinical proforma
      const result = await updateProforma(proformaUpdateData).unwrap();
      
      // Update ADL file if it exists and has complex case data
      if (proforma?.adl_file_id && Object.keys(adlUpdateData).length > 0) {
        try {
          await updateADLFile({ id: proforma.adl_file_id, ...adlUpdateData }).unwrap();
        } catch (adlError) {
          console.error('Failed to update ADL file:', adlError);
        }
      }

      toast.success('Clinical proforma updated successfully!');
      
      // Navigate back
      if (returnTab) {
        navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
      } else {
        navigate(`/clinical/${id}`);
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update clinical proforma');
      throw err;
    }
  };

  return (
    <CreateClinicalProforma 
      initialData={initialFormData}
      onUpdate={handleUpdate}
      proformaId={id}
    />
  );
};

export default EditClinicalProforma;
