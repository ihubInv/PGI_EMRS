const db = require('../config/database');

class OutpatientRecord {
  constructor(data) {
    this.id = data.id;
    this.patient_id = data.patient_id;
    this.filled_by = data.filled_by;
    this.age_group = data.age_group;
    this.marital_status = data.marital_status;
    this.year_of_marriage = data.year_of_marriage;
    this.no_of_children = data.no_of_children;
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
        age_group,
        marital_status,
        year_of_marriage,
        no_of_children,
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
        contact_number
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
        if (age_group !== undefined && age_group !== null) updatePayload.age_group = age_group;
        if (marital_status !== undefined && marital_status !== null) updatePayload.marital_status = marital_status;
        if (year_of_marriage !== undefined && year_of_marriage !== null) updatePayload.year_of_marriage = year_of_marriage;
        if (no_of_children !== undefined && no_of_children !== null) updatePayload.no_of_children = no_of_children;
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
          patient_id, filled_by, age_group, marital_status, year_of_marriage,
          no_of_children, occupation, actual_occupation, education_level,
          completed_years_of_education, patient_income, family_income, religion,
          family_type, locality, head_name, head_age, head_relationship,
          head_education, head_occupation, head_income, distance_from_hospital,
          mobility, referred_by, exact_source, present_address, permanent_address,
          local_address, school_college_office, contact_number
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
        ) RETURNING *`,
        [
          patient_id, filled_by, age_group, marital_status, year_of_marriage,
          no_of_children, occupation, actual_occupation, education_level,
          completed_years_of_education, patient_income, family_income, religion,
          family_type, locality, head_name, head_age, head_relationship,
          head_education, head_occupation, head_income, distance_from_hospital,
          mobility, referred_by, exact_source, present_address, permanent_address,
          local_address, school_college_office, contact_number
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
        'age_group', 'marital_status', 'year_of_marriage', 'no_of_children',
        'occupation', 'actual_occupation', 'education_level', 'completed_years_of_education',
        'patient_income', 'family_income', 'religion', 'family_type', 'locality',
        'head_name', 'head_age', 'head_relationship', 'head_education', 'head_occupation',
        'head_income', 'distance_from_hospital', 'mobility', 'referred_by', 'exact_source',
        'present_address', 'permanent_address', 'local_address', 'school_college_office',
        'contact_number'
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
      age_group: this.age_group,
      marital_status: this.marital_status,
      year_of_marriage: this.year_of_marriage,
      no_of_children: this.no_of_children,
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
