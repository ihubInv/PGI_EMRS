const ClinicalProforma = require('../models/ClinicalProforma');
const Patient = require('../models/Patient');
const ADLFile = require('../models/ADLFile');
const Prescription = require('../models/Prescription');
const { supabase, supabaseAdmin } = require('../config/database');


class ClinicalController {
  // Create a new clinical proforma (JR/SR role)
  // static async createClinicalProforma(req, res) {
  //   try {
  //     // Extract complex case fields from req.body
  //     const complexCaseFields = [
  //       'history_narrative', 'history_specific_enquiry', 'history_drug_intake',
  //       'history_treatment_place', 'history_treatment_dates', 'history_treatment_drugs', 'history_treatment_response',
  //       'informants', 'complaints_patient', 'complaints_informant',
  //       'past_history_medical', 'past_history_psychiatric_dates', 'past_history_psychiatric_diagnosis',
  //       'past_history_psychiatric_treatment', 'past_history_psychiatric_interim', 'past_history_psychiatric_recovery',
  //       'family_history_father_age', 'family_history_father_education', 'family_history_father_occupation',
  //       'family_history_father_personality', 'family_history_father_deceased', 'family_history_father_death_age',
  //       'family_history_father_death_date', 'family_history_father_death_cause',
  //       'family_history_mother_age', 'family_history_mother_education', 'family_history_mother_occupation',
  //       'family_history_mother_personality', 'family_history_mother_deceased', 'family_history_mother_death_age',
  //       'family_history_mother_death_date', 'family_history_mother_death_cause', 'family_history_siblings',
  //       'diagnostic_formulation_summary', 'diagnostic_formulation_features', 'diagnostic_formulation_psychodynamic',
  //       'premorbid_personality_passive_active', 'premorbid_personality_assertive', 'premorbid_personality_introvert_extrovert',
  //       'premorbid_personality_traits', 'premorbid_personality_hobbies', 'premorbid_personality_habits', 'premorbid_personality_alcohol_drugs',
  //       'physical_appearance', 'physical_body_build', 'physical_pallor', 'physical_icterus', 'physical_oedema', 'physical_lymphadenopathy',
  //       'physical_pulse', 'physical_bp', 'physical_height', 'physical_weight', 'physical_waist', 'physical_fundus',
  //       'physical_cvs_apex', 'physical_cvs_regularity', 'physical_cvs_heart_sounds', 'physical_cvs_murmurs',
  //       'physical_chest_expansion', 'physical_chest_percussion', 'physical_chest_adventitious',
  //       'physical_abdomen_tenderness', 'physical_abdomen_mass', 'physical_abdomen_bowel_sounds',
  //       'physical_cns_cranial', 'physical_cns_motor_sensory', 'physical_cns_rigidity', 'physical_cns_involuntary',
  //       'physical_cns_superficial_reflexes', 'physical_cns_dtrs', 'physical_cns_plantar', 'physical_cns_cerebellar',
  //       'mse_general_demeanour', 'mse_general_tidy', 'mse_general_awareness', 'mse_general_cooperation',
  //       'mse_psychomotor_verbalization', 'mse_psychomotor_pressure', 'mse_psychomotor_tension', 'mse_psychomotor_posture',
  //       'mse_psychomotor_mannerism', 'mse_psychomotor_catatonic', 'mse_affect_subjective', 'mse_affect_tone',
  //       'mse_affect_resting', 'mse_affect_fluctuation', 'mse_thought_flow', 'mse_thought_form', 'mse_thought_content',
  //       'mse_cognitive_consciousness', 'mse_cognitive_orientation_time', 'mse_cognitive_orientation_place',
  //       'mse_cognitive_orientation_person', 'mse_cognitive_memory_immediate', 'mse_cognitive_memory_recent',
  //       'mse_cognitive_memory_remote', 'mse_cognitive_subtraction', 'mse_cognitive_digit_span', 'mse_cognitive_counting',
  //       'mse_cognitive_general_knowledge', 'mse_cognitive_calculation', 'mse_cognitive_similarities', 'mse_cognitive_proverbs',
  //       'mse_insight_understanding', 'mse_insight_judgement',
  //       'education_start_age', 'education_highest_class', 'education_performance', 'education_disciplinary',
  //       'education_peer_relationship', 'education_hobbies', 'education_special_abilities', 'education_discontinue_reason',
  //       'occupation_jobs', 'sexual_menarche_age', 'sexual_menarche_reaction', 'sexual_education', 'sexual_masturbation',
  //       'sexual_contact', 'sexual_premarital_extramarital', 'sexual_marriage_arranged', 'sexual_marriage_date',
  //       'sexual_spouse_age', 'sexual_spouse_occupation', 'sexual_adjustment_general', 'sexual_adjustment_sexual',
  //       'sexual_children', 'sexual_problems', 'religion_type', 'religion_participation', 'religion_changes',
  //       'living_residents', 'living_income_sharing', 'living_expenses', 'living_kitchen', 'living_domestic_conflicts',
  //       'living_social_class', 'living_inlaws', 'home_situation_childhood', 'home_situation_parents_relationship',
  //       'home_situation_socioeconomic', 'home_situation_interpersonal', 'personal_birth_date', 'personal_birth_place',
  //       'personal_delivery_type', 'personal_complications_prenatal', 'personal_complications_natal', 'personal_complications_postnatal',
  //       'development_weaning_age', 'development_first_words', 'development_three_words', 'development_walking',
  //       'development_neurotic_traits', 'development_nail_biting', 'development_bedwetting', 'development_phobias',
  //       'development_childhood_illness', 'provisional_diagnosis', 'treatment_plan', 'consultant_comments'
  //     ];

  //     // Separate basic proforma data from complex case data
  //     // IMPORTANT: Complex case fields are extracted and removed from proformaData
  //     // They will be saved ONLY in adl_files table (not in clinical_proforma)
  //     // The clinical_proforma table will only store a reference (adl_file_id) to the ADL file
  //     const complexCaseData = {};
  //     const proformaData = {
  //       ...req.body,
  //       filled_by: req.user.id
  //     };

  //     // Extract complex case fields and remove them from proformaData
  //     // This ensures they are NOT saved to clinical_proforma table
  //     complexCaseFields.forEach(field => {
  //       if (proformaData[field] !== undefined) {
  //         complexCaseData[field] = proformaData[field];
  //         delete proformaData[field]; // Remove from basic proforma data to prevent duplication
  //       }
  //     });

  //     // Pass complexCaseData to the model
  //     // It will be saved to adl_files table only if doctor_decision === 'complex_case' AND requires_adl_file === true
  //     proformaData.complexCaseData = complexCaseData;

  //     // Log for debugging
  //     if (proformaData.doctor_decision === 'complex_case' && proformaData.requires_adl_file === true) {
  //       console.log(`[clinicalController.createClinicalProforma] Complex case with ADL requirement detected.`);
  //       console.log(`[clinicalController.createClinicalProforma] Extracted ${Object.keys(complexCaseData).length} complex case fields.`);
  //       console.log(`[clinicalController.createClinicalProforma] Complex case field names (first 15):`, Object.keys(complexCaseData).slice(0, 15));
  //       console.log(`[clinicalController.createClinicalProforma] Sample complex case data:`, {
  //         has_informants: !!complexCaseData.informants,
  //         has_complaints_patient: !!complexCaseData.complaints_patient,
  //         has_family_history_siblings: !!complexCaseData.family_history_siblings,
  //         has_occupation_jobs: !!complexCaseData.occupation_jobs,
  //         has_living_residents: !!complexCaseData.living_residents,
  //         history_narrative: complexCaseData.history_narrative ? complexCaseData.history_narrative.substring(0, 50) + '...' : null,
  //         provisional_diagnosis: complexCaseData.provisional_diagnosis ? complexCaseData.provisional_diagnosis.substring(0, 50) + '...' : null
  //       });
  //       console.log(`[clinicalController.createClinicalProforma] ⚠️ IMPORTANT: These fields will be saved ONLY in adl_files table, NOT in clinical_proforma`);
  //     } else if (proformaData.doctor_decision === 'complex_case' && proformaData.requires_adl_file !== true) {
  //       console.warn(`[clinicalController.createClinicalProforma] ⚠️ Complex case detected but requires_adl_file is not true. ADL data will NOT be saved.`);
  //       console.warn(`[clinicalController.createClinicalProforma] doctor_decision: ${proformaData.doctor_decision}, requires_adl_file: ${proformaData.requires_adl_file}`);
  //     }

