const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['MWO', 'JR', 'SR', 'Admin'])
    .withMessage('Role must be one of: MWO, JR, SR, Admin'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Patient validation rules
const validatePatient = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Patient name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  body('sex')
    .isIn(['M', 'F', 'Other'])
    .withMessage('Sex must be M, F, or Other'),
  body('actual_age')
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150'),
  body('assigned_room')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Room number must not exceed 10 characters'),
  handleValidationErrors
];

// Outpatient record validation
const validateOutpatientRecord = [
  body('patient_id')
    .isInt({ min: 1 })
    .withMessage('Valid patient ID is required'),
  body('age_group')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Age group must not exceed 20 characters'),
  body('marital_status')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Marital status must not exceed 20 characters'),
  body('occupation')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Occupation must not exceed 50 characters'),
  body('education_level')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Education level must not exceed 50 characters'),
  body('religion')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Religion must not exceed 20 characters'),
  body('contact_number')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Contact number must not exceed 20 characters'),
  handleValidationErrors
];

// Clinical proforma validation
const validateClinicalProforma = [
  body('patient_id')
    .isInt({ min: 1 })
    .withMessage('Valid patient ID is required'),
  body('visit_date')
    .isISO8601()
    .withMessage('Valid visit date is required'),
  body('visit_type')
    .optional()
    .isIn(['first_visit', 'follow_up'])
    .withMessage('Visit type must be first_visit or follow_up'),
  body('room_no')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Room number must not exceed 10 characters'),
  body('doctor_decision')
    .optional()
    .isIn(['simple_case', 'complex_case'])
    .withMessage('Doctor decision must be simple_case or complex_case'),
  body('case_severity')
    .optional()
    .isIn(['mild', 'moderate', 'severe', 'critical'])
    .withMessage('Case severity must be mild, moderate, severe, or critical'),
  body('assigned_doctor')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Assigned doctor name must not exceed 255 characters'),
  handleValidationErrors
];

// ADL file validation
const validateADLFile = [
  body('patient_id')
    .isInt({ min: 1 })
    .withMessage('Valid patient ID is required'),
  body('clinical_proforma_id')
    .isInt({ min: 1 })
    .withMessage('Valid clinical proforma ID is required'),
  body('file_created_date')
    .isISO8601()
    .withMessage('Valid file created date is required'),
  body('physical_file_location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('File location must not exceed 100 characters'),
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID is required'),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validatePatient,
  validateOutpatientRecord,
  validateClinicalProforma,
  validateADLFile,
  validateId,
  validatePagination
};
