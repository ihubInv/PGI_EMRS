const Prescription = require('../models/Prescription');
const ClinicalProforma = require('../models/ClinicalProforma');
const { validationResult } = require('express-validator');

/**
 * Create a new prescription
 */
const createPrescription = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const prescriptionData = req.body;

    // Verify clinical proforma exists
    const proforma = await ClinicalProforma.findById(prescriptionData.clinical_proforma_id);
    if (!proforma) {
      return res.status(404).json({
        success: false,
        message: 'Clinical proforma not found'
      });
    }

    const prescription = await Prescription.create(prescriptionData);

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: {
        prescription: prescription.toJSON()
      }
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create prescription',
      error: error.message
    });
  }
};

/**
 * Create multiple prescriptions (bulk)
 */
const createBulkPrescriptions = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { prescriptions, clinical_proforma_id } = req.body;

    if (!Array.isArray(prescriptions) || prescriptions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Prescriptions array is required and cannot be empty'
      });
    }

    // Verify clinical proforma exists
    const proforma = await ClinicalProforma.findById(clinical_proforma_id);
    if (!proforma) {
      return res.status(404).json({
        success: false,
        message: 'Clinical proforma not found'
      });
    }

    // Add clinical_proforma_id to each prescription
    const prescriptionsWithProformaId = prescriptions.map(prescription => ({
      ...prescription,
      clinical_proforma_id
    }));

    const createdPrescriptions = await Prescription.createBulk(prescriptionsWithProformaId);

    res.status(201).json({
      success: true,
      message: `${createdPrescriptions.length} prescription(s) created successfully`,
      data: {
        prescriptions: createdPrescriptions.map(p => p.toJSON()),
        count: createdPrescriptions.length
      }
    });
  } catch (error) {
    console.error('Error creating bulk prescriptions:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    res.status(500).json({
      success: false,
      message: 'Failed to create prescriptions',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get all prescriptions for a clinical proforma
 */
const getPrescriptionsByProformaId = async (req, res) => {
  try {
    const { proforma_id } = req.params;

    const prescriptions = await Prescription.findByClinicalProformaId(parseInt(proforma_id));

    res.status(200).json({
      success: true,
      message: 'Prescriptions retrieved successfully',
      data: {
        prescriptions: prescriptions.map(p => p.toJSON()),
        count: prescriptions.length
      }
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions',
      error: error.message
    });
  }
};

/**
 * Get a single prescription by ID
 */
const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(parseInt(id));

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Prescription retrieved successfully',
      data: {
        prescription: prescription.toJSON()
      }
    });
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescription',
      error: error.message
    });
  }
};

/**
 * Update a prescription
 */
const updatePrescription = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const prescription = await Prescription.findById(parseInt(id));

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    await prescription.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Prescription updated successfully',
      data: {
        prescription: prescription.toJSON()
      }
    });
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update prescription',
      error: error.message
    });
  }
};

/**
 * Delete a prescription
 */
const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(parseInt(id));

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    await prescription.delete();

    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete prescription',
      error: error.message
    });
  }
};

/**
 * Delete all prescriptions for a clinical proforma
 */
const deletePrescriptionsByProformaId = async (req, res) => {
  try {
    const { proforma_id } = req.params;

    const deletedCount = await Prescription.deleteByClinicalProformaId(parseInt(proforma_id));

    res.status(200).json({
      success: true,
      message: `${deletedCount} prescription(s) deleted successfully`,
      data: {
        deleted_count: deletedCount
      }
    });
  } catch (error) {
    console.error('Error deleting prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete prescriptions',
      error: error.message
    });
  }
};

module.exports = {
  createPrescription,
  createBulkPrescriptions,
  getPrescriptionsByProformaId,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
  deletePrescriptionsByProformaId
};