  //     const proforma = await ClinicalProforma.create(proformaData);

  //     let adlFileCreated = false;
  //     let adlFile = null;
  //     let adlCreationMessage = null;

  //     // Check if ADL file was created by the model (for complex cases)
  //     if (proforma.adl_file_id) {
  //       adlFile = await ADLFile.findById(proforma.adl_file_id);
  //       if (adlFile) {
  //         adlFileCreated = true;
  //         adlCreationMessage = 'ADL file created and registered successfully for complex case';
  //       }
  //     }


  //     // Handle prescriptions if provided
  //     let createdPrescriptions = [];
  //     if (proformaData.prescriptions && Array.isArray(proformaData.prescriptions) && proformaData.prescriptions.length > 0) {
  //       try {
  //         const prescriptionsWithProformaId = proformaData.prescriptions.map(prescription => ({
  //           ...prescription,
  //           clinical_proforma_id: proforma.id
  //         }));
  //         createdPrescriptions = await Prescription.createBulk(prescriptionsWithProformaId);
  //       } catch (prescriptionError) {
  //         console.error('Failed to create prescriptions:', prescriptionError);
  //         // Don't fail the entire request, just log the error
  //       }
  //     }

  //     // Refresh proforma to get latest data including adl_file_id
  //     const updatedProforma = await ClinicalProforma.findById(proforma.id);

  //     res.status(201).json({
  //       success: true,
  //       message: 'Clinical proforma created successfully',
  //       data: {
  //         proforma: updatedProforma ? updatedProforma.toJSON() : proforma.toJSON(),
  //         adl_file: adlFile ? {
  //           id: adlFile.id,
  //           adl_no: adlFile.adl_no,
  //           created: adlFileCreated,
  //           message: adlCreationMessage
  //         } : null,
  //         prescriptions: createdPrescriptions.length > 0 ? {
  //           count: createdPrescriptions.length,
  //           prescriptions: createdPrescriptions.map(p => p.toJSON())
  //         } : null
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Clinical proforma creation error:', error);
      
  //     if (error.message === 'Patient not found') {
  //       return res.status(404).json({
  //         success: false,
  //         message: error.message
  //       });
  //     }

  //     res.status(500).json({
  //       success: false,
  //       message: 'Failed to create clinical proforma',
  //       error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  //     });
  //   }
  // }


  // ✅ Create or update Clinical Proforma
 
 
 
  // static async createClinicalProforma(req, res) {
  //   try {
  //     const data = req.body;

  //     // Basic validation
  //     if (!data.patient_id || !data.visit_date) {
  //       return res.status(400).json({ success: false, message: "Missing required fields" });
  //     }

  //     // If doctor decided this is a complex case and ADL file is required
  //     if (data.doctor_decision === "complex_case" && data.requires_adl_file === true) {
  //       // Prepare ADL data by excluding clinical-only fields
  //       const adlData = {
  //         patient_id: data.patient_id,
  //         visit_date: data.visit_date,
  //         visit_type: data.visit_type,
  //         room_no: data.room_no,
  //         assigned_doctor: data.assigned_doctor,
  //         case_severity: data.case_severity,
  //         adjustment: data.adjustment,
  //         adl_reasoning: data.adl_reasoning,
  //         associated_medical_surgical: data.associated_medical_surgical,
  //         behaviour: data.behaviour,
  //         bio_functions: data.bio_functions,
  //         cognitive_function: data.cognitive_function,
  //         course: data.course,
  //         current_episode_since: data.current_episode_since,
  //         diagnosis: data.diagnosis,
  //         disposal: data.disposal,
  //         family_history: data.family_history,
  //         fits: data.fits,
  //         gpe: data.gpe,
  //         icd_code: data.icd_code,
  //         illness_duration: data.illness_duration,
  //         informant_present: data.informant_present,
  //         mood: data.mood,
  //         mse_affect: data.mse_affect,
  //         mse_behaviour: data.mse_behaviour,
  //         mse_cognitive_function: data.mse_cognitive_function,
  //         mse_delusions: data.mse_delusions,
  //         mse_perception: data.mse_perception,
  //         mse_thought: data.mse_thought,
  //         nature_of_information: data.nature_of_information,
  //         onset_duration: data.onset_duration,
  //         past_history: data.past_history,
  //         perception: data.perception,
  //         precipitating_factor: data.precipitating_factor,
  //         referred_to: data.referred_to,
  //         sexual_problem: data.sexual_problem,
  //         somatic: data.somatic,
  //         speech: data.speech,
  //         substance_use: data.substance_use,
  //         thought: data.thought,
  //         workup_appointment: data.workup_appointment,
  //       };

  //       // ✅ Step 1: Insert into adl_files
  //       const { data: adlFile, error: adlError } = await supabase
  //         .from("adl_files")
  //         .insert([adlData])
  //         .select()
  //         .single();

  //       if (adlError) {
  //         console.error("ADL Insert Error:", adlError);
  //         return res.status(500).json({ success: false, message: "Failed to create ADL record" });
  //       }

  //       // ✅ Step 2: Insert into clinical_proforma with reference to adl_file_id
  //       const clinicalData = {
  //         patient_id: data.patient_id,
  //         visit_date: data.visit_date,
  //         visit_type: data.visit_type,
  //         room_no: data.room_no,
  //         assigned_doctor: data.assigned_doctor,
  //         doctor_decision: data.doctor_decision,
  //         requires_adl_file: true,
  //         adl_file_id: adlFile.id,
  //       };

  //       const { data: clinicalRecord, error: clinicalError } = await supabase
  //         .from("clinical_proforma")
  //         .insert([clinicalData])
  //         .select()
  //         .single();

  //       if (clinicalError) {
  //         console.error("Clinical Insert Error:", clinicalError);
  //         return res.status(500).json({
  //           success: false,
  //           message: "Failed to create Clinical Proforma",
  //         });
  //       }

  //       return res.status(201).json({
  //         success: true,
  //         message: "Complex case with ADL file saved successfully",
  //         data: { clinical: clinicalRecord, adl: adlFile },
  //       });
  //     }

  //     // ✅ SIMPLE CASE: Insert only into clinical_proforma
  //     else {
  //       const clinicalData = {
  //         patient_id: data.patient_id,
  //         visit_date: data.visit_date,
  //         visit_type: data.visit_type,
  //         room_no: data.room_no,
  //         assigned_doctor: data.assigned_doctor,
  //         doctor_decision: data.doctor_decision,
  //         requires_adl_file: false,
  //         adl_file_id: null,
  //       };

  //       const { data: simpleClinical, error: simpleError } = await supabase
  //         .from("clinical_proforma")
  //         .insert([clinicalData])
  //         .select()
  //         .single();

  //       if (simpleError) {
  //         console.error("Simple Clinical Insert Error:", simpleError);
  //         return res.status(500).json({
  //           success: false,
  //           message: "Failed to create simple Clinical Proforma",
  //         });
  //       }

  //       return res.status(201).json({
  //         success: true,
  //         message: "Simple Clinical Proforma saved successfully",
  //         data: simpleClinical,
  //       });
  //     }
  //   } catch (err) {
  //     console.error("Unhandled Error:", err);
  //     return res.status(500).json({
  //       success: false,
  //       message: "Server Error",
  //     });
  //   }
  // }



  // Get all clinical proforma with pagination and filters
 
 



    // 🧩 Internal static helper (acts like Model.create)
    static async createRecord(table, data) {
      // Use supabaseAdmin for write operations to bypass RLS if needed
      const { data: result, error } = await supabaseAdmin.from(table).insert(data).select();
      if (error) {
        console.error(`Error inserting into ${table}:`, error);
        throw new Error(error.message || `Failed to create record in ${table}`);
      }
      if (!result || result.length === 0) {
        throw new Error(`No data returned from ${table} insert`);
      }
      return result[0];
    }
  
    // // 🏥 Main Method
    // static async createClinicalProforma(req, res) {
    //   try {
    //     const data = req.body;
  
    //     // 🔹 Basic validation
    //     if (!data.patient_id || !data.visit_date) {
    //       return res.status(400).json({
    //         success: false,
    //         message: "Missing required fields",
    //       });
    //     }
  
