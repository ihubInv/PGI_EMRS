const db = require('../config/database');

class OutpatientRecord {
  constructor(data) {
    this.id = data.id;
    this.patient_id = data.patient_id;
    this.filled_by = data.filled_by;
    this.seen_in_walk_in_on = data.seen_in_walk_in_on;
    this.worked_up_on = data.worked_up_on;
    this.special_clinic_no = data.special_clinic_no;
    this.age_group = data.age_group;
    this.marital_status = data.marital_status;
    this.year_of_marriage = data.year_of_marriage;
    this.no_of_children = data.no_of_children;
    this.no_of_children_male = data.no_of_children_male;
    this.no_of_children_female = data.no_of_children_female;
    this.occupation = data.occupation;
    this.actual_occupation = data.actual_occupation;
    this.education_level = data.education_level;
    this.completed_years_of_education = data.completed_years_of_education;
    this.patient_income = data.patient_income;
    this.family_income = data.family_income;
    this.religion = data.religion;
    this.family_type = data.family_type;
    this.locality = data.locality;
    this.head_name = data.head_name;
    this.head_age = data.head_age;
    this.head_relationship = data.head_relationship;
    this.head_education = data.head_education;
    this.head_occupation = data.head_occupation;
    this.head_income = data.head_income;
    this.distance_from_hospital = data.distance_from_hospital;
    this.mobility = data.mobility;
    this.referred_by = data.referred_by;
    this.exact_source = data.exact_source;
    this.present_address = data.present_address;
    this.permanent_address = data.permanent_address;
    this.local_address = data.local_address;
    this.school_college_office = data.school_college_office;
    this.contact_number = data.contact_number;
    
    // Quick Entry fields
    this.department = data.department;
    this.unit_consit = data.unit_consit;
    this.room_no = data.room_no;
    this.serial_no = data.serial_no;
    this.file_no = data.file_no;
    this.unit_days = data.unit_days;
    
    // Address fields (Quick Entry)
    this.address_line_1 = data.address_line_1;
    this.country = data.country;
    this.state = data.state;
    this.district = data.district;
    this.city_town_village = data.city_town_village;
    this.pin_code = data.pin_code;
    
    // Present Address fields
    this.present_address_line_1 = data.present_address_line_1;
    this.present_country = data.present_country;
    this.present_state = data.present_state;
    this.present_district = data.present_district;
    this.present_city_town_village = data.present_city_town_village;
    this.present_pin_code = data.present_pin_code;
    
    // Permanent Address fields
    this.permanent_address_line_1 = data.permanent_address_line_1;
    this.permanent_country = data.permanent_country;
    this.permanent_state = data.permanent_state;
    this.permanent_district = data.permanent_district;
    this.permanent_city_town_village = data.permanent_city_town_village;
    this.permanent_pin_code = data.permanent_pin_code;
    
    // Additional fields
    this.category = data.category;
    this.assigned_doctor_id = data.assigned_doctor_id;
    
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    
    // Joined fields from queries
    this.patient_name = data.patient_name;
    this.cr_no = data.cr_no;
    this.psy_no = data.psy_no;
    this.filled_by_name = data.filled_by_name;
  }

