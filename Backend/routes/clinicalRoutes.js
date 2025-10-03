const express = require('express');
const router = express.Router();
const ClinicalController = require('../controllers/clinicalController');
const { authenticateToken, requireDoctor, requireAdmin, authorizeRoles } = require('../middleware/auth');
const {
  validateClinicalProforma,
  validateId,
  validatePagination
} = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     ClinicalProforma:
 *       type: object
 *       required:
 *         - patient_id
 *         - visit_date
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated proforma ID
 *         patient_id:
 *           type: integer
 *           description: Patient ID
 *         filled_by:
 *           type: integer
 *           description: Doctor user ID who filled the proforma
 *         visit_date:
 *           type: string
 *           format: date
 *           description: Visit date
 *         visit_type:
 *           type: string
 *           enum: [first_visit, follow_up]
 *           description: Type of visit
 *         room_no:
 *           type: string
 *           maxLength: 10
 *         informant_present:
 *           type: boolean
 *         nature_of_information:
 *           type: string
 *           maxLength: 50
 *         onset_duration:
 *           type: string
 *           maxLength: 50
 *         course:
 *           type: string
 *           maxLength: 50
 *         precipitating_factor:
 *           type: string
 *         illness_duration:
 *           type: string
 *           maxLength: 100
 *         current_episode_since:
 *           type: string
 *           format: date
 *         mood:
 *           type: string
 *         behaviour:
 *           type: string
 *         speech:
 *           type: string
 *         thought:
 *           type: string
 *         perception:
 *           type: string
 *         somatic:
 *           type: string
 *         bio_functions:
 *           type: string
 *         adjustment:
 *           type: string
 *         cognitive_function:
 *           type: string
 *         fits:
 *           type: string
 *         sexual_problem:
 *           type: string
 *         substance_use:
 *           type: string
 *         past_history:
 *           type: string
 *         family_history:
 *           type: string
 *         associated_medical_surgical:
 *           type: string
 *         mse_behaviour:
 *           type: string
 *         mse_affect:
 *           type: string
 *         mse_thought:
 *           type: string
 *         mse_delusions:
 *           type: string
 *         mse_perception:
 *           type: string
 *         mse_cognitive_function:
 *           type: string
 *         gpe:
 *           type: string
 *         diagnosis:
 *           type: string
 *         icd_code:
 *           type: string
 *           maxLength: 20
 *         disposal:
 *           type: string
 *         workup_appointment:
 *           type: string
 *           format: date
 *         referred_to:
 *           type: string
 *         treatment_prescribed:
 *           type: string
 *         doctor_decision:
 *           type: string
 *           enum: [simple_case, complex_case]
 *         case_severity:
 *           type: string
 *           enum: [mild, moderate, severe, critical]
 *         requires_adl_file:
 *           type: boolean
 *         adl_reasoning:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         patient_name:
 *           type: string
 *           description: Patient name (from join)
 *         cr_no:
 *           type: string
 *           description: CR number (from join)
 *         psy_no:
 *           type: string
 *           description: PSY number (from join)
 *         doctor_name:
 *           type: string
 *           description: Doctor name (from join)
 *         doctor_role:
 *           type: string
 *           description: Doctor role (from join)
 *     
 *     ClinicalProformaCreate:
 *       type: object
 *       required:
 *         - patient_id
 *         - visit_date
 *       properties:
 *         patient_id:
 *           type: integer
 *         visit_date:
 *           type: string
 *           format: date
 *         visit_type:
 *           type: string
 *           enum: [first_visit, follow_up]
 *         room_no:
 *           type: string
 *         informant_present:
 *           type: boolean
 *         nature_of_information:
 *           type: string
 *         onset_duration:
 *           type: string
 *         course:
 *           type: string
 *         precipitating_factor:
 *           type: string
 *         illness_duration:
 *           type: string
 *         current_episode_since:
 *           type: string
 *           format: date
 *         mood:
 *           type: string
 *         behaviour:
 *           type: string
 *         speech:
 *           type: string
 *         thought:
 *           type: string
 *         perception:
 *           type: string
 *         somatic:
 *           type: string
 *         bio_functions:
 *           type: string
 *         adjustment:
 *           type: string
 *         cognitive_function:
 *           type: string
 *         fits:
 *           type: string
 *         sexual_problem:
 *           type: string
 *         substance_use:
 *           type: string
 *         past_history:
 *           type: string
 *         family_history:
 *           type: string
 *         associated_medical_surgical:
 *           type: string
 *         mse_behaviour:
 *           type: string
 *         mse_affect:
 *           type: string
 *         mse_thought:
 *           type: string
 *         mse_delusions:
 *           type: string
 *         mse_perception:
 *           type: string
 *         mse_cognitive_function:
 *           type: string
 *         gpe:
 *           type: string
 *         diagnosis:
 *           type: string
 *         icd_code:
 *           type: string
 *         disposal:
 *           type: string
 *         workup_appointment:
 *           type: string
 *           format: date
 *         referred_to:
 *           type: string
 *         treatment_prescribed:
 *           type: string
 *         doctor_decision:
 *           type: string
 *           enum: [simple_case, complex_case]
 *         case_severity:
 *           type: string
 *           enum: [mild, moderate, severe, critical]
 *         requires_adl_file:
 *           type: boolean
 *         adl_reasoning:
 *           type: string
 */

