const Patient = require('../models/Patient');
const PatientVisit = require('../models/PatientVisit');
const OutpatientRecord = require('../models/OutpatientRecord');

class PatientController {
  // Create a new patient (basic info only)
  // static async createPatient(req, res) {
  //   try {
  //     const { name, sex, actual_age, assigned_room, cr_no, psy_no } = req.body;

  //     const patient = await Patient.create({
  //       name,
  //       sex,
  //       actual_age,
  //       assigned_room,
  //       cr_no,
  //       psy_no
  //     });

  //     res.status(201).json({
  //       success: true,
  //       message: 'Patient registered successfully',
  //       data: {
  //         patient: patient.toJSON()
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Patient creation error:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Failed to register patient',
  //       error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  //     });
  //   }
  // }

  // // Comprehensive patient registration (includes personal information for MWO)
  // static async registerPatientWithDetails(req, res) {
  //   try {
  //     const {
  //       // Basic patient information
  //       name, sex, actual_age, assigned_room, cr_no, psy_no,
  //       // Additional outpatient fields
  //       seen_in_walk_in_on, worked_up_on, special_clinic_no,
  //       // Personal Information
  //       age_group, marital_status, year_of_marriage, no_of_children, no_of_children_male, no_of_children_female,
  //       // Occupation & Education
  //       occupation, actual_occupation, education_level, completed_years_of_education,
  //       // Financial Information
  //       patient_income, family_income,
  //       // Family Information
  //       religion, family_type, locality, head_name, head_age, head_relationship,
  //       head_education, head_occupation, head_income,
  //       // Referral & Mobility
  //       distance_from_hospital, mobility, referred_by, exact_source,
  //       // Contact Information (simple fields)
  //       present_address, permanent_address, local_address, school_college_office, contact_number,
  //       // Quick Entry fields
  //       department, unit_consit, room_no, serial_no, file_no, unit_days,
  //       // Address fields (Quick Entry)
  //       address_line_1, country, state, district, city_town_village, pin_code,
  //       // Present Address fields
  //       present_address_line_1, present_country, present_state, present_district, 
  //       present_city_town_village, present_pin_code,
  //       // Permanent Address fields
  //       permanent_address_line_1, permanent_country, permanent_state, permanent_district,
  //       permanent_city_town_village, permanent_pin_code,
  //       // Additional fields
  //       category, assigned_doctor_id
  //     } = req.body;

  //     // Create patient record
  //     const patient = await Patient.create({
  //       name,
  //       sex,
  //       actual_age,
  //       assigned_room,
  //       cr_no,
  //       psy_no
  //     });

  //     // Create outpatient record with personal information
  //     const outpatientRecord = await OutpatientRecord.create({
  //       patient_id: patient.id,
  //       filled_by: req.user.id, // MWO user ID
  //       seen_in_walk_in_on,
  //       worked_up_on,
  //       special_clinic_no,
  //       age_group,
  //       marital_status,
  //       year_of_marriage,
  //       no_of_children,
  //       no_of_children_male,
  //       no_of_children_female,
  //       occupation,
  //       actual_occupation,
  //       education_level,
  //       completed_years_of_education,
  //       patient_income,
  //       family_income,
  //       religion,
  //       family_type,
  //       locality,
  //       head_name,
  //       head_age,
  //       head_relationship,
  //       head_education,
  //       head_occupation,
  //       head_income,
  //       distance_from_hospital,
  //       mobility,
  //       referred_by,
  //       exact_source,
  //       present_address,
  //       permanent_address,
  //       local_address,
  //       school_college_office,
  //       contact_number,
  //       // Quick Entry fields
  //       department,
  //       unit_consit,
  //       room_no,
  //       serial_no,
  //       file_no,
  //       unit_days,
  //       // Address fields (Quick Entry)
  //       address_line_1,
  //       country,
  //       state,
  //       district,
  //       city_town_village,
  //       pin_code,
  //       // Present Address fields
  //       present_address_line_1,
  //       present_country,
  //       present_state,
  //       present_district,
  //       present_city_town_village,
  //       present_pin_code,
  //       // Permanent Address fields
  //       permanent_address_line_1,
  //       permanent_country,
  //       permanent_state,
  //       permanent_district,
  //       permanent_city_town_village,
  //       permanent_pin_code,
  //       // Additional fields
  //       category,
  //       assigned_doctor_id
  //     });

