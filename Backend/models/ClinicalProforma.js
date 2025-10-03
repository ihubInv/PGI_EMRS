const db = require('../config/database');

class ClinicalProforma {
  constructor(data) {
    this.id = data.id;
    this.patient_id = data.patient_id;
    this.filled_by = data.filled_by;
    this.visit_date = data.visit_date;
    this.visit_type = data.visit_type;
    this.room_no = data.room_no;
    this.assigned_doctor = data.assigned_doctor;
    this.informant_present = data.informant_present;
    this.nature_of_information = data.nature_of_information;
    this.onset_duration = data.onset_duration;
    this.course = data.course;
    this.precipitating_factor = data.precipitating_factor;
    this.illness_duration = data.illness_duration;
    this.current_episode_since = data.current_episode_since;
    this.mood = data.mood;
    this.behaviour = data.behaviour;
    this.speech = data.speech;
    this.thought = data.thought;
    this.perception = data.perception;
    this.somatic = data.somatic;
    this.bio_functions = data.bio_functions;
    this.adjustment = data.adjustment;
    this.cognitive_function = data.cognitive_function;
    this.fits = data.fits;
    this.sexual_problem = data.sexual_problem;
    this.substance_use = data.substance_use;
    this.past_history = data.past_history;
    this.family_history = data.family_history;
    this.associated_medical_surgical = data.associated_medical_surgical;
    this.mse_behaviour = data.mse_behaviour;
    this.mse_affect = data.mse_affect;
    this.mse_thought = data.mse_thought;
    this.mse_delusions = data.mse_delusions;
    this.mse_perception = data.mse_perception;
    this.mse_cognitive_function = data.mse_cognitive_function;
    this.gpe = data.gpe;
    this.diagnosis = data.diagnosis;
    this.icd_code = data.icd_code;
    this.disposal = data.disposal;
    this.workup_appointment = data.workup_appointment;
    this.referred_to = data.referred_to;
    this.treatment_prescribed = data.treatment_prescribed;
    this.doctor_decision = data.doctor_decision;
    this.case_severity = data.case_severity;
    this.requires_adl_file = data.requires_adl_file;
    this.adl_reasoning = data.adl_reasoning;
    this.created_at = data.created_at;
  }