    //     // 🔹 Complex Case (with ADL)
    //     if (data.doctor_decision === "complex_case" && data.requires_adl_file === true) {
    //       // Extract complex case fields (extended fields only, NOT basic clinical fields)
    //       // Basic clinical fields go to clinical_proforma, complex case fields go to ADL
    //       const complexCaseFields = [
    //         'history_narrative', 'history_specific_enquiry', 'history_drug_intake',
    //         'history_treatment_place', 'history_treatment_dates', 'history_treatment_drugs', 'history_treatment_response',
    //         'informants', 'complaints_patient', 'complaints_informant',
    //         'past_history_medical', 'past_history_psychiatric_dates', 'past_history_psychiatric_diagnosis',
    //         'past_history_psychiatric_treatment', 'past_history_psychiatric_interim', 'past_history_psychiatric_recovery',
    //         'family_history_father_age', 'family_history_father_education', 'family_history_father_occupation',
    //         'family_history_father_personality', 'family_history_father_deceased', 'family_history_father_death_age',
    //         'family_history_father_death_date', 'family_history_father_death_cause',
    //         'family_history_mother_age', 'family_history_mother_education', 'family_history_mother_occupation',
    //         'family_history_mother_personality', 'family_history_mother_deceased', 'family_history_mother_death_age',
    //         'family_history_mother_death_date', 'family_history_mother_death_cause', 'family_history_siblings',
    //         'diagnostic_formulation_summary', 'diagnostic_formulation_features', 'diagnostic_formulation_psychodynamic',
    //         'premorbid_personality_passive_active', 'premorbid_personality_assertive', 'premorbid_personality_introvert_extrovert',
    //         'premorbid_personality_traits', 'premorbid_personality_hobbies', 'premorbid_personality_habits', 'premorbid_personality_alcohol_drugs',
    //         'physical_appearance', 'physical_body_build', 'physical_pallor', 'physical_icterus', 'physical_oedema', 'physical_lymphadenopathy',
    //         'physical_pulse', 'physical_bp', 'physical_height', 'physical_weight', 'physical_waist', 'physical_fundus',
    //         'physical_cvs_apex', 'physical_cvs_regularity', 'physical_cvs_heart_sounds', 'physical_cvs_murmurs',
    //         'physical_chest_expansion', 'physical_chest_percussion', 'physical_chest_adventitious',
    //         'physical_abdomen_tenderness', 'physical_abdomen_mass', 'physical_abdomen_bowel_sounds',
    //         'physical_cns_cranial', 'physical_cns_motor_sensory', 'physical_cns_rigidity', 'physical_cns_involuntary',
    //         'physical_cns_superficial_reflexes', 'physical_cns_dtrs', 'physical_cns_plantar', 'physical_cns_cerebellar',
    //         'mse_general_demeanour', 'mse_general_tidy', 'mse_general_awareness', 'mse_general_cooperation',
    //         'mse_psychomotor_verbalization', 'mse_psychomotor_pressure', 'mse_psychomotor_tension', 'mse_psychomotor_posture',
    //         'mse_psychomotor_mannerism', 'mse_psychomotor_catatonic', 'mse_affect_subjective', 'mse_affect_tone',
    //         'mse_affect_resting', 'mse_affect_fluctuation', 'mse_thought_flow', 'mse_thought_form', 'mse_thought_content',
    //         'mse_cognitive_consciousness', 'mse_cognitive_orientation_time', 'mse_cognitive_orientation_place',
    //         'mse_cognitive_orientation_person', 'mse_cognitive_memory_immediate', 'mse_cognitive_memory_recent',
    //         'mse_cognitive_memory_remote', 'mse_cognitive_subtraction', 'mse_cognitive_digit_span', 'mse_cognitive_counting',
    //         'mse_cognitive_general_knowledge', 'mse_cognitive_calculation', 'mse_cognitive_similarities', 'mse_cognitive_proverbs',
    //         'mse_insight_understanding', 'mse_insight_judgement',
    //         'education_start_age', 'education_highest_class', 'education_performance', 'education_disciplinary',
    //         'education_peer_relationship', 'education_hobbies', 'education_special_abilities', 'education_discontinue_reason',
    //         'occupation_jobs', 'sexual_menarche_age', 'sexual_menarche_reaction', 'sexual_education', 'sexual_masturbation',
    //         'sexual_contact', 'sexual_premarital_extramarital', 'sexual_marriage_arranged', 'sexual_marriage_date',
    //         'sexual_spouse_age', 'sexual_spouse_occupation', 'sexual_adjustment_general', 'sexual_adjustment_sexual',
    //         'sexual_children', 'sexual_problems', 'religion_type', 'religion_participation', 'religion_changes',
    //         'living_residents', 'living_income_sharing', 'living_expenses', 'living_kitchen', 'living_domestic_conflicts',
    //         'living_social_class', 'living_inlaws', 'home_situation_childhood', 'home_situation_parents_relationship',
    //         'home_situation_socioeconomic', 'home_situation_interpersonal', 'personal_birth_date', 'personal_birth_place',
    //         'personal_delivery_type', 'personal_complications_prenatal', 'personal_complications_natal', 'personal_complications_postnatal',
    //         'development_weaning_age', 'development_first_words', 'development_three_words', 'development_walking',
    //         'development_neurotic_traits', 'development_nail_biting', 'development_bedwetting', 'development_phobias',
    //         'development_childhood_illness', 'provisional_diagnosis', 'treatment_plan', 'consultant_comments'
    //       ];

    //       // Extract only complex case fields for ADL file
    //       const complexCaseData = {};
    //       complexCaseFields.forEach(field => {
    //         if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
    //           // Handle arrays - check if they have meaningful content
    //           if (Array.isArray(data[field])) {
    //             if (data[field].length > 0 && data[field].some(item => {
    //               if (typeof item === 'object' && item !== null) {
    //                 return Object.values(item).some(val => val !== '' && val !== null);
    //               }
    //               return item !== '' && item !== null;
    //             })) {
    //               complexCaseData[field] = data[field];
    //             }
    //           } else {
    //             complexCaseData[field] = data[field];
    //           }
    //         }
    //       });

    //       // ✅ STEP 1: Create ADL file FIRST (with NULL clinical_proforma_id initially)
    //       let adlFile = null;
    //       let adlFileId = null;
          
    //       try {
    //         // Generate ADL number
    //         const adlNoResult = await supabaseAdmin
    //           .from('adl_files')
    //           .select('adl_no')
    //           .like('adl_no', 'ADL-%')
    //           .order('adl_no', { ascending: false })
    //           .limit(1);
            
    //         let nextAdlNo = 'ADL-000001';
    //         if (adlNoResult.data && adlNoResult.data.length > 0) {
    //           const lastNo = adlNoResult.data[0].adl_no;
    //           const lastNum = parseInt(lastNo.replace('ADL-', '')) || 0;
    //           nextAdlNo = `ADL-${String(lastNum + 1).padStart(6, '0')}`;
    //         }

    //         // ✅ Prepare ADL data matching the schema exactly
    //         // JSONB fields need to be arrays (Supabase will handle JSONB conversion automatically)
    //         const adlData = {
    //           // Basic ADL file fields (from schema)
    //           patient_id: data.patient_id,
    //           adl_no: nextAdlNo,
    //           created_by: req.user.id,
    //           clinical_proforma_id: null, // Will be updated after clinical_proforma is created
    //           file_status: 'created',
    //           file_created_date: data.visit_date || new Date().toISOString().split('T')[0],
    //           total_visits: 1,
    //           is_active: true,
    //           // Complex case fields (all ADL-specific fields from schema)
    //           ...complexCaseData
    //         };
            
    //         // ✅ Ensure JSONB fields are properly formatted (arrays for Supabase)
    //         // Supabase automatically converts JavaScript arrays/objects to JSONB
    //         const jsonbFields = ['informants', 'complaints_patient', 'complaints_informant', 
    //           'family_history_siblings', 'premorbid_personality_traits', 'occupation_jobs', 
    //           'sexual_children', 'living_residents', 'living_inlaws'];
            
