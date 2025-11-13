// const Patient = require('../models/Patient');
// const PatientVisit = require('../models/PatientVisit');

// const ClinicalProforma = require('../models/ClinicalProforma');
// const ADLFile = require('../models/ADLFile');

// class PatientController {

//   static async getPatientStats(req, res) {
//     try {
//       const stats = await Patient.getStats();

//       res.json({
//         success: true,
//         data: {
//           stats
//         }
//       });
//     } catch (error) {
//       console.error('Get patient stats error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get patient statistics',
//         error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//       });
//     }
//   }

  

//   static async createPatient(req, res) {
//     try {
//       const { name, sex, age, assigned_room, cr_no, psy_no, patient_id } = req.body;

//       // If patient_id is provided, this is a visit for an existing patient
//       if (patient_id) {
//         // Find the existing patient
//         const existingPatient = await Patient.findById(patient_id);
//         if (!existingPatient) {
//           return res.status(404).json({
//             success: false,
//             message: 'Patient not found'
//           });
//         }

//         // Create a visit record for the existing patient
//         const visit = await PatientVisit.assignPatient({
//           patient_id: parseInt(patient_id),
//           assigned_doctor: existingPatient.assigned_doctor_id || null,
//           room_no: existingPatient.assigned_room || assigned_room || null,
//           visit_date: new Date().toISOString().slice(0, 10),
//           visit_type: 'follow_up',
//           notes: `Visit created via Existing Patient flow`
//         });

//         // Return the existing patient with visit info
//         return res.status(201).json({
//           success: true,
//           message: 'Visit record created successfully',
//           data: {
//             patient: existingPatient.toJSON(),
//             visit: visit
//           }
//         });
//       }

//       // Otherwise, create a new patient
//       // Map old field names to new ones for backward compatibility
//       const patient = await Patient.create({
//         name,
//         sex,
//         age, // Support both age and actual_age (handled in Patient.create)
//         assigned_room,
//         cr_no,
//         psy_no
//       });

//       res.status(201).json({
//         success: true,
//         message: 'Patient registered successfully',
//         data: {
//           patient: patient.toJSON()
//         }
//       });
//     } catch (error) {
//       console.error('Patient creation error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to register patient',
//         error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//       });
//     }
//   }
  
//   // Comprehensive patient registration (includes all patient information for MWO)
//   static async registerPatientWithDetails(req, res) {
//     try {
//       // Log received data for debugging
//       console.log('[patientController.registerPatientWithDetails] Received request body with keys:', Object.keys(req.body).length);
//       console.log('[patientController.registerPatientWithDetails] Sample fields:', {
//         name: req.body.name,
//         sex: req.body.sex,
//         age: req.body.age,
//         age_group: req.body.age_group,
//         marital_status: req.body.marital_status,
//         occupation: req.body.occupation,
//         contact_number: req.body.contact_number,
//         mobile_no: req.body.mobile_no,
//         unit_days: req.body.unit_days,
//         year_of_marriage: req.body.year_of_marriage,
//         no_of_children_male: req.body.no_of_children_male,
//         no_of_children_female: req.body.no_of_children_female,
//         education: req.body.education,
//         income: req.body.income,
//         address_line: req.body.address_line,
//         city: req.body.city,
//         distance_from_hospital: req.body.distance_from_hospital
//       });

//       // Extract fields matching Patient.js create() method expectations
//       // The controller passes req.body directly to Patient.create(), which handles field mapping
//       // This destructuring is kept for logging/debugging purposes only
//       const {
//         // Registration & Quick Entry (frontend field names)
//         cr_no, date, name, mobile_no, age, sex, category, father_name,
//         department, unit_consit, room_no, serial_no, file_no, unit_days,
//         contact_number,
//         // Examination Details
//         seen_in_walk_in_on, worked_up_on, psy_no, special_clinic_no, age_group,
//         // Personal Information
//         marital_status, year_of_marriage, no_of_children_male, no_of_children_female,
//         // Occupation & Education
//         occupation, education, locality, income, religion, family_type,
//         // Head of Family
//         head_name, head_age, head_relationship, head_education, head_occupation, head_income,
//         // Distance & Mobility
//         distance_from_hospital, mobility,
//         // Referred By
//         referred_by,
//         // Address Details
//         address_line, country, state, district, city, pin_code,
//         // Additional Fields
//         assigned_doctor, assigned_room,
//         // Optional internal/system fields
//         filled_by, case_complexity, has_adl_file, file_status
//       } = req.body;
  
//       // Create patient record with all information
//       // Pass req.body directly to Patient.create() - it will dynamically handle all fields
//       // Add filled_by field (MWO user ID)
//       const patient = await Patient.create({
//         ...req.body,
//         filled_by: req.user.id
//       });

//       // Fetch related data to populate joined fields in response
//       let assignedDoctorName = null;
//       let assignedDoctorRole = null;
//       let filledByName = null;

