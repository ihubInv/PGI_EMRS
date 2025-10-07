const express = require('express');
const router = express.Router();
const PatientController = require('../controllers/patientController');
const { authenticateToken, requireMWOOrDoctor, requireAdmin, authorizeRoles } = require('../middleware/auth');
const {
  validatePatient,
  validateId,
  validatePagination
} = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       required:
 *         - name
 *         - sex
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated patient ID
 *         cr_no:
 *           type: string
 *           description: Central Registration Number
 *         psy_no:
 *           type: string
 *           description: Psychiatry General Number
 *         special_clinic_no:
 *           type: string
 *           description: Special Clinic Number
 *         adl_no:
 *           type: string
 *           description: ADL File Number (for complex cases)
 *         name:
 *           type: string
 *           description: Patient's full name
 *         sex:
 *           type: string
 *           enum: [M, F, Other]
 *           description: Patient's sex
 *         actual_age:
 *           type: integer
 *           description: Patient's actual age
 *         has_adl_file:
 *           type: boolean
 *           description: Whether patient has an ADL file
 *         file_status:
 *           type: string
 *           enum: [none, created, stored, retrieved, active]
 *           description: Current file status
 *         assigned_room:
 *           type: string
 *           description: Assigned room number
 *         case_complexity:
 *           type: string
 *           enum: [simple, complex]
 *           description: Case complexity level
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Patient registration timestamp
 *     
 *     PatientCreate:
 *       type: object
 *       required:
 *         - name
 *         - sex
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 255
 *         sex:
 *           type: string
 *           enum: [M, F, Other]
 *         actual_age:
 *           type: integer
 *           minimum: 0
 *           maximum: 150
 *         assigned_room:
 *           type: string
 *           maxLength: 10
 *     
 *     PatientUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 255
 *         sex:
 *           type: string
 *           enum: [M, F, Other]
 *         actual_age:
 *           type: integer
 *           minimum: 0
 *           maximum: 150
 *         assigned_room:
 *           type: string
 *           maxLength: 10
 *         case_complexity:
 *           type: string
 *           enum: [simple, complex]
 *         file_status:
 *           type: string
 *           enum: [none, created, stored, retrieved, active]
 *         has_adl_file:
 *           type: boolean
 */

// Protected routes (require authentication)
/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Register a new patient
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientCreate'
 *     responses:
 *       201:
 *         description: Patient registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     patient:
 *                       $ref: '#/components/schemas/Patient'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, requireMWOOrDoctor, validatePatient, PatientController.createPatient);

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get all patients with pagination and filters
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of patients per page
 *       - in: query
 *         name: sex
 *         schema:
 *           type: string
 *           enum: [M, F, Other]
 *         description: Filter by sex
 *       - in: query
 *         name: case_complexity
 *         schema:
 *           type: string
 *           enum: [simple, complex]
 *         description: Filter by case complexity
 *       - in: query
 *         name: has_adl_file
 *         schema:
 *           type: boolean
 *         description: Filter by ADL file status
 *       - in: query
 *         name: file_status
 *         schema:
 *           type: string
 *           enum: [none, created, stored, retrieved, active]
 *         description: Filter by file status
 *       - in: query
 *         name: assigned_room
 *         schema:
 *           type: string
 *         description: Filter by assigned room
 *     responses:
 *       200:
 *         description: Patients retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// Allow Admin to access patient list as well
router.get('/', authenticateToken, authorizeRoles('Admin', 'MWO', 'JR', 'SR'), validatePagination, PatientController.getAllPatients);

/**
 * @swagger
 * /api/patients/search:
 *   get:
 *     summary: Search patients by name or number
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search term (name, CR number, PSY number, or ADL number)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of patients per page
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       400:
 *         description: Search term too short
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/search', authenticateToken, authorizeRoles('Admin', 'MWO', 'JR', 'SR'), PatientController.searchPatients);

/**
 * @swagger
 * /api/patients/stats:
 *   get:
 *     summary: Get patient statistics
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/stats', authenticateToken, authorizeRoles('Admin', 'MWO', 'JR', 'SR'), PatientController.getPatientStats);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, authorizeRoles('Admin', 'MWO', 'JR', 'SR'), validateId, PatientController.getPatientById);

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     summary: Update patient information
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientUpdate'
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'MWO', 'JR', 'SR'), validateId, PatientController.updatePatient);

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     summary: Delete patient (Admin only)
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *       400:
 *         description: Cannot delete patient with existing records
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, requireAdmin, validateId, PatientController.deletePatient);

/**
 * @swagger
 * /api/patients/{id}/profile:
 *   get:
 *     summary: Get complete patient profile with all related records
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Complete patient profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get('/:id/profile', authenticateToken, authorizeRoles('Admin', 'MWO', 'JR', 'SR'), validateId, PatientController.getPatientProfile);

/**
 * @swagger
 * /api/patients/{id}/visits:
 *   get:
 *     summary: Get patient's visit history
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Visit history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get('/:id/visits', authenticateToken, authorizeRoles('Admin', 'MWO', 'JR', 'SR'), validateId, PatientController.getPatientVisitHistory);

/**
 * @swagger
 * /api/patients/{id}/clinical-records:
 *   get:
 *     summary: Get patient's clinical records
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Clinical records retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get('/:id/clinical-records', authenticateToken, authorizeRoles('Admin', 'MWO', 'JR', 'SR'), validateId, PatientController.getPatientClinicalRecords);

/**
 * @swagger
 * /api/patients/{id}/adl-files:
 *   get:
 *     summary: Get patient's ADL files
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: ADL files retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get('/:id/adl-files', authenticateToken, authorizeRoles('Admin', 'MWO', 'JR', 'SR'), validateId, PatientController.getPatientADLFiles);

// MWO assignment endpoint (tracking only, not restricting access)
router.post('/assign', authenticateToken, authorizeRoles('MWO', 'Admin'), PatientController.assignPatient);

// Routes for finding patients by specific numbers
/**
 * @swagger
 * /api/patients/cr/{cr_no}:
 *   get:
 *     summary: Get patient by CR number
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cr_no
 *         required: true
 *         schema:
 *           type: string
 *         description: Central Registration Number
 *     responses:
 *       200:
 *         description: Patient retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get('/cr/:cr_no', authenticateToken, authorizeRoles('Admin', 'MWO', 'JR', 'SR'), PatientController.getPatientByCRNo);

/**
 * @swagger
 * /api/patients/psy/{psy_no}:
 *   get:
 *     summary: Get patient by PSY number
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: psy_no
 *         required: true
 *         schema:
 *           type: string
 *         description: Psychiatry General Number
 *     responses:
 *       200:
 *         description: Patient retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get('/psy/:psy_no', authenticateToken, authorizeRoles('Admin', 'MWO', 'JR', 'SR'), PatientController.getPatientByPSYNo);

/**
 * @swagger
 * /api/patients/adl/{adl_no}:
 *   get:
 *     summary: Get patient by ADL number
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adl_no
 *         required: true
 *         schema:
 *           type: string
 *         description: ADL File Number
 *     responses:
 *       200:
 *         description: Patient retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get('/adl/:adl_no', authenticateToken, authorizeRoles('Admin', 'MWO', 'JR', 'SR'), PatientController.getPatientByADLNo);

module.exports = router;