    //         jsonbFields.forEach(field => {
    //           if (adlData[field] !== undefined && adlData[field] !== null) {
    //             // Ensure it's an array (Supabase will convert to JSONB)
    //             if (!Array.isArray(adlData[field])) {
    //               // If it's a string, try to parse it
    //               if (typeof adlData[field] === 'string') {
    //                 try {
    //                   adlData[field] = JSON.parse(adlData[field]);
    //                 } catch {
    //                   adlData[field] = [];
    //                 }
    //               } else {
    //                 adlData[field] = [];
    //               }
    //             }
    //           } else {
    //             // Set default empty array for JSONB fields if not provided
    //             adlData[field] = [];
    //           }
    //         });

    //         adlFile = await ClinicalController.createRecord("adl_files", adlData);
    //         adlFileId = adlFile.id;
    //         console.log(`[createClinicalProforma] ✅ Step 1: Created ADL file ${adlFileId} (${adlFile.adl_no})`);
    //       } catch (adlError) {
    //         console.error('[createClinicalProforma] ❌ Step 1: Failed to create ADL file:', adlError);
    //         throw new Error(`Failed to create ADL file: ${adlError.message}`);
    //       }

    //       // ✅ STEP 2: Create Clinical Proforma with adl_file_id reference
    //       // IMPORTANT: Only include fields that exist in clinical_proforma schema
    //       // ADL-specific fields (history_narrative, informants, physical_appearance, etc.) are NOT included here
    //       let clinicalRecord = null;
    //       try {
    //         // ✅ Build clinical_data object matching the schema exactly
    //         // Exclude all ADL-specific fields - they belong only in adl_files table
    //         const clinicalData = {
    //           // Core fields
    //           patient_id: data.patient_id,
    //           filled_by: req.user.id,
    //           visit_date: data.visit_date,
    //           visit_type: data.visit_type || 'first_visit',
    //           room_no: data.room_no,
    //           assigned_doctor: data.assigned_doctor,
    //           // History fields (basic, not ADL-extended)
    //           informant_present: data.informant_present,
    //           nature_of_information: data.nature_of_information,
    //           onset_duration: data.onset_duration,
    //           course: data.course,
    //           precipitating_factor: data.precipitating_factor,
    //           illness_duration: data.illness_duration,
    //           current_episode_since: data.current_episode_since,
    //           // Basic clinical fields
    //           mood: data.mood,
    //           behaviour: data.behaviour,
    //           speech: data.speech,
    //           thought: data.thought,
    //           perception: data.perception,
    //           somatic: data.somatic,
    //           bio_functions: data.bio_functions,
    //           adjustment: data.adjustment,
    //           cognitive_function: data.cognitive_function,
    //           fits: data.fits,
    //           sexual_problem: data.sexual_problem,
    //           substance_use: data.substance_use,
    //           past_history: data.past_history, // Basic past history, not ADL-extended
    //           family_history: data.family_history, // Basic family history, not ADL-extended
    //           associated_medical_surgical: data.associated_medical_surgical,
    //           // MSE fields (basic, not ADL-extended)
    //           mse_behaviour: data.mse_behaviour,
    //           mse_affect: data.mse_affect,
    //           mse_thought: data.mse_thought,
    //           mse_delusions: data.mse_delusions,
    //           mse_perception: data.mse_perception,
    //           mse_cognitive_function: data.mse_cognitive_function,
    //           // Examination and diagnosis
    //           gpe: data.gpe,
    //           diagnosis: data.diagnosis,
    //           icd_code: data.icd_code,
    //           disposal: data.disposal,
    //           workup_appointment: data.workup_appointment,
    //           referred_to: data.referred_to,
    //           treatment_prescribed: data.treatment_prescribed,
    //           // Decision and ADL flags
    //           doctor_decision: data.doctor_decision,
    //           case_severity: data.case_severity,
    //           requires_adl_file: true,
    //           adl_reasoning: data.adl_reasoning,
    //           // ✅ Foreign key reference to ADL file (matches schema)
    //           adl_file_id: adlFileId,
    //           // Prescriptions (JSONB array)
    //           prescriptions: data.prescriptions || []
    //         };
            
    //         // ✅ Remove any ADL-specific fields that might have been accidentally included
    //         // These fields should NOT be in clinical_proforma table
    //         const adlFieldsToRemove = [
    //           'history_narrative', 'history_specific_enquiry', 'history_drug_intake',
    //           'history_treatment_place', 'history_treatment_dates', 'history_treatment_drugs', 'history_treatment_response',
    //           'informants', 'complaints_patient', 'complaints_informant',
    //           'past_history_medical', 'past_history_psychiatric_dates', 'past_history_psychiatric_diagnosis',
    //           'past_history_psychiatric_treatment', 'past_history_psychiatric_interim', 'past_history_psychiatric_recovery',
    //           'family_history_father_age', 'family_history_father_education', 'family_history_father_occupation',
    //           'family_history_father_personality', 'family_history_father_deceased', 'family_history_father_death_age',
    //           'family_history_father_death_date', 'family_history_father_death_cause',
    //           'family_history_mother_age', 'family_history_mother_education', 'family_history_mother_occupation',
    //           'family_history_mother_personality', 'family_history_mother_deceased', 'family_history_mother_death_age',
    //           'family_history_mother_death_date', 'family_history_mother_death_cause', 'family_history_siblings',
    //           'diagnostic_formulation_summary', 'diagnostic_formulation_features', 'diagnostic_formulation_psychodynamic',
    //           'premorbid_personality_passive_active', 'premorbid_personality_assertive', 'premorbid_personality_introvert_extrovert',
    //           'premorbid_personality_traits', 'premorbid_personality_hobbies', 'premorbid_personality_habits', 'premorbid_personality_alcohol_drugs',
    //           'physical_appearance', 'physical_body_build', 'physical_pallor', 'physical_icterus', 'physical_oedema', 'physical_lymphadenopathy',
    //           'physical_pulse', 'physical_bp', 'physical_height', 'physical_weight', 'physical_waist', 'physical_fundus',
    //           'physical_cvs_apex', 'physical_cvs_regularity', 'physical_cvs_heart_sounds', 'physical_cvs_murmurs',
    //           'physical_chest_expansion', 'physical_chest_percussion', 'physical_chest_adventitious',
    //           'physical_abdomen_tenderness', 'physical_abdomen_mass', 'physical_abdomen_bowel_sounds',
    //           'physical_cns_cranial', 'physical_cns_motor_sensory', 'physical_cns_rigidity', 'physical_cns_involuntary',
    //           'physical_cns_superficial_reflexes', 'physical_cns_dtrs', 'physical_cns_plantar', 'physical_cns_cerebellar',
    //           'mse_general_demeanour', 'mse_general_tidy', 'mse_general_awareness', 'mse_general_cooperation',
    //           'mse_psychomotor_verbalization', 'mse_psychomotor_pressure', 'mse_psychomotor_tension', 'mse_psychomotor_posture',
    //           'mse_psychomotor_mannerism', 'mse_psychomotor_catatonic', 'mse_affect_subjective', 'mse_affect_tone',
    //           'mse_affect_resting', 'mse_affect_fluctuation', 'mse_thought_flow', 'mse_thought_form', 'mse_thought_content',
    //           'mse_cognitive_consciousness', 'mse_cognitive_orientation_time', 'mse_cognitive_orientation_place',
    //           'mse_cognitive_orientation_person', 'mse_cognitive_memory_immediate', 'mse_cognitive_memory_recent',
    //           'mse_cognitive_memory_remote', 'mse_cognitive_subtraction', 'mse_cognitive_digit_span', 'mse_cognitive_counting',
    //           'mse_cognitive_general_knowledge', 'mse_cognitive_calculation', 'mse_cognitive_similarities', 'mse_cognitive_proverbs',
    //           'mse_insight_understanding', 'mse_insight_judgement',
    //           'education_start_age', 'education_highest_class', 'education_performance', 'education_disciplinary',
    //           'education_peer_relationship', 'education_hobbies', 'education_special_abilities', 'education_discontinue_reason',
    //           'occupation_jobs', 'sexual_menarche_age', 'sexual_menarche_reaction', 'sexual_education', 'sexual_masturbation',
    //           'sexual_contact', 'sexual_premarital_extramarital', 'sexual_marriage_arranged', 'sexual_marriage_date',
    //           'sexual_spouse_age', 'sexual_spouse_occupation', 'sexual_adjustment_general', 'sexual_adjustment_sexual',
    //           'sexual_children', 'sexual_problems', 'religion_type', 'religion_participation', 'religion_changes',
    //           'living_residents', 'living_income_sharing', 'living_expenses', 'living_kitchen', 'living_domestic_conflicts',
    //           'living_social_class', 'living_inlaws', 'home_situation_childhood', 'home_situation_parents_relationship',
    //           'home_situation_socioeconomic', 'home_situation_interpersonal', 'personal_birth_date', 'personal_birth_place',
    //           'personal_delivery_type', 'personal_complications_prenatal', 'personal_complications_natal', 'personal_complications_postnatal',
    //           'development_weaning_age', 'development_first_words', 'development_three_words', 'development_walking',
    //           'development_neurotic_traits', 'development_nail_biting', 'development_bedwetting', 'development_phobias',
    //           'development_childhood_illness', 'provisional_diagnosis', 'treatment_plan', 'consultant_comments'
    //         ];
            
