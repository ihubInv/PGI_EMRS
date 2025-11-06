// const db = require('../config/database');
// const { v4: uuidv4 } = require('uuid');

// class Patient {
//   constructor(data) {
//     this.id = data.id;
//     this.cr_no = data.cr_no;
//     this.psy_no = data.psy_no;
//     this.special_clinic_no = data.special_clinic_no;
//     this.adl_no = data.adl_no;
//     this.name = data.name;
//     this.sex = data.sex;
//     this.actual_age = data.actual_age;
//     this.has_adl_file = data.has_adl_file;
//     this.file_status = data.file_status;
//     this.assigned_room = data.assigned_room;
//     this.case_complexity = data.case_complexity;
//     this.created_at = data.created_at;

//     this.id = data.id;
//     this.patient_id = data.patient_id;
//     this.filled_by = data.filled_by;
//     this.seen_in_walk_in_on = data.seen_in_walk_in_on;
//     this.worked_up_on = data.worked_up_on;
//     this.special_clinic_no = data.special_clinic_no;
//     this.age_group = data.age_group;
//     this.marital_status = data.marital_status;
//     this.year_of_marriage = data.year_of_marriage;
//     this.no_of_children = data.no_of_children;
//     this.no_of_children_male = data.no_of_children_male;
//     this.no_of_children_female = data.no_of_children_female;
//     this.occupation = data.occupation;
//     this.actual_occupation = data.actual_occupation;
//     this.education_level = data.education_level;
//     this.completed_years_of_education = data.completed_years_of_education;
//     this.patient_income = data.patient_income;
//     this.family_income = data.family_income;
//     this.religion = data.religion;
//     this.family_type = data.family_type;
//     this.locality = data.locality;
//     this.head_name = data.head_name;
//     this.head_age = data.head_age;
//     this.head_relationship = data.head_relationship;
//     this.head_education = data.head_education;
//     this.head_occupation = data.head_occupation;
//     this.head_income = data.head_income;
//     this.distance_from_hospital = data.distance_from_hospital;
//     this.mobility = data.mobility;
//     this.referred_by = data.referred_by;
//     this.exact_source = data.exact_source;
//     this.present_address = data.present_address;
//     this.permanent_address = data.permanent_address;
//     this.local_address = data.local_address;
//     this.school_college_office = data.school_college_office;
//     this.contact_number = data.contact_number;
    
//     // Quick Entry fields
//     this.department = data.department;
//     this.unit_consit = data.unit_consit;
//     this.room_no = data.room_no;
//     this.serial_no = data.serial_no;
//     this.file_no = data.file_no;
//     this.unit_days = data.unit_days;
    
//     // Address fields (Quick Entry)
//     this.address_line_1 = data.address_line_1;
//     this.country = data.country;
//     this.state = data.state;
//     this.district = data.district;
//     this.city_town_village = data.city_town_village;
//     this.pin_code = data.pin_code;
    
//     // Present Address fields
//     this.present_address_line_1 = data.present_address_line_1;
//     this.present_country = data.present_country;
//     this.present_state = data.present_state;
//     this.present_district = data.present_district;
//     this.present_city_town_village = data.present_city_town_village;
//     this.present_pin_code = data.present_pin_code;
    
//     // Permanent Address fields
//     this.permanent_address_line_1 = data.permanent_address_line_1;
//     this.permanent_country = data.permanent_country;
//     this.permanent_state = data.permanent_state;
//     this.permanent_district = data.permanent_district;
//     this.permanent_city_town_village = data.permanent_city_town_village;
//     this.permanent_pin_code = data.permanent_pin_code;
    
//     // Additional fields
//     this.category = data.category;
//     this.assigned_doctor_id = data.assigned_doctor_id;
    
//     this.created_at = data.created_at;
//     this.updated_at = data.updated_at;
    
//     // Joined fields from queries
//     this.patient_name = data.patient_name;
//     this.cr_no = data.cr_no;
//     this.psy_no = data.psy_no;
//     this.filled_by_name = data.filled_by_name;
//   }

//   // Generate unique CR number
//   static generateCRNo() {
//     const year = new Date().getFullYear();
//     const timestamp = Date.now().toString().slice(-6);
//     return `CR${year}${timestamp}`;
//   }

//   // Generate unique PSY number
//   static generatePSYNo() {
//     const year = new Date().getFullYear();
//     const timestamp = Date.now().toString().slice(-6);
//     return `PSY${year}${timestamp}`;
//   }

//   // Generate unique ADL number
//   static generateADLNo() {
//     const year = new Date().getFullYear();
//     const uuid = uuidv4().slice(0, 8).toUpperCase();
//     return `ADL${year}${uuid}`;
//   }

//   // Create a new patient
//   static async create(patientData) {
//     try {
//       const { name, sex, actual_age, assigned_room, cr_no, psy_no } = patientData;
      
//       // Use provided CR_NO and PSY_NO, or generate if not provided
//       const final_cr_no = cr_no || Patient.generateCRNo();
//       const final_psy_no = psy_no || Patient.generatePSYNo();

//       // Insert patient
//       const result = await db.query(
//         `INSERT INTO patients (cr_no, psy_no, name, sex, actual_age, assigned_room) 
//          VALUES ($1, $2, $3, $4, $5, $6) 
//          RETURNING *`,
//         [final_cr_no, final_psy_no, name, sex, actual_age, assigned_room]
//       );

//       return new Patient(result.rows[0]);
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Find patient by ID
//   static async findById(id) {
//     try {
//       const result = await db.query(
//         'SELECT * FROM patients WHERE id = $1',
//         [id]
//       );