  // Create a new outpatient record (with UPSERT functionality)
  static async create(recordData) {
    try {
      const {
        patient_id,
        filled_by,
        seen_in_walk_in_on,
        worked_up_on,
        special_clinic_no,
        age_group,
        marital_status,
        year_of_marriage,
        no_of_children,
        no_of_children_male,
        no_of_children_female,
        occupation,
        actual_occupation,
        education_level,
        completed_years_of_education,
        patient_income,
        family_income,
        religion,
        family_type,
        locality,
        head_name,
        head_age,
        head_relationship,
        head_education,
        head_occupation,
        head_income,
        distance_from_hospital,
        mobility,
        referred_by,
        exact_source,
        present_address,
        permanent_address,
        local_address,
        school_college_office,
        contact_number,
        // Quick Entry fields
        department,
        unit_consit,
        room_no,
        serial_no,
        file_no,
        unit_days,
        // Address fields (Quick Entry)
        address_line_1,
        country,
        state,
        district,
        city_town_village,
        pin_code,
        // Present Address fields
        present_address_line_1,
        present_country,
        present_state,
        present_district,
        present_city_town_village,
        present_pin_code,
        // Permanent Address fields
        permanent_address_line_1,
        permanent_country,
        permanent_state,
        permanent_district,
        permanent_city_town_village,
        permanent_pin_code,
        // Additional fields
        category,
        assigned_doctor_id
      } = recordData;

      // Check if patient exists
      const patientCheck = await db.query(
        'SELECT id FROM patients WHERE id = $1',
        [patient_id]
      );

      if (patientCheck.rows.length === 0) {
        throw new Error('Patient not found');
      }

      // Check if record already exists for this patient
      const existingRecord = await db.query(
        'SELECT id FROM outpatient_record WHERE patient_id = $1',
        [patient_id]
      );

      // If record exists, update it instead of creating new one
      if (existingRecord.rows.length > 0) {
        const existingOutpatientRecord = await OutpatientRecord.findById(existingRecord.rows[0].id);

        // Build update payload with only defined fields
        const updatePayload = {};
        if (seen_in_walk_in_on !== undefined && seen_in_walk_in_on !== null) updatePayload.seen_in_walk_in_on = seen_in_walk_in_on;
        if (worked_up_on !== undefined && worked_up_on !== null) updatePayload.worked_up_on = worked_up_on;
        if (special_clinic_no !== undefined && special_clinic_no !== null) updatePayload.special_clinic_no = special_clinic_no;
        if (age_group !== undefined && age_group !== null) updatePayload.age_group = age_group;
        if (marital_status !== undefined && marital_status !== null) updatePayload.marital_status = marital_status;
        if (year_of_marriage !== undefined && year_of_marriage !== null) updatePayload.year_of_marriage = year_of_marriage;
        if (no_of_children !== undefined && no_of_children !== null) updatePayload.no_of_children = no_of_children;
        if (no_of_children_male !== undefined && no_of_children_male !== null) updatePayload.no_of_children_male = no_of_children_male;
        if (no_of_children_female !== undefined && no_of_children_female !== null) updatePayload.no_of_children_female = no_of_children_female;
        if (occupation !== undefined && occupation !== null) updatePayload.occupation = occupation;
        if (actual_occupation !== undefined && actual_occupation !== null) updatePayload.actual_occupation = actual_occupation;
        if (education_level !== undefined && education_level !== null) updatePayload.education_level = education_level;
        if (completed_years_of_education !== undefined && completed_years_of_education !== null) updatePayload.completed_years_of_education = completed_years_of_education;
        if (patient_income !== undefined && patient_income !== null) updatePayload.patient_income = patient_income;
        if (family_income !== undefined && family_income !== null) updatePayload.family_income = family_income;
        if (religion !== undefined && religion !== null) updatePayload.religion = religion;
        if (family_type !== undefined && family_type !== null) updatePayload.family_type = family_type;
        if (locality !== undefined && locality !== null) updatePayload.locality = locality;
        if (head_name !== undefined && head_name !== null) updatePayload.head_name = head_name;
        if (head_age !== undefined && head_age !== null) updatePayload.head_age = head_age;
        if (head_relationship !== undefined && head_relationship !== null) updatePayload.head_relationship = head_relationship;
        if (head_education !== undefined && head_education !== null) updatePayload.head_education = head_education;
        if (head_occupation !== undefined && head_occupation !== null) updatePayload.head_occupation = head_occupation;
        if (head_income !== undefined && head_income !== null) updatePayload.head_income = head_income;
        if (distance_from_hospital !== undefined && distance_from_hospital !== null) updatePayload.distance_from_hospital = distance_from_hospital;
        if (mobility !== undefined && mobility !== null) updatePayload.mobility = mobility;
        if (referred_by !== undefined && referred_by !== null) updatePayload.referred_by = referred_by;
        if (exact_source !== undefined && exact_source !== null) updatePayload.exact_source = exact_source;
        if (present_address !== undefined && present_address !== null) updatePayload.present_address = present_address;
        if (permanent_address !== undefined && permanent_address !== null) updatePayload.permanent_address = permanent_address;
        if (local_address !== undefined && local_address !== null) updatePayload.local_address = local_address;
        if (school_college_office !== undefined && school_college_office !== null) updatePayload.school_college_office = school_college_office;
        if (contact_number !== undefined && contact_number !== null) updatePayload.contact_number = contact_number;

        // If there are fields to update, update the record; otherwise return existing record
        if (Object.keys(updatePayload).length > 0) {
          return await existingOutpatientRecord.update(updatePayload);
        } else {
          // No fields to update, just return the existing record
          return existingOutpatientRecord;
        }
      }

      // Insert new outpatient record
      const result = await db.query(
        `INSERT INTO outpatient_record (
          patient_id, filled_by, seen_in_walk_in_on, worked_up_on, special_clinic_no,
          age_group, marital_status, year_of_marriage, no_of_children, no_of_children_male,
          no_of_children_female, occupation, actual_occupation, education_level,
          completed_years_of_education, patient_income, family_income, religion,
          family_type, locality, head_name, head_age, head_relationship,
          head_education, head_occupation, head_income, distance_from_hospital,
          mobility, referred_by, exact_source, present_address, permanent_address,
          local_address, school_college_office, contact_number,
          department, unit_consit, room_no, serial_no, file_no, unit_days,
          address_line_1, country, state, district, city_town_village, pin_code,
          present_address_line_1, present_country, present_state, 
          present_district, present_city_town_village, present_pin_code,
          permanent_address_line_1, permanent_country, permanent_state,
          permanent_district, permanent_city_town_village, permanent_pin_code,
          category, assigned_doctor_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45,
          $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60,
          $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, $71, $72, $73, $74, $75
        ) RETURNING *`,
        [
          patient_id, filled_by, seen_in_walk_in_on, worked_up_on, special_clinic_no,
          age_group, marital_status, year_of_marriage, no_of_children, no_of_children_male,
          no_of_children_female, occupation, actual_occupation, education_level,
          completed_years_of_education, patient_income, family_income, religion,
          family_type, locality, head_name, head_age, head_relationship,
          head_education, head_occupation, head_income, distance_from_hospital,
          mobility, referred_by, exact_source, present_address, permanent_address,
          local_address, school_college_office, contact_number,
          department, unit_consit, room_no, serial_no, file_no, unit_days,
          address_line_1, country, state, district, city_town_village, pin_code,
          present_address_line_1, present_country, present_state,
          present_district, present_city_town_village, present_pin_code,
          permanent_address_line_1, permanent_country, permanent_state,
          permanent_district, permanent_city_town_village, permanent_pin_code,
          category, assigned_doctor_id
        ]
      );

      return new OutpatientRecord(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find outpatient record by ID
  static async findById(id) {
    try {
      const result = await db.query(
        `SELECT opr.*, p.name as patient_name, p.cr_no, p.psy_no, u.name as filled_by_name
         FROM outpatient_record opr
         LEFT JOIN patients p ON opr.patient_id = p.id
         LEFT JOIN users u ON opr.filled_by = u.id
         WHERE opr.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new OutpatientRecord(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find outpatient record by patient ID
  static async findByPatientId(patient_id) {
    try {
      const result = await db.query(
        `SELECT opr.*, p.name as patient_name, p.cr_no, p.psy_no, u.name as filled_by_name
         FROM outpatient_record opr
         LEFT JOIN patients p ON opr.patient_id = p.id
         LEFT JOIN users u ON opr.filled_by = u.id
         WHERE opr.patient_id = $1`,
        [patient_id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new OutpatientRecord(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get all outpatient records with pagination and filters
  static async findAll(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT opr.*, p.name as patient_name, p.cr_no, p.psy_no, u.name as filled_by_name
        FROM outpatient_record opr
        LEFT JOIN patients p ON opr.patient_id = p.id
        LEFT JOIN users u ON opr.filled_by = u.id
        WHERE 1=1
      `;
      let countQuery = 'SELECT COUNT(*) FROM outpatient_record WHERE 1=1';
      const params = [];
      let paramCount = 0;

      // Apply filters
      if (filters.marital_status) {
        paramCount++;
        query += ` AND opr.marital_status = $${paramCount}`;
        countQuery += ` AND marital_status = $${paramCount}`;
        params.push(filters.marital_status);
      }

      if (filters.occupation) {
        paramCount++;
        query += ` AND opr.occupation = $${paramCount}`;
        countQuery += ` AND occupation = $${paramCount}`;
        params.push(filters.occupation);
      }

      if (filters.education_level) {
        paramCount++;
        query += ` AND opr.education_level = $${paramCount}`;
        countQuery += ` AND education_level = $${paramCount}`;
        params.push(filters.education_level);
      }

      if (filters.religion) {
        paramCount++;
        query += ` AND opr.religion = $${paramCount}`;
        countQuery += ` AND religion = $${paramCount}`;
        params.push(filters.religion);
      }

      if (filters.family_type) {
        paramCount++;
        query += ` AND opr.family_type = $${paramCount}`;
        countQuery += ` AND family_type = $${paramCount}`;
        params.push(filters.family_type);
      }

      if (filters.locality) {
        paramCount++;
        query += ` AND opr.locality = $${paramCount}`;
        countQuery += ` AND locality = $${paramCount}`;
        params.push(filters.locality);
      }

      if (filters.filled_by) {
        paramCount++;
        query += ` AND opr.filled_by = $${paramCount}`;
        countQuery += ` AND filled_by = $${paramCount}`;
        params.push(filters.filled_by);
      }

      query += ` ORDER BY opr.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const [recordsResult, countResult] = await Promise.all([
        db.query(query, params),
        db.query(countQuery, Object.values(filters))
      ]);

      const records = recordsResult.rows.map(row => new OutpatientRecord(row));
      const total = parseInt(countResult.rows[0].count);

      return {
        records,
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

  // Update outpatient record
  async update(updateData) {
    try {
      const allowedFields = [
        'seen_in_walk_in_on', 'worked_up_on', 'special_clinic_no', 'age_group', 'marital_status', 
        'year_of_marriage', 'no_of_children', 'no_of_children_male', 'no_of_children_female',
        'occupation', 'actual_occupation', 'education_level', 'completed_years_of_education',
        'patient_income', 'family_income', 'religion', 'family_type', 'locality',
        'head_name', 'head_age', 'head_relationship', 'head_education', 'head_occupation',
        'head_income', 'distance_from_hospital', 'mobility', 'referred_by', 'exact_source',
        'present_address', 'permanent_address', 'local_address', 'school_college_office',
        'contact_number',
        // Quick Entry fields
        'department', 'unit_consit', 'room_no', 'serial_no', 'file_no', 'unit_days',
        // Address fields (Quick Entry)
        'address_line_1', 'country', 'state', 'district', 'city_town_village', 'pin_code',
        // Present Address fields
        'present_address_line_1', 'present_country', 'present_state',
        'present_district', 'present_city_town_village', 'present_pin_code',
        // Permanent Address fields
        'permanent_address_line_1', 'permanent_country', 'permanent_state',
        'permanent_district', 'permanent_city_town_village', 'permanent_pin_code',
        // Additional fields
        'category', 'assigned_doctor_id'
      ];

      const updates = [];
      const values = [];
      let paramCount = 0;

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          paramCount++;
          updates.push(`${key} = $${paramCount}`);
          values.push(value);
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      paramCount++;
      values.push(this.id);

      const result = await db.query(
        `UPDATE outpatient_record SET ${updates.join(', ')} 
         WHERE id = $${paramCount} 
         RETURNING *`,
        values
      );

      if (result.rows.length > 0) {
        Object.assign(this, result.rows[0]);
      }

      return this;
    } catch (error) {
      throw error;
    }
  }

  // Delete outpatient record
  async delete() {
    try {
      await db.query('DELETE FROM outpatient_record WHERE id = $1', [this.id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get outpatient record statistics
  static async getStats() {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_records,
          COUNT(CASE WHEN marital_status = 'Single' THEN 1 END) as single_patients,
          COUNT(CASE WHEN marital_status = 'Married' THEN 1 END) as married_patients,
          COUNT(CASE WHEN occupation = 'Unemployed' THEN 1 END) as unemployed_patients,
          COUNT(CASE WHEN education_level = 'Illiterate/Literate' THEN 1 END) as illiterate_patients,
          COUNT(CASE WHEN religion = 'Hinduism' THEN 1 END) as hindu_patients,
          COUNT(CASE WHEN family_type = 'Nuclear' THEN 1 END) as nuclear_families,
          COUNT(CASE WHEN locality = 'Urban' THEN 1 END) as urban_patients,
          COUNT(CASE WHEN locality = 'Rural' THEN 1 END) as rural_patients
        FROM outpatient_record
      `);

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get demographic statistics
  static async getDemographicStats() {
    try {
      const result = await db.query(`
        SELECT 
          marital_status,
          COUNT(*) as count
        FROM outpatient_record 
        WHERE marital_status IS NOT NULL
        GROUP BY marital_status
        ORDER BY count DESC
      `);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      patient_id: this.patient_id,
      filled_by: this.filled_by,
      seen_in_walk_in_on: this.seen_in_walk_in_on,
      worked_up_on: this.worked_up_on,
      special_clinic_no: this.special_clinic_no,
      age_group: this.age_group,
      marital_status: this.marital_status,
      year_of_marriage: this.year_of_marriage,
      no_of_children: this.no_of_children,
      no_of_children_male: this.no_of_children_male,
      no_of_children_female: this.no_of_children_female,
      occupation: this.occupation,
      actual_occupation: this.actual_occupation,
      education_level: this.education_level,
      completed_years_of_education: this.completed_years_of_education,
      patient_income: this.patient_income,
      family_income: this.family_income,
      religion: this.religion,
      family_type: this.family_type,
      locality: this.locality,
      head_name: this.head_name,
      head_age: this.head_age,
      head_relationship: this.head_relationship,
      head_education: this.head_education,
      head_occupation: this.head_occupation,
      head_income: this.head_income,
      distance_from_hospital: this.distance_from_hospital,
      mobility: this.mobility,
      referred_by: this.referred_by,
      exact_source: this.exact_source,
      present_address: this.present_address,
      permanent_address: this.permanent_address,
      local_address: this.local_address,
      school_college_office: this.school_college_office,
      contact_number: this.contact_number,
      // Quick Entry fields
      department: this.department,
      unit_consit: this.unit_consit,
      room_no: this.room_no,
      serial_no: this.serial_no,
      file_no: this.file_no,
      unit_days: this.unit_days,
      // Address fields (Quick Entry)
      address_line_1: this.address_line_1,
      country: this.country,
      state: this.state,
      district: this.district,
      city_town_village: this.city_town_village,
      pin_code: this.pin_code,
      // Present Address fields
      present_address_line_1: this.present_address_line_1,
      present_country: this.present_country,
      present_state: this.present_state,
      present_district: this.present_district,
      present_city_town_village: this.present_city_town_village,
      present_pin_code: this.present_pin_code,
      // Permanent Address fields
      permanent_address_line_1: this.permanent_address_line_1,
      permanent_country: this.permanent_country,
      permanent_state: this.permanent_state,
      permanent_district: this.permanent_district,
      permanent_city_town_village: this.permanent_city_town_village,
      permanent_pin_code: this.permanent_pin_code,
      // Additional fields
      category: this.category,
      assigned_doctor_id: this.assigned_doctor_id,
      created_at: this.created_at,
      // Additional fields from joins
      patient_name: this.patient_name,
      cr_no: this.cr_no,
      psy_no: this.psy_no,
      filled_by_name: this.filled_by_name
    };
  }
}

module.exports = OutpatientRecord;