//       // Fetch assigned doctor info if assigned_doctor_id exists
//       if (patient.assigned_doctor_id) {
//         try {
//           const db = require('../config/database');
//           const doctorResult = await db.query(
//             'SELECT name, role FROM users WHERE id = $1',
//             [patient.assigned_doctor_id]
//           );
//           if (doctorResult.rows.length > 0) {
//             assignedDoctorName = doctorResult.rows[0].name;
//             assignedDoctorRole = doctorResult.rows[0].role;
//           }
//         } catch (err) {
//           console.error('[patientController] Error fetching assigned doctor:', err);
//         }
//       }

//       // Fetch filled_by user info (MWO who registered the patient)
//       if (patient.filled_by) {
//         try {
//           const db = require('../config/database');
//           const filledByResult = await db.query(
//             'SELECT name FROM users WHERE id = $1',
//             [patient.filled_by]
//           );
//           if (filledByResult.rows.length > 0) {
//             filledByName = filledByResult.rows[0].name;
//           }
//         } catch (err) {
//           console.error('[patientController] Error fetching filled_by user:', err);
//         }
//       }

//       // Build response with populated related fields
//       const patientResponse = {
//         ...patient.toJSON(),
//         assigned_doctor_name: assignedDoctorName,
//         assigned_doctor_role: assignedDoctorRole,
//         filled_by_name: filledByName
//       };

//       // Log response for debugging
//       console.log('[patientController.registerPatientWithDetails] Patient created successfully. ID:', patient.id);
//       console.log('[patientController.registerPatientWithDetails] Response fields check:', {
//         unit_days: patientResponse.unit_days,
//         year_of_marriage: patientResponse.year_of_marriage,
//         no_of_children_male: patientResponse.no_of_children_male,
//         no_of_children_female: patientResponse.no_of_children_female,
//         education: patientResponse.education,
//         income: patientResponse.income,
//         address_line: patientResponse.address_line,
//         city: patientResponse.city,
//         assigned_doctor_name: patientResponse.assigned_doctor_name,
//         filled_by_name: patientResponse.filled_by_name,
//         adl_no: patientResponse.adl_no // This will be null on initial registration (expected)
//       });
  
//       res.status(201).json({
//         success: true,
//         message: 'Patient registered successfully with complete information',
//         data: {
//           patient: patientResponse
//         }
//       });
//     } catch (error) {
//       console.error('Comprehensive patient registration error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to register patient with details',
//         error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//       });
//     }
//   }

//   // Get all patients with pagination and filters
//   static async getAllPatients(req, res) {
//     try {
//       const page = parseInt(req.query.page) || 1;
//       const limit = parseInt(req.query.limit) || 10;
//       const filters = {};

//       // Check if search parameter is provided
//       if (req.query.search && req.query.search.trim().length >= 2) {
//         // Use search method instead
//         const result = await Patient.search(req.query.search.trim(), page, limit);
//         return res.json({
//           success: true,
//           data: result
//         });
//       }

//       // Apply filters
//       if (req.query.sex) filters.sex = req.query.sex;
//       if (req.query.case_complexity) filters.case_complexity = req.query.case_complexity;
//       if (req.query.has_adl_file !== undefined) filters.has_adl_file = req.query.has_adl_file === 'true';
//       if (req.query.file_status) filters.file_status = req.query.file_status;
//       if (req.query.assigned_room) filters.assigned_room = req.query.assigned_room;

//       const result = await Patient.findAll(page, limit, filters);

//       // Enrich with latest assignment info (assigned doctor) and visit info for each patient
//       try {
//         const db = require('../config/database');
//         const client = db.getClient();
//         const patientIds = (result.patients || []).map(p => p.id);
//         if (patientIds.length > 0) {
//           const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
          
//           // Fetch latest visit per patient (ordered by visit_date desc) and join doctor user
//           const { data: visits, error } = await client
//             .from('patient_visits')
//             .select(`patient_id, visit_date, assigned_doctor, users:assigned_doctor(id, name, role)`) 
//             .in('patient_id', patientIds)
//             .order('visit_date', { ascending: false });

//           // Fetch patients with visits today
//           const { data: visitsToday, error: visitsTodayError } = await client
//             .from('patient_visits')
//             .select(`patient_id, visit_date, assigned_doctor, users:assigned_doctor(id, name, role)`) 
//             .in('patient_id', patientIds)
//             .eq('visit_date', today);

//           if (!error && Array.isArray(visits)) {
//             const latestByPatient = new Map();
//             for (const v of visits) {
//               if (!latestByPatient.has(v.patient_id)) {
//                 latestByPatient.set(v.patient_id, v);
//               }
//             }
            
//             // Create a set of patient IDs with visits today
//             const patientsWithVisitToday = new Set();
//             if (!visitsTodayError && Array.isArray(visitsToday)) {
//               visitsToday.forEach(v => patientsWithVisitToday.add(v.patient_id));
//             }
            
//             result.patients = result.patients.map(p => {
//               const latest = latestByPatient.get(p.id);
//               const hasVisitToday = patientsWithVisitToday.has(p.id);
//               // If patient has visit today, use that visit's info, otherwise use latest
//               const visitInfo = hasVisitToday && visitsToday?.find(v => v.patient_id === p.id) 
//                 ? visitsToday.find(v => v.patient_id === p.id)
//                 : latest;
              
