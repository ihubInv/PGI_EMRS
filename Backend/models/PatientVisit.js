const db = require('../config/database');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase admin client for direct inserts
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

class PatientVisit {
  static async assignPatient({ patient_id, assigned_doctor_id, room_no, visit_date, notes }) {
    try {
      const dateToUse = visit_date || new Date().toISOString().slice(0, 10);

      // Use Supabase native insert which handles UUID/INT conversion automatically
      const { data, error } = await supabaseAdmin
        .from('patient_visits')
        .insert({
          patient_id: patient_id, // Supabase will handle type conversion
          visit_date: dateToUse,
          visit_type: 'follow_up',
          has_file: false,
          assigned_doctor_id: assigned_doctor_id,
          room_no: room_no || null,
          visit_status: 'scheduled',
          notes: notes || null
        })
        .select()
        .single();

      if (error) {
        // Check for UUID type errors (after migration, patient_id should be UUID)
        const isUUIDError = error.message && (
          error.message.includes('invalid input syntax for type uuid') ||
          error.message.includes('invalid input syntax for type integer') ||
          error.message.includes('type mismatch') ||
          error.code === '22P02' // PostgreSQL invalid input syntax error code
        );

        if (isUUIDError) {
          console.error('[PatientVisit.assignPatient] Type mismatch error:', error.message);
          console.error('[PatientVisit.assignPatient] patient_id value:', patient_id, 'type:', typeof patient_id);
          
          // If error is about UUID, it means patient_id is not a valid UUID
          if (error.message.includes('invalid input syntax for type uuid')) {
            throw new Error(`Invalid patient_id format: Expected UUID but received "${patient_id}". The patient_visits table now uses UUID for patient_id. Please ensure the patient record has a valid UUID.`);
          }
          
          // If error is about integer, it means the migration hasn't been run
          // The column is still INT but we're trying to insert UUID
          if (error.message.includes('invalid input syntax for type integer')) {
            throw new Error(`Database schema mismatch: The patient_visits.patient_id column is still INT type, but you're trying to insert a UUID. Please run the migration script to convert it to UUID. Error: ${error.message}`);
          }
          
          throw new Error(`Type mismatch error: ${error.message}`);
        }

        // For other errors, try raw SQL as fallback
        console.log('[PatientVisit.assignPatient] Supabase insert failed, trying raw SQL:', error.message);
        
        try {
          const result = await db.query(
            `INSERT INTO patient_visits (patient_id, visit_date, visit_type, has_file, assigned_doctor_id, room_no, visit_status, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [patient_id, dateToUse, 'follow_up', false, assigned_doctor_id, room_no || null, 'scheduled', notes || null]
          );
          
          return result.rows[0];
        } catch (sqlError) {
          // If raw SQL also fails, throw the original Supabase error
          throw error;
        }
      }

      return data;
    } catch (error) {
      console.error('[PatientVisit.assignPatient] Error:', error);
      throw error;
    }
  }
}

module.exports = PatientVisit;


