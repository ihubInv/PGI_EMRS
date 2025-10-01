const ClinicalProforma = require('../models/ClinicalProforma');
const Patient = require('../models/Patient');

class ClinicalController {
  // Create a new clinical proforma (JR/SR role)
  static async createClinicalProforma(req, res) {
    try {
      const proformaData = {
        ...req.body,
        filled_by: req.user.id // Set the doctor who is filling the proforma
      };

      const proforma = await ClinicalProforma.create(proformaData);

      // If this is a complex case requiring ADL file, create it
      if (proforma.doctor_decision === 'complex_case' && proforma.requires_adl_file) {
        try {
          const patient = await Patient.findById(proforma.patient_id);
          if (patient && !patient.has_adl_file) {
            await patient.createADLFile(proforma.id, req.user.id);
          }
        } catch (adlError) {
          console.warn('Failed to create ADL file:', adlError.message);
          // Don't fail the entire operation if ADL file creation fails
        }
      }

      res.status(201).json({
        success: true,
        message: 'Clinical proforma created successfully',
        data: {
          proforma: proforma.toJSON()
        }
      });
    } catch (error) {
      console.error('Clinical proforma creation error:', error);
      
      if (error.message === 'Patient not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create clinical proforma',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get all clinical proforma with pagination and filters
  static async getAllClinicalProformas(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};

      // Apply filters
      if (req.query.visit_type) filters.visit_type = req.query.visit_type;
      if (req.query.doctor_decision) filters.doctor_decision = req.query.doctor_decision;
      if (req.query.case_severity) filters.case_severity = req.query.case_severity;
      if (req.query.requires_adl_file !== undefined) filters.requires_adl_file = req.query.requires_adl_file === 'true';
      if (req.query.filled_by) filters.filled_by = req.query.filled_by;
      if (req.query.room_no) filters.room_no = req.query.room_no;
      if (req.query.date_from) filters.date_from = req.query.date_from;
      if (req.query.date_to) filters.date_to = req.query.date_to;

      const result = await ClinicalProforma.findAll(page, limit, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all clinical proformas error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get clinical proformas',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get clinical proforma by ID
  static async getClinicalProformaById(req, res) {
    try {
      const { id } = req.params;
      const proforma = await ClinicalProforma.findById(id);

      if (!proforma) {
        return res.status(404).json({
          success: false,
          message: 'Clinical proforma not found'
        });
      }

      res.json({
        success: true,
        data: {
          proforma: proforma.toJSON()
        }
      });
    } catch (error) {
      console.error('Get clinical proforma by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get clinical proforma',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get clinical proforma by patient ID
  static async getClinicalProformaByPatientId(req, res) {
    try {
      const { patient_id } = req.params;
      const proformas = await ClinicalProforma.findByPatientId(patient_id);

      res.json({
        success: true,
        data: {
          proformas: proformas.map(p => p.toJSON())
        }
      });
    } catch (error) {
      console.error('Get clinical proforma by patient ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get clinical proformas',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Update clinical proforma
  static async updateClinicalProforma(req, res) {
    try {
      const { id } = req.params;
      const proforma = await ClinicalProforma.findById(id);

      if (!proforma) {
        return res.status(404).json({
          success: false,
          message: 'Clinical proforma not found'
        });
      }

      // Only allow the doctor who created the proforma or admin to update
      if (proforma.filled_by !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update proformas you created.'
        });
      }

      const updateData = req.body;
      await proforma.update(updateData);

      res.json({
        success: true,
        message: 'Clinical proforma updated successfully',
        data: {
          proforma: proforma.toJSON()
        }
      });
    } catch (error) {
      console.error('Update clinical proforma error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update clinical proforma',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Delete clinical proforma
  static async deleteClinicalProforma(req, res) {
    try {
      const { id } = req.params;
      const proforma = await ClinicalProforma.findById(id);

      if (!proforma) {
        return res.status(404).json({
          success: false,
          message: 'Clinical proforma not found'
        });
      }

      // Only allow the doctor who created the proforma or admin to delete
      if (proforma.filled_by !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only delete proformas you created.'
        });
      }

      await proforma.delete();

      res.json({
        success: true,
        message: 'Clinical proforma deleted successfully'
      });
    } catch (error) {
      console.error('Delete clinical proforma error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete clinical proforma',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get clinical proforma statistics
  static async getClinicalStats(req, res) {
    try {
      const stats = await ClinicalProforma.getStats();

      res.json({
        success: true,
        data: {
          stats
        }
      });
    } catch (error) {
      console.error('Get clinical stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get clinical statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get cases by severity
  static async getCasesBySeverity(req, res) {
    try {
      const stats = await ClinicalProforma.getCasesBySeverity();

      res.json({
        success: true,
        data: {
          severityStats: stats
        }
      });
    } catch (error) {
      console.error('Get cases by severity error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get severity statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get cases by decision
  static async getCasesByDecision(req, res) {
    try {
      const stats = await ClinicalProforma.getCasesByDecision();

      res.json({
        success: true,
        data: {
          decisionStats: stats
        }
      });
    } catch (error) {
      console.error('Get cases by decision error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get decision statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get proformas created by current doctor
  static async getMyProformas(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        filled_by: req.user.id
      };

      const result = await ClinicalProforma.findAll(page, limit, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get my proformas error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get your proformas',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get complex cases requiring ADL files
  static async getComplexCases(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        doctor_decision: 'complex_case',
        requires_adl_file: true
      };

      const result = await ClinicalProforma.findAll(page, limit, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get complex cases error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get complex cases',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get cases by room
  static async getCasesByRoom(req, res) {
    try {
      const { room_no } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        room_no: room_no
      };

      const result = await ClinicalProforma.findAll(page, limit, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get cases by room error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cases by room',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = ClinicalController;