//               return {
//                 ...p,
//                 assigned_doctor_id: visitInfo?.assigned_doctor || latest?.assigned_doctor || null,
//                 assigned_doctor_name: visitInfo?.users?.name || latest?.users?.name || null,
//                 assigned_doctor_role: visitInfo?.users?.role || latest?.users?.role || null,
//                 last_assigned_date: latest?.visit_date || null,
//                 visit_date: visitInfo?.visit_date || null, // Include visit_date for today's filter
//                 has_visit_today: hasVisitToday,
//               };
//             });
//           }
//         }
//       } catch (_) {
//         // Fail silently; base data still returned
//       }

//       res.json({
//         success: true,
//         data: result
//       });
//     } catch (error) {
//       console.error('Get all patients error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get patients',
//         error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//       });
//     }
//   }

//   // Search patients
//   static async searchPatients(req, res) {
//     try {
//       const { q } = req.query;
//       const page = parseInt(req.query.page) || 1;
//       const limit = parseInt(req.query.limit) || 10;

//       if (!q || q.trim().length < 2) {
//         return res.status(400).json({
//           success: false,
//           message: 'Search term must be at least 2 characters long'
//         });
//       }

//       const result = await Patient.search(q.trim(), page, limit);

//       res.json({
//         success: true,
//         data: result
//       });
//     } catch (error) {
//       console.error('Search patients error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to search patients',
//         error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//       });
//     }
//   }

//   // Get patient by ID
//   static async getPatientById(req, res) {
//     try {
//       const { id } = req.params;
      
//       // Validate and parse ID - ensure it's a valid integer
//       const patientId = parseInt(id, 10);
//       if (isNaN(patientId) || patientId <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid patient ID. ID must be a positive integer.'
//         });
//       }
      
//       console.log(`[getPatientById] Fetching patient with ID: ${patientId} (original: ${id})`);
      
//       const patient = await Patient.findById(patientId);

//       if (!patient) {
//         console.log(`[getPatientById] Patient with ID ${patientId} not found`);
//         return res.status(404).json({
//           success: false,
//           message: 'Patient not found'
//         });
//       }

//       // Verify the returned patient ID matches the requested ID
//       if (patient.id && parseInt(patient.id, 10) !== patientId) {
//         console.error(`[getPatientById] CRITICAL: ID mismatch! Requested: ${patientId}, Returned: ${patient.id}`);
//         return res.status(500).json({
//           success: false,
//           message: 'Data integrity error: Patient ID mismatch'
//         });
//       }

//       console.log(`[getPatientById] Successfully fetched patient ID: ${patient.id}, Name: ${patient.name}`);

//       res.json({
//         success: true,
//         data: {
//           patient: patient.toJSON()
//         }
//       });
//     } catch (error) {
//       console.error('[getPatientById] Error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get patient',
//         error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//       });
//     }
//   }

//   // Get patient by CR number
//   static async getPatientByCRNo(req, res) {
//     try {
//       const { cr_no } = req.params;
//       const patient = await Patient.findByCRNo(cr_no);

//       if (!patient) {
//         return res.status(404).json({
//           success: false,
//           message: 'Patient not found'
//         });
//       }

//       res.json({
//         success: true,
//         data: {
//           patient: patient.toJSON()
//         }
//       });
//     } catch (error) {
//       console.error('Get patient by CR number error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get patient',
//         error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//       });
//     }
//   }

//   // Get patient by PSY number
//   static async getPatientByPSYNo(req, res) {
//     try {
//       const { psy_no } = req.params;
//       const patient = await Patient.findByPSYNo(psy_no);

//       if (!patient) {
//         return res.status(404).json({
//           success: false,
//           message: 'Patient not found'
//         });
//       }

//       res.json({
//         success: true,
//         data: {
//           patient: patient.toJSON()
//         }
//       });
//     } catch (error) {
//       console.error('Get patient by PSY number error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get patient',
//         error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//       });
//     }
//   }

//   // Get patient by ADL number
//   static async getPatientByADLNo(req, res) {
//     try {
//       const { adl_no } = req.params;
//       const patient = await Patient.findByADLNo(adl_no);

//       if (!patient) {
//         return res.status(404).json({
//           success: false,
//           message: 'Patient not found'
//         });
//       }

//       res.json({
//         success: true,
//         data: {
//           patient: patient.toJSON()
//         }
//       });
//     } catch (error) {
//       console.error('Get patient by ADL number error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get patient',
//         error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//       });
//     }
//   }

//   // Update patient
//   static async updatePatient(req, res) {
//     try {
//       const { id } = req.params;
//       const patient = await Patient.findById(id);

//       if (!patient) {
//         return res.status(404).json({
//           success: false,
//           message: 'Patient not found'
//         });
//       }