//       if (result.rows.length === 0) {
//         return null;
//       }

//       return new Patient(result.rows[0]);
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Find patient by CR number
//   static async findByCRNo(cr_no) {
//     try {
//       const result = await db.query(
//         'SELECT * FROM patients WHERE cr_no = $1',
//         [cr_no]
//       );

//       if (result.rows.length === 0) {
//         return null;
//       }

//       return new Patient(result.rows[0]);
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Find patient by PSY number
//   static async findByPSYNo(psy_no) {
//     try {
//       const result = await db.query(
//         'SELECT * FROM patients WHERE psy_no = $1',
//         [psy_no]
//       );

//       if (result.rows.length === 0) {
//         return null;
//       }

//       return new Patient(result.rows[0]);
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Find patient by ADL number
//   static async findByADLNo(adl_no) {
//     try {
//       const result = await db.query(
//         'SELECT * FROM patients WHERE adl_no = $1',
//         [adl_no]
//       );

//       if (result.rows.length === 0) {
//         return null;
//       }

//       return new Patient(result.rows[0]);
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Search patients by name or number
//   static async search(searchTerm, page = 1, limit = 10) {
//     try {
//       const offset = (page - 1) * limit;

//       // Simple search pattern
//       const searchPattern = `%${searchTerm}%`;

//       const query = `
//         SELECT
//           p.*,
//           pa.assigned_doctor as assigned_doctor_id,
//           u.name as assigned_doctor_name,
//           u.role as assigned_doctor_role,
//           pa.visit_date as last_assigned_date
//         FROM patients p
//         LEFT JOIN LATERAL (
//           SELECT * FROM patient_assignments
//           WHERE patient_id = p.id
//           ORDER BY visit_date DESC
//           LIMIT 1
//         ) pa ON true
//         LEFT JOIN users u ON pa.assigned_doctor = u.id
//         WHERE p.name ILIKE $1 OR p.cr_no ILIKE $1 OR p.psy_no ILIKE $1 OR p.adl_no ILIKE $1
//         ORDER BY p.created_at DESC
//         LIMIT $2 OFFSET $3
//       `;

//       const countQuery = `
//         SELECT COUNT(*) FROM patients
//         WHERE name ILIKE $1 OR cr_no ILIKE $1 OR psy_no ILIKE $1 OR adl_no ILIKE $1
//       `;

//       const result = await db.query(query, [searchPattern, limit, offset]);
//       const countResult = await db.query(countQuery, [searchPattern]);

//       const patients = result.rows.map(row => ({
//         ...new Patient(row).toJSON(),
//         assigned_doctor_id: row.assigned_doctor_id,
//         assigned_doctor_name: row.assigned_doctor_name,
//         assigned_doctor_role: row.assigned_doctor_role,
//         last_assigned_date: row.last_assigned_date
//       }));
//       const total = parseInt(countResult.rows[0].count);

//       return {
//         patients,
//         pagination: {
//           page,
//           limit,
//           total,
//           pages: Math.ceil(total / limit)
//         }
//       };
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Get all patients with pagination and filters
//   static async findAll(page = 1, limit = 10, filters = {}) {
//     try {
//       const offset = (page - 1) * limit;
//       let query = 'SELECT * FROM patients WHERE 1=1';
//       let countQuery = 'SELECT COUNT(*) FROM patients WHERE 1=1';
//       const params = [];
//       let paramCount = 0;

//       // Apply filters
//       if (filters.sex) {
//         paramCount++;
//         query += ` AND sex = $${paramCount}`;
//         countQuery += ` AND sex = $${paramCount}`;
//         params.push(filters.sex);
//       }

//       if (filters.case_complexity) {
//         paramCount++;
//         query += ` AND case_complexity = $${paramCount}`;
//         countQuery += ` AND case_complexity = $${paramCount}`;
//         params.push(filters.case_complexity);
//       }

//       if (filters.has_adl_file !== undefined) {
//         paramCount++;
//         query += ` AND has_adl_file = $${paramCount}`;
//         countQuery += ` AND has_adl_file = $${paramCount}`;
//         params.push(filters.has_adl_file);
//       }

//       if (filters.file_status) {
//         paramCount++;
//         query += ` AND file_status = $${paramCount}`;
//         countQuery += ` AND file_status = $${paramCount}`;
//         params.push(filters.file_status);
//       }

//       if (filters.assigned_room) {
//         paramCount++;
//         query += ` AND assigned_room = $${paramCount}`;
//         countQuery += ` AND assigned_room = $${paramCount}`;
//         params.push(filters.assigned_room);
//       }

//       query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
//       params.push(limit, offset);

//       const [patientsResult, countResult] = await Promise.all([
//         db.query(query, params),
//         db.query(countQuery, filters.sex ? [filters.sex] : [])
//       ]);

//       const patients = patientsResult.rows.map(row => new Patient(row));
//       const total = parseInt(countResult.rows[0].count);

//       return {
//         patients,
//         pagination: {
//           page,
//           limit,
//           total,
//           pages: Math.ceil(total / limit)
//         }
//       };
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Update patient
//   async update(updateData) {
//     try {
//       const allowedFields = ['name', 'sex', 'actual_age', 'assigned_room', 'case_complexity', 'file_status', 'has_adl_file'];
//       const updates = [];
//       const values = [];
//       let paramCount = 0;

