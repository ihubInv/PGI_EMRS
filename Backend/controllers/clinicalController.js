const ClinicalProforma = require('../models/ClinicalProforma');
const Patient = require('../models/Patient');
const ADLFile = require('../models/ADLFile');
const Prescription = require('../models/Prescription');

class ClinicalController {
  // Create a new clinical proforma (JR/SR role)
  static async createClinicalProforma(req, res) {
    try {
      const proformaData = {
        ...req.body,
        filled_by: req.user.id // Set the doctor who is filling the proforma
      };

      const proforma = await ClinicalProforma.create(proformaData);

      let adlFileCreated = false;
      let adlFile = null;
      let adlCreationMessage = null;

      // If this is a complex case, automatically create/register ADL file
      if (proforma.doctor_decision === 'complex_case') {
        try {
          const patient = await Patient.findById(proforma.patient_id);
          if (!patient) {
            adlCreationMessage = 'Patient not found for ADL file creation';
          } else if (patient.has_adl_file) {
            // Patient already has an ADL file - get existing file info
            const existingFiles = await patient.getADLFiles();
            adlFile = existingFiles.length > 0 ? existingFiles[0] : null;
            
            if (adlFile) {
              // Check if we should link this new proforma to the existing ADL file
              // If the existing ADL file doesn't have a clinical_proforma_id, link this one
              if (!adlFile.clinical_proforma_id) {
                // Link this proforma to the existing ADL file
                const adlFileInstance = new ADLFile(adlFile);
                await adlFileInstance.update({ clinical_proforma_id: proforma.id });
                adlFile.clinical_proforma_id = proforma.id;
                adlCreationMessage = 'Complex case proforma registered with existing ADL file';
                
                // Update proforma with adl_file_id for bidirectional linking
                await proforma.update({ 
                  requires_adl_file: true,
                  adl_file_id: adlFile.id 
                });
              } else {
                adlCreationMessage = 'Patient already has an ADL file registered with another proforma';
                // Still link this proforma to the ADL file
                await proforma.update({ 
                  requires_adl_file: true,
                  adl_file_id: adlFile.id 
                });
              }
            } else {
              adlCreationMessage = 'Patient has ADL file flag but no file record found';
            }
          } else {
            // Automatically create the ADL file for complex case with ALL complex case data
            // Extract complex case data from proformaData to save in ADL file
            const complexCaseData = {
              // Basic ADL file fields
              patient_id: proforma.patient_id,
              created_by: req.user.id,
              clinical_proforma_id: proforma.id,
              file_status: 'created',
              file_created_date: proforma.visit_date || new Date(),
              total_visits: 1,
              
              // Extract all complex case fields from proformaData
              // History of Present Illness - Expanded
              history_narrative: proformaData.history_narrative,
              history_specific_enquiry: proformaData.history_specific_enquiry,
              history_drug_intake: proformaData.history_drug_intake,
              history_treatment_place: proformaData.history_treatment_place,
              history_treatment_dates: proformaData.history_treatment_dates,
              history_treatment_drugs: proformaData.history_treatment_drugs,
              history_treatment_response: proformaData.history_treatment_response,
              // Multiple Informants (JSONB)
              informants: proformaData.informants,
              // Complaints and Duration (JSONB)
              complaints_patient: proformaData.complaints_patient,
              complaints_informant: proformaData.complaints_informant,
              // Past History - Detailed
              past_history_medical: proformaData.past_history_medical,
              past_history_psychiatric_dates: proformaData.past_history_psychiatric_dates,
              past_history_psychiatric_diagnosis: proformaData.past_history_psychiatric_diagnosis,
              past_history_psychiatric_treatment: proformaData.past_history_psychiatric_treatment,
              past_history_psychiatric_interim: proformaData.past_history_psychiatric_interim,
              past_history_psychiatric_recovery: proformaData.past_history_psychiatric_recovery,
              // Family History - Detailed
              family_history_father_age: proformaData.family_history_father_age,
              family_history_father_education: proformaData.family_history_father_education,
              family_history_father_occupation: proformaData.family_history_father_occupation,
              family_history_father_personality: proformaData.family_history_father_personality,
              family_history_father_deceased: proformaData.family_history_father_deceased,
              family_history_father_death_age: proformaData.family_history_father_death_age,
              family_history_father_death_date: proformaData.family_history_father_death_date,
              family_history_father_death_cause: proformaData.family_history_father_death_cause,
              family_history_mother_age: proformaData.family_history_mother_age,
              family_history_mother_education: proformaData.family_history_mother_education,
              family_history_mother_occupation: proformaData.family_history_mother_occupation,
              family_history_mother_personality: proformaData.family_history_mother_personality,
              family_history_mother_deceased: proformaData.family_history_mother_deceased,
              family_history_mother_death_age: proformaData.family_history_mother_death_age,
              family_history_mother_death_date: proformaData.family_history_mother_death_date,
              family_history_mother_death_cause: proformaData.family_history_mother_death_cause,
              family_history_siblings: proformaData.family_history_siblings,
              // Diagnostic Formulation
              diagnostic_formulation_summary: proformaData.diagnostic_formulation_summary,
              diagnostic_formulation_features: proformaData.diagnostic_formulation_features,
              diagnostic_formulation_psychodynamic: proformaData.diagnostic_formulation_psychodynamic,
              // Premorbid Personality
              premorbid_personality_passive_active: proformaData.premorbid_personality_passive_active,
              premorbid_personality_assertive: proformaData.premorbid_personality_assertive,
              premorbid_personality_introvert_extrovert: proformaData.premorbid_personality_introvert_extrovert,
              premorbid_personality_traits: proformaData.premorbid_personality_traits,
              premorbid_personality_hobbies: proformaData.premorbid_personality_hobbies,
              premorbid_personality_habits: proformaData.premorbid_personality_habits,
              premorbid_personality_alcohol_drugs: proformaData.premorbid_personality_alcohol_drugs,
              // Physical Examination - Comprehensive
              physical_appearance: proformaData.physical_appearance,
              physical_body_build: proformaData.physical_body_build,
              physical_pallor: proformaData.physical_pallor,
              physical_icterus: proformaData.physical_icterus,
              physical_oedema: proformaData.physical_oedema,
              physical_lymphadenopathy: proformaData.physical_lymphadenopathy,
              physical_pulse: proformaData.physical_pulse,
              physical_bp: proformaData.physical_bp,
              physical_height: proformaData.physical_height,
              physical_weight: proformaData.physical_weight,
              physical_waist: proformaData.physical_waist,
              physical_fundus: proformaData.physical_fundus,
              physical_cvs_apex: proformaData.physical_cvs_apex,
              physical_cvs_regularity: proformaData.physical_cvs_regularity,
              physical_cvs_heart_sounds: proformaData.physical_cvs_heart_sounds,
              physical_cvs_murmurs: proformaData.physical_cvs_murmurs,
              physical_chest_expansion: proformaData.physical_chest_expansion,
              physical_chest_percussion: proformaData.physical_chest_percussion,
              physical_chest_adventitious: proformaData.physical_chest_adventitious,
              physical_abdomen_tenderness: proformaData.physical_abdomen_tenderness,
              physical_abdomen_mass: proformaData.physical_abdomen_mass,
              physical_abdomen_bowel_sounds: proformaData.physical_abdomen_bowel_sounds,
              physical_cns_cranial: proformaData.physical_cns_cranial,
              physical_cns_motor_sensory: proformaData.physical_cns_motor_sensory,
              physical_cns_rigidity: proformaData.physical_cns_rigidity,
              physical_cns_involuntary: proformaData.physical_cns_involuntary,
              physical_cns_superficial_reflexes: proformaData.physical_cns_superficial_reflexes,
              physical_cns_dtrs: proformaData.physical_cns_dtrs,
              physical_cns_plantar: proformaData.physical_cns_plantar,
              physical_cns_cerebellar: proformaData.physical_cns_cerebellar,
              // Mental Status Examination - Expanded
              mse_general_demeanour: proformaData.mse_general_demeanour,
              mse_general_tidy: proformaData.mse_general_tidy,
              mse_general_awareness: proformaData.mse_general_awareness,
              mse_general_cooperation: proformaData.mse_general_cooperation,
              mse_psychomotor_verbalization: proformaData.mse_psychomotor_verbalization,
              mse_psychomotor_pressure: proformaData.mse_psychomotor_pressure,
              mse_psychomotor_tension: proformaData.mse_psychomotor_tension,
              mse_psychomotor_posture: proformaData.mse_psychomotor_posture,
              mse_psychomotor_mannerism: proformaData.mse_psychomotor_mannerism,
              mse_psychomotor_catatonic: proformaData.mse_psychomotor_catatonic,
              mse_affect_subjective: proformaData.mse_affect_subjective,
              mse_affect_tone: proformaData.mse_affect_tone,
              mse_affect_resting: proformaData.mse_affect_resting,
              mse_affect_fluctuation: proformaData.mse_affect_fluctuation,
              mse_thought_flow: proformaData.mse_thought_flow,
              mse_thought_form: proformaData.mse_thought_form,
              mse_thought_content: proformaData.mse_thought_content,
              mse_cognitive_consciousness: proformaData.mse_cognitive_consciousness,
              mse_cognitive_orientation_time: proformaData.mse_cognitive_orientation_time,
              mse_cognitive_orientation_place: proformaData.mse_cognitive_orientation_place,
              mse_cognitive_orientation_person: proformaData.mse_cognitive_orientation_person,
              mse_cognitive_memory_immediate: proformaData.mse_cognitive_memory_immediate,
              mse_cognitive_memory_recent: proformaData.mse_cognitive_memory_recent,
              mse_cognitive_memory_remote: proformaData.mse_cognitive_memory_remote,
              mse_cognitive_subtraction: proformaData.mse_cognitive_subtraction,
              mse_cognitive_digit_span: proformaData.mse_cognitive_digit_span,
              mse_cognitive_counting: proformaData.mse_cognitive_counting,
              mse_cognitive_general_knowledge: proformaData.mse_cognitive_general_knowledge,
              mse_cognitive_calculation: proformaData.mse_cognitive_calculation,
              mse_cognitive_similarities: proformaData.mse_cognitive_similarities,
              mse_cognitive_proverbs: proformaData.mse_cognitive_proverbs,
              mse_insight_understanding: proformaData.mse_insight_understanding,
              mse_insight_judgement: proformaData.mse_insight_judgement,
              // Educational History
              education_start_age: proformaData.education_start_age,
              education_highest_class: proformaData.education_highest_class,
              education_performance: proformaData.education_performance,
              education_disciplinary: proformaData.education_disciplinary,
              education_peer_relationship: proformaData.education_peer_relationship,
              education_hobbies: proformaData.education_hobbies,
              education_special_abilities: proformaData.education_special_abilities,
              education_discontinue_reason: proformaData.education_discontinue_reason,
              // Occupational History (JSONB)
              occupation_jobs: proformaData.occupation_jobs,
              // Sexual and Marital History
              sexual_menarche_age: proformaData.sexual_menarche_age,
              sexual_menarche_reaction: proformaData.sexual_menarche_reaction,
              sexual_education: proformaData.sexual_education,
              sexual_masturbation: proformaData.sexual_masturbation,
              sexual_contact: proformaData.sexual_contact,
              sexual_premarital_extramarital: proformaData.sexual_premarital_extramarital,
              sexual_marriage_arranged: proformaData.sexual_marriage_arranged,
              sexual_marriage_date: proformaData.sexual_marriage_date,
              sexual_spouse_age: proformaData.sexual_spouse_age,
              sexual_spouse_occupation: proformaData.sexual_spouse_occupation,
              sexual_adjustment_general: proformaData.sexual_adjustment_general,
              sexual_adjustment_sexual: proformaData.sexual_adjustment_sexual,
              sexual_children: proformaData.sexual_children,
              sexual_problems: proformaData.sexual_problems,
              // Religion
              religion_type: proformaData.religion_type,
              religion_participation: proformaData.religion_participation,
              religion_changes: proformaData.religion_changes,
              // Present Living Situation
              living_residents: proformaData.living_residents,
              living_income_sharing: proformaData.living_income_sharing,
              living_expenses: proformaData.living_expenses,
              living_kitchen: proformaData.living_kitchen,
              living_domestic_conflicts: proformaData.living_domestic_conflicts,
              living_social_class: proformaData.living_social_class,
              living_inlaws: proformaData.living_inlaws,
              // General Home Situation and Early Development
              home_situation_childhood: proformaData.home_situation_childhood,
              home_situation_parents_relationship: proformaData.home_situation_parents_relationship,
              home_situation_socioeconomic: proformaData.home_situation_socioeconomic,
              home_situation_interpersonal: proformaData.home_situation_interpersonal,
              personal_birth_date: proformaData.personal_birth_date,
              personal_birth_place: proformaData.personal_birth_place,
              personal_delivery_type: proformaData.personal_delivery_type,
              personal_complications_prenatal: proformaData.personal_complications_prenatal,
              personal_complications_natal: proformaData.personal_complications_natal,
              personal_complications_postnatal: proformaData.personal_complications_postnatal,
              development_weaning_age: proformaData.development_weaning_age,
              development_first_words: proformaData.development_first_words,
              development_three_words: proformaData.development_three_words,
              development_walking: proformaData.development_walking,
              development_neurotic_traits: proformaData.development_neurotic_traits,
              development_nail_biting: proformaData.development_nail_biting,
              development_bedwetting: proformaData.development_bedwetting,
              development_phobias: proformaData.development_phobias,
              development_childhood_illness: proformaData.development_childhood_illness,
              // Provisional Diagnosis and Treatment Plan
              provisional_diagnosis: proformaData.provisional_diagnosis,
              treatment_plan: proformaData.treatment_plan,
              // Comments of the Consultant
              consultant_comments: proformaData.consultant_comments
            };
            
            // Generate ADL number using Patient method
            const adl_no = Patient.generateADLNo();
            complexCaseData.adl_no = adl_no;
            
            // Create ADL file with all complex case data using ADLFile.create()
            adlFile = await ADLFile.create(complexCaseData);
            adlFileCreated = true;
            
            // Update patient record to mark as having ADL file
            await patient.update({
              adl_no: adl_no,
              has_adl_file: true,
              file_status: 'created',
              case_complexity: 'complex'
            });
            
            // Log the file movement
            await adlFile.logMovement('created', 'Doctor Office', 'Record Room', req.user.id, 'Initial ADL file creation for complex case');
            
            adlCreationMessage = 'ADL file created and registered successfully for complex case with all comprehensive data';
            
            // Update proforma with adl_file_id for bidirectional linking
            await proforma.update({ 
              requires_adl_file: true,
              adl_file_id: adlFile.id 
            });
          }
          
          // Ensure requires_adl_file is set to true for complex cases
          if (!proforma.requires_adl_file) {
            await proforma.update({ requires_adl_file: true });
          }
          
          // If ADL file exists but proforma doesn't have adl_file_id, update it
          if (adlFile && !proforma.adl_file_id) {
            await proforma.update({ adl_file_id: adlFile.id });
          }
        } catch (adlError) {
          console.error('Failed to create/register ADL file:', adlError);
          // If patient already has ADL file, that's okay - just log it
          if (adlError.message && adlError.message.includes('already has an ADL file')) {
            adlCreationMessage = 'Patient already has an ADL file (linked to existing file)';
            try {
              const existingPatient = await Patient.findById(proforma.patient_id);
              const existingFiles = await existingPatient.getADLFiles();
              if (existingFiles && existingFiles.length > 0) {
                adlFile = existingFiles[0];
                // Try to link it anyway
                await proforma.update({ 
                  requires_adl_file: true,
                  adl_file_id: adlFile.id 
                });
              }
            } catch (linkError) {
              console.error('Failed to link existing ADL file:', linkError);
            }
          } else {
            adlCreationMessage = `Failed to create/register ADL file: ${adlError.message}`;
          }
        }
      }

      // Handle prescriptions if provided
      let createdPrescriptions = [];
      if (proformaData.prescriptions && Array.isArray(proformaData.prescriptions) && proformaData.prescriptions.length > 0) {
        try {
          const prescriptionsWithProformaId = proformaData.prescriptions.map(prescription => ({
            ...prescription,
            clinical_proforma_id: proforma.id
          }));
          createdPrescriptions = await Prescription.createBulk(prescriptionsWithProformaId);
        } catch (prescriptionError) {
          console.error('Failed to create prescriptions:', prescriptionError);
          // Don't fail the entire request, just log the error
        }
      }

      // Refresh proforma to get latest data including adl_file_id
      const updatedProforma = await ClinicalProforma.findById(proforma.id);

      res.status(201).json({
        success: true,
        message: 'Clinical proforma created successfully',
        data: {
          proforma: updatedProforma ? updatedProforma.toJSON() : proforma.toJSON(),
          adl_file: adlFile ? {
            id: adlFile.id,
            adl_no: adlFile.adl_no,
            created: adlFileCreated,
            message: adlCreationMessage
          } : null,
          prescriptions: createdPrescriptions.length > 0 ? {
            count: createdPrescriptions.length,
            prescriptions: createdPrescriptions.map(p => p.toJSON())
          } : null
        }
      });
    } catch (error) {
      console.error('Clinical proforma creation error:', error);
      
      if (error.message === 'Patient not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create clinical proforma',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get all clinical proforma with pagination and filters
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

      // Extract prescriptions from updateData if present
      const { prescriptions, ...proformaUpdateData } = req.body;
      
      // Check if this is a complex case and update ADL file if needed
      const isComplexCase = proformaUpdateData.doctor_decision === 'complex_case' || proforma.doctor_decision === 'complex_case';
      let adlFileUpdated = false;
      let adlUpdateMessage = null;

      if (isComplexCase) {
        try {
          // Find or create ADL file for this complex case
          let adlFile = null;
          
          if (proforma.adl_file_id) {
            // ADL file already exists, update it
            adlFile = await ADLFile.findById(proforma.adl_file_id);
          } else {
            // Check if patient has an ADL file
            const patient = await Patient.findById(proforma.patient_id);
            if (patient && patient.has_adl_file) {
              const existingFiles = await patient.getADLFiles();
              if (existingFiles && existingFiles.length > 0) {
                adlFile = existingFiles[0];
                // Link this proforma to the existing ADL file
                await proforma.update({ adl_file_id: adlFile.id });
              }
            }
            
            // If still no ADL file, create one (this should not normally happen, but handle it)
            if (!adlFile) {
              const adl_no = Patient.generateADLNo();
              const complexCaseData = {
                patient_id: proforma.patient_id,
                adl_no: adl_no,
                created_by: req.user.id,
                clinical_proforma_id: proforma.id,
                file_status: 'created',
                file_created_date: proforma.visit_date || new Date(),
                total_visits: 1
              };
              
              // Extract complex case fields from updateData
              Object.keys(proformaUpdateData).forEach(key => {
                if (key.startsWith('history_') || key.startsWith('informants') || 
                    key.startsWith('complaints_') || key.startsWith('past_history_') ||
                    key.startsWith('family_history_') || key.startsWith('diagnostic_formulation_') ||
                    key.startsWith('premorbid_personality_') || key.startsWith('physical_') ||
                    key.startsWith('mse_') || key.startsWith('education_') || 
                    key.startsWith('occupation_') || key.startsWith('sexual_') ||
                    key.startsWith('religion_') || key.startsWith('living_') ||
                    key.startsWith('home_situation_') || key.startsWith('personal_') ||
                    key.startsWith('development_') || key === 'provisional_diagnosis' ||
                    key === 'treatment_plan' || key === 'consultant_comments') {
                  complexCaseData[key] = proformaUpdateData[key];
                }
              });
              
              adlFile = await ADLFile.create(complexCaseData);
              await patient.update({
                adl_no: adl_no,
                has_adl_file: true,
                file_status: 'created',
                case_complexity: 'complex'
              });
              await adlFile.logMovement('created', 'Doctor Office', 'Record Room', req.user.id, 'ADL file created during proforma update');
              adlUpdateMessage = 'ADL file created during proforma update';
            }
          }
          
          // If ADL file exists, update it with complex case data
          if (adlFile) {
            const adlUpdateData = {};
            
            // Extract complex case fields from proformaUpdateData
            Object.keys(proformaUpdateData).forEach(key => {
              if (key.startsWith('history_') || key.startsWith('informants') || 
                  key.startsWith('complaints_') || key.startsWith('past_history_') ||
                  key.startsWith('family_history_') || key.startsWith('diagnostic_formulation_') ||
                  key.startsWith('premorbid_personality_') || key.startsWith('physical_') ||
                  key.startsWith('mse_') || key.startsWith('education_') || 
                  key.startsWith('occupation_') || key.startsWith('sexual_') ||
                  key.startsWith('religion_') || key.startsWith('living_') ||
                  key.startsWith('home_situation_') || key.startsWith('personal_') ||
                  key.startsWith('development_') || key === 'provisional_diagnosis' ||
                  key === 'treatment_plan' || key === 'consultant_comments') {
                adlUpdateData[key] = proformaUpdateData[key];
                // Remove from proformaUpdateData so it doesn't get saved to clinical_proforma
                delete proformaUpdateData[key];
              }
            });
            
            if (Object.keys(adlUpdateData).length > 0) {
              await adlFile.update(adlUpdateData);
              adlFileUpdated = true;
              adlUpdateMessage = adlUpdateMessage || 'ADL file updated with complex case data';
            }
          }
        } catch (adlError) {
          console.error('Failed to update ADL file:', adlError);
          adlUpdateMessage = `ADL file update failed: ${adlError.message}`;
          // Continue with proforma update even if ADL update fails
        }
      }
      
      // Update the clinical proforma (excluding complex case fields which are now in ADL)
      await proforma.update(proformaUpdateData);

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

      // Refresh proforma to get latest data
      const updatedProforma = await ClinicalProforma.findById(proforma.id);

      res.status(200).json({
        success: true,
        message: 'Clinical proforma updated successfully',
        data: {
          proforma: updatedProforma ? updatedProforma.toJSON() : proforma.toJSON(),
          prescriptions: updatedPrescriptions.length > 0 ? {
            count: updatedPrescriptions.length,
            prescriptions: updatedPrescriptions.map(p => p.toJSON())
          } : null,
          adl_file: adlFileUpdated ? {
            updated: true,
            message: adlUpdateMessage
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
