const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Patient {
  constructor(data) {
    this.id = data.id;
    this.cr_no = data.cr_no;
    this.psy_no = data.psy_no;
    this.special_clinic_no = data.special_clinic_no;
    this.adl_no = data.adl_no;
    this.name = data.name;
    this.sex = data.sex;
    this.actual_age = data.actual_age;
    this.has_adl_file = data.has_adl_file;
    this.file_status = data.file_status;
    this.assigned_room = data.assigned_room;
    this.case_complexity = data.case_complexity;
    this.created_at = data.created_at;
  }

  // Generate unique CR number
  static generateCRNo() {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `CR${year}${timestamp}`;
  }

  // Generate unique PSY number
  static generatePSYNo() {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `PSY${year}${timestamp}`;
  }

  // Generate unique ADL number
  static generateADLNo() {
    const year = new Date().getFullYear();
    const uuid = uuidv4().slice(0, 8).toUpperCase();
    return `ADL${year}${uuid}`;
  }

  // Create a new patient
  static async create(patientData) {
    try {
      const { name, sex, actual_age, assigned_room } = patientData;
      
      // Generate numbers
      const cr_no = Patient.generateCRNo();
      const psy_no = Patient.generatePSYNo();

      // Insert patient
      const result = await db.query(
        `INSERT INTO patients (cr_no, psy_no, name, sex, actual_age, assigned_room) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [cr_no, psy_no, name, sex, actual_age, assigned_room]
      );

      return new Patient(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find patient by ID
  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT * FROM patients WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new Patient(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find patient by CR number
  static async findByCRNo(cr_no) {
    try {
      const result = await db.query(
        'SELECT * FROM patients WHERE cr_no = $1',
        [cr_no]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new Patient(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find patient by PSY number
  static async findByPSYNo(psy_no) {
    try {
      const result = await db.query(
        'SELECT * FROM patients WHERE psy_no = $1',
        [psy_no]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new Patient(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find patient by ADL number
  static async findByADLNo(adl_no) {
    try {
      const result = await db.query(
        'SELECT * FROM patients WHERE adl_no = $1',
        [adl_no]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new Patient(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Search patients by name or number
  static async search(searchTerm, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      // Simple search pattern
      const searchPattern = `%${searchTerm}%`;
      
      const query = `
        SELECT * FROM patients 
        WHERE name ILIKE $1 OR cr_no ILIKE $1 OR psy_no ILIKE $1 OR adl_no ILIKE $1
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
      `;
      
      const countQuery = `
        SELECT COUNT(*) FROM patients 
        WHERE name ILIKE $1 OR cr_no ILIKE $1 OR psy_no ILIKE $1 OR adl_no ILIKE $1
      `;

      const result = await db.query(query, [searchPattern, limit, offset]);
      const countResult = await db.query(countQuery, [searchPattern]);

      const patients = result.rows.map(row => new Patient(row));
      const total = parseInt(countResult.rows[0].count);

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

  // Get all patients with pagination and filters
  static async findAll(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let query = 'SELECT * FROM patients WHERE 1=1';
      let countQuery = 'SELECT COUNT(*) FROM patients WHERE 1=1';
      const params = [];
      let paramCount = 0;

      // Apply filters
      if (filters.sex) {
        paramCount++;
        query += ` AND sex = $${paramCount}`;
        countQuery += ` AND sex = $${paramCount}`;
        params.push(filters.sex);
      }

      if (filters.case_complexity) {
        paramCount++;
        query += ` AND case_complexity = $${paramCount}`;
        countQuery += ` AND case_complexity = $${paramCount}`;
        params.push(filters.case_complexity);
      }

      if (filters.has_adl_file !== undefined) {
        paramCount++;
        query += ` AND has_adl_file = $${paramCount}`;
        countQuery += ` AND has_adl_file = $${paramCount}`;
        params.push(filters.has_adl_file);
      }

      if (filters.file_status) {
        paramCount++;
        query += ` AND file_status = $${paramCount}`;
        countQuery += ` AND file_status = $${paramCount}`;
        params.push(filters.file_status);
      }

      if (filters.assigned_room) {
        paramCount++;
        query += ` AND assigned_room = $${paramCount}`;
        countQuery += ` AND assigned_room = $${paramCount}`;
        params.push(filters.assigned_room);
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const [patientsResult, countResult] = await Promise.all([
        db.query(query, params),
        db.query(countQuery, filters.sex ? [filters.sex] : [])
      ]);

      const patients = patientsResult.rows.map(row => new Patient(row));
      const total = parseInt(countResult.rows[0].count);

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
  async update(updateData) {
    try {
      const allowedFields = ['name', 'sex', 'actual_age', 'assigned_room', 'case_complexity', 'file_status', 'has_adl_file'];
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
        `UPDATE patients SET ${updates.join(', ')} 
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

  // Create ADL file for complex cases
  async createADLFile(clinicalProformaId, createdBy) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      if (this.has_adl_file) {
        throw new Error('Patient already has an ADL file');
      }

      const adl_no = Patient.generateADLNo();

      // Update patient record
      await client.query(
        `UPDATE patients 
         SET adl_no = $1, has_adl_file = true, file_status = $2, case_complexity = $3
         WHERE id = $4`,
        [adl_no, 'created', 'complex', this.id]
      );

      // Update the instance
      this.adl_no = adl_no;
      this.has_adl_file = true;
      this.file_status = 'created';
      this.case_complexity = 'complex';

      // Create ADL file record
      const adlResult = await client.query(
        `INSERT INTO adl_files (patient_id, adl_no, created_by, clinical_proforma_id, file_status, file_created_date, total_visits) 
         VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, 1) 
         RETURNING *`,
        [this.id, adl_no, createdBy, clinicalProformaId, 'created']
      );

      const adlFile = adlResult.rows[0];

      // Log file creation movement
      await client.query(
        `INSERT INTO file_movements (adl_file_id, patient_id, moved_by, movement_type, from_location, to_location, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [adlFile.id, this.id, createdBy, 'created', 'Doctor Office', 'Record Room', 'Initial ADL file creation for complex case']
      );

      await client.query('COMMIT');
      
      return adlFile;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get patient's visit history
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

  // Get patient's clinical records
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

  // Get patient's ADL files
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

  // Delete patient (soft delete - only if no records exist)
  async delete() {
    try {
      // Check if patient has any records
      const recordsCheck = await db.query(
        `SELECT 
           (SELECT COUNT(*) FROM outpatient_record WHERE patient_id = $1) as outpatient_count,
           (SELECT COUNT(*) FROM clinical_proforma WHERE patient_id = $1) as clinical_count,
           (SELECT COUNT(*) FROM adl_files WHERE patient_id = $1) as adl_count`,
        [this.id]
      );

      const counts = recordsCheck.rows[0];
      if (counts.outpatient_count > 0 || counts.clinical_count > 0 || counts.adl_count > 0) {
        throw new Error('Cannot delete patient with existing records');
      }

      await db.query('DELETE FROM patients WHERE id = $1', [this.id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get patient statistics
  static async getStats() {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_patients,
          COUNT(CASE WHEN sex = 'M' THEN 1 END) as male_patients,
          COUNT(CASE WHEN sex = 'F' THEN 1 END) as female_patients,
          COUNT(CASE WHEN sex = 'Other' THEN 1 END) as other_patients,
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

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      cr_no: this.cr_no,
      psy_no: this.psy_no,
      special_clinic_no: this.special_clinic_no,
      adl_no: this.adl_no,
      name: this.name,
      sex: this.sex,
      actual_age: this.actual_age,
      has_adl_file: this.has_adl_file,
      file_status: this.file_status,
      assigned_room: this.assigned_room,
      case_complexity: this.case_complexity,
      created_at: this.created_at
    };
  }
}

module.exports = Patient;