//       const {
//         // Basic patient information
//         name, sex, age, assigned_room, contact_number,
//         // Personal Information
//         age_group, marital_status, year_of_marriage, no_of_children, 
//         no_of_children_male, no_of_children_female,
//         // Occupation & Education
//         occupation, actual_occupation, education_level, completed_years_of_education,
//         // Financial Information
//         patient_income, family_income,
//         // Family Information
//         religion, family_type, locality, head_name, head_age, head_relationship,
//         head_education, head_occupation, head_income,
//         // Referral & Mobility
//         distance_from_hospital, mobility, referred_by, exact_source,
//         seen_in_walk_in_on, worked_up_on,
//         // Contact Information
//         school_college_office,
//         // Registration Details
//         department, unit_consit, room_no, serial_no, file_no, unit_days,
//         // Address Information (Quick Entry)
//         address_line, address_line_2, country, state, district, 
//         city, pin_code,
//         // Present Address
//         present_address_line_1, present_address_line_2, present_country, 
//         present_state, present_district, present_city_town_village, present_pin_code,
//         // Permanent Address
//         permanent_address_line_1, permanent_address_line_2, permanent_country, 
//         permanent_state, permanent_district, permanent_city_town_village, 
//         permanent_pin_code,
//         // Additional fields
//         category, special_clinic_no, case_complexity, file_status, has_adl_file
//       } = req.body;

//       const updateData = {};

//       // Basic information
//       if (name !== undefined) updateData.name = name;
//       if (sex !== undefined) updateData.sex = sex;
//       if (age !== undefined) updateData.age = age;
//       if (assigned_room !== undefined) updateData.assigned_room = assigned_room;
//       if (contact_number !== undefined) updateData.contact_number = contact_number;

//       // Personal Information
//       if (age_group !== undefined) updateData.age_group = age_group;
//       if (marital_status !== undefined) updateData.marital_status = marital_status;
//       if (year_of_marriage !== undefined) updateData.year_of_marriage = year_of_marriage;
//       if (no_of_children !== undefined) updateData.no_of_children = no_of_children;
//       if (no_of_children_male !== undefined) updateData.no_of_children_male = no_of_children_male;
//       if (no_of_children_female !== undefined) updateData.no_of_children_female = no_of_children_female;

//       // Occupation & Education
//       if (occupation !== undefined) updateData.occupation = occupation;
//       if (actual_occupation !== undefined) updateData.actual_occupation = actual_occupation;
//       if (education_level !== undefined) updateData.education_level = education_level;
//       if (completed_years_of_education !== undefined) updateData.completed_years_of_education = completed_years_of_education;

//       // Financial Information
//       if (patient_income !== undefined) updateData.patient_income = patient_income;
//       if (family_income !== undefined) updateData.family_income = family_income;

//       // Family Information
//       if (religion !== undefined) updateData.religion = religion;
//       if (family_type !== undefined) updateData.family_type = family_type;
//       if (locality !== undefined) updateData.locality = locality;
//       if (head_name !== undefined) updateData.head_name = head_name;
//       if (head_age !== undefined) updateData.head_age = head_age;
//       if (head_relationship !== undefined) updateData.head_relationship = head_relationship;
//       if (head_education !== undefined) updateData.head_education = head_education;
//       if (head_occupation !== undefined) updateData.head_occupation = head_occupation;
//       if (head_income !== undefined) updateData.head_income = head_income;

//       // Referral & Mobility
//       if (distance_from_hospital !== undefined) updateData.distance_from_hospital = distance_from_hospital;
//       if (mobility !== undefined) updateData.mobility = mobility;
//       if (referred_by !== undefined) updateData.referred_by = referred_by;
//       if (exact_source !== undefined) updateData.exact_source = exact_source;
//       if (seen_in_walk_in_on !== undefined) updateData.seen_in_walk_in_on = seen_in_walk_in_on;
//       if (worked_up_on !== undefined) updateData.worked_up_on = worked_up_on;

//       // Contact Information
//       if (school_college_office !== undefined) updateData.school_college_office = school_college_office;

//       // Registration Details
//       if (department !== undefined) updateData.department = department;
//       if (unit_consit !== undefined) updateData.unit_consit = unit_consit;
//       if (room_no !== undefined) updateData.room_no = room_no;
//       if (serial_no !== undefined) updateData.serial_no = serial_no;
//       if (file_no !== undefined) updateData.file_no = file_no;
//       if (unit_days !== undefined) updateData.unit_days = unit_days;

//       // Address Information (Quick Entry)
//       if (address_line !== undefined) updateData.address_line = address_line;
//       if (address_line_2 !== undefined) updateData.address_line_2 = address_line_2;
//       if (country !== undefined) updateData.country = country;
//       if (state !== undefined) updateData.state = state;
//       if (district !== undefined) updateData.district = district;
//       if (city !== undefined) updateData.city = city;
//       if (pin_code !== undefined) updateData.pin_code = pin_code;

