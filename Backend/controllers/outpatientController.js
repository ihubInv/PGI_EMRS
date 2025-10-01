const OutpatientRecord = require('../models/OutpatientRecord');

class OutpatientController {
  // Create a new outpatient record (MWO role)
  static async createOutpatientRecord(req, res) {
    try {
      const recordData = {
        ...req.body,
        filled_by: req.user.id // Set the MWO who is filling the record
      };

      const record = await OutpatientRecord.create(recordData);

      res.status(201).json({
        success: true,
        message: 'Outpatient record created successfully',
        data: {
          record: record.toJSON()
        }
      });
    } catch (error) {
      console.error('Outpatient record creation error:', error);
      
      if (error.message === 'Patient not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message === 'Outpatient record already exists for this patient') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create outpatient record',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get all outpatient records with pagination and filters
  static async getAllOutpatientRecords(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};

      // Apply filters
      if (req.query.marital_status) filters.marital_status = req.query.marital_status;
      if (req.query.occupation) filters.occupation = req.query.occupation;
      if (req.query.education_level) filters.education_level = req.query.education_level;
      if (req.query.religion) filters.religion = req.query.religion;
      if (req.query.family_type) filters.family_type = req.query.family_type;
      if (req.query.locality) filters.locality = req.query.locality;
      if (req.query.filled_by) filters.filled_by = req.query.filled_by;

      const result = await OutpatientRecord.findAll(page, limit, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all outpatient records error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get outpatient records',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get outpatient record by ID
  static async getOutpatientRecordById(req, res) {
    try {
      const { id } = req.params;
      const record = await OutpatientRecord.findById(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Outpatient record not found'
        });
      }

      res.json({
        success: true,
        data: {
          record: record.toJSON()
        }
      });
    } catch (error) {
      console.error('Get outpatient record by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get outpatient record',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get outpatient record by patient ID
  static async getOutpatientRecordByPatientId(req, res) {
    try {
      const { patient_id } = req.params;
      const record = await OutpatientRecord.findByPatientId(patient_id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Outpatient record not found for this patient'
        });
      }

      res.json({
        success: true,
        data: {
          record: record.toJSON()
        }
      });
    } catch (error) {
      console.error('Get outpatient record by patient ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get outpatient record',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Update outpatient record
  static async updateOutpatientRecord(req, res) {
    try {
      const { id } = req.params;
      const record = await OutpatientRecord.findById(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Outpatient record not found'
        });
      }

      // Only allow the MWO who created the record or admin to update
      if (record.filled_by !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update records you created.'
        });
      }

      const updateData = req.body;
      await record.update(updateData);

      res.json({
        success: true,
        message: 'Outpatient record updated successfully',
        data: {
          record: record.toJSON()
        }
      });
    } catch (error) {
      console.error('Update outpatient record error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update outpatient record',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Delete outpatient record
  static async deleteOutpatientRecord(req, res) {
    try {
      const { id } = req.params;
      const record = await OutpatientRecord.findById(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Outpatient record not found'
        });
      }

      // Only allow the MWO who created the record or admin to delete
      if (record.filled_by !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only delete records you created.'
        });
      }

      await record.delete();

      res.json({
        success: true,
        message: 'Outpatient record deleted successfully'
      });
    } catch (error) {
      console.error('Delete outpatient record error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete outpatient record',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get outpatient record statistics
  static async getOutpatientStats(req, res) {
    try {
      const stats = await OutpatientRecord.getStats();

      res.json({
        success: true,
        data: {
          stats
        }
      });
    } catch (error) {
      console.error('Get outpatient stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get outpatient statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get demographic statistics
  static async getDemographicStats(req, res) {
    try {
      const stats = await OutpatientRecord.getDemographicStats();

      res.json({
        success: true,
        data: {
          demographicStats: stats
        }
      });
    } catch (error) {
      console.error('Get demographic stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get demographic statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get records created by current user
  static async getMyRecords(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        filled_by: req.user.id
      };

      const result = await OutpatientRecord.findAll(page, limit, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get my records error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get your records',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = OutpatientController;