    //         // Remove any ADL fields that might have been accidentally included
    //         adlFieldsToRemove.forEach(field => {
    //           delete clinicalData[field];
    //         });

    //         clinicalRecord = await ClinicalController.createRecord("clinical_proforma", clinicalData);
    //         console.log(`[createClinicalProforma] ✅ Step 2: Created Clinical Proforma ${clinicalRecord.id} with adl_file_id: ${adlFileId}`);
    //       } catch (clinicalError) {
    //         console.error('[createClinicalProforma] ❌ Step 2: Failed to create Clinical Proforma. Rolling back ADL file...');
    //         // ✅ ROLLBACK: Delete ADL file if clinical_proforma creation fails
    //         try {
    //           await supabaseAdmin
    //             .from('adl_files')
    //             .delete()
    //             .eq('id', adlFileId);
    //           console.log(`[createClinicalProforma] ✅ Rollback: Deleted ADL file ${adlFileId}`);
    //         } catch (rollbackError) {
    //           console.error('[createClinicalProforma] ❌ Rollback failed:', rollbackError);
    //         }
    //         throw new Error(`Failed to create Clinical Proforma: ${clinicalError.message}`);
    //       }

    //       // ✅ STEP 3: Update ADL file with clinical_proforma_id (bidirectional link)
    //       try {
    //         await supabaseAdmin
    //           .from('adl_files')
    //           .update({ clinical_proforma_id: clinicalRecord.id })
    //           .eq('id', adlFileId);
    //         console.log(`[createClinicalProforma] ✅ Step 3: Updated ADL file ${adlFileId} with clinical_proforma_id: ${clinicalRecord.id}`);
    //       } catch (updateError) {
    //         console.error('[createClinicalProforma] ⚠️ Step 3: Failed to update ADL file with clinical_proforma_id. Link is still valid via adl_file_id in clinical_proforma.');
    //         // Non-critical error - the link is already established via adl_file_id
    //       }

    //       // Refresh clinical record to get latest data
    //       const updatedClinical = await supabaseAdmin
    //         .from('clinical_proforma')
    //         .select('*')
    //         .eq('id', clinicalRecord.id)
    //         .single();

    //       // Refresh ADL file to get latest data (including clinical_proforma_id)
    //       const updatedAdlFile = await supabaseAdmin
    //         .from('adl_files')
    //         .select('*')
    //         .eq('id', adlFileId)
    //         .single();

    //       // Handle prescriptions if provided
    //       let createdPrescriptions = [];
    //       if (data.prescriptions && Array.isArray(data.prescriptions) && data.prescriptions.length > 0) {
    //         try {
    //           const prescriptionsWithProformaId = data.prescriptions.map(prescription => ({
    //             ...prescription,
    //             clinical_proforma_id: clinicalRecord.id
    //           }));
    //           createdPrescriptions = await Prescription.createBulk(prescriptionsWithProformaId);
    //         } catch (prescriptionError) {
    //           console.error('Failed to create prescriptions:', prescriptionError);
    //           // Don't fail the entire request, just log the error
    //         }
    //       }

    //       return res.status(201).json({
    //         success: true,
    //         message: "Complex case with ADL file saved successfully",
    //         data: { 
    //           proforma: updatedClinical.data || clinicalRecord,
    //           clinical: updatedClinical.data || clinicalRecord, // Keep both for compatibility
    //           adl_file: updatedAdlFile.data ? {
    //             id: updatedAdlFile.data.id,
    //             adl_no: updatedAdlFile.data.adl_no,
    //             clinical_proforma_id: updatedAdlFile.data.clinical_proforma_id,
    //             created: true,
    //             message: 'ADL file created and linked successfully'
    //           } : {
    //             id: adlFile.id,
    //             adl_no: adlFile.adl_no,
    //             created: true,
    //             message: 'ADL file created and linked successfully'
    //           },
    //           adl: updatedAdlFile.data || adlFile, // Keep both for compatibility
    //           prescriptions: createdPrescriptions.length > 0 ? {
    //             count: createdPrescriptions.length,
    //             prescriptions: createdPrescriptions
    //           } : null
    //         },
    //       });
    //     }
  
    //     // 🔹 Simple Case (no ADL) - All clinical data goes to clinical_proforma only
    //     const clinicalData = {
    //       patient_id: data.patient_id,
    //       visit_date: data.visit_date,
    //       visit_type: data.visit_type,
    //       room_no: data.room_no,
    //       assigned_doctor: data.assigned_doctor,
    //       filled_by: req.user.id,
    //       informant_present: data.informant_present,
    //       nature_of_information: data.nature_of_information,
    //       onset_duration: data.onset_duration,
    //       course: data.course,
    //       precipitating_factor: data.precipitating_factor,
    //       illness_duration: data.illness_duration,
    //       current_episode_since: data.current_episode_since,
    //       mood: data.mood,
    //       behaviour: data.behaviour,
    //       speech: data.speech,
    //       thought: data.thought,
    //       perception: data.perception,
    //       somatic: data.somatic,
    //       bio_functions: data.bio_functions,
    //       adjustment: data.adjustment,
    //       cognitive_function: data.cognitive_function,
    //       fits: data.fits,
    //       sexual_problem: data.sexual_problem,
    //       substance_use: data.substance_use,
    //       past_history: data.past_history,
    //       family_history: data.family_history,
    //       associated_medical_surgical: data.associated_medical_surgical,
    //       mse_behaviour: data.mse_behaviour,
    //       mse_affect: data.mse_affect,
    //       mse_thought: data.mse_thought,
    //       mse_delusions: data.mse_delusions,
    //       mse_perception: data.mse_perception,
    //       mse_cognitive_function: data.mse_cognitive_function,
    //       gpe: data.gpe,
    //       diagnosis: data.diagnosis,
    //       icd_code: data.icd_code,
    //       disposal: data.disposal,
    //       workup_appointment: data.workup_appointment,
    //       referred_to: data.referred_to,
    //       treatment_prescribed: data.treatment_prescribed,
    //       doctor_decision: data.doctor_decision,
    //       case_severity: data.case_severity,
    //       requires_adl_file: false,
    //       adl_file_id: null,
    //       adl_reasoning: data.adl_reasoning,
    //     };
  
    //     const simpleClinical = await ClinicalController.createRecord("clinical_proforma", clinicalData);

    //     // Handle prescriptions if provided
    //     let createdPrescriptions = [];
    //     if (data.prescriptions && Array.isArray(data.prescriptions) && data.prescriptions.length > 0) {
    //       try {
    //         const prescriptionsWithProformaId = data.prescriptions.map(prescription => ({
    //           ...prescription,
    //           clinical_proforma_id: simpleClinical.id
    //         }));
    //         createdPrescriptions = await Prescription.createBulk(prescriptionsWithProformaId);
    //       } catch (prescriptionError) {
    //         console.error('Failed to create prescriptions:', prescriptionError);
    //         // Don't fail the entire request, just log the error
    //       }
    //     }
  
    //     return res.status(201).json({
    //       success: true,
    //       message: "Simple Clinical Proforma saved successfully",
    //       data: {
    //         proforma: simpleClinical,
    //         clinical: simpleClinical, // Keep both for compatibility
    //         prescriptions: createdPrescriptions.length > 0 ? {
    //           count: createdPrescriptions.length,
    //           prescriptions: createdPrescriptions
    //         } : null
    //       },
    //     });
    //   } catch (err) {
    //     console.error("Unhandled Error:", err);
    //     return res.status(500).json({
    //       success: false,
    //       message: err.message || "Server Error",
    //     });
    //   }
    // }
  