//       // Present Address
//       if (present_address_line_1 !== undefined) updateData.present_address_line_1 = present_address_line_1;
//       if (present_address_line_2 !== undefined) updateData.present_address_line_2 = present_address_line_2;
//       if (present_country !== undefined) updateData.present_country = present_country;
//       if (present_state !== undefined) updateData.present_state = present_state;
//       if (present_district !== undefined) updateData.present_district = present_district;
//       if (present_city_town_village !== undefined) updateData.present_city_town_village = present_city_town_village;
//       if (present_pin_code !== undefined) updateData.present_pin_code = present_pin_code;

//       // Permanent Address
//       if (permanent_address_line_1 !== undefined) updateData.permanent_address_line_1 = permanent_address_line_1;
//       if (permanent_address_line_2 !== undefined) updateData.permanent_address_line_2 = permanent_address_line_2;
//       if (permanent_country !== undefined) updateData.permanent_country = permanent_country;
//       if (permanent_state !== undefined) updateData.permanent_state = permanent_state;
//       if (permanent_district !== undefined) updateData.permanent_district = permanent_district;
//       if (permanent_city_town_village !== undefined) updateData.permanent_city_town_village = permanent_city_town_village;
//       if (permanent_pin_code !== undefined) updateData.permanent_pin_code = permanent_pin_code;

//       // Additional fields
//       if (category !== undefined) updateData.category = category;
//       if (special_clinic_no !== undefined) updateData.special_clinic_no = special_clinic_no;
//       if (case_complexity !== undefined) updateData.case_complexity = case_complexity;
//       if (file_status !== undefined) updateData.file_status = file_status;
//       if (has_adl_file !== undefined) updateData.has_adl_file = has_adl_file;

//       console.log('Updating patient with data:', updateData);

//       await patient.update(updateData);

//       // Fetch updated patient data with joins
//       const updatedPatient = await Patient.findById(id);

//       res.json({
//         success: true,
//         message: 'Patient updated successfully',
//         data: {
//           patient: updatedPatient.toJSON()
//         }
//       });
//     } catch (error) {
//       console.error('Update patient error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to update patient',
//         error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//       });
//     }
//   }

//   // Get patient's complete profile (with all related records)
//   static async getPatientProfile(req, res) {
//     try {
//       const { id } = req.params;
//       const patient = await Patient.findById(id);

//       if (!patient) {
//         return res.status(404).json({
//           success: false,
//           message: 'Patient not found'
//         });
//       }

//       // Get all related data
//       const [visitHistory, clinicalRecords, adlFiles] = await Promise.all([
//         patient.getVisitHistory(),
//         patient.getClinicalRecords(),
//         patient.getADLFiles()
//       ]);

//       res.json({
//         success: true,
//         data: {
//           patient: patient.toJSON(),
//           visitHistory,
//           clinicalRecords,
//           adlFiles
//         }
//       });
//     } catch (error) {
//       console.error('Get patient profile error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get patient profile',
//         error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//       });
//     }
//   }

//   // Get patient's visit history
//   static async getPatientVisitHistory(req, res) {
//     try {
//       const { id } = req.params;
//       const patient = await Patient.findById(id);

//       if (!patient) {
//         return res.status(404).json({
//           success: false,
//           message: 'Patient not found'
//         });
//       }

//       const visitHistory = await patient.getVisitHistory();

//       res.json({
//         success: true,
//         data: {
//           patient: patient.toJSON(),
//           visitHistory
//         }
//       });
//     } catch (error) {
//       console.error('Get patient visit history error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get patient visit history',
//         error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//       });
//     }
//   }

//   // Get patient's clinical records
//   static async getPatientClinicalRecords(req, res) {
//     try {
//       const { id } = req.params;
//       const patient = await Patient.findById(id);

//       if (!patient) {
//         return res.status(404).json({
//           success: false,
//           message: 'Patient not found'
//         });
//       }

//       const clinicalRecords = await patient.getClinicalRecords();

//       res.json({
//         success: true,
//         data: {
//           patient: patient.toJSON(),
//           clinicalRecords
//         }
//       });
//     } catch (error) {
//       console.error('Get patient clinical records error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get patient clinical records',
//         error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//       });
//     }
//   }

//   // Get patient's ADL files
//   static async getPatientADLFiles(req, res) {
//     try {
//       const { id } = req.params;
//       const patient = await Patient.findById(id);

//       if (!patient) {
//         return res.status(404).json({
//           success: false,
//           message: 'Patient not found'
//         });
//       }

//       const adlFiles = await patient.getADLFiles();

//       res.json({
//         success: true,
//         data: {
//           patient: patient.toJSON(),
//           adlFiles
//         }
//       });
//     } catch (error) {
//       console.error('Get patient ADL files error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get patient ADL files',
//         error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//       });
//     }
//   }

//   // Delete patient
//   // static async deletePatient(req, res) {
//   //   try {
//   //     const { id } = req.params;
      
//   //     // Validate ID
//   //     const patientId = parseInt(id);
//   //     if (isNaN(patientId) || patientId <= 0) {
//   //       return res.status(400).json({
//   //         success: false,
//   //         message: 'Invalid patient ID'
//   //       });
//   //     }

//   //     console.log(`[deletePatient] Attempting to delete patient ID: ${patientId}`);
      
//   //     const patient = await Patient.findById(patientId);

