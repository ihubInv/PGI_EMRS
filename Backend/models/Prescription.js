const db = require('../config/database');

class Prescription {
  constructor(data) {
    this.id = data.id;
    this.clinical_proforma_id = data.clinical_proforma_id;
    this.medicine = data.medicine;
    this.dosage = data.dosage;
    // Database column is 'when_to_take', but we support 'when' and 'when_taken' for API compatibility
    this.when_taken = data.when_to_take || data.when_taken || data.when;
    this.frequency = data.frequency;
    this.duration = data.duration;
    // Database column is 'quantity', but we support 'qty' for API compatibility
    this.quantity = data.quantity || data.qty;
    this.details = data.details;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(prescriptionData) {
    try {
      const {
        clinical_proforma_id,
        medicine,
        dosage,
        when_taken,
        when, // Support both field names
        frequency,
        duration,
        quantity,
        qty, // Support both field names
        details,
        notes
      } = prescriptionData;

      // Validate required fields
      if (!clinical_proforma_id || !medicine) {
        throw new Error('clinical_proforma_id and medicine are required');
      }

      // Use when_taken or when, quantity or qty
      const whenValue = when_taken || when || null;
      const quantityValue = quantity || qty || null;

      const result = await db.query(
        `INSERT INTO prescriptions (
          clinical_proforma_id, medicine, dosage, when_to_take, frequency, 
          duration, quantity, details, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          clinical_proforma_id,
          medicine,
          dosage || null,
          whenValue,
          frequency || null,
          duration || null,
          quantityValue,
          details || null,
          notes || null
        ]
      );

      return new Prescription(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async createBulk(prescriptionsArray) {
    try {
      if (!Array.isArray(prescriptionsArray) || prescriptionsArray.length === 0) {
        return [];
      }

      // Prepare data array for Supabase bulk insert
      const insertData = [];

      for (const prescription of prescriptionsArray) {
        const {
          clinical_proforma_id,
          medicine,
          dosage,
          when_taken,
          when,
          frequency,
          duration,
          quantity,
          qty,
          details,
          notes
        } = prescription;

        if (!clinical_proforma_id || !medicine) {
          continue; // Skip invalid prescriptions
        }

        const whenValue = when_taken || when || null;
        const quantityValue = quantity || qty || null;

        insertData.push({
          clinical_proforma_id,
          medicine,
          dosage: dosage || null,
          when_to_take: whenValue, // Use correct database column name
          frequency: frequency || null,
          duration: duration || null,
          quantity: quantityValue, // Use correct database column name
          details: details || null,
          notes: notes || null
        });
      }

      if (insertData.length === 0) {
        return [];
      }

      try {
        // Use Supabase client directly for bulk insert
        const { supabaseAdmin } = require('../config/database');
        const { data: result, error } = await supabaseAdmin
          .from('prescriptions')
          .insert(insertData)
          .select();

        if (error) {
          console.error('Supabase bulk insert error:', error);
          throw error;
        }

        return (result || []).map(row => new Prescription(row));
      } catch (dbError) {
        console.error('Database error in createBulk:', dbError);
        console.error('Insert data count:', insertData.length);
        throw dbError;
      }
    } catch (error) {
      throw error;
    }
  }

  static async findByClinicalProformaId(clinical_proforma_id) {
    try {
      const result = await db.query(
        'SELECT * FROM prescriptions WHERE clinical_proforma_id = $1 ORDER BY id ASC',
        [clinical_proforma_id]
      );

      return result.rows.map(row => new Prescription(row));
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT * FROM prescriptions WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new Prescription(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  async update(updateData) {
    try {
      const allowedFields = [
        'medicine',
        'dosage',
        'when_to_take',
        'when_taken',
        'when', // Support multiple field names for API compatibility
        'frequency',
        'duration',
        'quantity',
        'qty', // Support both for API compatibility
        'details',
        'notes'
      ];

      const updates = [];
      const values = [];
      let paramCount = 0;

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          paramCount++;
          // Map API field names to database column names
          if (key === 'when' || key === 'when_taken') {
            updates.push(`when_to_take = $${paramCount}`);
            values.push(value);
          } else if (key === 'qty') {
            updates.push(`quantity = $${paramCount}`);
            values.push(value);
          } else if (key === 'when_to_take') {
            updates.push(`when_to_take = $${paramCount}`);
            values.push(value);
          } else {
            updates.push(`${key} = $${paramCount}`);
            values.push(value);
          }
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      paramCount++;
      values.push(this.id);

      const result = await db.query(
        `UPDATE prescriptions SET ${updates.join(', ')}
         WHERE id = $${paramCount}
         RETURNING *`,
        values
      );

      Object.assign(this, result.rows[0]);
      return this;
    } catch (error) {
      throw error;
    }
  }

  async delete() {
    try {
      await db.query('DELETE FROM prescriptions WHERE id = $1', [this.id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async deleteByClinicalProformaId(clinical_proforma_id) {
    try {
      const result = await db.query(
        'DELETE FROM prescriptions WHERE clinical_proforma_id = $1 RETURNING id',
        [clinical_proforma_id]
      );
      return result.rows.length;
    } catch (error) {
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      clinical_proforma_id: this.clinical_proforma_id,
      medicine: this.medicine,
      dosage: this.dosage,
      when: this.when_taken, // Export as "when" for frontend compatibility
      frequency: this.frequency,
      duration: this.duration,
      qty: this.quantity, // Export as "qty" for frontend compatibility
      details: this.details,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Prescription;