    // At the top of your controller file, make sure ADLFile is imported


// ... rest of imports ...

static async createClinicalProforma(req, res) {
  try {
    const data = req.body;

    // 🔹 Basic validation
    if (!data.patient_id || !data.visit_date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // 🔹 Complex Case (with ADL) - Transaction-like atomicity
    // When doctor_decision === 'complex_case', create ADL file and link bidirectionally
    if (data.doctor_decision === "complex_case") {
      // Ensure requires_adl_file is true for complex cases
      if (data.requires_adl_file !== true && data.requires_adl_file !== "true") {
        data.requires_adl_file = true;
      }

      // Extract complex case fields (ADL-specific fields only)
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

      // Extract complex case fields for ADL file
      const complexCaseData = {};
      complexCaseFields.forEach(field => {
        if (data.hasOwnProperty(field) && data[field] !== undefined && data[field] !== null) {
          complexCaseData[field] = data[field];
        }
      });

      // ✅ TRANSACTION-LIKE FLOW: Create clinical_proforma, then ADL file, then update clinical_proforma
      // This ensures atomicity with rollback on failure
      let clinicalRecord = null;
      let adlFile = null;
      
      try {
        // STEP 1: Create clinical_proforma (adl_file_id will be null initially)
        const clinicalData = {
          patient_id: data.patient_id,
          filled_by: req.user.id,
          visit_date: data.visit_date,
          visit_type: data.visit_type || 'first_visit',
          room_no: data.room_no,
          assigned_doctor: data.assigned_doctor,
          informant_present: data.informant_present,
          nature_of_information: data.nature_of_information,
          onset_duration: data.onset_duration,
          course: data.course,
          precipitating_factor: data.precipitating_factor,
          illness_duration: data.illness_duration,
          current_episode_since: data.current_episode_since,
          mood: data.mood,
          behaviour: data.behaviour,
          speech: data.speech,
          thought: data.thought,
          perception: data.perception,
          somatic: data.somatic,
          bio_functions: data.bio_functions,
          adjustment: data.adjustment,
          cognitive_function: data.cognitive_function,
          fits: data.fits,
          sexual_problem: data.sexual_problem,
          substance_use: data.substance_use,
          past_history: data.past_history,
          family_history: data.family_history,
          associated_medical_surgical: data.associated_medical_surgical,
          mse_behaviour: data.mse_behaviour,
          mse_affect: data.mse_affect,
          mse_thought: data.mse_thought,
          mse_delusions: data.mse_delusions,
          mse_perception: data.mse_perception,
          mse_cognitive_function: data.mse_cognitive_function,
          gpe: data.gpe,
          diagnosis: data.diagnosis,
          icd_code: data.icd_code,
          disposal: data.disposal,
          workup_appointment: data.workup_appointment,
          referred_to: data.referred_to,
          treatment_prescribed: data.treatment_prescribed,
          doctor_decision: data.doctor_decision,
          case_severity: data.case_severity,
          requires_adl_file: true,
          adl_reasoning: data.adl_reasoning,
          adl_file_id: null // Will be set after ADL file creation
        };

        clinicalRecord = await ClinicalController.createRecord("clinical_proforma", clinicalData);
        console.log(`[createClinicalProforma] ✅ Step 1: Created Clinical Proforma ${clinicalRecord.id}`);

        // STEP 2: Create or reuse ADL file
        // Check if ADL file already exists for this clinical_proforma (shouldn't happen on create, but handle gracefully)
        let existingAdlFile = null;
        if (clinicalRecord.adl_file_id) {
          try {
            existingAdlFile = await ADLFile.findById(clinicalRecord.adl_file_id);
            if (existingAdlFile) {
              console.log(`[createClinicalProforma] ⚠️ ADL file ${existingAdlFile.id} already exists, reusing it`);
            }
          } catch (err) {
            console.warn(`[createClinicalProforma] Could not fetch existing ADL file: ${err.message}`);
          }
        }

        if (!existingAdlFile) {
          // Generate ADL number
          const adlNoResult = await supabaseAdmin
            .from('adl_files')
            .select('adl_no')
            .like('adl_no', 'ADL-%')
            .order('adl_no', { ascending: false })
            .limit(1);
          
          let nextAdlNo = 'ADL-000001';
          if (adlNoResult.data && adlNoResult.data.length > 0) {
            const lastNo = adlNoResult.data[0].adl_no;
            const lastNum = parseInt(lastNo.replace('ADL-', '')) || 0;
            nextAdlNo = `ADL-${String(lastNum + 1).padStart(6, '0')}`;
          }

          // Prepare ADL data with complex case fields
          const adlData = {
            patient_id: data.patient_id,
            adl_no: nextAdlNo,
            created_by: req.user.id,
            clinical_proforma_id: clinicalRecord.id, // ✅ Link to clinical_proforma
            file_status: 'created',
            file_created_date: data.visit_date || new Date().toISOString().split('T')[0],
            total_visits: 1,
            is_active: true,
            ...complexCaseData // All ADL-specific fields
          };

          // Ensure JSONB fields are arrays
          const jsonbFields = ['informants', 'complaints_patient', 'complaints_informant', 
            'family_history_siblings', 'premorbid_personality_traits', 'occupation_jobs', 
            'sexual_children', 'living_residents', 'living_inlaws'];
          
          jsonbFields.forEach(field => {
            if (adlData[field] !== undefined && adlData[field] !== null) {
              if (!Array.isArray(adlData[field])) {
                if (typeof adlData[field] === 'string') {
                  try {
                    adlData[field] = JSON.parse(adlData[field]);
                  } catch {
                    adlData[field] = [];
                  }
                } else {
                  adlData[field] = [];
                }
              }
            } else {
              adlData[field] = [];
            }
          });

          adlFile = await ADLFile.create(adlData);
          if (!adlFile || !adlFile.id) {
            throw new Error('ADL file creation returned no ID');
          }
          console.log(`[createClinicalProforma] ✅ Step 2: Created ADL file ${adlFile.id} (${adlFile.adl_no})`);
        } else {
          adlFile = existingAdlFile;
          console.log(`[createClinicalProforma] ✅ Step 2: Reusing existing ADL file ${adlFile.id}`);
        }

        // STEP 3: Update clinical_proforma with adl_file_id (bidirectional link)
        const { error: updateError } = await supabaseAdmin
          .from('clinical_proforma')
          .update({ adl_file_id: adlFile.id })
          .eq('id', clinicalRecord.id);

        if (updateError) {
          console.error(`[createClinicalProforma] ❌ Step 3: Failed to update adl_file_id:`, updateError);
          throw new Error(`Failed to link ADL file: ${updateError.message}`);
        }

        console.log(`[createClinicalProforma] ✅ Step 3: Updated Clinical Proforma ${clinicalRecord.id} with adl_file_id: ${adlFile.id}`);

        // ✅ STEP 4: Update patient record to reflect complex case status
        try {
          const patient = await Patient.findById(data.patient_id);
          if (patient) {
            await patient.update({
              has_adl_file: true,
              case_complexity: 'complex'
            });
            console.log(`[createClinicalProforma] ✅ Step 4: Updated patient ${data.patient_id} - has_adl_file=true, case_complexity=complex`);
          } else {
            console.warn(`[createClinicalProforma] ⚠️ Patient ${data.patient_id} not found for status update`);
          }
        } catch (patientUpdateError) {
          console.error('[createClinicalProforma] ❌ Failed to update patient status:', patientUpdateError);
          // Non-critical error - continue with response
        }

        // Refresh clinical record to get updated adl_file_id
        const { data: updatedClinical } = await supabaseAdmin
          .from('clinical_proforma')
          .select('*')
          .eq('id', clinicalRecord.id)
          .single();

        // Handle prescriptions if provided
        let createdPrescriptions = [];
        if (data.prescriptions && Array.isArray(data.prescriptions) && data.prescriptions.length > 0) {
          try {
            const prescriptionsWithProformaId = data.prescriptions.map(prescription => ({
              ...prescription,
              clinical_proforma_id: clinicalRecord.id
            }));
            createdPrescriptions = await Prescription.createBulk(prescriptionsWithProformaId);
          } catch (prescriptionError) {
            console.error('[createClinicalProforma] Failed to create prescriptions:', prescriptionError);
          }
        }

        // ✅ Return combined response with both clinical_proforma and adl_file
        return res.status(201).json({
          success: true,
          message: "Complex case with ADL file saved successfully",
          data: {
            clinical_proforma: updatedClinical || clinicalRecord,
            adl_file: adlFile.toJSON() // Full ADL file data for frontend to prefill Step 3
          },
          prescriptions: createdPrescriptions.length > 0 ? {
            count: createdPrescriptions.length,
            prescriptions: createdPrescriptions
          } : null
        });

      } catch (error) {
        console.error('[createClinicalProforma] ❌ Transaction failed:', error);
        
        // ✅ ROLLBACK: Delete clinical_proforma if it was created but ADL creation/linking failed
        if (clinicalRecord && clinicalRecord.id && !adlFile) {
          try {
            await supabaseAdmin
              .from('clinical_proforma')
              .delete()
              .eq('id', clinicalRecord.id);
            console.log(`[createClinicalProforma] ✅ Rollback: Deleted Clinical Proforma ${clinicalRecord.id}`);
          } catch (rollbackError) {
            console.error('[createClinicalProforma] ❌ Rollback failed:', rollbackError);
          }
        }
        
        return res.status(500).json({
          success: false,
          message: "Failed to handle ADL file for complex case",
          error: error.message || "Internal server error"
        });
      }
    }

    // 🔹 Simple Case (no ADL)
    const clinicalData = {
      patient_id: data.patient_id,
      visit_date: data.visit_date,
      visit_type: data.visit_type,
      room_no: data.room_no,
      assigned_doctor: data.assigned_doctor,
      filled_by: req.user.id,
      informant_present: data.informant_present,
      nature_of_information: data.nature_of_information,
      onset_duration: data.onset_duration,
      course: data.course,
      precipitating_factor: data.precipitating_factor,
      illness_duration: data.illness_duration,
      current_episode_since: data.current_episode_since,
      mood: data.mood,
      behaviour: data.behaviour,
      speech: data.speech,
      thought: data.thought,
      perception: data.perception,
      somatic: data.somatic,
      bio_functions: data.bio_functions,
      adjustment: data.adjustment,
      cognitive_function: data.cognitive_function,
      fits: data.fits,
      sexual_problem: data.sexual_problem,
      substance_use: data.substance_use,
      past_history: data.past_history,
      family_history: data.family_history,
      associated_medical_surgical: data.associated_medical_surgical,
      mse_behaviour: data.mse_behaviour,
      mse_affect: data.mse_affect,
      mse_thought: data.mse_thought,
      mse_delusions: data.mse_delusions,
      mse_perception: data.mse_perception,
      mse_cognitive_function: data.mse_cognitive_function,
      gpe: data.gpe,
      diagnosis: data.diagnosis,
      icd_code: data.icd_code,
      disposal: data.disposal,
      workup_appointment: data.workup_appointment,
      referred_to: data.referred_to,
      treatment_prescribed: data.treatment_prescribed,
      doctor_decision: data.doctor_decision,
      case_severity: data.case_severity,
      requires_adl_file: false,
      adl_file_id: null,
      adl_reasoning: data.adl_reasoning,
    };

    const simpleClinical = await ClinicalController.createRecord("clinical_proforma", clinicalData);

    // Handle prescriptions
    let createdPrescriptions = [];
    if (data.prescriptions && Array.isArray(data.prescriptions) && data.prescriptions.length > 0) {
      try {
        const prescriptionsWithProformaId = data.prescriptions.map(prescription => ({
          ...prescription,
          clinical_proforma_id: simpleClinical.id
        }));
        createdPrescriptions = await Prescription.createBulk(prescriptionsWithProformaId);
      } catch (prescriptionError) {
        console.error('Failed to create prescriptions:', prescriptionError);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Simple Clinical Proforma saved successfully",
      data: {
        proforma: simpleClinical,
        prescriptions: createdPrescriptions.length > 0 ? {
          count: createdPrescriptions.length,
          prescriptions: createdPrescriptions
        } : null
      },
    });
  } catch (err) {
    console.error("❌ Unhandled Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
}
  
 
  static async getAllClinicalProformas(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};

      // Apply filters
      if (req.query.visit_type) filters.visit_type = req.query.visit_type;
      if (req.query.doctor_decision) filters.doctor_decision = req.query.doctor_decision;
      if (req.query.case_severity) filters.case_severity = req.query.case_severity;
      if (req.query.requires_adl_file !== undefined) filters.requires_adl_file = req.query.requires_adl_file === 'true';
      if (req.query.filled_by) filters.filled_by = req.query.filled_by;
      if (req.query.room_no) filters.room_no = req.query.room_no;
      if (req.query.date_from) filters.date_from = req.query.date_from;
      if (req.query.date_to) filters.date_to = req.query.date_to;

      const result = await ClinicalProforma.findAll(page, limit, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all clinical proformas error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get clinical proformas',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get clinical proforma by ID
  static async getClinicalProformaById(req, res) {
    try {
      const { id } = req.params;
      const proforma = await ClinicalProforma.findById(id);

      if (!proforma) {
        return res.status(404).json({
          success: false,
          message: 'Clinical proforma not found'
        });
      }

      res.json({
        success: true,
        data: {
          proforma: proforma.toJSON()
        }
      });
    } catch (error) {
      console.error('Get clinical proforma by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get clinical proforma',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get clinical proforma by patient ID
  static async getClinicalProformaByPatientId(req, res) {
    try {
      const { patient_id } = req.params;
      const proformas = await ClinicalProforma.findByPatientId(patient_id);

      res.json({
        success: true,
        data: {
          proformas: proformas.map(p => p.toJSON())
        }
      });
    } catch (error) {
      console.error('Get clinical proforma by patient ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get clinical proformas',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Update clinical proforma
  static async updateClinicalProforma(req, res) {
    try {
      const { id } = req.params;
      const proforma = await ClinicalProforma.findById(id);

      if (!proforma) {
        return res.status(404).json({
          success: false,
          message: 'Clinical proforma not found'
        });
      }

      // Only allow the doctor who created the proforma or admin to update
      if (proforma.filled_by !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update proformas you created.'
        });
      }

      // Extract prescriptions and complex case data from updateData
      const { prescriptions, ...proformaUpdateData } = req.body;
      
      // Define complex case fields that should go to ADL file
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

      // Separate complex case data from basic proforma data
      // IMPORTANT: Complex case fields are extracted and removed from proformaUpdateData
      // They will be saved ONLY in adl_files table (not in clinical_proforma)
      // The clinical_proforma table will only store a reference (adl_file_id) to the ADL file
      const complexCaseData = {};
      complexCaseFields.forEach(field => {
        if (proformaUpdateData[field] !== undefined) {
          complexCaseData[field] = proformaUpdateData[field];
          delete proformaUpdateData[field]; // Remove from basic proforma data to prevent duplication
        }
      });

      // Check if changing to complex case or already is complex case
      const changingToComplexCase = proformaUpdateData.doctor_decision === 'complex_case' && 
                                     proforma.doctor_decision !== 'complex_case';
      const isComplexCase = proformaUpdateData.doctor_decision === 'complex_case' || proforma.doctor_decision === 'complex_case';
      
      // Ensure requires_adl_file is true for complex cases
      if (isComplexCase && proformaUpdateData.requires_adl_file !== true && proformaUpdateData.requires_adl_file !== "true") {
        proformaUpdateData.requires_adl_file = true;
      }
      
      // Handle ADL file separately (don't pass to model's update method)
      // Remove complexCaseData from updateData to prevent model from trying to handle it
      delete proformaUpdateData.complexCaseData;
      
      // Update the clinical proforma (without ADL data)
      await proforma.update(proformaUpdateData);

      // ✅ Handle ADL file creation/update if complex case
      let adlFile = null;
      let adlFileUpdated = false;

      if (isComplexCase) {
        try {
          // Check if ADL file already exists for this clinical_proforma
          if (proforma.adl_file_id) {
            try {
              adlFile = await ADLFile.findById(proforma.adl_file_id);
              if (adlFile) {
                console.log(`[updateClinicalProforma] ✅ Found existing ADL file ${adlFile.id}`);
                
                // If complex case data provided, update the ADL file
                if (Object.keys(complexCaseData).length > 0) {
                  await adlFile.update(complexCaseData);
                  adlFileUpdated = true;
                  console.log(`[updateClinicalProforma] ✅ Updated existing ADL file ${adlFile.id}`);
                }
                
                // ✅ Ensure patient status is updated (has_adl_file=true, case_complexity=complex)
                try {
                  const patient = await Patient.findById(proforma.patient_id);
                  if (patient) {
                    await patient.update({
                      has_adl_file: true,
                      case_complexity: 'complex'
                    });
                    console.log(`[updateClinicalProforma] ✅ Updated patient ${proforma.patient_id} status (existing ADL file)`);
                  }
                } catch (patientUpdateError) {
                  console.error('[updateClinicalProforma] ❌ Failed to update patient status:', patientUpdateError);
                }
              }
            } catch (err) {
              console.warn(`[updateClinicalProforma] Could not fetch existing ADL file: ${err.message}`);
            }
          }
          
          // Create new ADL file if it doesn't exist or changing to complex case
          if (!adlFile && (changingToComplexCase || !proforma.adl_file_id)) {
            // Generate ADL number
            const adlNoResult = await supabaseAdmin
              .from('adl_files')
              .select('adl_no')
              .like('adl_no', 'ADL-%')
              .order('adl_no', { ascending: false })
              .limit(1);
            
            let nextAdlNo = 'ADL-000001';
            if (adlNoResult.data && adlNoResult.data.length > 0) {
              const lastNo = adlNoResult.data[0].adl_no;
              const lastNum = parseInt(lastNo.replace('ADL-', '')) || 0;
              nextAdlNo = `ADL-${String(lastNum + 1).padStart(6, '0')}`;
            }

            // Prepare ADL data
            const adlData = {
              patient_id: proforma.patient_id,
              adl_no: nextAdlNo,
              created_by: proforma.filled_by,
              clinical_proforma_id: proforma.id, // ✅ Link to existing clinical_proforma
              file_status: 'created',
              file_created_date: proformaUpdateData.visit_date || proforma.visit_date || new Date().toISOString().split('T')[0],
              total_visits: 1,
              is_active: true,
              ...complexCaseData // All ADL-specific fields
            };
            
            // Ensure JSONB fields are arrays
            const jsonbFields = ['informants', 'complaints_patient', 'complaints_informant', 
              'family_history_siblings', 'premorbid_personality_traits', 'occupation_jobs', 
              'sexual_children', 'living_residents', 'living_inlaws'];
            
            jsonbFields.forEach(field => {
              if (adlData[field] !== undefined && adlData[field] !== null) {
                if (!Array.isArray(adlData[field])) {
                  if (typeof adlData[field] === 'string') {
                    try {
                      adlData[field] = JSON.parse(adlData[field]);
                    } catch {
                      adlData[field] = [];
                    }
                  } else {
                    adlData[field] = [];
                  }
                }
              } else {
                adlData[field] = [];
              }
            });

            adlFile = await ADLFile.create(adlData);
            if (!adlFile || !adlFile.id) {
              throw new Error('ADL file creation returned no ID');
            }

            // ✅ Update clinical_proforma with adl_file_id (bidirectional link)
            const { error: updateError } = await supabaseAdmin
              .from('clinical_proforma')
              .update({ adl_file_id: adlFile.id })
              .eq('id', proforma.id);

            if (updateError) {
              console.error(`[updateClinicalProforma] ❌ Failed to update adl_file_id:`, updateError);
              throw new Error(`Failed to link ADL file: ${updateError.message}`);
            }

            adlFileUpdated = true;
            console.log(`[updateClinicalProforma] ✅ Created ADL file ${adlFile.id} and linked to clinical_proforma ${proforma.id}`);
            
            // ✅ Update patient record to reflect complex case status
            try {
              const patient = await Patient.findById(proforma.patient_id);
              if (patient) {
                await patient.update({
                  has_adl_file: true,
                  case_complexity: 'complex'
                });
                console.log(`[updateClinicalProforma] ✅ Updated patient ${proforma.patient_id} - has_adl_file=true, case_complexity=complex`);
              }
            } catch (patientUpdateError) {
              console.error('[updateClinicalProforma] ❌ Failed to update patient status:', patientUpdateError);
              // Non-critical error - continue
            }
          }
        } catch (adlError) {
          console.error('[updateClinicalProforma] ❌ Error handling ADL file:', adlError);
          // Don't fail the entire update, but log the error
          // The clinical_proforma update already succeeded, so we continue
        }
      }

      // Handle prescriptions update
      let updatedPrescriptions = [];
      if (prescriptions !== undefined && Array.isArray(prescriptions)) {
        try {
          // Delete existing prescriptions for this proforma
          await Prescription.deleteByClinicalProformaId(proforma.id);
          
          // Create new prescriptions if any were provided
          if (prescriptions.length > 0) {
            const prescriptionsWithProformaId = prescriptions.map(prescription => ({
              ...prescription,
              clinical_proforma_id: proforma.id
            }));
            updatedPrescriptions = await Prescription.createBulk(prescriptionsWithProformaId);
          }
        } catch (prescriptionError) {
          console.error('Failed to update prescriptions:', prescriptionError);
          // Don't fail the entire request, just log the error
        }
      }

      // Refresh proforma to get latest data (including adl_file_id if updated)
      const updatedProforma = await ClinicalProforma.findById(proforma.id);
      
      // Refresh ADL file if it exists
      if (adlFile && adlFile.id) {
        try {
          adlFile = await ADLFile.findById(adlFile.id);
        } catch (err) {
          console.warn(`[updateClinicalProforma] Could not refresh ADL file: ${err.message}`);
        }
      } else if (updatedProforma?.adl_file_id) {
        try {
          adlFile = await ADLFile.findById(updatedProforma.adl_file_id);
        } catch (err) {
          console.warn(`[updateClinicalProforma] Could not fetch ADL file: ${err.message}`);
        }
      }

      // ✅ Return combined response matching createClinicalProforma format
      res.status(200).json({
        success: true,
        message: 'Clinical proforma updated successfully',
        data: {
          clinical_proforma: updatedProforma ? updatedProforma.toJSON() : proforma.toJSON(),
          adl_file: adlFile ? adlFile.toJSON() : null, // Full ADL file data for frontend
          prescriptions: updatedPrescriptions.length > 0 ? {
            count: updatedPrescriptions.length,
            prescriptions: updatedPrescriptions.map(p => p.toJSON())
          } : null
        }
      });
    } catch (error) {
      console.error('Update clinical proforma error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update clinical proforma',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Delete clinical proforma
  static async deleteClinicalProforma(req, res) {
    try {
      const { id } = req.params;
      const proforma = await ClinicalProforma.findById(id);

      if (!proforma) {
        return res.status(404).json({
          success: false,
          message: 'Clinical proforma not found'
        });
      }

      // Only allow the doctor who created the proforma or admin to delete
      if (proforma.filled_by !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only delete proformas you created.'
        });
      }

      await proforma.delete();

      res.json({
        success: true,
        message: 'Clinical proforma deleted successfully'
      });
    } catch (error) {
      console.error('Delete clinical proforma error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete clinical proforma',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get clinical proforma statistics
  static async getClinicalStats(req, res) {
    try {
      const stats = await ClinicalProforma.getStats();

      res.json({
        success: true,
        data: {
          stats
        }
      });
    } catch (error) {
      console.error('Get clinical stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get clinical statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get cases by severity
  static async getCasesBySeverity(req, res) {
    try {
      const stats = await ClinicalProforma.getCasesBySeverity();

      res.json({
        success: true,
        data: {
          severityStats: stats
        }
      });
    } catch (error) {
      console.error('Get cases by severity error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get severity statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get cases by decision
  static async getCasesByDecision(req, res) {
    try {
      const stats = await ClinicalProforma.getCasesByDecision();

      res.json({
        success: true,
        data: {
          decisionStats: stats
        }
      });
    } catch (error) {
      console.error('Get cases by decision error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get decision statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get proformas created by current doctor
  static async getMyProformas(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        filled_by: req.user.id
      };

      const result = await ClinicalProforma.findAll(page, limit, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get my proformas error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get your proformas',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get complex cases requiring ADL files
  static async getComplexCases(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        doctor_decision: 'complex_case',
        requires_adl_file: true
      };

      const result = await ClinicalProforma.findAll(page, limit, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get complex cases error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get complex cases',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get cases by room
  static async getCasesByRoom(req, res) {
    try {
      const { room_no } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        room_no: room_no
      };

      const result = await ClinicalProforma.findAll(page, limit, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get cases by room error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cases by room',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = ClinicalController;