// Doctor-only routes (JR/SR)
/**
 * @swagger
 * /api/clinical-proformas:
 *   post:
 *     summary: Create a new clinical proforma (Admin, JR/SR Doctor only)
 *     tags: [Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClinicalProformaCreate'
 *     responses:
 *       201:
 *         description: Clinical proforma created successfully
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
 *                     proforma:
 *                       $ref: '#/components/schemas/ClinicalProforma'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin or Doctor access required
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, authorizeRoles('Admin', 'JR', 'SR'), validateClinicalProforma, ClinicalController.createClinicalProforma);

/**
 * @swagger
 * /api/clinical-proformas/my-proformas:
 *   get:
 *     summary: Get proformas created by current doctor
 *     tags: [Clinical Proforma]
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
 *         description: Number of proformas per page
 *     responses:
 *       200:
 *         description: Proformas retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Doctor access required
 *       500:
 *         description: Server error
 */
router.get('/my-proformas', authenticateToken, requireDoctor, validatePagination, ClinicalController.getMyProformas);

/**
 * @swagger
 * /api/clinical-proformas/complex-cases:
 *   get:
 *     summary: Get complex cases requiring ADL files
 *     tags: [Clinical Proforma]
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
 *         description: Number of proformas per page
 *     responses:
 *       200:
 *         description: Complex cases retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/complex-cases', authenticateToken, validatePagination, ClinicalController.getComplexCases);

// Protected routes (Doctor and Admin)
/**
 * @swagger
 * /api/clinical-proformas:
 *   get:
 *     summary: Get all clinical proformas with pagination and filters
 *     tags: [Clinical Proforma]
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
 *         description: Number of proformas per page
 *       - in: query
 *         name: visit_type
 *         schema:
 *           type: string
 *           enum: [first_visit, follow_up]
 *         description: Filter by visit type
 *       - in: query
 *         name: doctor_decision
 *         schema:
 *           type: string
 *           enum: [simple_case, complex_case]
 *         description: Filter by doctor decision
 *       - in: query
 *         name: case_severity
 *         schema:
 *           type: string
 *           enum: [mild, moderate, severe, critical]
 *         description: Filter by case severity
 *       - in: query
 *         name: requires_adl_file
 *         schema:
 *           type: boolean
 *         description: Filter by ADL file requirement
 *       - in: query
 *         name: filled_by
 *         schema:
 *           type: integer
 *         description: Filter by doctor who filled the proforma
 *       - in: query
 *         name: room_no
 *         schema:
 *           type: string
 *         description: Filter by room number
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *     responses:
 *       200:
 *         description: Proformas retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, validatePagination, ClinicalController.getAllClinicalProformas);

/**
 * @swagger
 * /api/clinical-proformas/stats:
 *   get:
 *     summary: Get clinical proforma statistics
 *     tags: [Clinical Proforma]
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
router.get('/stats', authenticateToken, requireAdmin, ClinicalController.getClinicalStats);

/**
 * @swagger
 * /api/clinical-proformas/severity-stats:
 *   get:
 *     summary: Get cases by severity statistics
 *     tags: [Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Severity statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/severity-stats', authenticateToken, ClinicalController.getCasesBySeverity);

/**
 * @swagger
 * /api/clinical-proformas/decision-stats:
 *   get:
 *     summary: Get cases by decision statistics
 *     tags: [Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Decision statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/decision-stats', authenticateToken, ClinicalController.getCasesByDecision);

/**
 * @swagger
 * /api/clinical-proformas/{id}:
 *   get:
 *     summary: Get clinical proforma by ID
 *     tags: [Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Proforma ID
 *     responses:
 *       200:
 *         description: Proforma retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Proforma not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, validateId, ClinicalController.getClinicalProformaById);

/**
 * @swagger
 * /api/clinical-proformas/{id}:
 *   put:
 *     summary: Update clinical proforma
 *     tags: [Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Proforma ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               visit_date:
 *                 type: string
 *                 format: date
 *               visit_type:
 *                 type: string
 *                 enum: [first_visit, follow_up]
 *               room_no:
 *                 type: string
 *               informant_present:
 *                 type: boolean
 *               nature_of_information:
 *                 type: string
 *               onset_duration:
 *                 type: string
 *               course:
 *                 type: string
 *               precipitating_factor:
 *                 type: string
 *               illness_duration:
 *                 type: string
 *               current_episode_since:
 *                 type: string
 *                 format: date
 *               mood:
 *                 type: string
 *               behaviour:
 *                 type: string
 *               speech:
 *                 type: string
 *               thought:
 *                 type: string
 *               perception:
 *                 type: string
 *               somatic:
 *                 type: string
 *               bio_functions:
 *                 type: string
 *               adjustment:
 *                 type: string
 *               cognitive_function:
 *                 type: string
 *               fits:
 *                 type: string
 *               sexual_problem:
 *                 type: string
 *               substance_use:
 *                 type: string
 *               past_history:
 *                 type: string
 *               family_history:
 *                 type: string
 *               associated_medical_surgical:
 *                 type: string
 *               mse_behaviour:
 *                 type: string
 *               mse_affect:
 *                 type: string
 *               mse_thought:
 *                 type: string
 *               mse_delusions:
 *                 type: string
 *               mse_perception:
 *                 type: string
 *               mse_cognitive_function:
 *                 type: string
 *               gpe:
 *                 type: string
 *               diagnosis:
 *                 type: string
 *               icd_code:
 *                 type: string
 *               disposal:
 *                 type: string
 *               workup_appointment:
 *                 type: string
 *                 format: date
 *               referred_to:
 *                 type: string
 *               treatment_prescribed:
 *                 type: string
 *               doctor_decision:
 *                 type: string
 *                 enum: [simple_case, complex_case]
 *               case_severity:
 *                 type: string
 *                 enum: [mild, moderate, severe, critical]
 *               requires_adl_file:
 *                 type: boolean
 *               adl_reasoning:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proforma updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - can only update own proformas
 *       404:
 *         description: Proforma not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, validateId, ClinicalController.updateClinicalProforma);

/**
 * @swagger
 * /api/clinical-proformas/{id}:
 *   delete:
 *     summary: Delete clinical proforma
 *     tags: [Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Proforma ID
 *     responses:
 *       200:
 *         description: Proforma deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - can only delete own proformas
 *       404:
 *         description: Proforma not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, validateId, ClinicalController.deleteClinicalProforma);

/**
 * @swagger
 * /api/clinical-proformas/patient/{patient_id}:
 *   get:
 *     summary: Get clinical proformas by patient ID
 *     tags: [Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Proformas retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/patient/:patient_id', authenticateToken, ClinicalController.getClinicalProformaByPatientId);

/**
 * @swagger
 * /api/clinical-proformas/room/{room_no}:
 *   get:
 *     summary: Get cases by room number
 *     tags: [Clinical Proforma]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: room_no
 *         required: true
 *         schema:
 *           type: string
 *         description: Room number
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
 *         description: Number of proformas per page
 *     responses:
 *       200:
 *         description: Cases retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/room/:room_no', authenticateToken, validatePagination, ClinicalController.getCasesByRoom);

module.exports = router;