//   //     if (!patient) {
//   //       return res.status(404).json({
//   //         success: false,
//   //         message: 'Patient not found'
//   //       });
//   //     }

//   //     // Delete patient and all related records
//   //     await patient.delete();

//   //     console.log(`[deletePatient] Successfully deleted patient ID: ${patientId}`);

//   //     res.json({
//   //       success: true,
//   //       message: 'Patient and all related records deleted successfully',
//   //       deletedPatientId: patientId
//   //     });
//   //   } catch (error) {
//   //     console.error('[deletePatient] Error:', error);
      
//   //     // Handle specific error cases
//   //     if (error.message && error.message.includes('not deleted')) {
//   //       return res.status(500).json({
//   //         success: false,
//   //         message: 'Failed to delete patient. Patient record was not removed from database.',
//   //         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//   //       });
//   //     }

//   //     res.status(500).json({
//   //       success: false,
//   //       message: 'Failed to delete patient and related records',
//   //       error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//   //     });
//   //   }
//   // }




  
//   // static async deletePatient(req, res) {
//   //   try {
//   //     const { id } = req.params;
  
//   //     // Validate ID
//   //     if (!id || id.trim() === '') {
//   //       return res.status(400).json({
//   //         success: false,
//   //         message: 'Invalid patient ID'
//   //       });
//   //     }
  
//   //     console.log(`[deletePatient] Attempting to delete patient ID: ${id}`);
  
//   //     // Check if patient exists
//   //     const patient = await Patient.findById(id);
//   //     if (!patient) {
//   //       return res.status(404).json({
//   //         success: false,
//   //         message: 'Patient not found'
//   //       });
//   //     }
  
//   //     // Delete related records
//   //     await Promise.all([
//   //       ClinicalProforma.deleteMany({ patientId: id }),
//   //       ADLFile.deleteMany({ patientId: id })
//   //     ]);
  
//   //     // Delete patient
//   //     await Patient.findByIdAndDelete(id);
  
//   //     console.log(`[deletePatient] Successfully deleted patient ID: ${id}`);
  
//   //     res.json({
//   //       success: true,
//   //       message: 'Patient and all related records deleted successfully',
//   //       deletedPatientId: id
//   //     });
//   //   } catch (error) {
//   //     console.error('[deletePatient] Error:', error);
  
//   //     res.status(500).json({
//   //       success: false,
//   //       message: 'Failed to delete patient and related records',
//   //       error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//   //     });
//   //   }
//   // }
  

//   // Delete patient and all related records (cascade delete)
//   static async deletePatient(req, res) {
//     try {
//       const { id } = req.params;

//       // Validate ID
//       const patientId = parseInt(id, 10);
//       if (isNaN(patientId) || patientId <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid patient ID'
//         });
//       }

//       console.log(`[deletePatient] Attempting to delete patient ID: ${patientId}`);

//       // Step 1: Check if patient exists using Patient model (consistent with other methods)
//       const patient = await Patient.findById(patientId);

//       if (!patient) {
//         console.error(`[deletePatient] Patient with ID ${patientId} not found`);
//         return res.status(404).json({
//           success: false,
//           message: 'Patient not found'
//         });
//       }

//       console.log(`[deletePatient] Patient found: ${patient.name} (ID: ${patientId})`);

//       // Step 2: Delete all related records using the Patient model's delete method
//       // This method handles cascade deletion of all related records properly
//       // It deletes: prescriptions, file_movements, adl_files, clinical_proforma, 
//       // patient_visits, outpatient_record, and finally the patient record itself
//       await patient.delete();

//       console.log(`[deletePatient] Successfully deleted patient ID: ${patientId}`);

//       res.json({
//         success: true,
//         message: 'Patient and all related records deleted successfully',
//         deletedPatientId: patientId
//       });

//     } catch (error) {
//       console.error('[deletePatient] Error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to delete patient and related records',
//         error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//       });
//     }
//   }


//   // Get patient statistics
//   static async getPatientStats(req, res) {
//     try {
//       const stats = await Patient.getStats();

//       res.json({
//         success: true,
//         data: {
//           stats
//         }
//       });
//     } catch (error) {
//       console.error('Get patient stats error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get patient statistics',
//         error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//       });
//     }
//   }

//   // Assign patient to a doctor (MWO workflow tracking)
//   static async assignPatient(req, res) {
//     try {
//       const { patient_id, assigned_doctor, room_no, visit_date, notes } = req.body;

//       if (!patient_id || !assigned_doctor) {
//         return res.status(400).json({ success: false, message: 'patient_id and assigned_doctor are required' });
//       }

//       const assignment = await PatientVisit.assignPatient({ patient_id, assigned_doctor, room_no, visit_date, notes });

//       return res.status(201).json({ success: true, message: 'Patient assigned successfully', data: { assignment } });
//     } catch (error) {
//       console.error('Assign patient error:', error);
//       return res.status(500).json({ success: false, message: 'Failed to assign patient', error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' });
//     }
//   }