  // Create a new clinical proforma
  static async create(proformaData) {
    try {
      const {
        patient_id,
        filled_by,
        visit_date,
        visit_type,
        room_no,
        assigned_doctor,
        informant_present,
        nature_of_information,
        onset_duration,
        course,
        precipitating_factor,
        illness_duration,
        current_episode_since,
        mood,
        behaviour,
        speech,
        thought,
        perception,
        somatic,
        bio_functions,
        adjustment,
        cognitive_function,
        fits,
        sexual_problem,
        substance_use,
        past_history,
        family_history,
        associated_medical_surgical,
        mse_behaviour,
        mse_affect,
        mse_thought,
        mse_delusions,
        mse_perception,
        mse_cognitive_function,
        gpe,
        diagnosis,
        icd_code,
        disposal,
        workup_appointment,
        referred_to,
        treatment_prescribed,
        doctor_decision,
        case_severity,
        requires_adl_file,
        adl_reasoning
      } = proformaData;

      // Check if patient exists
      const patientCheck = await db.query(
        'SELECT id FROM patients WHERE id = $1',
        [patient_id]
      );

      if (patientCheck.rows.length === 0) {
        throw new Error('Patient not found');
      }

      // Insert clinical proforma
      const result = await db.query(
        `INSERT INTO clinical_proforma (
          patient_id, filled_by, visit_date, visit_type, room_no, assigned_doctor, informant_present,
          nature_of_information, onset_duration, course, precipitating_factor,
          illness_duration, current_episode_since, mood, behaviour, speech, thought,
          perception, somatic, bio_functions, adjustment, cognitive_function, fits,
          sexual_problem, substance_use, past_history, family_history,
          associated_medical_surgical, mse_behaviour, mse_affect, mse_thought,
          mse_delusions, mse_perception, mse_cognitive_function, gpe, diagnosis,
          icd_code, disposal, workup_appointment, referred_to, treatment_prescribed,
          doctor_decision, case_severity, requires_adl_file, adl_reasoning
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45
        ) RETURNING *`,
        [
          patient_id, filled_by, visit_date, visit_type, room_no, assigned_doctor, informant_present,
          nature_of_information, onset_duration, course, precipitating_factor,
          illness_duration, current_episode_since, mood, behaviour, speech, thought,
          perception, somatic, bio_functions, adjustment, cognitive_function, fits,
          sexual_problem, substance_use, past_history, family_history,
          associated_medical_surgical, mse_behaviour, mse_affect, mse_thought,
          mse_delusions, mse_perception, mse_cognitive_function, gpe, diagnosis,
          icd_code, disposal, workup_appointment, referred_to, treatment_prescribed,
          doctor_decision, case_severity, requires_adl_file, adl_reasoning
        ]
      );

      return new ClinicalProforma(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find clinical proforma by ID
  static async findById(id) {
    try {
      const result = await db.query(
        `SELECT cp.*, p.name as patient_name, p.cr_no, p.psy_no, u.name as doctor_name, u.role as doctor_role
         FROM clinical_proforma cp
         LEFT JOIN patients p ON cp.patient_id = p.id
         LEFT JOIN users u ON cp.filled_by = u.id
         WHERE cp.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new ClinicalProforma(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find clinical proforma by patient ID
  static async findByPatientId(patient_id) {
    try {
      const result = await db.query(
        `SELECT cp.*, p.name as patient_name, p.cr_no, p.psy_no, u.name as doctor_name, u.role as doctor_role
         FROM clinical_proforma cp
         LEFT JOIN patients p ON cp.patient_id = p.id
         LEFT JOIN users u ON cp.filled_by = u.id
         WHERE cp.patient_id = $1
         ORDER BY cp.visit_date DESC`,
        [patient_id]
      );

      return result.rows.map(row => new ClinicalProforma(row));
    } catch (error) {
      throw error;
    }
  }

  // Get all clinical proforma with pagination and filters
  static async findAll(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT cp.*, p.name as patient_name, p.cr_no, p.psy_no, u.name as doctor_name, u.role as doctor_role
        FROM clinical_proforma cp
        LEFT JOIN patients p ON cp.patient_id = p.id
        LEFT JOIN users u ON cp.filled_by = u.id
        WHERE 1=1
      `;
      let countQuery = 'SELECT COUNT(*) FROM clinical_proforma WHERE 1=1';
      const params = [];
      let paramCount = 0;

      // Apply filters
      if (filters.visit_type) {
        paramCount++;
        query += ` AND cp.visit_type = $${paramCount}`;
        countQuery += ` AND visit_type = $${paramCount}`;
        params.push(filters.visit_type);
      }

      if (filters.doctor_decision) {
        paramCount++;
        query += ` AND cp.doctor_decision = $${paramCount}`;
        countQuery += ` AND doctor_decision = $${paramCount}`;
        params.push(filters.doctor_decision);
      }

      if (filters.case_severity) {
        paramCount++;
        query += ` AND cp.case_severity = $${paramCount}`;
        countQuery += ` AND case_severity = $${paramCount}`;
        params.push(filters.case_severity);
      }

      if (filters.requires_adl_file !== undefined) {
        paramCount++;
        query += ` AND cp.requires_adl_file = $${paramCount}`;
        countQuery += ` AND requires_adl_file = $${paramCount}`;
        params.push(filters.requires_adl_file);
      }

      if (filters.filled_by) {
        paramCount++;
        query += ` AND cp.filled_by = $${paramCount}`;
        countQuery += ` AND filled_by = $${paramCount}`;
        params.push(filters.filled_by);
      }

      if (filters.room_no) {
        paramCount++;
        query += ` AND cp.room_no = $${paramCount}`;
        countQuery += ` AND room_no = $${paramCount}`;
        params.push(filters.room_no);
      }

      if (filters.date_from) {
        paramCount++;
        query += ` AND cp.visit_date >= $${paramCount}`;
        countQuery += ` AND visit_date >= $${paramCount}`;
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        paramCount++;
        query += ` AND cp.visit_date <= $${paramCount}`;
        countQuery += ` AND visit_date <= $${paramCount}`;
        params.push(filters.date_to);
      }

      query += ` ORDER BY cp.visit_date DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const [proformaResult, countResult] = await Promise.all([
        db.query(query, params),
        db.query(countQuery, Object.values(filters))
      ]);

      const proformas = proformaResult.rows.map(row => new ClinicalProforma(row));
      const total = parseInt(countResult.rows[0].count);

      return {
        proformas,
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

  // Update clinical proforma
  async update(updateData) {
    try {
      const allowedFields = [
        'visit_date', 'visit_type', 'room_no', 'informant_present', 'nature_of_information',
        'onset_duration', 'course', 'precipitating_factor', 'illness_duration',
        'current_episode_since', 'mood', 'behaviour', 'speech', 'thought', 'perception',
        'somatic', 'bio_functions', 'adjustment', 'cognitive_function', 'fits',
        'sexual_problem', 'substance_use', 'past_history', 'family_history',
        'associated_medical_surgical', 'mse_behaviour', 'mse_affect', 'mse_thought',
        'mse_delusions', 'mse_perception', 'mse_cognitive_function', 'gpe',
        'diagnosis', 'icd_code', 'disposal', 'workup_appointment', 'referred_to',
        'treatment_prescribed', 'doctor_decision', 'case_severity', 'requires_adl_file',
        'adl_reasoning'
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
        `UPDATE clinical_proforma SET ${updates.join(', ')} 
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

  // Delete clinical proforma
  async delete() {
    try {
      await db.query('DELETE FROM clinical_proforma WHERE id = $1', [this.id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get clinical proforma statistics
  static async getStats() {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_proformas,
          COUNT(CASE WHEN visit_type = 'first_visit' THEN 1 END) as first_visits,
          COUNT(CASE WHEN visit_type = 'follow_up' THEN 1 END) as follow_ups,
          COUNT(CASE WHEN doctor_decision = 'simple_case' THEN 1 END) as simple_cases,
          COUNT(CASE WHEN doctor_decision = 'complex_case' THEN 1 END) as complex_cases,
          COUNT(CASE WHEN requires_adl_file = true THEN 1 END) as cases_requiring_adl,
          COUNT(CASE WHEN case_severity = 'mild' THEN 1 END) as mild_cases,
          COUNT(CASE WHEN case_severity = 'moderate' THEN 1 END) as moderate_cases,
          COUNT(CASE WHEN case_severity = 'severe' THEN 1 END) as severe_cases,
          COUNT(CASE WHEN case_severity = 'critical' THEN 1 END) as critical_cases
        FROM clinical_proforma
      `);

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get cases by severity
  static async getCasesBySeverity() {
    try {
      const result = await db.query(`
        SELECT 
          case_severity,
          COUNT(*) as count
        FROM clinical_proforma 
        WHERE case_severity IS NOT NULL
        GROUP BY case_severity
        ORDER BY count DESC
      `);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get cases by decision
  static async getCasesByDecision() {
    try {
      const result = await db.query(`
        SELECT 
          doctor_decision,
          COUNT(*) as count
        FROM clinical_proforma 
        WHERE doctor_decision IS NOT NULL
        GROUP BY doctor_decision
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
      visit_date: this.visit_date,
      visit_type: this.visit_type,
      room_no: this.room_no,
      informant_present: this.informant_present,
      nature_of_information: this.nature_of_information,
      onset_duration: this.onset_duration,
      course: this.course,
      precipitating_factor: this.precipitating_factor,
      illness_duration: this.illness_duration,
      current_episode_since: this.current_episode_since,
      mood: this.mood,
      behaviour: this.behaviour,
      speech: this.speech,
      thought: this.thought,
      perception: this.perception,
      somatic: this.somatic,
      bio_functions: this.bio_functions,
      adjustment: this.adjustment,
      cognitive_function: this.cognitive_function,
      fits: this.fits,
      sexual_problem: this.sexual_problem,
      substance_use: this.substance_use,
      past_history: this.past_history,
      family_history: this.family_history,
      associated_medical_surgical: this.associated_medical_surgical,
      mse_behaviour: this.mse_behaviour,
      mse_affect: this.mse_affect,
      mse_thought: this.mse_thought,
      mse_delusions: this.mse_delusions,
      mse_perception: this.mse_perception,
      mse_cognitive_function: this.mse_cognitive_function,
      gpe: this.gpe,
      diagnosis: this.diagnosis,
      icd_code: this.icd_code,
      disposal: this.disposal,
      workup_appointment: this.workup_appointment,
      referred_to: this.referred_to,
      treatment_prescribed: this.treatment_prescribed,
      doctor_decision: this.doctor_decision,
      case_severity: this.case_severity,
      requires_adl_file: this.requires_adl_file,
      adl_reasoning: this.adl_reasoning,
      created_at: this.created_at,
      // Additional fields from joins
      patient_name: this.patient_name,
      cr_no: this.cr_no,
      psy_no: this.psy_no,
      doctor_name: this.doctor_name,
      doctor_role: this.doctor_role
    };
  }
}

module.exports = ClinicalProforma;
