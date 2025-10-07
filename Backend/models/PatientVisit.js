const db = require('../config/database');

class PatientVisit {
  static async assignPatient({ patient_id, assigned_doctor, room_no, visit_date, notes }) {
    try {
      const dateToUse = visit_date || new Date().toISOString().slice(0, 10);

      const result = await db.query(
        `INSERT INTO patient_visits (patient_id, visit_date, visit_type, has_file, assigned_doctor, room_no, visit_status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [patient_id, dateToUse, 'follow_up', false, assigned_doctor, room_no || null, 'scheduled', notes || null]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PatientVisit;


