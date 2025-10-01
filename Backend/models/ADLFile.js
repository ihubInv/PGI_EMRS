const db = require('../config/database');

class ADLFile {
  constructor(data) {
    this.id = data.id;
    this.patient_id = data.patient_id;
    this.adl_no = data.adl_no;
    this.created_by = data.created_by;
    this.clinical_proforma_id = data.clinical_proforma_id;
    this.file_status = data.file_status;
    this.physical_file_location = data.physical_file_location;
    this.file_created_date = data.file_created_date;
    this.last_accessed_date = data.last_accessed_date;
    this.last_accessed_by = data.last_accessed_by;
    this.total_visits = data.total_visits;
    this.is_active = data.is_active;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Find ADL file by ID
  static async findById(id) {
    try {
      const result = await db.query(
        `SELECT af.*, p.name as patient_name, p.cr_no, p.psy_no, 
                u1.name as created_by_name, u1.role as created_by_role,
                u2.name as last_accessed_by_name
         FROM adl_files af
         LEFT JOIN patients p ON af.patient_id = p.id
         LEFT JOIN users u1 ON af.created_by = u1.id
         LEFT JOIN users u2 ON af.last_accessed_by = u2.id
         WHERE af.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new ADLFile(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find ADL file by ADL number
  static async findByADLNo(adl_no) {
    try {
      const result = await db.query(
        `SELECT af.*, p.name as patient_name, p.cr_no, p.psy_no, 
                u1.name as created_by_name, u1.role as created_by_role,
                u2.name as last_accessed_by_name
         FROM adl_files af
         LEFT JOIN patients p ON af.patient_id = p.id
         LEFT JOIN users u1 ON af.created_by = u1.id
         LEFT JOIN users u2 ON af.last_accessed_by = u2.id
         WHERE af.adl_no = $1`,
        [adl_no]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new ADLFile(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find ADL file by patient ID
  static async findByPatientId(patient_id) {
    try {
      const result = await db.query(
        `SELECT af.*, p.name as patient_name, p.cr_no, p.psy_no, 
                u1.name as created_by_name, u1.role as created_by_role,
                u2.name as last_accessed_by_name
         FROM adl_files af
         LEFT JOIN patients p ON af.patient_id = p.id
         LEFT JOIN users u1 ON af.created_by = u1.id
         LEFT JOIN users u2 ON af.last_accessed_by = u2.id
         WHERE af.patient_id = $1
         ORDER BY af.file_created_date DESC`,
        [patient_id]
      );

      return result.rows.map(row => new ADLFile(row));
    } catch (error) {
      throw error;
    }
  }

  // Get all ADL files with pagination and filters
  static async findAll(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT af.*, p.name as patient_name, p.cr_no, p.psy_no, 
                u1.name as created_by_name, u1.role as created_by_role,
                u2.name as last_accessed_by_name
        FROM adl_files af
        LEFT JOIN patients p ON af.patient_id = p.id
        LEFT JOIN users u1 ON af.created_by = u1.id
        LEFT JOIN users u2 ON af.last_accessed_by = u2.id
        WHERE 1=1
      `;
      let countQuery = 'SELECT COUNT(*) FROM adl_files WHERE 1=1';
      const params = [];
      let paramCount = 0;

      // Apply filters
      if (filters.file_status) {
        paramCount++;
        query += ` AND af.file_status = $${paramCount}`;
        countQuery += ` AND file_status = $${paramCount}`;
        params.push(filters.file_status);
      }

      if (filters.is_active !== undefined) {
        paramCount++;
        query += ` AND af.is_active = $${paramCount}`;
        countQuery += ` AND is_active = $${paramCount}`;
        params.push(filters.is_active);
      }

      if (filters.created_by) {
        paramCount++;
        query += ` AND af.created_by = $${paramCount}`;
        countQuery += ` AND created_by = $${paramCount}`;
        params.push(filters.created_by);
      }

      if (filters.last_accessed_by) {
        paramCount++;
        query += ` AND af.last_accessed_by = $${paramCount}`;
        countQuery += ` AND last_accessed_by = $${paramCount}`;
        params.push(filters.last_accessed_by);
      }

      if (filters.date_from) {
        paramCount++;
        query += ` AND af.file_created_date >= $${paramCount}`;
        countQuery += ` AND file_created_date >= $${paramCount}`;
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        paramCount++;
        query += ` AND af.file_created_date <= $${paramCount}`;
        countQuery += ` AND file_created_date <= $${paramCount}`;
        params.push(filters.date_to);
      }

      query += ` ORDER BY af.file_created_date DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const [filesResult, countResult] = await Promise.all([
        db.query(query, params),
        db.query(countQuery, Object.values(filters))
      ]);

      const files = filesResult.rows.map(row => new ADLFile(row));
      const total = parseInt(countResult.rows[0].count);

      return {
        files,
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

  // Update ADL file
  async update(updateData) {
    try {
      const allowedFields = [
        'file_status', 'physical_file_location', 'last_accessed_date',
        'last_accessed_by', 'total_visits', 'is_active', 'notes'
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

      // Add updated_at
      paramCount++;
      updates.push(`updated_at = CURRENT_TIMESTAMP`);

      paramCount++;
      values.push(this.id);

      const result = await db.query(
        `UPDATE adl_files SET ${updates.join(', ')} 
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

  // Retrieve file (update status to retrieved)
  async retrieveFile(accessedBy) {
    try {
      await this.update({
        file_status: 'retrieved',
        last_accessed_date: new Date(),
        last_accessed_by: accessedBy
      });

      // Log the movement
      await this.logMovement('retrieved', 'Record Room', 'Doctor Office', accessedBy);
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Return file to storage
  async returnFile(returnedBy) {
    try {
      await this.update({
        file_status: 'stored',
        last_accessed_date: new Date(),
        last_accessed_by: returnedBy
      });

      // Log the movement
      await this.logMovement('returned', 'Doctor Office', 'Record Room', returnedBy);
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Archive file
  async archiveFile(archivedBy) {
    try {
      await this.update({
        file_status: 'archived',
        is_active: false,
        last_accessed_date: new Date(),
        last_accessed_by: archivedBy
      });

      // Log the movement
      await this.logMovement('archived', 'Record Room', 'Archive Room', archivedBy);
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Log file movement
  async logMovement(movementType, fromLocation, toLocation, movedBy, notes = null) {
    try {
      await db.query(
        `INSERT INTO file_movements (adl_file_id, patient_id, moved_by, movement_type, from_location, to_location, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [this.id, this.patient_id, movedBy, movementType, fromLocation, toLocation, notes]
      );
    } catch (error) {
      throw error;
    }
  }

  // Get file movement history
  async getMovementHistory() {
    try {
      const result = await db.query(
        `SELECT fm.*, u.name as moved_by_name, u.role as moved_by_role
         FROM file_movements fm
         LEFT JOIN users u ON fm.moved_by = u.id
         WHERE fm.adl_file_id = $1
         ORDER BY fm.movement_date DESC`,
        [this.id]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get files that need to be retrieved
  static async getFilesToRetrieve() {
    try {
      const result = await db.query(
        `SELECT af.*, p.name as patient_name, p.cr_no, p.psy_no, 
                u1.name as created_by_name, u1.role as created_by_role
         FROM adl_files af
         LEFT JOIN patients p ON af.patient_id = p.id
         LEFT JOIN users u1 ON af.created_by = u1.id
         WHERE af.file_status = 'stored' AND af.is_active = true
         ORDER BY af.file_created_date ASC`
      );

      return result.rows.map(row => new ADLFile(row));
    } catch (error) {
      throw error;
    }
  }

  // Get active files (currently retrieved)
  static async getActiveFiles() {
    try {
      const result = await db.query(
        `SELECT af.*, p.name as patient_name, p.cr_no, p.psy_no, 
                u1.name as created_by_name, u1.role as created_by_role,
                u2.name as last_accessed_by_name
         FROM adl_files af
         LEFT JOIN patients p ON af.patient_id = p.id
         LEFT JOIN users u1 ON af.created_by = u1.id
         LEFT JOIN users u2 ON af.last_accessed_by = u2.id
         WHERE af.file_status = 'retrieved' AND af.is_active = true
         ORDER BY af.last_accessed_date ASC`
      );

      return result.rows.map(row => new ADLFile(row));
    } catch (error) {
      throw error;
    }
  }

  // Get ADL file statistics
  static async getStats() {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_files,
          COUNT(CASE WHEN file_status = 'created' THEN 1 END) as created_files,
          COUNT(CASE WHEN file_status = 'stored' THEN 1 END) as stored_files,
          COUNT(CASE WHEN file_status = 'retrieved' THEN 1 END) as retrieved_files,
          COUNT(CASE WHEN file_status = 'archived' THEN 1 END) as archived_files,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_files,
          COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_files,
          AVG(total_visits) as avg_visits_per_file
        FROM adl_files
      `);

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get files by status
  static async getFilesByStatus() {
    try {
      const result = await db.query(`
        SELECT 
          file_status,
          COUNT(*) as count
        FROM adl_files 
        WHERE file_status IS NOT NULL
        GROUP BY file_status
        ORDER BY count DESC
      `);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Delete ADL file (soft delete by archiving)
  async delete() {
    try {
      // Archive the file instead of hard delete
      await this.update({
        file_status: 'archived',
        is_active: false,
        notes: this.notes ? `${this.notes}\n[DELETED]` : '[DELETED]'
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      patient_id: this.patient_id,
      adl_no: this.adl_no,
      created_by: this.created_by,
      clinical_proforma_id: this.clinical_proforma_id,
      file_status: this.file_status,
      physical_file_location: this.physical_file_location,
      file_created_date: this.file_created_date,
      last_accessed_date: this.last_accessed_date,
      last_accessed_by: this.last_accessed_by,
      total_visits: this.total_visits,
      is_active: this.is_active,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at,
      // Additional fields from joins
      patient_name: this.patient_name,
      cr_no: this.cr_no,
      psy_no: this.psy_no,
      created_by_name: this.created_by_name,
      created_by_role: this.created_by_role,
      last_accessed_by_name: this.last_accessed_by_name
    };
  }
}

module.exports = ADLFile;
