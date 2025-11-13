
// models/Patient.js
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Patient {
  constructor(data = {}) {
    // 🔹 Core identifiers
    this.id = data.id || null;
    this.cr_no = data.cr_no || null;
    this.psy_no = data.psy_no || null;
    this.adl_no = data.adl_no || null;
    this.special_clinic_no = data.special_clinic_no || null;

    // 🔹 Registration & Quick Entry details
    this.date = data.date || null;
    this.name = data.name || null;
    this.age = data.age || null;
    this.sex = data.sex || null;
    this.category = data.category || null;
    this.father_name = data.father_name || null;
    this.department = data.department || null;
    this.unit_consit = data.unit_consit || null;
    this.room_no = data.room_no || null;
    this.serial_no = data.serial_no || null;
    this.file_no = data.file_no || null;
    this.unit_days = data.unit_days || null;
    this.contact_number = data.contact_number || data.contact_number || null;

    // 🔹 Examination & clinic details
    this.seen_in_walk_in_on = data.seen_in_walk_in_on || null;
    this.worked_up_on = data.worked_up_on || null;
    this.age_group = data.age_group || null;

    // 🔹 Personal information
    this.marital_status = data.marital_status || null;
    this.year_of_marriage = data.year_of_marriage || null;
    this.no_of_children_male = data.no_of_children_male || null;
    this.no_of_children_female = data.no_of_children_female || null;

    // 🔹 Occupation & education
    this.occupation = data.occupation || null;
    this.education = data.education || null;
    this.locality = data.locality || null;
    this.income = data.income || null;
    this.religion = data.religion || null;
    this.family_type = data.family_type || null;

    // 🔹 Head of family
    this.head_name = data.head_name || data.father_name || null;
    this.head_age = data.head_age || null;
    this.head_relationship = data.head_relationship || null;
    this.head_education = data.head_education || null;
    this.head_occupation = data.head_occupation || null;
    this.head_income = data.head_income || null;

    // 🔹 Distance & mobility
    this.distance_from_hospital = data.distance_from_hospital || null;
    this.mobility = data.mobility || null;

    // 🔹 Referral & assignment
    this.referred_by = data.referred_by || null;
    this.assigned_room = data.assigned_room || null;

    // 🔹 Address details
    this.address_line = data.address_line || null;
    this.country = data.country || null;
    this.state = data.state || null;
    this.district = data.district || null;
    this.city = data.city || null;
    this.pin_code = data.pin_code || null;

    // 🔹 Optional system / metadata fields
    this.has_adl_file = data.has_adl_file || false;
    this.file_status = data.file_status || null;
    this.case_complexity = data.case_complexity || null;
    this.filled_by = data.filled_by || null;
    this.filled_by_name = data.filled_by_name || null;

    // 🔹 Timestamps
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;

    // 🔹 Joined / derived fields (query results)
    this.patient_name = data.patient_name || this.name || null;
    this.assigned_doctor_name = data.assigned_doctor_name || null;
    this.assigned_doctor_role = data.assigned_doctor_role || null;
    this.last_assigned_date = data.last_assigned_date || null;
    this.assigned_doctor_id = data.assigned_doctor_id || null;
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
      const {
        // Registration & Quick Entry
        cr_no,
        date,
        name,
        contact_number,
        age,
        sex,
        category,
        father_name,
        department,
        unit_consit,
        room_no,
        serial_no,
        file_no,
        unit_days,
      
        // Examination Details
        seen_in_walk_in_on,
        worked_up_on,
        psy_no,
        special_clinic_no,
        age_group,
      
        // Personal Information
        marital_status,
        year_of_marriage,
        no_of_children_male,
        no_of_children_female,
      
        // Occupation & Education
        occupation,
        education,
        locality,
        income,
        religion,
        family_type,
      
        // Head of Family
        head_name,
        head_age,
        head_relationship,
        head_education,
        head_occupation,
        head_income,
      
        // Distance & Mobility
        distance_from_hospital,
        mobility,
      
        // Referred By
        referred_by,
      
        // Address Details
        address_line,
        country,
        state,
        district,
        city,
        pin_code,
      
        // Additional Fields
        assigned_doctor_name,
        assigned_doctor_id,
        assigned_room,
        filled_by,
        has_adl_file,
        file_status
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

      fields.push('age');
      placeholders.push(`$${++paramCount}`);
      values.push(age);

      // Handle field mappings and fallbacks

      

      // Optional fields - only include if they have values
      const optionalFields = {
        name,
        sex,
        age,
        date,
        contact_number,
        category,
        father_name,
        department,
        unit_consit,
        room_no,
        serial_no,
        file_no,
        unit_days,
        seen_in_walk_in_on,
        worked_up_on,
        special_clinic_no,
        age_group,
        marital_status,
        year_of_marriage,
        no_of_children_male,
        no_of_children_female,
        occupation,
        education,
        locality,
        income,
        religion,
        family_type,
        head_name,
        head_age,
        head_relationship,
        head_education,
        head_occupation,
        head_income,
        distance_from_hospital,
        mobility,
        referred_by,
        address_line,
        country,
        state,
        district,
        city,
        pin_code,
        assigned_doctor_name,
        assigned_doctor_id,
        assigned_room,
        filled_by,
        has_adl_file,
        file_status
      };

      // Add optional fields that have values
      for (const [fieldName, fieldValue] of Object.entries(optionalFields)) {
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
          fields.push(fieldName);
          placeholders.push(`$${++paramCount}`);
          values.push(fieldValue);
        }
      }

      // If assigned_doctor_id is provided but assigned_doctor_name is not, fetch it
      if (assigned_doctor_id && !assigned_doctor_name) {
        try {
          const doctorResult = await db.query(
            'SELECT name FROM users WHERE id = $1',
            [assigned_doctor_id]
          );
          if (doctorResult.rows.length > 0) {
            const doctorName = doctorResult.rows[0].name;
            // Only add if not already in fields
            if (!fields.includes('assigned_doctor_name')) {
              fields.push('assigned_doctor_name');
              placeholders.push(`$${++paramCount}`);
              values.push(doctorName);
            }
          }
        } catch (err) {
          console.warn('[Patient.create] Could not fetch doctor name:', err.message);
        }
      }

      // Add created_at timestamp
      fields.push('created_at');
      placeholders.push('CURRENT_TIMESTAMP');

      // Build and execute INSERT query
      const query = `
        INSERT INTO registered_patient (${fields.join(', ')})
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

  // Find by id (supports both integer and UUID)
  // static async findById(id) {
  //   try {
  //     if (!id) {
  //       console.error(`[Patient.findById] No ID provided`);
  //       return null;
  //     }

  //     // Check if ID is a UUID (contains hyphens) or integer
  //     const isUUID = typeof id === 'string' && id.includes('-') && id.length === 36;
  //     let patientId;
      
  //     if (isUUID) {
  //       // UUID format - use as-is, ensure it's a valid UUID format
  //       patientId = id.trim();
  //       // Validate UUID format (basic check: 8-4-4-4-12 hex digits with hyphens)
  //       const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  //       if (!uuidRegex.test(patientId)) {
  //         console.error(`[Patient.findById] Invalid UUID format: ${patientId}`);
  //         return null;
  //       }
  //       console.log(`[Patient.findById] Querying for patient UUID: ${patientId}`);
  //     } else {
  //       // Try to parse as integer
  //       patientId = parseInt(id, 10);
  //       if (isNaN(patientId) || patientId <= 0) {
  //         console.error(`[Patient.findById] Invalid ID provided: ${id}`);
  //         return null;
  //       }
  //       console.log(`[Patient.findById] Querying for patient ID: ${patientId}`);
  //     }
      
  //     // Build query with explicit type casting based on ID type
  //     // For UUID, cast parameter to UUID; for integer, use integer comparison
  //     let query;
  //     let queryParam;
      
  //     if (isUUID) {
  //       // For UUID, explicitly cast parameter to UUID type
  //       query = `
  //       SELECT 
  //         p.*,
  //         CASE WHEN af.id IS NOT NULL THEN true ELSE COALESCE(p.has_adl_file, false) END as has_adl_file,
  //         CASE 
  //           WHEN af.id IS NOT NULL THEN 'complex'
  //           ELSE 'simple'
  //         END as case_complexity,
  //         COALESCE(
  //           p.assigned_doctor_id,
  //           (
  //             SELECT assigned_doctor_id 
  //             FROM patient_visits 
  //             WHERE patient_id = p.id
  //             ORDER BY visit_date DESC 
  //             LIMIT 1
  //           )
  //         ) as assigned_doctor_id,
  //         COALESCE(
  //           p.assigned_doctor_name,
  //           (
  //             SELECT u.name 
  //             FROM patient_visits pv
  //             JOIN users u ON u.id = pv.assigned_doctor_id
  //             WHERE pv.patient_id = p.id
  //             ORDER BY pv.visit_date DESC 
  //             LIMIT 1
  //           )
  //         ) as assigned_doctor_name,
  //           (
  //             SELECT u.role 
  //             FROM patient_visits pv
  //             JOIN users u ON u.id = pv.assigned_doctor_id
  //             WHERE pv.patient_id = p.id
  //             ORDER BY pv.visit_date DESC 
  //             LIMIT 1
  //           ) as assigned_doctor_role,
  //           (
  //             SELECT visit_date 
  //             FROM patient_visits 
  //             WHERE patient_id = p.id
  //             ORDER BY visit_date DESC 
  //             LIMIT 1
  //           ) as last_assigned_date
  //       FROM registered_patient p
  //       LEFT JOIN adl_files af ON af.patient_id = p.id
  //         WHERE p.id = $1::uuid
  //       `;
  //       queryParam = patientId; // UUID string
  //     } else {
  //       // For integer, use integer comparison
  //       query = `
  //         SELECT 
  //           p.*,
  //           CASE WHEN af.id IS NOT NULL THEN true ELSE COALESCE(p.has_adl_file, false) END as has_adl_file,
  //           CASE 
  //             WHEN af.id IS NOT NULL THEN 'complex'
  //             ELSE 'simple'
  //           END as case_complexity,
  //           COALESCE(
  //             p.assigned_doctor_id,
  //             (
  //               SELECT assigned_doctor_id 
  //               FROM patient_visits 
  //               WHERE patient_id = p.id
  //               ORDER BY visit_date DESC
  //               LIMIT 1
  //             )
  //           ) as assigned_doctor_id,
  //           COALESCE(
  //             p.assigned_doctor_name,
  //             (
  //               SELECT u.name 
  //               FROM patient_visits pv
  //               JOIN users u ON u.id = pv.assigned_doctor_id
  //               WHERE pv.patient_id = p.id
  //               ORDER BY pv.visit_date DESC 
  //               LIMIT 1
  //             )
  //           ) as assigned_doctor_name,
  //           (
  //             SELECT u.role 
  //             FROM patient_visits pv
  //             JOIN users u ON u.id = pv.assigned_doctor_id
  //             WHERE pv.patient_id = p.id
  //             ORDER BY pv.visit_date DESC 
  //             LIMIT 1
  //           ) as assigned_doctor_role,
  //           (
  //             SELECT visit_date 
  //             FROM patient_visits 
  //             WHERE patient_id = p.id
  //             ORDER BY visit_date DESC 
  //             LIMIT 1
  //           ) as last_assigned_date
  //         FROM registered_patient p
  //         LEFT JOIN adl_files af ON af.patient_id = p.id
  //       WHERE p.id = $1
  //     `;
  //       queryParam = patientId; // Integer
  //     }
      
  //     let result;
  //     try {
  //       result = await db.query(query, [queryParam]);
  //     } catch (queryError) {
  //       // If UUID casting fails, the column is likely INTEGER type, not UUID
  //       // In this case, a UUID patient ID cannot exist in an INTEGER column
  //       // Return null instead of trying fallback (which could give wrong results)
  //       if (isUUID && queryError.message && (
  //         queryError.message.includes('invalid input syntax for type uuid') ||
  //         queryError.message.includes('cannot cast') ||
  //         queryError.message.includes('uuid')
  //       )) {
  //         console.error(`[Patient.findById] UUID cast failed - column is likely INTEGER type, not UUID. Cannot query UUID ${patientId} in INTEGER column. Error: ${queryError.message}`);
  //         return null;
  //       } else {
  //         throw queryError;
  //       }
  //     }
      
  //     if (result.rows.length === 0) {
  //       console.log(`[Patient.findById] No patient found with ID: ${patientId}`);
  //       return null;
  //     }
      
  //     if (result.rows.length > 1) {
  //       console.warn(`[Patient.findById] WARNING: Multiple rows returned for ID ${patientId}, using first row`);
  //     }
      
  //     const row = result.rows[0];
      
  //     // Verify the returned patient ID matches the requested ID
  //     // Handle both UUID and integer IDs - use strict string comparison for UUIDs
  //     const returnedId = row.id;
  //     let idMatches;
      
  //     if (isUUID) {
  //       // For UUID, must match exactly as strings (case-insensitive UUID comparison)
  //       const returnedStr = String(returnedId).toLowerCase().trim();
  //       const requestedStr = String(patientId).toLowerCase().trim();
  //       idMatches = returnedStr === requestedStr;
  //     } else {
  //       // For integer, compare as integers
  //       idMatches = parseInt(returnedId, 10) === parseInt(patientId, 10);
  //     }
      
  //     if (!idMatches) {
  //       console.error(`[Patient.findById] CRITICAL ERROR: ID mismatch! Requested: ${patientId} (type: ${typeof patientId}), Returned: ${returnedId} (type: ${typeof returnedId})`);
  //       // Return null instead of throwing error - this means the patient with this exact ID doesn't exist
  //       // The query matched a different patient, which indicates a data integrity issue or wrong query
  //       console.error(`[Patient.findById] Returning null - no exact match found for ID: ${patientId}`);
  //       return null;
  //     }
      
  //     console.log(`[Patient.findById] Successfully found patient ID: ${returnedId}, Name: ${row.name}`);
      
  //     const patient = new Patient(row);
      
  //     // Ensure joined fields are set on the Patient instance
  //     patient.assigned_doctor_id = row.assigned_doctor_id || patient.assigned_doctor_id;
  //     patient.assigned_doctor_name = row.assigned_doctor_name || patient.assigned_doctor_name;
  //     patient.assigned_doctor_role = row.assigned_doctor_role || patient.assigned_doctor_role;
  //     patient.last_assigned_date = row.last_assigned_date || patient.last_assigned_date;
      
  //     return patient;
  //   } catch (error) {
  //     console.error('[Patient.findById] Error:', error);
  //     throw error;
  //   }
  // }

  static async findById(id) {
    try {
      if (!id) {
        console.error(`[Patient.findById] ❌ No ID provided`);
        return null;
      }
  
      const isUUID =
        typeof id === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
  
      if (!isUUID) {
        console.error(`[Patient.findById] ❌ Invalid UUID format: ${id}`);
        return null;
      }
  
      const patientId = id.trim();
  
      const query = `
        SELECT 
          p.id, p.cr_no, p.date, p.name, p.age, p.sex, p.category, p.department, p.unit_consit,
          p.room_no, p.serial_no, p.file_no, p.unit_days, p.contact_number, p.seen_in_walk_in_on,
          p.worked_up_on, p.psy_no, p.special_clinic_no, p.age_group, p.marital_status,
          p.year_of_marriage, p.no_of_children_male, p.no_of_children_female, p.occupation,
          p.education, p.locality, p.income, p.religion, p.family_type, p.head_name, p.head_age,
          p.head_relationship, p.head_education, p.head_occupation, p.head_income,
          p.distance_from_hospital, p.mobility, p.referred_by, p.address_line, p.country,
          p.state, p.district, p.city, p.pin_code, p.assigned_room, p.filled_by,
          p.has_adl_file, p.file_status, p.created_at, p.updated_at,
          -- ✅ Store original assigned_doctor_id and assigned_doctor_name before overriding
          p.assigned_doctor_id,
          p.assigned_doctor_name,
          -- ✅ Ensure ADL and complexity flags
          CASE WHEN af.id IS NOT NULL THEN true ELSE COALESCE(p.has_adl_file, false) END AS has_adl_file,
          CASE WHEN af.id IS NOT NULL THEN 'complex' ELSE 'simple' END AS case_complexity,
          -- ✅ Assigned Doctor ID: use p.assigned_doctor_id directly (it's already in the table)
          -- Only fallback to patient_visits if it's NULL
          COALESCE(
            p.assigned_doctor_id,
            (
              SELECT pv.assigned_doctor_id
              FROM patient_visits pv
              WHERE pv.patient_id = p.id
              ORDER BY pv.visit_date DESC
              LIMIT 1
            )
          ) AS assigned_doctor_id,
          -- ✅ Doctor name: use p.assigned_doctor_name directly (it's already in the table)
          -- Only try to fetch from users/visits if it's NULL or empty
          COALESCE(
            NULLIF(p.assigned_doctor_name, ''),
            (
              -- Try to get from patient_visits if available
              SELECT u.name
              FROM patient_visits pv
              LEFT JOIN users u ON (
                -- Handle both UUID and INTEGER types for users.id
                (u.id::text = pv.assigned_doctor_id::text) OR
                (pv.assigned_doctor_id::text LIKE u.id::text || '%')
              )
              WHERE pv.patient_id = p.id
              ORDER BY pv.visit_date DESC
              LIMIT 1
            )
          ) AS assigned_doctor_name,
          -- ✅ Doctor role: try to fetch from users, but only if we have an assigned_doctor_id
          -- Note: This may return NULL if users.id is INTEGER and assigned_doctor_id is UUID
          (
            SELECT u.role
            FROM users u
            WHERE (
              -- Try to match UUID to INTEGER (won't work, but handle gracefully)
              (u.id::text = COALESCE(
                p.assigned_doctor_id::text,
                (
                  SELECT pv.assigned_doctor_id::text
                  FROM patient_visits pv
                  WHERE pv.patient_id = p.id
                  ORDER BY pv.visit_date DESC
                  LIMIT 1
                )
              )) OR
              -- Try partial match (for backward compatibility)
              (COALESCE(
                p.assigned_doctor_id::text,
                (
                  SELECT pv.assigned_doctor_id::text
                  FROM patient_visits pv
                  WHERE pv.patient_id = p.id
                  ORDER BY pv.visit_date DESC
                  LIMIT 1
                )
              ) LIKE u.id::text || '%')
            )
            LIMIT 1
          ) AS assigned_doctor_role,
          -- ✅ Last assigned date from patient_visits
          (
            SELECT pv.visit_date
            FROM patient_visits pv
            WHERE pv.patient_id = p.id
            ORDER BY pv.visit_date DESC
            LIMIT 1
          ) AS last_assigned_date
        FROM registered_patient p
        LEFT JOIN adl_files af ON af.patient_id = p.id
        WHERE p.id = $1::uuid
        LIMIT 1;
      `;
  
      const result = await db.query(query, [patientId]);
  
      if (result.rows.length === 0) {
        console.warn(`[Patient.findById] ⚠️ No patient found for ID ${patientId}`);
        return null;
      }
  
      const row = result.rows[0];
      
      // Debug: Log the raw row data to see what we're getting
      console.log(`[Patient.findById] 🔍 Raw row data:`, {
        original_assigned_doctor_id: row.original_assigned_doctor_id,
        original_assigned_doctor_name: row.original_assigned_doctor_name,
        assigned_doctor_id: row.assigned_doctor_id,
        assigned_doctor_name: row.assigned_doctor_name,
        assigned_doctor_role: row.assigned_doctor_role,
        last_assigned_date: row.last_assigned_date
      });
      
      const patient = new Patient(row);

      // ✅ Explicitly map joined/derived doctor fields
      // Use the COALESCE result (assigned_doctor_id alias), but fallback to original if needed
      const doctorId = row.assigned_doctor_id || null;
      const doctorName = row.assigned_doctor_name || null;
      const doctorRole = row.assigned_doctor_role || null;
      
      if (doctorId !== undefined && doctorId !== null) {
        patient.assigned_doctor_id = String(doctorId);
      } else {
        patient.assigned_doctor_id = null;
      }
      
      patient.assigned_doctor_name = doctorName || null;
      patient.assigned_doctor_role = doctorRole || null;
      patient.last_assigned_date = row.last_assigned_date || null;

      console.log(
        `[Patient.findById] ✅ Found patient ${row.name} (${row.id}) — Doctor ID: ${patient.assigned_doctor_id}, Name: ${patient.assigned_doctor_name || 'None'}, Role: ${patient.assigned_doctor_role || 'None'}`
      );

      return patient;
    } catch (error) {
      console.error('[Patient.findById] ❌ Error:', error);
      throw error;
    }
  }
  
  
  

  // Find by cr, psy, adl
  static async findByCRNo(cr_no) {
    try {
      const result = await db.query('SELECT * FROM registered_patient WHERE cr_no = $1', [cr_no]);
      if (result.rows.length === 0) return null;
      return new Patient(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findByPSYNo(psy_no) {
    try {
      const result = await db.query('SELECT * FROM registered_patient WHERE psy_no = $1', [psy_no]);
      if (result.rows.length === 0) return null;
      return new Patient(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findByADLNo(adl_no) {
    try {
      const result = await db.query('SELECT * FROM registered_patient WHERE adl_no = $1', [adl_no]);
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
          p.*,
          CASE WHEN af.id IS NOT NULL THEN true ELSE COALESCE(p.has_adl_file, false) END as has_adl_file,
          CASE 
            WHEN af.id IS NOT NULL THEN 'complex'
            WHEN p.case_complexity IS NOT NULL THEN p.case_complexity
            ELSE 'simple'
          END as case_complexity
        FROM registered_patient p
        LEFT JOIN adl_files af ON af.patient_id = p.id
        WHERE p.name ILIKE $1 OR p.cr_no ILIKE $1 OR p.psy_no ILIKE $1 OR p.adl_no ILIKE $1
        GROUP BY p.id, af.id
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const countQuery = `
        SELECT COUNT(DISTINCT p.id) as cnt FROM registered_patient p
        LEFT JOIN adl_files af ON af.patient_id = p.id
        WHERE p.name ILIKE $1 OR p.cr_no ILIKE $1 OR p.psy_no ILIKE $1 OR p.adl_no ILIKE $1
      `;

      const [result, countResult] = await Promise.all([
        db.query(query, [searchPattern, limit, offset]),
        db.query(countQuery, [searchPattern])
      ]);

      const total = parseInt(countResult.rows[0].cnt, 10);
      const patientIds = result.rows.map(row => row.id);

      // Fetch latest visit and doctor info separately
      let visitMap = new Map();
      let doctorMap = new Map();
      
      if (patientIds.length > 0) {
        try {
          const { supabaseAdmin } = require('../config/database');
          
          // Get latest visit per patient
          const { data: visits, error: visitsError } = await supabaseAdmin
            .from('patient_visits')
            .select('patient_id, visit_date, assigned_doctor_id')
            .in('patient_id', patientIds)
            .order('visit_date', { ascending: false });

          if (!visitsError && Array.isArray(visits)) {
            // Get unique doctor IDs
            const doctorIds = [...new Set(visits.map(v => v.assigned_doctor_id).filter(id => id))];
            
            // Fetch doctor info
            if (doctorIds.length > 0) {
              const { data: doctors, error: doctorsError } = await supabaseAdmin
                .from('users')
                .select('id, name, role')
                .in('id', doctorIds);

              if (!doctorsError && Array.isArray(doctors)) {
                doctors.forEach(d => {
                  doctorMap.set(d.id, { name: d.name, role: d.role });
                });
              }
            }

            // Create visit map (latest visit per patient)
            visits.forEach(v => {
              if (!visitMap.has(v.patient_id)) {
                visitMap.set(v.patient_id, {
                  assigned_doctor_id: v.assigned_doctor_id,
                  visit_date: v.visit_date
                });
              }
            });
          }
        } catch (supabaseError) {
          console.warn('[Patient.search] Error fetching visit/doctor info:', supabaseError.message);
        }
      }

      const patients = result.rows.map(row => {
        const patient = new Patient(row);
        const visitInfo = visitMap.get(row.id);
        const doctorInfo = visitInfo?.assigned_doctor_id ? doctorMap.get(visitInfo.assigned_doctor_id) : null;
        
        return {
          ...patient.toJSON(),
          assigned_doctor_id: visitInfo?.assigned_doctor_id || null,
          assigned_doctor_name: doctorInfo?.name || null,
          assigned_doctor_role: doctorInfo?.role || null,
          last_assigned_date: visitInfo?.visit_date || null
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
      console.error('[Patient.search] Error:', error);
      throw error;
    }
  }

  // Get all with filters
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
        if (filters.case_complexity === 'complex') {
          where.push(`(p.case_complexity = 'complex' OR af.id IS NOT NULL)`);
        } else {
          where.push(`p.case_complexity = $${idx++}`);
          params.push(filters.case_complexity);
        }
      }
      if (filters.has_adl_file !== undefined) {
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
          p.*,
          CASE WHEN af.id IS NOT NULL THEN true ELSE COALESCE(p.has_adl_file, false) END as has_adl_file,
          CASE 
            WHEN af.id IS NOT NULL THEN 'complex'
            WHEN p.case_complexity IS NOT NULL THEN p.case_complexity
            ELSE 'simple'
          END as case_complexity
        FROM registered_patient p
        LEFT JOIN adl_files af ON af.patient_id = p.id
        ${whereClause}
        GROUP BY p.id, af.id
        ORDER BY p.created_at DESC
        LIMIT $${idx++} OFFSET $${idx++}
      `;
      params.push(limit, offset);

      const countParams = params.slice(0, params.length - 2);
      const countQuery = `
        SELECT COUNT(DISTINCT p.id) as cnt FROM registered_patient p
        LEFT JOIN adl_files af ON af.patient_id = p.id
        ${whereClause}
      `;

      const [patientsResult, countResult] = await Promise.all([
        db.query(query, params),
        db.query(countQuery, countParams)
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

  // Update patient
  async update(updateData = {}) {
    try {
      const allowedFields = [
        'name', 'sex', 'age', 'date', 'contact_number', 'category', 'father_name',
        'department', 'unit_consit', 'room_no', 'serial_no', 'file_no', 'unit_days',
        'seen_in_walk_in_on', 'worked_up_on', 'age_group',
        'marital_status', 'year_of_marriage', 'no_of_children_male', 'no_of_children_female',
        'occupation', 'education', 'locality', 'income', 'religion', 'family_type',
        'head_name', 'head_age', 'head_relationship', 'head_education', 'head_occupation', 'head_income',
        'distance_from_hospital', 'mobility', 'referred_by',
        'address_line', 'country', 'state', 'district', 'city', 'pin_code',
        'assigned_room', 'assigned_doctor_id', 'assigned_doctor_name', 'file_status', 'has_adl_file', 'special_clinic_no'
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
        `UPDATE registered_patient SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
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

  // Create ADL file
  async createADLFile(clinicalProformaId, createdBy) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      if (this.has_adl_file) {
        throw new Error('Patient already has an ADL file');
      }

      const adl_no = Patient.generateADLNo();

      await client.query(
        `UPDATE registered_patient SET adl_no = $1, has_adl_file = true, file_status = $2, case_complexity = $3 WHERE id = $4`,
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
         LEFT JOIN users u ON pv.assigned_doctor_id = u.id
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

  // Delete patient and all related records
  async delete() {
    try {
      console.log(`[Patient.delete] Starting deletion for patient ID: ${this.id}`);
      
      const { supabaseAdmin } = require('../config/database');
      
      // Step 1: Get all clinical_proforma IDs
      const { data: clinicalProformas, error: clinicalProformasError } = await supabaseAdmin
        .from('clinical_proforma')
        .select('id')
        .eq('patient_id', this.id);
      
      if (clinicalProformasError) {
        console.warn(`[Patient.delete] Error fetching clinical proformas: ${clinicalProformasError.message}`);
      }
      
      const clinicalProformaIds = clinicalProformas ? clinicalProformas.map(cp => cp.id) : [];
      console.log(`[Patient.delete] Found ${clinicalProformaIds.length} clinical proforma(s)`);
      
      // Step 2: Delete prescriptions
      if (clinicalProformaIds.length > 0) {
        const { error: prescriptionsError } = await supabaseAdmin
          .from('prescriptions')
          .delete()
          .in('clinical_proforma_id', clinicalProformaIds);
        
        if (prescriptionsError) {
          console.warn(`[Patient.delete] Error deleting prescriptions: ${prescriptionsError.message}`);
        } else {
          console.log(`[Patient.delete] Deleted prescriptions`);
        }
      }
      
      // Step 3: Delete file movements
      try {
        const { data: adlFiles } = await supabaseAdmin
          .from('adl_files')
          .select('id')
          .eq('patient_id', this.id);
        
        const adlFileIds = adlFiles ? adlFiles.map(af => af.id) : [];
        
        if (adlFileIds.length > 0) {
          await supabaseAdmin
            .from('file_movements')
            .delete()
            .in('adl_file_id', adlFileIds);
        }
        
        await supabaseAdmin
          .from('file_movements')
          .delete()
          .eq('patient_id', this.id);
        
        console.log(`[Patient.delete] Deleted file movements`);
      } catch (fileMovementsErr) {
        console.warn(`[Patient.delete] Could not delete file_movements: ${fileMovementsErr.message}`);
      }
      
      // Step 4: Delete ADL files
      const { error: adlError } = await supabaseAdmin
        .from('adl_files')
        .delete()
        .eq('patient_id', this.id);
      
      if (adlError) {
        console.error(`[Patient.delete] Error deleting ADL files: ${adlError.message}`);
        throw new Error(`Failed to delete ADL files: ${adlError.message}`);
      }
      console.log(`[Patient.delete] Deleted ADL files for patient ${this.id}`);
      
      // Step 5: Delete clinical proformas
      const { error: clinicalError } = await supabaseAdmin
        .from('clinical_proforma')
        .delete()
        .eq('patient_id', this.id);
      
      if (clinicalError) {
        console.error(`[Patient.delete] Error deleting clinical proformas: ${clinicalError.message}`);
        throw new Error(`Failed to delete clinical proformas: ${clinicalError.message}`);
      }
      console.log(`[Patient.delete] Deleted clinical proformas for patient ${this.id}`);
      
      // Step 6: Delete patient visits
      const { error: visitsError } = await supabaseAdmin
        .from('patient_visits')
        .delete()
        .eq('patient_id', this.id);
      
      if (visitsError) {
        console.warn(`[Patient.delete] Error deleting patient visits: ${visitsError.message}`);
      } else {
        console.log(`[Patient.delete] Deleted patient visits for patient ${this.id}`);
      }
      
      // Step 7: Delete outpatient records
      const { error: outpatientError } = await supabaseAdmin
        .from('outpatient_record')
        .delete()
        .eq('patient_id', this.id);
      
      if (outpatientError) {
        console.warn(`[Patient.delete] Error deleting outpatient records: ${outpatientError.message}`);
      } else {
        console.log(`[Patient.delete] Deleted outpatient records for patient ${this.id}`);
      }

      // Step 8: Finally, delete the patient record itself
      const { error: patientDeleteError } = await supabaseAdmin
        .from('registered_patient')
        .delete()
        .eq('id', this.id);
      
      if (patientDeleteError) {
        console.error(`[Patient.delete] Error deleting patient: ${patientDeleteError.message}`);
        throw new Error(`Failed to delete patient: ${patientDeleteError.message}`);
      }
      
      console.log(`[Patient.delete] Successfully deleted patient ID: ${this.id}`);
      return true;
    } catch (error) {
      console.error(`[Patient.delete] Error deleting patient ID ${this.id}:`, error);
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
        FROM registered_patient
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
      age: this.age,
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
      address_line: this.address_line,
      address_line_2: this.address_line_2,
      country: this.country,
      state: this.state,
      district: this.district,
      city: this.city,
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