//       for (const [key, value] of Object.entries(updateData)) {
//         if (allowedFields.includes(key) && value !== undefined) {
//           paramCount++;
//           updates.push(`${key} = $${paramCount}`);
//           values.push(value);
//         }
//       }

//       if (updates.length === 0) {
//         throw new Error('No valid fields to update');
//       }

//       paramCount++;
//       values.push(this.id);

//       const result = await db.query(
//         `UPDATE patients SET ${updates.join(', ')} 
//          WHERE id = $${paramCount} 
//          RETURNING *`,
//         values
//       );

//       if (result.rows.length > 0) {
//         Object.assign(this, result.rows[0]);
//       }

//       return this;
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Create ADL file for complex cases
//   async createADLFile(clinicalProformaId, createdBy) {
//     const client = await db.getClient();
    
//     try {
//       await client.query('BEGIN');
      
//       if (this.has_adl_file) {
//         throw new Error('Patient already has an ADL file');
//       }

//       const adl_no = Patient.generateADLNo();

//       // Update patient record
//       await client.query(
//         `UPDATE patients 
//          SET adl_no = $1, has_adl_file = true, file_status = $2, case_complexity = $3
//          WHERE id = $4`,
//         [adl_no, 'created', 'complex', this.id]
//       );

//       // Update the instance
//       this.adl_no = adl_no;
//       this.has_adl_file = true;
//       this.file_status = 'created';
//       this.case_complexity = 'complex';

//       // Create ADL file record
//       const adlResult = await client.query(
//         `INSERT INTO adl_files (patient_id, adl_no, created_by, clinical_proforma_id, file_status, file_created_date, total_visits) 
//          VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, 1) 
//          RETURNING *`,
//         [this.id, adl_no, createdBy, clinicalProformaId, 'created']
//       );

//       const adlFile = adlResult.rows[0];

//       // Log file creation movement
//       await client.query(
//         `INSERT INTO file_movements (adl_file_id, patient_id, moved_by, movement_type, from_location, to_location, notes) 
//          VALUES ($1, $2, $3, $4, $5, $6, $7)`,
//         [adlFile.id, this.id, createdBy, 'created', 'Doctor Office', 'Record Room', 'Initial ADL file creation for complex case']
//       );

//       await client.query('COMMIT');
      
//       return adlFile;
//     } catch (error) {
//       await client.query('ROLLBACK');
//       throw error;
//     } finally {
//       client.release();
//     }
//   }

//   // Get patient's visit history
//   async getVisitHistory() {
//     try {
//       const result = await db.query(
//         `SELECT pv.*, u.name as doctor_name, u.role as doctor_role
//          FROM patient_visits pv
//          LEFT JOIN users u ON pv.assigned_doctor = u.id
//          WHERE pv.patient_id = $1
//          ORDER BY pv.visit_date DESC`,
//         [this.id]
//       );

//       return result.rows;
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Get patient's clinical records
//   async getClinicalRecords() {
//     try {
//       const result = await db.query(
//         `SELECT cp.*, u.name as doctor_name, u.role as doctor_role
//          FROM clinical_proforma cp
//          LEFT JOIN users u ON cp.filled_by = u.id
//          WHERE cp.patient_id = $1
//          ORDER BY cp.visit_date DESC`,
//         [this.id]
//       );

//       return result.rows;
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Get patient's ADL files
//   async getADLFiles() {
//     try {
//       const result = await db.query(
//         `SELECT af.*, u.name as created_by_name, u.role as created_by_role
//          FROM adl_files af
//          LEFT JOIN users u ON af.created_by = u.id
//          WHERE af.patient_id = $1
//          ORDER BY af.file_created_date DESC`,
//         [this.id]
//       );

//       return result.rows;
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Delete patient (soft delete - only if no records exist)
//   async delete() {
//     try {
//       // Check if patient has any records
//       const recordsCheck = await db.query(
//         `SELECT 
//            (SELECT COUNT(*) FROM outpatient_record WHERE patient_id = $1) as outpatient_count,
//            (SELECT COUNT(*) FROM clinical_proforma WHERE patient_id = $1) as clinical_count,
//            (SELECT COUNT(*) FROM adl_files WHERE patient_id = $1) as adl_count`,
//         [this.id]
//       );

//       const counts = recordsCheck.rows[0];
//       if (counts.outpatient_count > 0 || counts.clinical_count > 0 || counts.adl_count > 0) {
//         throw new Error('Cannot delete patient with existing records');
//       }

//       await db.query('DELETE FROM patients WHERE id = $1', [this.id]);
//       return true;
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Get patient statistics
//   static async getStats() {
//     try {
//       const result = await db.query(`
//         SELECT 
//           COUNT(*) as total_patients,
//           COUNT(CASE WHEN sex = 'M' THEN 1 END) as male_patients,
//           COUNT(CASE WHEN sex = 'F' THEN 1 END) as female_patients,
//           COUNT(CASE WHEN sex = 'Other' THEN 1 END) as other_patients,
//           COUNT(CASE WHEN has_adl_file = true THEN 1 END) as patients_with_adl,
//           COUNT(CASE WHEN case_complexity = 'complex' THEN 1 END) as complex_cases,
//           COUNT(CASE WHEN case_complexity = 'simple' THEN 1 END) as simple_cases
//         FROM patients
//       `);

//       return result.rows[0];
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Convert to JSON
//   toJSON() {
//     return {
//       id: this.id,
//       cr_no: this.cr_no,
//       psy_no: this.psy_no,
//       special_clinic_no: this.special_clinic_no,
//       adl_no: this.adl_no,
//       name: this.name,
//       sex: this.sex,
//       actual_age: this.actual_age,
//       has_adl_file: this.has_adl_file,
//       file_status: this.file_status,
//       assigned_room: this.assigned_room,
//       case_complexity: this.case_complexity,
//       created_at: this.created_at
//     };
//   }
// }