//   // Get today's patients registered by MWO
//   static async getTodayPatients(req, res) {
//     try {
//       const { page = 1, limit = 10, date } = req.query;
//       const pageNum = parseInt(page, 10);
//       const limitNum = parseInt(limit, 10);
//       const offset = (pageNum - 1) * limitNum;

//       // Use provided date or default to today
//       const targetDate = date ? new Date(date) : new Date();
//       const startOfDay = new Date(targetDate);
//       startOfDay.setHours(0, 0, 0, 0);
//       const endOfDay = new Date(targetDate);
//       endOfDay.setHours(23, 59, 59, 999);

//       const db = require('../config/database');

//       // Check if date filter is provided for today's patients
//       if (req.query.date) {
//         const targetDate = new Date(req.query.date);
//         const dateString = targetDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        
//         const pageNum = parseInt(page, 10);
//         const limitNum = parseInt(limit, 10);
//         const offset = (pageNum - 1) * limitNum;

//         // Base query to get patients registered on the specified date by MWO users
//         let query = `
//           SELECT 
//             p.*,
//             opr.age_group,
//             opr.marital_status,
//             opr.year_of_marriage,
//             opr.no_of_children,
//             opr.occupation,
//             opr.actual_occupation,
//             opr.education_level,
//             opr.completed_years_of_education,
//             opr.patient_income,
//             opr.family_income,
//             opr.religion,
//             opr.family_type,
//             opr.locality,
//             opr.head_name,
//             opr.head_age,
//             opr.head_relationship,
//             opr.head_education,
//             opr.head_occupation,
//             opr.head_income,
//             opr.distance_from_hospital,
//             opr.mobility,
//             opr.referred_by,
//             opr.exact_source,
//             opr.present_address,
//             opr.permanent_address,
//             opr.local_address,
//             opr.school_college_office,
//             opr.contact_number,
//             u.name as filled_by_name,
//             u.role as filled_by_role
//           FROM registered_patient p
//           INNER JOIN outpatient_record opr ON p.id = opr.patient_id
//           INNER JOIN users u ON opr.filled_by = u.id
//           WHERE u.role = 'MWO'
//             AND DATE(opr.created_at) = DATE($1)
//         `;
        
//         let countQuery = `
//           SELECT COUNT(*) as total
//           FROM registered_patient p
//           INNER JOIN outpatient_record opr ON p.id = opr.patient_id
//           INNER JOIN users u ON opr.filled_by = u.id
//           WHERE u.role = 'MWO'
//             AND DATE(opr.created_at) = DATE($1)
//         `;
        
//         const params = [dateString];
//         // If JR/SR, restrict to assigned doctor
//         if (req.user?.role === 'JR' || req.user?.role === 'SR') {
//           query += ` AND p.assigned_doctor_id = $2`;
//           countQuery += ` AND p.assigned_doctor_id = $2`;
//           params.push(req.user.id);
//         }
        
//         query += ` ORDER BY opr.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
//         const queryParams = [...params, limitNum, offset];

//         const [patientsResult, countResult] = await Promise.all([
//           db.query(query, queryParams),
//           db.query(countQuery, params)
//         ]);

//         const patients = patientsResult.rows.map(row => ({
//           id: row.id,
//           cr_no: row.cr_no,
//           psy_no: row.psy_no,
//           adl_no: row.adl_no,
//           special_clinic_no: row.special_clinic_no,
//           name: row.name,
//           sex: row.sex,
//           age: row.age,
//           age_group: row.age_group,
//           marital_status: row.marital_status,
//           year_of_marriage: row.year_of_marriage,
//           no_of_children: row.no_of_children,
//           occupation: row.occupation,
//           actual_occupation: row.actual_occupation,
//           education_level: row.education_level,
//           completed_years_of_education: row.completed_years_of_education,
//           patient_income: row.patient_income,
//           family_income: row.family_income,
//           religion: row.religion,
//           family_type: row.family_type,
//           locality: row.locality,
//           head_name: row.head_name,
//           head_age: row.head_age,
//           head_relationship: row.head_relationship,
//           head_education: row.head_education,
//           head_occupation: row.head_occupation,
//           head_income: row.head_income,
//           distance_from_hospital: row.distance_from_hospital,
//           mobility: row.mobility,
//           referred_by: row.referred_by,
//           exact_source: row.exact_source,
//           present_address: row.present_address,
//           permanent_address: row.permanent_address,
//           local_address: row.local_address,
//           school_college_office: row.school_college_office,
//           contact_number: row.contact_number,
//           filled_by_name: row.filled_by_name,
//           filled_by_role: row.filled_by_role,
//           created_at: row.created_at,
//           has_adl_file: row.has_adl_file,
//           file_status: row.file_status,
//           case_complexity: row.case_complexity,
//           assigned_room: row.assigned_room,
//           assigned_doctor_id: row.assigned_doctor_id || null,
//         }));

//         const total = parseInt(countResult.rows[0].total, 10);

//         return res.json({
//           success: true,
//           data: {
//             patients,
//             pagination: {
//               page: pageNum,
//               limit: limitNum,
//               total,
//               pages: Math.ceil(total / limitNum)
//             },
//             date: dateString
//           }
//         });
//       }

