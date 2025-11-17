const Patient = require('../models/Patient');
const PatientVisit = require('../models/PatientVisit');
const ClinicalProforma = require('../models/ClinicalProforma');
const ADLFile = require('../models/ADLFile');

class PatientController {

  static async getPatientStats(req, res) {
    try {
      const stats = await Patient.getStats();

      res.json({
        success: true,
        data: {
          stats
        }
      });
    } catch (error) {
      console.error('Get patient stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  static async createPatient(req, res) {
    try {
      const { name, sex, age, assigned_room, cr_no, psy_no, patient_id } = req.body;

      // If patient_id is provided, this is a visit for an existing patient
      if (patient_id) {
        const existingPatient = await Patient.findById(patient_id);
        if (!existingPatient) {
          return res.status(404).json({
            success: false,
            message: 'Patient not found'
          });
        }

        // Create a visit record for the existing patient
        const visit = await PatientVisit.assignPatient({
          patient_id: parseInt(patient_id),
          assigned_doctor_id: existingPatient.assigned_doctor_id || null,
          room_no: existingPatient.assigned_room || assigned_room || null,
          visit_date: new Date().toISOString().slice(0, 10),
          visit_type: 'follow_up',
          notes: `Visit created via Existing Patient flow`
        });

        return res.status(201).json({
          success: true,
          message: 'Visit record created successfully',
          data: {
            patient: existingPatient.toJSON(),
            visit: visit
          }
        });
      }

      // Create new patient
      const patient = await Patient.create({
        name,
        sex,
        age,
        assigned_room,
        cr_no,
        psy_no
      });

      res.status(201).json({
        success: true,
        message: 'Patient registered successfully',
        data: {
          patient: patient.toJSON()
        }
      });
    } catch (error) {
      console.error('Patient creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register patient',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  // Comprehensive patient registration (includes all patient information for MWO)
  static async registerPatientWithDetails(req, res) {
    try {
      console.log('[patientController.registerPatientWithDetails] Received request body with keys:', Object.keys(req.body).length);
      console.log('[patientController.registerPatientWithDetails] Sample fields:', {
        name: req.body.name,
        sex: req.body.sex,
        age: req.body.age,
        mobile_no: req.body.mobile_no,
        father_name: req.body.father_name,
        education: req.body.education,
        income: req.body.income,
        distance_from_hospital: req.body.distance_from_hospital
      });

      // Create patient record with all information
      // Pass req.body directly to Patient.create() - it handles all field mapping
      const patient = await Patient.create({
        ...req.body,
        filled_by: req.user.id
      });

      // Fetch related data to populate joined fields in response
      let assignedDoctorName = null;
      let assignedDoctorRole = null;
      let filledByName = null;

      // Fetch assigned doctor info if assigned_doctor_id exists
      if (patient.assigned_doctor_id) {
        try {
          const db = require('../config/database');
          const doctorResult = await db.query(
            'SELECT name, role FROM users WHERE id = $1',
            [patient.assigned_doctor_id]
          );
          if (doctorResult.rows.length > 0) {
            assignedDoctorName = doctorResult.rows[0].name;
            assignedDoctorRole = doctorResult.rows[0].role;
          }
        } catch (err) {
          console.error('[patientController] Error fetching assigned doctor:', err);
        }
      }

      // Fetch filled_by user info (MWO who registered the patient)
      if (patient.filled_by) {
        try {
          const db = require('../config/database');
          const filledByResult = await db.query(
            'SELECT name FROM users WHERE id = $1',
            [patient.filled_by]
          );
          if (filledByResult.rows.length > 0) {
            filledByName = filledByResult.rows[0].name;
          }
        } catch (err) {
          console.error('[patientController] Error fetching filled_by user:', err);
        }
      }

      // Build response with populated related fields
      const patientResponse = {
        ...patient.toJSON(),
        assigned_doctor_name: assignedDoctorName,
        assigned_doctor_role: assignedDoctorRole,
        filled_by_name: filledByName
      };

      console.log('[patientController.registerPatientWithDetails] Patient created successfully. ID:', patient.id);
  
      res.status(201).json({
        success: true,
        message: 'Patient registered successfully with complete information',
        data: {
          patient: patientResponse
        }
      });
    } catch (error) {
      console.error('Comprehensive patient registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register patient with details',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get all patients with pagination and filters
  static async getAllPatients(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};

      // Check if search parameter is provided
      if (req.query.search && req.query.search.trim().length >= 2) {
        const result = await Patient.search(req.query.search.trim(), page, limit);
        return res.json({
          success: true,
          data: result
        });
      }

      // Apply filters
      if (req.query.sex) filters.sex = req.query.sex;
      // if (req.query.case_complexity) filters.case_complexity = req.query.case_complexity;
      if (req.query.has_adl_file !== undefined) filters.has_adl_file = req.query.has_adl_file === 'true';
      if (req.query.file_status) filters.file_status = req.query.file_status;
      if (req.query.assigned_room) filters.assigned_room = req.query.assigned_room;

      const result = await Patient.findAll(page, limit, filters);

      // Enrich with latest assignment info
      try {
        const { createClient } = require('@supabase/supabase-js');
        require('dotenv').config();
        
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        
        const patientIds = (result.patients || []).map(p => p.id);
        if (patientIds.length > 0) {
          const today = new Date().toISOString().slice(0, 10);
          
          console.log(`[getAllPatients] Fetching visits for ${patientIds.length} patients (sample IDs: ${patientIds.slice(0, 3).join(', ')})`);
          
          // Fetch visits with assigned_doctor info
          // Try with original IDs first (Supabase handles type conversion)
          let visits = [];
          let visitsToday = [];
          let visitsError = null;
          let visitsTodayError = null;
          
          try {
            const visitsResult = await supabaseAdmin
              .from('patient_visits')
              .select('patient_id, visit_date, assigned_doctor_id')
              .in('patient_id', patientIds)
              .order('visit_date', { ascending: false });
            
            visits = visitsResult.data || [];
            visitsError = visitsResult.error;
            
            const visitsTodayResult = await supabaseAdmin
              .from('patient_visits')
              .select('patient_id, visit_date, assigned_doctor_id')
              .in('patient_id', patientIds)
              .eq('visit_date', today);
            
            visitsToday = visitsTodayResult.data || [];
            visitsTodayError = visitsTodayResult.error;
          } catch (queryErr) {
            console.error('[getAllPatients] Error in Supabase query:', queryErr);
            // If query fails, try with text comparison as fallback
            try {
              const patientIdStrings = patientIds.map(id => String(id));
              const visitsResult = await supabaseAdmin
                .from('patient_visits')
                .select('patient_id, visit_date, assigned_doctor_id')
                .in('patient_id', patientIdStrings)
                .order('visit_date', { ascending: false });
              
              visits = visitsResult.data || [];
              visitsError = visitsResult.error;
            } catch (fallbackErr) {
              console.error('[getAllPatients] Fallback query also failed:', fallbackErr);
            }
          }
          
          console.log(`[getAllPatients] Found ${visits?.length || 0} visits, ${visitsToday?.length || 0} visits today`);

          if (visitsError) {
            console.error('[getAllPatients] Error fetching visits:', visitsError);
          }

          if (!visitsError && Array.isArray(visits)) {
            // Get unique assigned_doctor IDs
            const assignedDoctorIds = [...new Set(
              visits
                .map(v => v.assigned_doctor_id)
                .filter(id => id !== null && id !== undefined)
            )];

            // Fetch doctor information
            let doctorsMap = {};
            if (assignedDoctorIds.length > 0) {
              const { data: doctors, error: doctorsError } = await supabaseAdmin
                .from('users')
                .select('id, name, role')
                .in('id', assignedDoctorIds);

              if (!doctorsError && doctors) {
                doctorsMap = doctors.reduce((acc, doc) => {
                  acc[doc.id] = doc;
                  return acc;
                }, {});
              } else if (doctorsError) {
                console.error('[getAllPatients] Error fetching doctors:', doctorsError);
              }
            }

            // Group visits by patient_id (get latest)
            // Use string comparison to handle both UUID and integer IDs
            const latestByPatient = new Map();
            for (const v of visits) {
              const visitPatientId = String(v.patient_id);
              if (!latestByPatient.has(visitPatientId)) {
                latestByPatient.set(visitPatientId, v);
              }
            }
            
            const patientsWithVisitToday = new Set();
            if (!visitsTodayError && Array.isArray(visitsToday)) {
              visitsToday.forEach(v => patientsWithVisitToday.add(String(v.patient_id)));
            }
            
            result.patients = result.patients.map(p => {
              const patientIdStr = String(p.id);
              const latest = latestByPatient.get(patientIdStr);
              const hasVisitToday = patientsWithVisitToday.has(patientIdStr);
              const visitInfo = hasVisitToday && visitsToday?.find(v => String(v.patient_id) === patientIdStr) 
                ? visitsToday.find(v => String(v.patient_id) === patientIdStr)
                : latest;
              
              const doctorId = visitInfo?.assigned_doctor_id || latest?.assigned_doctor_id;
              const doctor = doctorId ? doctorsMap[doctorId] : null;
              
              return {
                ...p,
                assigned_doctor_id: doctorId || null,
                assigned_doctor_name: doctor?.name || null,
                assigned_doctor_role: doctor?.role || null,
                last_assigned_date: latest?.visit_date || null,
                visit_date: visitInfo?.visit_date || null,
                has_visit_today: hasVisitToday,
              };
            });
          } else {
            // If no visits found, ensure assigned_doctor fields are null
            result.patients = result.patients.map(p => ({
              ...p,
              assigned_doctor_id: p.assigned_doctor_id || null,
              assigned_doctor_name: p.assigned_doctor_name || null,
              assigned_doctor_role: p.assigned_doctor_role || null,
              has_visit_today: false,
            }));
          }
        }
      } catch (err) {
        console.error('[getAllPatients] Error enriching patient data:', err);
        // Ensure fields are set to null if enrichment fails
        if (result.patients) {
          result.patients = result.patients.map(p => ({
            ...p,
            assigned_doctor_id: p.assigned_doctor_id || null,
            assigned_doctor_name: p.assigned_doctor_name || null,
            assigned_doctor_role: p.assigned_doctor_role || null,
          }));
        }
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all patients error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patients',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Search patients
  static async searchPatients(req, res) {
    try {
      const { q } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search term must be at least 2 characters long'
        });
      }

      const result = await Patient.search(q.trim(), page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Search patients error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search patients',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get patient by ID (supports both UUID and integer)
  static async getPatientById(req, res) {
    try {
      const { id } = req.params;
      
      // Pass ID as-is to Patient.findById, which handles both UUID and integer
      console.log(`[getPatientById] Fetching patient with ID: ${id} (type: ${typeof id})`);
      
      const patient = await Patient.findById(id);
  console.log(">>>>>>>",patient)
      if (!patient) {
        console.log(`[getPatientById] Patient with ID ${id} not found`);
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      // Verify ID matches (handle both UUID and integer comparison)
      const requestedId = id;
      const returnedId = patient.id;
      const idMatches = (typeof returnedId === 'string' && returnedId.includes('-'))
        ? String(returnedId) === String(requestedId) // UUID comparison
        : parseInt(returnedId, 10) === parseInt(requestedId, 10); // Integer comparison

      if (!idMatches) {
        console.error(`[getPatientById] CRITICAL: ID mismatch! Requested: ${requestedId}, Returned: ${returnedId}`);
        return res.status(500).json({
          success: false,
          message: 'Data integrity error: Patient ID mismatch'
        });
      }

      console.log(`[getPatientById] Successfully fetched patient ID: ${patient.id}, Name: ${patient.name}`);

      res.json({
        success: true,
        data: {
          patient: patient.toJSON()
        }
      });
    } catch (error) {
      console.error('[getPatientById] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get patient by CR number
  static async getPatientByCRNo(req, res) {
    try {
      const { cr_no } = req.params;
      const patient = await Patient.findByCRNo(cr_no);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        data: {
          patient: patient.toJSON()
        }
      });
    } catch (error) {
      console.error('Get patient by CR number error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get patient by PSY number
  static async getPatientByPSYNo(req, res) {
    try {
      const { psy_no } = req.params;
      const patient = await Patient.findByPSYNo(psy_no);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        data: {
          patient: patient.toJSON()
        }
      });
    } catch (error) {
      console.error('Get patient by PSY number error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get patient by ADL number
  static async getPatientByADLNo(req, res) {
    try {
      const { adl_no } = req.params;
      const patient = await Patient.findByADLNo(adl_no);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        data: {
          patient: patient.toJSON()
        }
      });
    } catch (error) {
      console.error('Get patient by ADL number error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Update patient
  // static async updatePatient(req, res) {
  //   try {
  //     const { id } = req.params;
  //     const patient = await Patient.findById(id);

  //     if (!patient) {
  //       return res.status(404).json({
  //         success: false,
  //         message: 'Patient not found'
  //       });
  //     }

  //     // Extract all fields from request body
  //     const updateData = {};
      
  //     // List of allowed update fields (matching new form structure)
  //     const allowedFields = [
  //       'name', 'sex', 'age', 'date', 'mobile_no', 'category', 'father_name',
  //       'department', 'unit_consit', 'room_no', 'serial_no', 'file_no', 'unit_days',
  //       'contact_number', 'seen_in_walk_in_on', 'worked_up_on', 'age_group',
  //       'marital_status', 'year_of_marriage', 'no_of_children_male', 'no_of_children_female',
  //       'occupation', 'education', 'locality', 'income', 'religion', 'family_type',
  //       'head_name', 'head_age', 'head_relationship', 'head_education', 'head_occupation', 'head_income',
  //       'distance_from_hospital', 'mobility', 'referred_by',
  //       'address_line', 'country', 'state', 'district', 'city', 'pin_code',
  //       'assigned_doctor_id', 'assigned_room', 'file_status', 'has_adl_file',
  //       'special_clinic_no'
  //     ];

  //     // Build update data object
  //     for (const field of allowedFields) {
  //       if (req.body[field] !== undefined) {
  //         updateData[field] = req.body[field];
  //       }
  //     }

  //     console.log('Updating patient with data:', updateData);

  //     await patient.update(updateData);

  //     // Fetch updated patient data with joins
  //     const updatedPatient = await Patient.findById(id);

  //     res.json({
  //       success: true,
  //       message: 'Patient updated successfully',
  //       data: {
  //         patient: updatedPatient.toJSON()
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Update patient error:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Failed to update patient',
  //       error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  //     });
  //   }
  // }


  static async updatePatient(req, res) {
    try {
      const { id } = req.params;
  
      // Find the patient by ID
      const patient = await Patient.findById(id);
  
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }
  
      // Allowed fields for update (matching Patient model's update method and DB schema)
      const allowedFields = [
        'name',
        'sex',
        'age',
        'date',
        'contact_number',
        'category',
        'father_name',
        'department',
        'unit_consit',
        'room_no',
        'serial_no',
        'file_no',
        'unit_days',
        'seen_in_walk_in_on',
        'worked_up_on',
        'special_clinic_no',
        'age_group',
        'marital_status',
        'year_of_marriage',
        'no_of_children_male',
        'no_of_children_female',
        'occupation',
        'education',
        'locality',
        'income',
        'religion',
        'family_type',
        'head_name',
        'head_age',
        'head_relationship',
        'head_education',
        'head_occupation',
        'head_income',
        'distance_from_hospital',
        'mobility',
        'referred_by',
        'address_line',
        'country',
        'state',
        'district',
        'city',
        'pin_code',
        'assigned_room',
        'assigned_doctor_id',
        'assigned_doctor_name',
        'has_adl_file',
        'file_status'
      ];
  
      // Build update data object only with defined fields
      const updateData = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          // Handle assigned_doctor_id - it's UUID, keep as string if provided
          if (field === 'assigned_doctor_id' && req.body[field] !== null && req.body[field] !== '') {
            // UUIDs should be strings
            updateData[field] = String(req.body[field]);
            
            // If assigned_doctor_id is provided but assigned_doctor_name is not, fetch it
            if (!req.body.assigned_doctor_name && updateData[field]) {
              try {
                const db = require('../config/database');
                const doctorResult = await db.query(
                  'SELECT name FROM users WHERE id = $1',
                  [updateData[field]]
                );
                if (doctorResult.rows.length > 0) {
                  updateData.assigned_doctor_name = doctorResult.rows[0].name;
                }
              } catch (err) {
                console.warn('[updatePatient] Could not fetch doctor name:', err.message);
              }
            }
          } else {
            updateData[field] = req.body[field];
          }
        }
      }
  
      console.log('Updating patient with data:', updateData);
  
      // Perform the update
      await patient.update(updateData);
  
      // Re-fetch updated patient (findById already includes doctor info from patient_visits)
      const updatedPatient = await Patient.findById(id);
  
      if (!updatedPatient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found after update',
        });
      }
  
      res.json({
        success: true,
        message: 'Patient updated successfully',
        data: { patient: updatedPatient.toJSON() },
      });
    } catch (error) {
      console.error('Update patient error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update patient',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal server error',
      });
    }
  }
  
  
  
  // Get patient's complete profile
  static async getPatientProfile(req, res) {
    try {
      const { id } = req.params;
      const patient = await Patient.findById(id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const [visitHistory, clinicalRecords, adlFiles] = await Promise.all([
        patient.getVisitHistory(),
        patient.getClinicalRecords(),
        patient.getADLFiles()
      ]);

      res.json({
        success: true,
        data: {
          patient: patient.toJSON(),
          visitHistory,
          clinicalRecords,
          adlFiles
        }
      });
    } catch (error) {
      console.error('Get patient profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get patient's visit history
  static async getPatientVisitHistory(req, res) {
    try {
      const { id } = req.params;
      const patient = await Patient.findById(id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const visitHistory = await patient.getVisitHistory();

      res.json({
        success: true,
        data: {
          patient: patient.toJSON(),
          visitHistory
        }
      });
    } catch (error) {
      console.error('Get patient visit history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient visit history',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get patient's clinical records
  static async getPatientClinicalRecords(req, res) {
    try {
      const { id } = req.params;
      const patient = await Patient.findById(id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const clinicalRecords = await patient.getClinicalRecords();

      res.json({
        success: true,
        data: {
          patient: patient.toJSON(),
          clinicalRecords
        }
      });
    } catch (error) {
      console.error('Get patient clinical records error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient clinical records',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get patient's ADL files
  static async getPatientADLFiles(req, res) {
    try {
      const { id } = req.params;
      const patient = await Patient.findById(id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const adlFiles = await patient.getADLFiles();

      res.json({
        success: true,
        data: {
          patient: patient.toJSON(),
          adlFiles
        }
      });
    } catch (error) {
      console.error('Get patient ADL files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient ADL files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Delete patient and all related records
  // static async deletePatient(req, res) {
  //   try {
  //     const { id } = req.params;

  //     const patientId = id;
  //     if (isNaN(patientId) || patientId <= 0) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Invalid patient ID'
  //       });
  //     }

  //     console.log(`[deletePatient] Attempting to delete patient ID: ${patientId}`);

  //     const patient = await Patient.findById(patientId);

  //     if (!patient) {
  //       console.error(`[deletePatient] Patient with ID ${patientId} not found`);
  //       return res.status(404).json({
  //         success: false,
  //         message: 'Patient not found'
  //       });
  //     }

  //     console.log(`[deletePatient] Patient found: ${patient.name} (ID: ${patientId})`);

  //     await patient.delete();

  //     console.log(`[deletePatient] Successfully deleted patient ID: ${patientId}`);

  //     res.json({
  //       success: true,
  //       message: 'Patient and all related records deleted successfully',
  //       deletedPatientId: patientId
  //     });

  //   } catch (error) {
  //     console.error('[deletePatient] Error:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Failed to delete patient and related records',
  //       error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  //     });
  //   }
  // }
  // static async deletePatient(req, res) {
  //   try {
  //     const { id } = req.params;
  
  //     // UUID validation (string, not number)
  //     if (!id || typeof id !== "string" || id.length < 36) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Invalid patient ID'
  //       });
  //     }
  
  //     console.log(`[deletePatient] Attempting to delete patient ID: ${id}`);
  
  //     const patient = await Patient.findOne({ where: { id } });
  
  //     if (!patient) {
  //       console.error(`[deletePatient] Patient with ID ${id} not found`);
  //       return res.status(404).json({
  //         success: false,
  //         message: 'Patient not found'
  //       });
  //     }
  
  //     console.log(`[deletePatient] Patient found: ${patient.name} (ID: ${id})`);
  
  //     await patient.destroy(); // Sequelize / ORM delete
  
  //     console.log(`[deletePatient] Successfully deleted patient ID: ${id}`);
  
  //     return res.json({
  //       success: true,
  //       message: 'Patient and all related records deleted successfully',
  //       deletedPatientId: id
  //     });
  
  //   } catch (error) {
  //     console.error('[deletePatient] Error:', error);
  //     return res.status(500).json({
  //       success: false,
  //       message: 'Failed to delete patient and related records'
  //     });
  //   }
  // }


  // static async deletePatient(req, res) {
  //   try {
  //     const { id } = req.params;
  
  //     // UUID validation
  //     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  //     if (!uuidRegex.test(id)) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Invalid patient ID'
  //       });
  //     }
  
  //     console.log(`[deletePatient] Attempting to delete patient ID: ${id}`);
  
  //     // UUID lookup — correct method
  //     const patient = await Patient.findOne({ where: { id } });
  
  //     if (!patient) {
  //       return res.status(404).json({
  //         success: false,
  //         message: 'Patient not found'
  //       });
  //     }
  
  //     await patient.destroy();
  
  //     return res.status(200).json({
  //       success: true,
  //       message: 'Patient and all related records deleted successfully',
  //       deletedPatientId: id
  //     });
  
  //   } catch (error) {
  //     console.error('[deletePatient] Error:', error);
  //     return res.status(500).json({
  //       success: false,
  //       message: 'Failed to delete patient and related records'
  //     });
  //   }
  // }
  

  static async deletePatient(req, res) {
    try {
      const { id } = req.params;
  
      // Validate UUID
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
      if (!uuidRegex.test(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid patient ID",
        });
      }
  
      console.log(`[deletePatient] Attempting to delete patient ID: ${id}`);
  
      const { supabaseAdmin } = require('../config/database');
      
      // 1️⃣ Check if patient exists in registered_patient table
      const { data: patientData, error: patientCheckError } = await supabaseAdmin
        .from('registered_patient')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      
      if (patientCheckError) {
        console.error(`[deletePatient] Error checking patient: ${patientCheckError.message}`);
        return res.status(500).json({
          success: false,
          message: "Failed to check patient existence",
          error: process.env.NODE_ENV === 'development' ? patientCheckError.message : 'Internal server error'
        });
      }
      
      if (!patientData) {
        console.log(`[deletePatient] Patient with ID ${id} not found in registered_patient`);
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }
      
      console.log(`[deletePatient] Patient found in registered_patient table`);
      
      // 2️⃣ Check if patient_id exists in clinical_proforma table
      // Handle both UUID and INT types by trying UUID first, then text comparison
      let clinicalProformas = [];
      let clinicalCheckError = null;
      
      // Try direct UUID comparison first
      const { data: clinicalData1, error: clinicalError1 } = await supabaseAdmin
        .from('clinical_proforma')
        .select('id')
        .eq('patient_id', id);
      
      if (!clinicalError1 && clinicalData1) {
        clinicalProformas = clinicalData1;
      } else {
        // If UUID comparison fails, try text comparison (handles INT columns)
        const { data: clinicalData2, error: clinicalError2 } = await supabaseAdmin
          .from('clinical_proforma')
          .select('id, patient_id');
        
        if (!clinicalError2 && clinicalData2) {
          // Filter by comparing as strings
          clinicalProformas = clinicalData2.filter(cp => String(cp.patient_id) === String(id));
          clinicalProformas = clinicalProformas.map(cp => ({ id: cp.id }));
        } else {
          clinicalCheckError = clinicalError2 || clinicalError1;
        }
      }
      
      if (clinicalCheckError) {
        console.warn(`[deletePatient] Error checking clinical_proforma: ${clinicalCheckError.message}`);
      } else {
        console.log(`[deletePatient] Found ${clinicalProformas?.length || 0} clinical proforma record(s) for patient ${id}`);
      }
      
      // 3️⃣ Check if patient_id exists in adl_files table
      // Handle both UUID and INT types
      let adlFiles = [];
      let adlCheckError = null;
      
      // Try direct UUID comparison first
      const { data: adlData1, error: adlError1 } = await supabaseAdmin
        .from('adl_files')
        .select('id')
        .eq('patient_id', id);
      
      if (!adlError1 && adlData1) {
        adlFiles = adlData1;
      } else {
        // If UUID comparison fails, try text comparison (handles INT columns)
        const { data: adlData2, error: adlError2 } = await supabaseAdmin
          .from('adl_files')
          .select('id, patient_id');
        
        if (!adlError2 && adlData2) {
          // Filter by comparing as strings
          adlFiles = adlData2.filter(af => String(af.patient_id) === String(id));
          adlFiles = adlFiles.map(af => ({ id: af.id }));
        } else {
          adlCheckError = adlError2 || adlError1;
        }
      }
      
      if (adlCheckError) {
        console.warn(`[deletePatient] Error checking adl_files: ${adlCheckError.message}`);
      } else {
        console.log(`[deletePatient] Found ${adlFiles?.length || 0} ADL file record(s) for patient ${id}`);
      }
      
      // 4️⃣ Delete related records first (in correct order to avoid foreign key constraints)
      
      // Step 4a: Delete prescriptions linked to clinical proformas
      if (clinicalProformas && clinicalProformas.length > 0) {
        const clinicalProformaIds = clinicalProformas.map(cp => cp.id);
        const { error: prescriptionsError } = await supabaseAdmin
          .from('prescriptions')
          .delete()
          .in('clinical_proforma_id', clinicalProformaIds);
        
        if (prescriptionsError) {
          console.warn(`[deletePatient] Error deleting prescriptions: ${prescriptionsError.message}`);
        } else {
          console.log(`[deletePatient] Deleted prescriptions for clinical proformas`);
        }
      }
      
      // Step 4b: Delete file movements linked to ADL files
      if (adlFiles && adlFiles.length > 0) {
        const adlFileIds = adlFiles.map(af => af.id);
        
        // Delete file movements by adl_file_id
        const { error: fileMovementsError1 } = await supabaseAdmin
          .from('file_movements')
          .delete()
          .in('adl_file_id', adlFileIds);
        
        if (fileMovementsError1) {
          console.warn(`[deletePatient] Error deleting file movements by adl_file_id: ${fileMovementsError1.message}`);
        }
        
        // Delete file movements by patient_id
        const { error: fileMovementsError2 } = await supabaseAdmin
          .from('file_movements')
          .delete()
          .eq('patient_id', id);
        
        if (fileMovementsError2) {
          console.warn(`[deletePatient] Error deleting file movements by patient_id: ${fileMovementsError2.message}`);
        } else {
          console.log(`[deletePatient] Deleted file movements`);
        }
      }
      
      // Step 4c: Delete ADL files
      if (adlFiles && adlFiles.length > 0) {
        // Delete by IDs if direct patient_id comparison fails
        const adlFileIds = adlFiles.map(af => af.id);
        const { error: adlDeleteError } = await supabaseAdmin
          .from('adl_files')
          .delete()
          .in('id', adlFileIds);
        
        if (adlDeleteError) {
          // Fallback: try deleting by patient_id directly
          const { error: adlDeleteError2 } = await supabaseAdmin
            .from('adl_files')
            .delete()
            .eq('patient_id', id);
          
          if (adlDeleteError2) {
            console.error(`[deletePatient] Error deleting ADL files: ${adlDeleteError2.message}`);
            return res.status(500).json({
              success: false,
              message: "Failed to delete ADL files",
              error: process.env.NODE_ENV === 'development' ? adlDeleteError2.message : 'Internal server error'
            });
          }
        }
        console.log(`[deletePatient] Deleted ${adlFiles.length} ADL file(s)`);
      }
      
      // Step 4d: Delete clinical proformas
      if (clinicalProformas && clinicalProformas.length > 0) {
        // Delete by IDs if direct patient_id comparison fails
        const clinicalProformaIds = clinicalProformas.map(cp => cp.id);
        const { error: clinicalDeleteError } = await supabaseAdmin
          .from('clinical_proforma')
          .delete()
          .in('id', clinicalProformaIds);
        
        if (clinicalDeleteError) {
          // Fallback: try deleting by patient_id directly
          const { error: clinicalDeleteError2 } = await supabaseAdmin
            .from('clinical_proforma')
            .delete()
            .eq('patient_id', id);
          
          if (clinicalDeleteError2) {
            console.error(`[deletePatient] Error deleting clinical proformas: ${clinicalDeleteError2.message}`);
            return res.status(500).json({
              success: false,
              message: "Failed to delete clinical proformas",
              error: process.env.NODE_ENV === 'development' ? clinicalDeleteError2.message : 'Internal server error'
            });
          }
        }
        console.log(`[deletePatient] Deleted ${clinicalProformas.length} clinical proforma(s)`);
      }
      
      // Step 4e: Delete patient visits
      const { error: visitsError } = await supabaseAdmin
        .from('patient_visits')
        .delete()
        .eq('patient_id', id);
      
      if (visitsError) {
        console.warn(`[deletePatient] Error deleting patient visits: ${visitsError.message}`);
      } else {
        console.log(`[deletePatient] Deleted patient visits`);
      }
      
      // Step 4f: Delete outpatient records
      const { error: outpatientError } = await supabaseAdmin
        .from('outpatient_record')
        .delete()
        .eq('patient_id', id);
      
      if (outpatientError) {
        console.warn(`[deletePatient] Error deleting outpatient records: ${outpatientError.message}`);
      } else {
        console.log(`[deletePatient] Deleted outpatient records`);
      }
      
      // Step 5: Finally, delete the patient record itself
      const { error: patientDeleteError } = await supabaseAdmin
        .from('registered_patient')
        .delete()
        .eq('id', id);
      
      if (patientDeleteError) {
        console.error(`[deletePatient] Error deleting patient: ${patientDeleteError.message}`);
        return res.status(500).json({
          success: false,
          message: "Failed to delete patient record",
          error: process.env.NODE_ENV === 'development' ? patientDeleteError.message : 'Internal server error'
        });
      }
      
      console.log(`[deletePatient] Successfully deleted patient ID: ${id}`);
      
      return res.status(200).json({
        success: true,
        message: "Patient and all related records deleted successfully",
        deletedPatientId: id,
        deleted: {
          patient: true,
          clinicalProformas: clinicalProformas?.length || 0,
          adlFiles: adlFiles?.length || 0
        }
      });
  
    } catch (error) {
      console.error("[deletePatient] Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete patient and related records",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  
  // Assign patient to a doctor
  static async assignPatient(req, res) {
    try {
      const { patient_id, assigned_doctor_id, room_no, visit_date, notes } = req.body;

      if (!patient_id || !assigned_doctor_id) {
        return res.status(400).json({ 
          success: false, 
          message: 'patient_id and assigned_doctor are required' 
        });
      }

      // First, look up the patient to get the actual ID (handles both UUID and integer)
      const patient = await Patient.findById(patient_id);
      if (!patient) {
        return res.status(404).json({ 
          success: false, 
          message: 'Patient not found' 
        });
      }

      // Get the patient's actual ID (should be UUID after migration)
      const actualPatientId = patient.id;
      const actualDoctorId = String(assigned_doctor_id).trim();
      
      // Validate that patient_id is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isPatientUUID = typeof actualPatientId === 'string' && uuidRegex.test(actualPatientId);
      
      // Validate doctor_id - can be UUID or integer (support both for backward compatibility)
      const isDoctorUUID = typeof actualDoctorId === 'string' && uuidRegex.test(actualDoctorId);
      const isDoctorInteger = !isNaN(parseInt(actualDoctorId)) && parseInt(actualDoctorId) > 0 && !actualDoctorId.includes('-');
      const isValidDoctorId = isDoctorUUID || isDoctorInteger;
      
      if (!isValidDoctorId) {
        console.error(`[assignPatient] Doctor ID is not valid: ${actualDoctorId} (type: ${typeof actualDoctorId})`);
        return res.status(400).json({ 
          success: false, 
          message: `Invalid doctor ID format: The doctor ID "${actualDoctorId}" must be a valid UUID or integer.`,
          doctor_id_received: actualDoctorId,
          doctor_id_type: typeof actualDoctorId,
          error: process.env.NODE_ENV === 'development' ? 'Doctor ID must be a valid UUID or integer' : undefined
        });
      }
      
      if (!isPatientUUID) {
        console.error(`[assignPatient] Patient ID is not a valid UUID: ${actualPatientId} (type: ${typeof actualPatientId})`);
        return res.status(400).json({ 
          success: false, 
          message: `Invalid patient ID format: The patient record has ID "${actualPatientId}" which is not a valid UUID. The patient_visits table requires UUID format.`,
          patient_id_received: actualPatientId,
          patient_id_type: typeof actualPatientId,
          error: process.env.NODE_ENV === 'development' ? 'Patient ID must be a valid UUID format (e.g., "123e4567-e89b-12d3-a456-426614174000")' : undefined
        });
      }
      
      // Use the UUID directly for patient
      const patientIdForVisit = actualPatientId;
      // For doctor ID, keep as string if UUID, convert to integer if it's a number string
      // The database/PatientVisit will handle the type conversion
      const doctorIdForVisit = isDoctorUUID ? actualDoctorId : parseInt(actualDoctorId);
   
      const assignment = await PatientVisit.assignPatient({ 
        patient_id: patientIdForVisit, 
        assigned_doctor_id: doctorIdForVisit, 
        room_no, 
        visit_date, 
        notes 
      });

      return res.status(201).json({ 
        success: true, 
        message: 'Patient assigned successfully', 
        data: { assignment } 
      });
    } catch (error) {
      console.error('Assign patient error:', error);
      
      // Check if error is due to UUID/integer mismatch in patient_visits
      if (error.message && (
        error.message.includes('invalid input syntax for type integer') ||
        error.message.includes('invalid input syntax for type uuid') ||
        error.message.includes('Invalid patient_id format') ||
        error.message.includes('Database schema mismatch') ||
        error.message.includes('type mismatch')
      )) {
        const isUUIDError = error.message.includes('invalid input syntax for type uuid');
        
        // Determine the actual issue
        const isIntegerColumnError = error.message.includes('invalid input syntax for type integer');
        const isUUIDColumnError = error.message.includes('invalid input syntax for type uuid');
        
        return res.status(400).json({ 
          success: false, 
          message: isUUIDColumnError
            ? 'Invalid patient ID format: The patient_visits table now uses UUID for patient_id, but the provided patient ID is not a valid UUID. Please ensure the patient record exists and has a valid UUID identifier.'
            : isIntegerColumnError
            ? 'Database schema mismatch: The patient_visits.patient_id column is still INT type, but patient records use UUID. You MUST run the migration script to convert patient_visits.patient_id from INT to UUID.'
            : 'Database schema mismatch: Type mismatch between patient_visits table and patient records.',
          migration_required: isIntegerColumnError,
          migration_instructions: isIntegerColumnError ? '1. Go to Supabase Dashboard → SQL Editor\n2. Copy and paste the contents of Backend/database/migrate_patient_visits_simple.sql\n3. If you have existing visit data you want to keep, use migrate_patient_visits_to_uuid.sql instead\n4. Execute the SQL script\n5. Verify the migration worked' : undefined,
          migration_file: isIntegerColumnError ? 'Backend/database/migrate_patient_visits_simple.sql' : undefined,
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to assign patient', 
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
      });
    }
  }

  // Get today's patients
  static async getTodayPatients(req, res) {
    try {
      const { page = 1, limit = 10, date } = req.query;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const offset = (pageNum - 1) * limitNum;

      const targetDate = date ? new Date(date) : new Date();
      const dateString = targetDate.toISOString().split('T')[0];

      const db = require('../config/database');

      let query = `
        SELECT 
          p.*,
          u.name as filled_by_name,
          u.role as filled_by_role
        FROM registered_patient p
        LEFT JOIN users u ON p.filled_by = u.id
        WHERE DATE(p.created_at) = DATE($1)
      `;
      
      let countQuery = `
        SELECT COUNT(*) as total
        FROM registered_patient p
        WHERE DATE(p.created_at) = DATE($1)
      `;
      
      const params = [dateString];

      // If JR/SR, restrict to assigned doctor (from patient_visits)
      if (req.user?.role === 'JR' || req.user?.role === 'SR') {
        query += ` AND EXISTS (
          SELECT 1 FROM patient_visits pv 
          WHERE pv.patient_id = p.id 
          AND pv.assigned_doctor_id = $2
        )`;
        countQuery += ` AND EXISTS (
          SELECT 1 FROM patient_visits pv 
          WHERE pv.patient_id = p.id 
          AND pv.assigned_doctor_id = $2
        )`;
        params.push(req.user.id);
      }
      
      query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      const queryParams = [...params, limitNum, offset];

      const [patientsResult, countResult] = await Promise.all([
        db.query(query, queryParams),
        db.query(countQuery, params)
      ]);

      const patients = patientsResult.rows.map(row => new Patient(row).toJSON());
      const total = parseInt(countResult.rows[0].total, 10);

      res.status(200).json({
        success: true,
        message: `Patients registered on ${dateString}`,
        data: {
          patients,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          },
          date: dateString
        }
      });
    } catch (error) {
      console.error('Get today patients error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch today\'s patients',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = PatientController;