  //     res.status(201).json({
  //       success: true,
  //       message: 'Patient registered successfully with complete information',
  //       data: {
  //         patient: patient.toJSON(),
  //         outpatientRecord: outpatientRecord.toJSON()
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Comprehensive patient registration error:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Failed to register patient with details',
  //       error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  //     });
  //   }
  // }

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
      const { name, sex, actual_age, assigned_room, cr_no, psy_no, patient_id } = req.body;

      // If patient_id is provided, this is a visit for an existing patient
      if (patient_id) {
        // Find the existing patient
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
          assigned_doctor: existingPatient.assigned_doctor_id || null,
          room_no: existingPatient.assigned_room || assigned_room || null,
          visit_date: new Date().toISOString().slice(0, 10),
          visit_type: 'follow_up',
          notes: `Visit created via Existing Patient flow`
        });

        // Return the existing patient with visit info
        return res.status(201).json({
          success: true,
          message: 'Visit record created successfully',
          data: {
            patient: existingPatient.toJSON(),
            visit: visit
          }
        });
      }

      // Otherwise, create a new patient
      const patient = await Patient.create({
        name,
        sex,
        actual_age,
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
      // Log received data for debugging
      console.log('[patientController.registerPatientWithDetails] Received request body with keys:', Object.keys(req.body).length);
      console.log('[patientController.registerPatientWithDetails] Sample fields:', {
        name: req.body.name,
        sex: req.body.sex,
        actual_age: req.body.actual_age,
        age_group: req.body.age_group,
        marital_status: req.body.marital_status,
        occupation: req.body.occupation,
        contact_number: req.body.contact_number,
        unit_days: req.body.unit_days,
        year_of_marriage: req.body.year_of_marriage,
        no_of_children: req.body.no_of_children,
        completed_years_of_education: req.body.completed_years_of_education,
        present_address: req.body.present_address,
        permanent_address: req.body.permanent_address,
        local_address: req.body.local_address
      });

      const {
        // Basic patient information
        name, sex, actual_age, assigned_room, cr_no, psy_no,
        // Additional fields
        seen_in_walk_in_on, worked_up_on, special_clinic_no,
        // Personal Information
        age_group, marital_status, year_of_marriage, no_of_children, 
        no_of_children_male, no_of_children_female,
        // Occupation & Education
        occupation, actual_occupation, education_level, completed_years_of_education,
        // Financial Information
        patient_income, family_income,
        // Family Information
        religion, family_type, locality, head_name, head_age, head_relationship,
        head_education, head_occupation, head_income,
        // Referral & Mobility
        distance_from_hospital, mobility, referred_by, exact_source,
        // Contact Information
        school_college_office, contact_number,
        // Quick Entry fields
        department, unit_consit, room_no, serial_no, file_no, unit_days,
        // Local/Current Address fields
        address_line_1, address_line_2, country, state, district, 
        city_town_village, pin_code,
        // Present Address fields
        present_address_line_1, present_address_line_2, present_country, 
        present_state, present_district, present_city_town_village, present_pin_code,
        // Permanent Address fields
        permanent_address_line_1, permanent_address_line_2, permanent_country, 
        permanent_state, permanent_district, permanent_city_town_village, 
        permanent_pin_code,
        // Additional fields
        category, assigned_doctor_id, has_adl_file, file_status, case_complexity
      } = req.body;
  
      // Create patient record with all information
      // Pass req.body directly to Patient.create() - it will dynamically handle all fields
      // Add filled_by field (MWO user ID)
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

      // Log response for debugging
      console.log('[patientController.registerPatientWithDetails] Patient created successfully. ID:', patient.id);
      console.log('[patientController.registerPatientWithDetails] Response fields check:', {
        unit_days: patientResponse.unit_days,
        year_of_marriage: patientResponse.year_of_marriage,
        no_of_children: patientResponse.no_of_children,
        completed_years_of_education: patientResponse.completed_years_of_education,
        present_address: patientResponse.present_address,
        permanent_address: patientResponse.permanent_address,
        local_address: patientResponse.local_address,
        assigned_doctor_name: patientResponse.assigned_doctor_name,
        filled_by_name: patientResponse.filled_by_name,
        adl_no: patientResponse.adl_no // This will be null on initial registration (expected)
      });
  
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
        // Use search method instead
        const result = await Patient.search(req.query.search.trim(), page, limit);
        return res.json({
          success: true,
          data: result
        });
      }

      // Apply filters
      if (req.query.sex) filters.sex = req.query.sex;
      if (req.query.case_complexity) filters.case_complexity = req.query.case_complexity;
      if (req.query.has_adl_file !== undefined) filters.has_adl_file = req.query.has_adl_file === 'true';
      if (req.query.file_status) filters.file_status = req.query.file_status;
      if (req.query.assigned_room) filters.assigned_room = req.query.assigned_room;

      const result = await Patient.findAll(page, limit, filters);

      // Enrich with latest assignment info (assigned doctor) and visit info for each patient
      try {
        const db = require('../config/database');
        const client = db.getClient();
        const patientIds = (result.patients || []).map(p => p.id);
        if (patientIds.length > 0) {
          const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
          
          // Fetch latest visit per patient (ordered by visit_date desc) and join doctor user
          const { data: visits, error } = await client
            .from('patient_visits')
            .select(`patient_id, visit_date, assigned_doctor, users:assigned_doctor(id, name, role)`) 
            .in('patient_id', patientIds)
            .order('visit_date', { ascending: false });

          // Fetch patients with visits today
          const { data: visitsToday, error: visitsTodayError } = await client
            .from('patient_visits')
            .select(`patient_id, visit_date, assigned_doctor, users:assigned_doctor(id, name, role)`) 
            .in('patient_id', patientIds)
            .eq('visit_date', today);

          if (!error && Array.isArray(visits)) {
            const latestByPatient = new Map();
            for (const v of visits) {
              if (!latestByPatient.has(v.patient_id)) {
                latestByPatient.set(v.patient_id, v);
              }
            }
            
            // Create a set of patient IDs with visits today
            const patientsWithVisitToday = new Set();
            if (!visitsTodayError && Array.isArray(visitsToday)) {
              visitsToday.forEach(v => patientsWithVisitToday.add(v.patient_id));
            }
            
            result.patients = result.patients.map(p => {
              const latest = latestByPatient.get(p.id);
              const hasVisitToday = patientsWithVisitToday.has(p.id);
              // If patient has visit today, use that visit's info, otherwise use latest
              const visitInfo = hasVisitToday && visitsToday?.find(v => v.patient_id === p.id) 
                ? visitsToday.find(v => v.patient_id === p.id)
                : latest;
              
              return {
                ...p,
                assigned_doctor_id: visitInfo?.assigned_doctor || latest?.assigned_doctor || null,
                assigned_doctor_name: visitInfo?.users?.name || latest?.users?.name || null,
                assigned_doctor_role: visitInfo?.users?.role || latest?.users?.role || null,
                last_assigned_date: latest?.visit_date || null,
                visit_date: visitInfo?.visit_date || null, // Include visit_date for today's filter
                has_visit_today: hasVisitToday,
              };
            });
          }
        }
      } catch (_) {
        // Fail silently; base data still returned
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

  // Get patient by ID
  static async getPatientById(req, res) {
    try {
      const { id } = req.params;
      const patient = await Patient.findById(id);

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
      console.error('Get patient by ID error:', error);
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
  static async updatePatient(req, res) {
    try {
      const { id } = req.params;
      const patient = await Patient.findById(id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const {
        // Basic patient information
        name, sex, actual_age, assigned_room, contact_number,
        // Personal Information
        age_group, marital_status, year_of_marriage, no_of_children, 
        no_of_children_male, no_of_children_female,
        // Occupation & Education
        occupation, actual_occupation, education_level, completed_years_of_education,
        // Financial Information
        patient_income, family_income,
        // Family Information
        religion, family_type, locality, head_name, head_age, head_relationship,
        head_education, head_occupation, head_income,
        // Referral & Mobility
        distance_from_hospital, mobility, referred_by, exact_source,
        seen_in_walk_in_on, worked_up_on,
        // Contact Information
        school_college_office,
        // Registration Details
        department, unit_consit, room_no, serial_no, file_no, unit_days,
        // Address Information (Quick Entry)
        address_line_1, address_line_2, country, state, district, 
        city_town_village, pin_code,
        // Present Address
        present_address_line_1, present_address_line_2, present_country, 
        present_state, present_district, present_city_town_village, present_pin_code,
        // Permanent Address
        permanent_address_line_1, permanent_address_line_2, permanent_country, 
        permanent_state, permanent_district, permanent_city_town_village, 
        permanent_pin_code,
        // Additional fields
        category, special_clinic_no, case_complexity, file_status, has_adl_file
      } = req.body;

      const updateData = {};

      // Basic information
      if (name !== undefined) updateData.name = name;
      if (sex !== undefined) updateData.sex = sex;
      if (actual_age !== undefined) updateData.actual_age = actual_age;
      if (assigned_room !== undefined) updateData.assigned_room = assigned_room;
      if (contact_number !== undefined) updateData.contact_number = contact_number;

      // Personal Information
      if (age_group !== undefined) updateData.age_group = age_group;
      if (marital_status !== undefined) updateData.marital_status = marital_status;
      if (year_of_marriage !== undefined) updateData.year_of_marriage = year_of_marriage;
      if (no_of_children !== undefined) updateData.no_of_children = no_of_children;
      if (no_of_children_male !== undefined) updateData.no_of_children_male = no_of_children_male;
      if (no_of_children_female !== undefined) updateData.no_of_children_female = no_of_children_female;

      // Occupation & Education
      if (occupation !== undefined) updateData.occupation = occupation;
      if (actual_occupation !== undefined) updateData.actual_occupation = actual_occupation;
      if (education_level !== undefined) updateData.education_level = education_level;
      if (completed_years_of_education !== undefined) updateData.completed_years_of_education = completed_years_of_education;

      // Financial Information
      if (patient_income !== undefined) updateData.patient_income = patient_income;
      if (family_income !== undefined) updateData.family_income = family_income;

      // Family Information
      if (religion !== undefined) updateData.religion = religion;
      if (family_type !== undefined) updateData.family_type = family_type;
      if (locality !== undefined) updateData.locality = locality;
      if (head_name !== undefined) updateData.head_name = head_name;
      if (head_age !== undefined) updateData.head_age = head_age;
      if (head_relationship !== undefined) updateData.head_relationship = head_relationship;
      if (head_education !== undefined) updateData.head_education = head_education;
      if (head_occupation !== undefined) updateData.head_occupation = head_occupation;
      if (head_income !== undefined) updateData.head_income = head_income;

      // Referral & Mobility
      if (distance_from_hospital !== undefined) updateData.distance_from_hospital = distance_from_hospital;
      if (mobility !== undefined) updateData.mobility = mobility;
      if (referred_by !== undefined) updateData.referred_by = referred_by;
      if (exact_source !== undefined) updateData.exact_source = exact_source;
      if (seen_in_walk_in_on !== undefined) updateData.seen_in_walk_in_on = seen_in_walk_in_on;
      if (worked_up_on !== undefined) updateData.worked_up_on = worked_up_on;

      // Contact Information
      if (school_college_office !== undefined) updateData.school_college_office = school_college_office;

      // Registration Details
      if (department !== undefined) updateData.department = department;
      if (unit_consit !== undefined) updateData.unit_consit = unit_consit;
      if (room_no !== undefined) updateData.room_no = room_no;
      if (serial_no !== undefined) updateData.serial_no = serial_no;
      if (file_no !== undefined) updateData.file_no = file_no;
      if (unit_days !== undefined) updateData.unit_days = unit_days;

      // Address Information (Quick Entry)
      if (address_line_1 !== undefined) updateData.address_line_1 = address_line_1;
      if (address_line_2 !== undefined) updateData.address_line_2 = address_line_2;
      if (country !== undefined) updateData.country = country;
      if (state !== undefined) updateData.state = state;
      if (district !== undefined) updateData.district = district;
      if (city_town_village !== undefined) updateData.city_town_village = city_town_village;
      if (pin_code !== undefined) updateData.pin_code = pin_code;

      // Present Address
      if (present_address_line_1 !== undefined) updateData.present_address_line_1 = present_address_line_1;
      if (present_address_line_2 !== undefined) updateData.present_address_line_2 = present_address_line_2;
      if (present_country !== undefined) updateData.present_country = present_country;
      if (present_state !== undefined) updateData.present_state = present_state;
      if (present_district !== undefined) updateData.present_district = present_district;
      if (present_city_town_village !== undefined) updateData.present_city_town_village = present_city_town_village;
      if (present_pin_code !== undefined) updateData.present_pin_code = present_pin_code;

      // Permanent Address
      if (permanent_address_line_1 !== undefined) updateData.permanent_address_line_1 = permanent_address_line_1;
      if (permanent_address_line_2 !== undefined) updateData.permanent_address_line_2 = permanent_address_line_2;
      if (permanent_country !== undefined) updateData.permanent_country = permanent_country;
      if (permanent_state !== undefined) updateData.permanent_state = permanent_state;
      if (permanent_district !== undefined) updateData.permanent_district = permanent_district;
      if (permanent_city_town_village !== undefined) updateData.permanent_city_town_village = permanent_city_town_village;
      if (permanent_pin_code !== undefined) updateData.permanent_pin_code = permanent_pin_code;

      // Additional fields
      if (category !== undefined) updateData.category = category;
      if (special_clinic_no !== undefined) updateData.special_clinic_no = special_clinic_no;
      if (case_complexity !== undefined) updateData.case_complexity = case_complexity;
      if (file_status !== undefined) updateData.file_status = file_status;
      if (has_adl_file !== undefined) updateData.has_adl_file = has_adl_file;

      console.log('Updating patient with data:', updateData);

      await patient.update(updateData);

      // Fetch updated patient data with joins
      const updatedPatient = await Patient.findById(id);

      res.json({
        success: true,
        message: 'Patient updated successfully',
        data: {
          patient: updatedPatient.toJSON()
        }
      });
    } catch (error) {
      console.error('Update patient error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update patient',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get patient's complete profile (with all related records)
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

      // Get all related data
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

  // Delete patient
  static async deletePatient(req, res) {
    try {
      const { id } = req.params;
      const patient = await Patient.findById(id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      await patient.delete();

      res.json({
        success: true,
        message: 'Patient deleted successfully'
      });
    } catch (error) {
      console.error('Delete patient error:', error);
      
      if (error.message === 'Cannot delete patient with existing records') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete patient',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get patient statistics
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

  // Assign patient to a doctor (MWO workflow tracking)
  static async assignPatient(req, res) {
    try {
      const { patient_id, assigned_doctor, room_no, visit_date, notes } = req.body;

      if (!patient_id || !assigned_doctor) {
        return res.status(400).json({ success: false, message: 'patient_id and assigned_doctor are required' });
      }

      const assignment = await PatientVisit.assignPatient({ patient_id, assigned_doctor, room_no, visit_date, notes });

      return res.status(201).json({ success: true, message: 'Patient assigned successfully', data: { assignment } });
    } catch (error) {
      console.error('Assign patient error:', error);
      return res.status(500).json({ success: false, message: 'Failed to assign patient', error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' });
    }
  }

  // Get today's patients registered by MWO
  static async getTodayPatients(req, res) {
    try {
      const { page = 1, limit = 10, date } = req.query;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const offset = (pageNum - 1) * limitNum;

      // Use provided date or default to today
      const targetDate = date ? new Date(date) : new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const db = require('../config/database');

      // Check if date filter is provided for today's patients
      if (req.query.date) {
        const targetDate = new Date(req.query.date);
        const dateString = targetDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const offset = (pageNum - 1) * limitNum;

        // Base query to get patients registered on the specified date by MWO users
        let query = `
          SELECT 
            p.*,
            opr.age_group,
            opr.marital_status,
            opr.year_of_marriage,
            opr.no_of_children,
            opr.occupation,
            opr.actual_occupation,
            opr.education_level,
            opr.completed_years_of_education,
            opr.patient_income,
            opr.family_income,
            opr.religion,
            opr.family_type,
            opr.locality,
            opr.head_name,
            opr.head_age,
            opr.head_relationship,
            opr.head_education,
            opr.head_occupation,
            opr.head_income,
            opr.distance_from_hospital,
            opr.mobility,
            opr.referred_by,
            opr.exact_source,
            opr.present_address,
            opr.permanent_address,
            opr.local_address,
            opr.school_college_office,
            opr.contact_number,
            u.name as filled_by_name,
            u.role as filled_by_role
          FROM patients p
          INNER JOIN outpatient_record opr ON p.id = opr.patient_id
          INNER JOIN users u ON opr.filled_by = u.id
          WHERE u.role = 'MWO'
            AND DATE(opr.created_at) = DATE($1)
        `;
        
        let countQuery = `
          SELECT COUNT(*) as total
          FROM patients p
          INNER JOIN outpatient_record opr ON p.id = opr.patient_id
          INNER JOIN users u ON opr.filled_by = u.id
          WHERE u.role = 'MWO'
            AND DATE(opr.created_at) = DATE($1)
        `;
        
        const params = [dateString];
        // If JR/SR, restrict to assigned doctor
        if (req.user?.role === 'JR' || req.user?.role === 'SR') {
          query += ` AND p.assigned_doctor_id = $2`;
          countQuery += ` AND p.assigned_doctor_id = $2`;
          params.push(req.user.id);
        }
        
        query += ` ORDER BY opr.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        const queryParams = [...params, limitNum, offset];

        const [patientsResult, countResult] = await Promise.all([
          db.query(query, queryParams),
          db.query(countQuery, params)
        ]);

        const patients = patientsResult.rows.map(row => ({
          id: row.id,
          cr_no: row.cr_no,
          psy_no: row.psy_no,
          adl_no: row.adl_no,
          special_clinic_no: row.special_clinic_no,
          name: row.name,
          sex: row.sex,
          actual_age: row.actual_age,
          age_group: row.age_group,
          marital_status: row.marital_status,
          year_of_marriage: row.year_of_marriage,
          no_of_children: row.no_of_children,
          occupation: row.occupation,
          actual_occupation: row.actual_occupation,
          education_level: row.education_level,
          completed_years_of_education: row.completed_years_of_education,
          patient_income: row.patient_income,
          family_income: row.family_income,
          religion: row.religion,
          family_type: row.family_type,
          locality: row.locality,
          head_name: row.head_name,
          head_age: row.head_age,
          head_relationship: row.head_relationship,
          head_education: row.head_education,
          head_occupation: row.head_occupation,
          head_income: row.head_income,
          distance_from_hospital: row.distance_from_hospital,
          mobility: row.mobility,
          referred_by: row.referred_by,
          exact_source: row.exact_source,
          present_address: row.present_address,
          permanent_address: row.permanent_address,
          local_address: row.local_address,
          school_college_office: row.school_college_office,
          contact_number: row.contact_number,
          filled_by_name: row.filled_by_name,
          filled_by_role: row.filled_by_role,
          created_at: row.created_at,
          has_adl_file: row.has_adl_file,
          file_status: row.file_status,
          case_complexity: row.case_complexity,
          assigned_room: row.assigned_room,
          assigned_doctor_id: row.assigned_doctor_id || null,
        }));

        const total = parseInt(countResult.rows[0].total, 10);

        return res.json({
          success: true,
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
      }

      // Query to get patients registered today by MWO users
      const query = `
        SELECT 
          p.*,
          opr.age_group,
          opr.marital_status,
          opr.year_of_marriage,
          opr.no_of_children,
          opr.occupation,
          opr.actual_occupation,
          opr.education_level,
          opr.completed_years_of_education,
          opr.patient_income,
          opr.family_income,
          opr.religion,
          opr.family_type,
          opr.locality,
          opr.head_name,
          opr.head_age,
          opr.head_relationship,
          opr.head_education,
          opr.head_occupation,
          opr.head_income,
          opr.distance_from_hospital,
          opr.mobility,
          opr.referred_by,
          opr.exact_source,
          opr.present_address,
          opr.permanent_address,
          opr.local_address,
          opr.school_college_office,
          opr.contact_number,
          u.name as filled_by_name,
          u.role as filled_by_role
        FROM patients p
        INNER JOIN outpatient_record opr ON p.id = opr.patient_id
        INNER JOIN users u ON opr.filled_by = u.id
        WHERE u.role = 'MWO'
          AND DATE(opr.created_at) = DATE($1)
        ORDER BY opr.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM patients p
        INNER JOIN outpatient_record opr ON p.id = opr.patient_id
        INNER JOIN users u ON opr.filled_by = u.id
        WHERE u.role = 'MWO'
          AND DATE(opr.created_at) = DATE($1)
      `;

      const [patientsResult, countResult] = await Promise.all([
        db.query(query, [targetDate, limitNum, offset]),
        db.query(countQuery, [targetDate])
      ]);

      const patients = patientsResult.rows.map(row => ({
        id: row.id,
        cr_no: row.cr_no,
        psy_no: row.psy_no,
        adl_no: row.adl_no,
        special_clinic_no: row.special_clinic_no,
        name: row.name,
        sex: row.sex,
        actual_age: row.actual_age,
        age_group: row.age_group,
        marital_status: row.marital_status,
        year_of_marriage: row.year_of_marriage,
        no_of_children: row.no_of_children,
        occupation: row.occupation,
        actual_occupation: row.actual_occupation,
        education_level: row.education_level,
        completed_years_of_education: row.completed_years_of_education,
        patient_income: row.patient_income,
        family_income: row.family_income,
        religion: row.religion,
        family_type: row.family_type,
        locality: row.locality,
        head_name: row.head_name,
        head_age: row.head_age,
        head_relationship: row.head_relationship,
        head_education: row.head_education,
        head_occupation: row.head_occupation,
        head_income: row.head_income,
        distance_from_hospital: row.distance_from_hospital,
        mobility: row.mobility,
        referred_by: row.referred_by,
        exact_source: row.exact_source,
        present_address: row.present_address,
        permanent_address: row.permanent_address,
        local_address: row.local_address,
        school_college_office: row.school_college_office,
        contact_number: row.contact_number,
        filled_by_name: row.filled_by_name,
        filled_by_role: row.filled_by_role,
        created_at: row.created_at,
        has_adl_file: row.has_adl_file,
        file_status: row.file_status,
        case_complexity: row.case_complexity,
        assigned_room: row.assigned_room
      }));

      const total = parseInt(countResult.rows[0].total, 10);

      res.status(200).json({
        success: true,
        message: `Patients registered today by MWO (${targetDate.toDateString()})`,
        data: {
          patients,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          },
          date: targetDate.toISOString().split('T')[0]
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