//       // Query to get patients registered today by MWO users
//       const query = `
//         SELECT 
//           p.*,
//           opr.age_group,
//           opr.marital_status,
//           opr.year_of_marriage,
//           opr.no_of_children,
//           opr.occupation,
//           opr.actual_occupation,
//           opr.education_level,
//           opr.completed_years_of_education,
//           opr.patient_income,
//           opr.family_income,
//           opr.religion,
//           opr.family_type,
//           opr.locality,
//           opr.head_name,
//           opr.head_age,
//           opr.head_relationship,
//           opr.head_education,
//           opr.head_occupation,
//           opr.head_income,
//           opr.distance_from_hospital,
//           opr.mobility,
//           opr.referred_by,
//           opr.exact_source,
//           opr.present_address,
//           opr.permanent_address,
//           opr.local_address,
//           opr.school_college_office,
//           opr.contact_number,
//           u.name as filled_by_name,
//           u.role as filled_by_role
//         FROM registered_patient p
//         INNER JOIN outpatient_record opr ON p.id = opr.patient_id
//         INNER JOIN users u ON opr.filled_by = u.id
//         WHERE u.role = 'MWO'
//           AND DATE(opr.created_at) = DATE($1)
//         ORDER BY opr.created_at DESC
//         LIMIT $2 OFFSET $3
//       `;

//       const countQuery = `
//         SELECT COUNT(*) as total
//         FROM registered_patient p
//         INNER JOIN outpatient_record opr ON p.id = opr.patient_id
//         INNER JOIN users u ON opr.filled_by = u.id
//         WHERE u.role = 'MWO'
//           AND DATE(opr.created_at) = DATE($1)
//       `;

//       const [patientsResult, countResult] = await Promise.all([
//         db.query(query, [targetDate, limitNum, offset]),
//         db.query(countQuery, [targetDate])
//       ]);

//       const patients = patientsResult.rows.map(row => ({
//         id: row.id,
//         cr_no: row.cr_no,
//         psy_no: row.psy_no,
//         adl_no: row.adl_no,
//         special_clinic_no: row.special_clinic_no,
//         name: row.name,
//         sex: row.sex,
//         age: row.age,
//         age_group: row.age_group,
//         marital_status: row.marital_status,
//         year_of_marriage: row.year_of_marriage,
//         no_of_children: row.no_of_children,
//         occupation: row.occupation,
//         actual_occupation: row.actual_occupation,
//         education_level: row.education_level,
//         completed_years_of_education: row.completed_years_of_education,
//         patient_income: row.patient_income,
//         family_income: row.family_income,
//         religion: row.religion,
//         family_type: row.family_type,
//         locality: row.locality,
//         head_name: row.head_name,
//         head_age: row.head_age,
//         head_relationship: row.head_relationship,
//         head_education: row.head_education,
//         head_occupation: row.head_occupation,
//         head_income: row.head_income,
//         distance_from_hospital: row.distance_from_hospital,
//         mobility: row.mobility,
//         referred_by: row.referred_by,
//         exact_source: row.exact_source,
//         present_address: row.present_address,
//         permanent_address: row.permanent_address,
//         local_address: row.local_address,
//         school_college_office: row.school_college_office,
//         contact_number: row.contact_number,
//         filled_by_name: row.filled_by_name,
//         filled_by_role: row.filled_by_role,
//         created_at: row.created_at,
//         has_adl_file: row.has_adl_file,
//         file_status: row.file_status,
//         case_complexity: row.case_complexity,
//         assigned_room: row.assigned_room
//       }));

//       const total = parseInt(countResult.rows[0].total, 10);

//       res.status(200).json({
//         success: true,
//         message: `Patients registered today by MWO (${targetDate.toDateString()})`,
//         data: {
//           patients,
//           pagination: {
//             page: pageNum,
//             limit: limitNum,
//             total,
//             pages: Math.ceil(total / limitNum)
//           },
//           date: targetDate.toISOString().split('T')[0]
//         }
//       });
//     } catch (error) {
//       console.error('Get today patients error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to fetch today\'s patients',
//         error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//       });
//     }
//   }
// }

// module.exports = PatientController;





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
  static async deletePatient(req, res) {
    try {
      const { id } = req.params;

      const patientId = parseInt(id, 10);
      if (isNaN(patientId) || patientId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID'
        });
      }

      console.log(`[deletePatient] Attempting to delete patient ID: ${patientId}`);

      const patient = await Patient.findById(patientId);

      if (!patient) {
        console.error(`[deletePatient] Patient with ID ${patientId} not found`);
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      console.log(`[deletePatient] Patient found: ${patient.name} (ID: ${patientId})`);

      await patient.delete();

      console.log(`[deletePatient] Successfully deleted patient ID: ${patientId}`);

      res.json({
        success: true,
        message: 'Patient and all related records deleted successfully',
        deletedPatientId: patientId
      });

    } catch (error) {
      console.error('[deletePatient] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete patient and related records',
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