// module.exports = Patient;








// models/Patient.js
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Patient {
  constructor(data = {}) {
    // Core identifiers
    this.id = data.id || null;
    this.cr_no = data.cr_no || null;
    this.psy_no = data.psy_no || null;
    this.adl_no = data.adl_no || null;
    this.special_clinic_no = data.special_clinic_no || null;

    // Basic patient info
    this.name = data.name || null;
    this.sex = data.sex || null;
    this.actual_age = data.actual_age || null;
    this.age_group = data.age_group || null;
    this.marital_status = data.marital_status || null;
    this.year_of_marriage = data.year_of_marriage || null;
    this.no_of_children = data.no_of_children || null;
    this.no_of_children_male = data.no_of_children_male || null;
    this.no_of_children_female = data.no_of_children_female || null;

    // Flags / status
    this.has_adl_file = data.has_adl_file || false;
    this.file_status = data.file_status || null;
    this.case_complexity = data.case_complexity || null;

    // Room / assignment
    this.assigned_room = data.assigned_room || null;
    this.assigned_doctor_id = data.assigned_doctor_id || null;

    // Contact / family
    this.contact_number = data.contact_number || null;
    this.head_name = data.head_name || null;
    this.head_age = data.head_age || null;
    this.head_relationship = data.head_relationship || null;
    this.head_education = data.head_education || null;
    this.head_occupation = data.head_occupation || null;
    this.head_income = data.head_income || null;

    // Income / occupation / education
    this.occupation = data.occupation || null;
    this.actual_occupation = data.actual_occupation || null;
    this.education_level = data.education_level || null;
    this.completed_years_of_education = data.completed_years_of_education || null;
    this.patient_income = data.patient_income || null;
    this.family_income = data.family_income || null;

    // Addresses (quick/present/permanent)
    this.address_line_1 = data.address_line_1 || null;
    this.address_line_2 = data.address_line_2 || null;
    this.country = data.country || null;
    this.state = data.state || null;
    this.district = data.district || null;
    this.city_town_village = data.city_town_village || null;
    this.pin_code = data.pin_code || null;

    this.present_address_line_1 = data.present_address_line_1 || null;
    this.present_address_line_2 = data.present_address_line_2 || null;
    this.present_country = data.present_country || null;
    this.present_state = data.present_state || null;
    this.present_district = data.present_district || null;
    this.present_city_town_village = data.present_city_town_village || null;
    this.present_pin_code = data.present_pin_code || null;

    this.permanent_address_line_1 = data.permanent_address_line_1 || null;
    this.permanent_address_line_2 = data.permanent_address_line_2 || null;
    this.permanent_country = data.permanent_country || null;
    this.permanent_state = data.permanent_state || null;
    this.permanent_district = data.permanent_district || null;
    this.permanent_city_town_village = data.permanent_city_town_village || null;
    this.permanent_pin_code = data.permanent_pin_code || null;

    // Quick Entry / registration helper fields
    this.department = data.department || null;
    this.unit_consit = data.unit_consit || null;
    this.room_no = data.room_no || null;
    this.serial_no = data.serial_no || null;
    this.file_no = data.file_no || null;
    this.unit_days = data.unit_days || null;

    // Legacy Address Fields
    this.present_address = data.present_address || null;
    this.permanent_address = data.permanent_address || null;
    this.local_address = data.local_address || null;

    // misc
    this.religion = data.religion || null;
    this.family_type = data.family_type || null;
    this.locality = data.locality || null;
    this.school_college_office = data.school_college_office || null;
    this.distance_from_hospital = data.distance_from_hospital || null;
    this.mobility = data.mobility || null;
    this.referred_by = data.referred_by || null;
    this.exact_source = data.exact_source || null;
    this.seen_in_walk_in_on = data.seen_in_walk_in_on || null;
    this.worked_up_on = data.worked_up_on || null;
    this.category = data.category || null;
    this.filled_by = data.filled_by || null;
    this.filled_by_name = data.filled_by_name || null;

    // timestamps
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;

    // joined fields (if returned by queries)
    this.patient_name = data.patient_name || this.name || null;
    this.assigned_doctor_name = data.assigned_doctor_name || null;
    this.assigned_doctor_role = data.assigned_doctor_role || null;
    this.last_assigned_date = data.last_assigned_date || null;
  }

  // Utilities for unique numbers
  static generateCRNo() {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `CR${year}${timestamp}`;
  }

  static generatePSYNo() {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `PSY${year}${timestamp}`;
  }

  static generateADLNo() {
    const year = new Date().getFullYear();
    const uuid = uuidv4().slice(0, 8).toUpperCase();
    return `ADL${year}${uuid}`;
  }

  // Create new patient record
  static async create(patientData) {
    try {
      // Extract basic required fields
      const {
        name, sex, actual_age, assigned_room, cr_no, psy_no, assigned_doctor_id, contact_number,
        // All other fields that might be provided
        filled_by, special_clinic_no, seen_in_walk_in_on, worked_up_on,
        age_group, marital_status, year_of_marriage, no_of_children, 
        no_of_children_male, no_of_children_female,
        occupation, actual_occupation, education_level, completed_years_of_education,
        patient_income, family_income,
        religion, family_type, locality, head_name, head_age, head_relationship,
        head_education, head_occupation, head_income,
        distance_from_hospital, mobility, referred_by, exact_source,
        school_college_office,
        department, unit_consit, room_no, serial_no, file_no, unit_days,
        address_line_1, address_line_2, country, state, district, 
        city_town_village, pin_code,
        present_address_line_1, present_address_line_2, present_country, 
        present_state, present_district, present_city_town_village, present_pin_code,
        permanent_address_line_1, permanent_address_line_2, permanent_country, 
        permanent_state, permanent_district, permanent_city_town_village, 
        permanent_pin_code,
        // Legacy address fields
        present_address, permanent_address, local_address,
        category, has_adl_file, file_status, case_complexity
      } = patientData;

      // Generate CR and PSY numbers if not provided
      const final_cr_no = cr_no || Patient.generateCRNo();
      const final_psy_no = psy_no || Patient.generatePSYNo();

      // Build dynamic INSERT query with all provided fields
      const fields = [];
      const values = [];
      const placeholders = [];
      let paramCount = 0;

      // Required fields (always included)
      fields.push('cr_no');
      placeholders.push(`$${++paramCount}`);
      values.push(final_cr_no);

      fields.push('psy_no');
      placeholders.push(`$${++paramCount}`);
      values.push(final_psy_no);

      fields.push('name');
      placeholders.push(`$${++paramCount}`);
      values.push(name);

      fields.push('sex');
      placeholders.push(`$${++paramCount}`);
      values.push(sex);

      fields.push('actual_age');
      placeholders.push(`$${++paramCount}`);
      values.push(actual_age);

      // Optional fields - only include if they have values
      const optionalFields = {
        assigned_room, assigned_doctor_id, contact_number, filled_by,
        special_clinic_no, seen_in_walk_in_on, worked_up_on,
        age_group, marital_status, year_of_marriage, no_of_children,
        no_of_children_male, no_of_children_female,
        occupation, actual_occupation, education_level, completed_years_of_education,
        patient_income, family_income,
        religion, family_type, locality, head_name, head_age, head_relationship,
        head_education, head_occupation, head_income,
        distance_from_hospital, mobility, referred_by, exact_source,
        school_college_office,
        department, unit_consit, room_no, serial_no, file_no, unit_days,
        address_line_1, address_line_2, country, state, district,
        city_town_village, pin_code,
        present_address_line_1, present_address_line_2, present_country,
        present_state, present_district, present_city_town_village, present_pin_code,
        permanent_address_line_1, permanent_address_line_2, permanent_country,
        permanent_state, permanent_district, permanent_city_town_village,
        permanent_pin_code,
        // Legacy address fields
        present_address, permanent_address, local_address,
        category, has_adl_file, file_status, case_complexity
      };

      // Add optional fields that have values
      for (const [fieldName, fieldValue] of Object.entries(optionalFields)) {
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
          fields.push(fieldName);
          placeholders.push(`$${++paramCount}`);
          values.push(fieldValue);
        }
      }

      // Add created_at timestamp
      fields.push('created_at');
      placeholders.push('CURRENT_TIMESTAMP');

      // Build and execute INSERT query
      const query = `
        INSERT INTO patients (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;

      console.log(`[Patient.create] Inserting patient with ${fields.length} fields`);
      console.log(`[Patient.create] Fields:`, fields.slice(0, 10), '...');

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Failed to create patient: No row returned');
      }

      return new Patient(result.rows[0]);
    } catch (error) {
      console.error('[Patient.create] Error creating patient:', error);
      throw error;
    }
  }

  // Find by id
  static async findById(id) {
    try {
      const result = await db.query('SELECT * FROM patients WHERE id = $1', [id]);
      if (result.rows.length === 0) return null;
      return new Patient(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find by cr, psy, adl
  static async findByCRNo(cr_no) {
    try {
      const result = await db.query('SELECT * FROM patients WHERE cr_no = $1', [cr_no]);
      if (result.rows.length === 0) return null;
      return new Patient(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findByPSYNo(psy_no) {
    try {
      const result = await db.query('SELECT * FROM patients WHERE psy_no = $1', [psy_no]);
      if (result.rows.length === 0) return null;
      return new Patient(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findByADLNo(adl_no) {
    try {
      const result = await db.query('SELECT * FROM patients WHERE adl_no = $1', [adl_no]);
      if (result.rows.length === 0) return null;
      return new Patient(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Search (name / cr / psy / adl) with pagination
  static async search(searchTerm = '', page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const searchPattern = `%${searchTerm}%`;

      const query = `
        SELECT
          p.id, p.name, p.cr_no, p.psy_no, p.adl_no, p.sex, p.actual_age, 
          p.dob, p.age_group, p.marital_status, p.year_of_marriage, 
          p.no_of_children, p.no_of_children_male, p.no_of_children_female,
          p.occupation, p.education_level, p.religion, p.family_type, p.locality,
          p.patient_income, p.family_income, p.contact_number,
          p.head_name, p.head_age, p.head_relationship, p.head_education, 
          p.head_occupation, p.head_income,
          p.present_address_line_1, p.present_country, p.present_state, 
          p.present_district, p.present_city_town_village, p.present_pin_code,
          p.permanent_address_line_1, p.permanent_country, p.permanent_state,
          p.permanent_district, p.permanent_city_town_village, p.permanent_pin_code,
          p.address_line_1, p.country, p.state, p.district, p.city_town_village, p.pin_code,
          p.category, p.special_clinic_no, p.assigned_room, p.created_at,
          CASE WHEN af.id IS NOT NULL THEN true ELSE COALESCE(p.has_adl_file, false) END as has_adl_file,
          CASE 
            WHEN af.id IS NOT NULL THEN 'complex'
            WHEN p.case_complexity IS NOT NULL THEN p.case_complexity
            ELSE 'simple'
          END as case_complexity,
          p.file_status,
          pa.assigned_doctor as assigned_doctor_id,
          u.name as assigned_doctor_name,
          u.role as assigned_doctor_role,
          pa.visit_date as last_assigned_date
        FROM patients p
        LEFT JOIN adl_files af ON af.patient_id = p.id
        LEFT JOIN LATERAL (
          SELECT * FROM patient_assignments
          WHERE patient_id = p.id
          ORDER BY visit_date DESC
          LIMIT 1
        ) pa ON true
        LEFT JOIN users u ON pa.assigned_doctor = u.id
        WHERE p.name ILIKE $1 OR p.cr_no ILIKE $1 OR p.psy_no ILIKE $1 OR p.adl_no ILIKE $1
        GROUP BY p.id, p.name, p.cr_no, p.psy_no, p.adl_no, p.sex, p.actual_age, 
          p.dob, p.age_group, p.marital_status, p.year_of_marriage, 
          p.no_of_children, p.no_of_children_male, p.no_of_children_female,
          p.occupation, p.education_level, p.religion, p.family_type, p.locality,
          p.patient_income, p.family_income, p.contact_number,
          p.head_name, p.head_age, p.head_relationship, p.head_education, 
          p.head_occupation, p.head_income,
          p.present_address_line_1, p.present_country, p.present_state, 
          p.present_district, p.present_city_town_village, p.present_pin_code,
          p.permanent_address_line_1, p.permanent_country, p.permanent_state,
          p.permanent_district, p.permanent_city_town_village, p.permanent_pin_code,
          p.address_line_1, p.country, p.state, p.district, p.city_town_village, p.pin_code,
          p.category, p.special_clinic_no, p.assigned_room, p.created_at,
          p.has_adl_file, p.case_complexity, p.file_status, af.id,
          pa.assigned_doctor, u.name, u.role, pa.visit_date
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const countQuery = `
        SELECT COUNT(*) as cnt FROM patients p
        WHERE p.name ILIKE $1 OR p.cr_no ILIKE $1 OR p.psy_no ILIKE $1 OR p.adl_no ILIKE $1
      `;

      const [result, countResult] = await Promise.all([
        db.query(query, [searchPattern, limit, offset]),
        db.query(countQuery, [searchPattern])
      ]);

      const total = parseInt(countResult.rows[0].cnt, 10);

      // Return rich object using row data (not limited to toJSON)
      const patients = result.rows.map(row => {
        const patient = new Patient(row);
        return {
          ...patient.toJSON(),
          // include joined fields explicitly
          assigned_doctor_id: row.assigned_doctor_id || patient.assigned_doctor_id,
          assigned_doctor_name: row.assigned_doctor_name || patient.assigned_doctor_name,
          assigned_doctor_role: row.assigned_doctor_role || patient.assigned_doctor_role,
          last_assigned_date: row.last_assigned_date || patient.last_assigned_date
        };
      });

      return {
        patients,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all with filters (robust parameter handling)
  static async findAll(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const where = [];
      const params = [];
      let idx = 1;

      if (filters.sex) {
        where.push(`p.sex = $${idx++}`);
        params.push(filters.sex);
      }
      if (filters.case_complexity) {
        // For complex filter, check both stored value and actual ADL file existence
        if (filters.case_complexity === 'complex') {
          where.push(`(p.case_complexity = 'complex' OR af.id IS NOT NULL)`);
        } else {
          where.push(`p.case_complexity = $${idx++}`);
          params.push(filters.case_complexity);
        }
      }
      if (filters.has_adl_file !== undefined) {
        // For has_adl_file filter, check both stored value and actual ADL file existence
        if (filters.has_adl_file) {
          where.push(`(p.has_adl_file = true OR af.id IS NOT NULL)`);
        } else {
          where.push(`(p.has_adl_file = false AND af.id IS NULL)`);
        }
      }
      if (filters.file_status) {
        where.push(`p.file_status = $${idx++}`);
        params.push(filters.file_status);
      }
      if (filters.assigned_room) {
        where.push(`p.assigned_room = $${idx++}`);
        params.push(filters.assigned_room);
      }

      const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const query = `
        SELECT 
          p.id, p.name, p.cr_no, p.psy_no, p.adl_no, p.sex, p.actual_age, 
          p.dob, p.age_group, p.marital_status, p.year_of_marriage, 
          p.no_of_children, p.no_of_children_male, p.no_of_children_female,
          p.occupation, p.education_level, p.religion, p.family_type, p.locality,
          p.patient_income, p.family_income, p.contact_number,
          p.head_name, p.head_age, p.head_relationship, p.head_education, 
          p.head_occupation, p.head_income,
          p.present_address_line_1, p.present_country, p.present_state, 
          p.present_district, p.present_city_town_village, p.present_pin_code,
          p.permanent_address_line_1, p.permanent_country, p.permanent_state,
          p.permanent_district, p.permanent_city_town_village, p.permanent_pin_code,
          p.address_line_1, p.country, p.state, p.district, p.city_town_village, p.pin_code,
          p.category, p.special_clinic_no, p.assigned_room, p.created_at,
          CASE WHEN af.id IS NOT NULL THEN true ELSE COALESCE(p.has_adl_file, false) END as has_adl_file,
          CASE 
            WHEN af.id IS NOT NULL THEN 'complex'
            WHEN p.case_complexity IS NOT NULL THEN p.case_complexity
            ELSE 'simple'
          END as case_complexity,
          p.file_status
        FROM patients p
        LEFT JOIN adl_files af ON af.patient_id = p.id
        ${whereClause}
        GROUP BY p.id, p.name, p.cr_no, p.psy_no, p.adl_no, p.sex, p.actual_age, 
          p.dob, p.age_group, p.marital_status, p.year_of_marriage, 
          p.no_of_children, p.no_of_children_male, p.no_of_children_female,
          p.occupation, p.education_level, p.religion, p.family_type, p.locality,
          p.patient_income, p.family_income, p.contact_number,
          p.head_name, p.head_age, p.head_relationship, p.head_education, 
          p.head_occupation, p.head_income,
          p.present_address_line_1, p.present_country, p.present_state, 
          p.present_district, p.present_city_town_village, p.present_pin_code,
          p.permanent_address_line_1, p.permanent_country, p.permanent_state,
          p.permanent_district, p.permanent_city_town_village, p.permanent_pin_code,
          p.address_line_1, p.country, p.state, p.district, p.city_town_village, p.pin_code,
          p.category, p.special_clinic_no, p.assigned_room, p.created_at,
          p.has_adl_file, p.case_complexity, p.file_status, af.id
        ORDER BY p.created_at DESC
        LIMIT $${idx++} OFFSET $${idx++}
      `;
      params.push(limit, offset);

      // Build count query with same filters but without LIMIT/OFFSET
      const countParams = params.slice(0, params.length - 2); // Remove limit and offset params
      const countQuery = `
        SELECT COUNT(DISTINCT p.id) as cnt FROM patients p
        LEFT JOIN adl_files af ON af.patient_id = p.id
        ${whereClause}
      `;

      const [patientsResult, countResult] = await Promise.all([
        db.query(query, params).catch(err => {
          console.error('[Patient.findAll] Query error:', err);
          console.error('[Patient.findAll] Query:', query);
          console.error('[Patient.findAll] Params:', params);
          throw err;
        }),
        db.query(countQuery, countParams).catch(err => {
          console.error('[Patient.findAll] Count query error:', err);
          console.error('[Patient.findAll] Count query:', countQuery);
          console.error('[Patient.findAll] Count params:', countParams);
          throw err;
        })
      ]);

      const patients = patientsResult.rows.map(r => new Patient(r).toJSON());
      const total = parseInt(countResult.rows[0].cnt, 10);

      return {
        patients,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update patient (allows multiple fields)
  async update(updateData = {}) {
    try {
      // broaden allowed updatable fields as required
      const allowedFields = [
        'name','sex','actual_age','assigned_room','case_complexity','file_status','has_adl_file',
        'contact_number','assigned_doctor_id','occupation','education_level','patient_income',
        'family_income','present_address_line_1','present_country','present_state','present_district',
        'present_city_town_village','present_pin_code','permanent_address_line_1','permanent_country',
        'permanent_state','permanent_district','permanent_city_town_village','permanent_pin_code',
        'address_line_1','country','state','district','city_town_village','pin_code','category'
      ];

      const updates = [];
      const values = [];
      let idx = 1;

      for (const [k, v] of Object.entries(updateData)) {
        if (allowedFields.includes(k) && v !== undefined) {
          updates.push(`${k} = $${idx++}`);
          values.push(v);
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(this.id);
      const result = await db.query(
        `UPDATE patients SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
        values
      );

      if (result.rows.length) {
        Object.assign(this, result.rows[0]);
      }

      return this;
    } catch (error) {
      throw error;
    }
  }

  // Create ADL file (transactional)
  async createADLFile(clinicalProformaId, createdBy) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      if (this.has_adl_file) {
        throw new Error('Patient already has an ADL file');
      }

      const adl_no = Patient.generateADLNo();

      await client.query(
        `UPDATE patients SET adl_no = $1, has_adl_file = true, file_status = $2, case_complexity = $3 WHERE id = $4`,
        [adl_no, 'created', 'complex', this.id]
      );

      this.adl_no = adl_no;
      this.has_adl_file = true;
      this.file_status = 'created';
      this.case_complexity = 'complex';

      const adlResult = await client.query(
        `INSERT INTO adl_files (patient_id, adl_no, created_by, clinical_proforma_id, file_status, file_created_date, total_visits)
         VALUES ($1,$2,$3,$4,$5,CURRENT_DATE,1) RETURNING *`,
        [this.id, adl_no, createdBy, clinicalProformaId, 'created']
      );

      await client.query(
        `INSERT INTO file_movements (adl_file_id, patient_id, moved_by, movement_type, from_location, to_location, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [adlResult.rows[0].id, this.id, createdBy, 'created', 'Doctor Office', 'Record Room', 'Initial ADL file creation for complex case']
      );

      await client.query('COMMIT');
      return adlResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get visit history
  async getVisitHistory() {
    try {
      const result = await db.query(
        `SELECT pv.*, u.name as doctor_name, u.role as doctor_role
         FROM patient_visits pv
         LEFT JOIN users u ON pv.assigned_doctor = u.id
         WHERE pv.patient_id = $1
         ORDER BY pv.visit_date DESC`,
        [this.id]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get clinical records
  async getClinicalRecords() {
    try {
      const result = await db.query(
        `SELECT cp.*, u.name as doctor_name, u.role as doctor_role
         FROM clinical_proforma cp
         LEFT JOIN users u ON cp.filled_by = u.id
         WHERE cp.patient_id = $1
         ORDER BY cp.visit_date DESC`,
        [this.id]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get ADL files
  async getADLFiles() {
    try {
      const result = await db.query(
        `SELECT af.*, u.name as created_by_name, u.role as created_by_role
         FROM adl_files af
         LEFT JOIN users u ON af.created_by = u.id
         WHERE af.patient_id = $1
         ORDER BY af.file_created_date DESC`,
        [this.id]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Soft-delete guard
  async delete() {
    try {
      const recordsCheck = await db.query(
        `SELECT 
           (SELECT COUNT(*) FROM outpatient_record WHERE patient_id = $1) as outpatient_count,
           (SELECT COUNT(*) FROM clinical_proforma WHERE patient_id = $1) as clinical_count,
           (SELECT COUNT(*) FROM adl_files WHERE patient_id = $1) as adl_count`,
        [this.id]
      );

      const counts = recordsCheck.rows[0];
      if (parseInt(counts.outpatient_count, 10) > 0 ||
          parseInt(counts.clinical_count, 10) > 0 ||
          parseInt(counts.adl_count, 10) > 0) {
        throw new Error('Cannot delete patient with existing records');
      }

      await db.query('DELETE FROM patients WHERE id = $1', [this.id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Statistics
  static async getStats() {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_patients,
          COUNT(CASE WHEN sex = 'M' THEN 1 END) as male_patients,
          COUNT(CASE WHEN sex = 'F' THEN 1 END) as female_patients,
          COUNT(CASE WHEN sex NOT IN ('M','F') THEN 1 END) as other_patients,
          COUNT(CASE WHEN has_adl_file = true THEN 1 END) as patients_with_adl,
          COUNT(CASE WHEN case_complexity = 'complex' THEN 1 END) as complex_cases,
          COUNT(CASE WHEN case_complexity = 'simple' THEN 1 END) as simple_cases
        FROM patients
      `);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // toJSON: return all fields for comprehensive export
  toJSON() {
    return {
      // Identifiers
      id: this.id,
      cr_no: this.cr_no,
      psy_no: this.psy_no,
      adl_no: this.adl_no,
      special_clinic_no: this.special_clinic_no,
  
      // Basic info
      name: this.name,
      sex: this.sex,
      actual_age: this.actual_age,
      age_group: this.age_group,
      marital_status: this.marital_status,
      year_of_marriage: this.year_of_marriage,
      no_of_children: this.no_of_children,
      no_of_children_male: this.no_of_children_male,
      no_of_children_female: this.no_of_children_female,
  
      // Flags / status
      has_adl_file: this.has_adl_file,
      file_status: this.file_status,
      case_complexity: this.case_complexity,
  
      // Room / assignment
      assigned_room: this.assigned_room,
      assigned_doctor_id: this.assigned_doctor_id,
      assigned_doctor_name: this.assigned_doctor_name,
      assigned_doctor_role: this.assigned_doctor_role,
      last_assigned_date: this.last_assigned_date,
  
      // Contact / family
      contact_number: this.contact_number,
      head_name: this.head_name,
      head_age: this.head_age,
      head_relationship: this.head_relationship,
      head_education: this.head_education,
      head_occupation: this.head_occupation,
      head_income: this.head_income,
  
      // Income / occupation / education
      occupation: this.occupation,
      actual_occupation: this.actual_occupation,
      education_level: this.education_level,
      completed_years_of_education: this.completed_years_of_education,
      patient_income: this.patient_income,
      family_income: this.family_income,
  
      // Quick entry / registration helper fields
      department: this.department,
      unit_consit: this.unit_consit,
      room_no: this.room_no,
      serial_no: this.serial_no,
      file_no: this.file_no,
      unit_days: this.unit_days,
  
      // Addresses - Quick Entry
      address_line_1: this.address_line_1,
      address_line_2: this.address_line_2,
      country: this.country,
      state: this.state,
      district: this.district,
      city_town_village: this.city_town_village,
      pin_code: this.pin_code,
  
      // Present Address
      present_address_line_1: this.present_address_line_1,
      present_address_line_2: this.present_address_line_2,
      present_country: this.present_country,
      present_state: this.present_state,
      present_district: this.present_district,
      present_city_town_village: this.present_city_town_village,
      present_pin_code: this.present_pin_code,
  
      // Permanent Address
      permanent_address_line_1: this.permanent_address_line_1,
      permanent_address_line_2: this.permanent_address_line_2,
      permanent_country: this.permanent_country,
      permanent_state: this.permanent_state,
      permanent_district: this.permanent_district,
      permanent_city_town_village: this.permanent_city_town_village,
      permanent_pin_code: this.permanent_pin_code,
  
      // Legacy Address Fields
      present_address: this.present_address,
      permanent_address: this.permanent_address,
      local_address: this.local_address,
  
      // Family & Social
      religion: this.religion,
      family_type: this.family_type,
      locality: this.locality,
      school_college_office: this.school_college_office,
  
      // Referral & Mobility
      distance_from_hospital: this.distance_from_hospital,
      mobility: this.mobility,
      referred_by: this.referred_by,
      exact_source: this.exact_source,
      seen_in_walk_in_on: this.seen_in_walk_in_on,
      worked_up_on: this.worked_up_on,
  
      // Additional Fields
      category: this.category,
      filled_by: this.filled_by,
      filled_by_name: this.filled_by_name,
      patient_name: this.patient_name,
  
      // Timestamps
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
  
}

module.exports = Patient;
