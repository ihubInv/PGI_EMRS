const express = require('express');
const router = express.Router();
const OutpatientController = require('../controllers/outpatientController');
const { authenticateToken, requireMWO, requireAdmin } = require('../middleware/auth');
const {
  validateOutpatientRecord,
  validateId,
  validatePagination
} = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     OutpatientRecord:
 *       type: object
 *       required:
 *         - patient_id
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated record ID
 *         patient_id:
 *           type: integer
 *           description: Patient ID
 *         filled_by:
 *           type: integer
 *           description: MWO user ID who filled the record
 *         age_group:
 *           type: string
 *           maxLength: 20
 *         marital_status:
 *           type: string
 *           maxLength: 20
 *         year_of_marriage:
 *           type: integer
 *         no_of_children:
 *           type: integer
 *         occupation:
 *           type: string
 *           maxLength: 50
 *         actual_occupation:
 *           type: string
 *         education_level:
 *           type: string
 *           maxLength: 50
 *         completed_years_of_education:
 *           type: integer
 *         patient_income:
 *           type: number
 *           format: decimal
 *         family_income:
 *           type: number
 *           format: decimal
 *         religion:
 *           type: string
 *           maxLength: 20
 *         family_type:
 *           type: string
 *           maxLength: 20
 *         locality:
 *           type: string
 *           maxLength: 20
 *         head_name:
 *           type: string
 *           maxLength: 255
 *         head_age:
 *           type: integer
 *         head_relationship:
 *           type: string
 *           maxLength: 50
 *         head_education:
 *           type: string
 *           maxLength: 50
 *         head_occupation:
 *           type: string
 *           maxLength: 100
 *         head_income:
 *           type: number
 *           format: decimal
 *         distance_from_hospital:
 *           type: string
 *           maxLength: 100
 *         mobility:
 *           type: string
 *           maxLength: 100
 *         referred_by:
 *           type: string
 *           maxLength: 100
 *         exact_source:
 *           type: string
 *         present_address:
 *           type: string
 *         permanent_address:
 *           type: string
 *         local_address:
 *           type: string
 *         school_college_office:
 *           type: string
 *         contact_number:
 *           type: string
 *           maxLength: 20
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
 *         filled_by_name:
 *           type: string
 *           description: MWO name (from join)
 *     
 *     OutpatientRecordCreate:
 *       type: object
 *       required:
 *         - patient_id
 *       properties:
 *         patient_id:
 *           type: integer
 *         age_group:
 *           type: string
 *         marital_status:
 *           type: string
 *         year_of_marriage:
 *           type: integer
 *         no_of_children:
 *           type: integer
 *         occupation:
 *           type: string
 *         actual_occupation:
 *           type: string
 *         education_level:
 *           type: string
 *         completed_years_of_education:
 *           type: integer
 *         patient_income:
 *           type: number
 *         family_income:
 *           type: number
 *         religion:
 *           type: string
 *         family_type:
 *           type: string
 *         locality:
 *           type: string
 *         head_name:
 *           type: string
 *         head_age:
 *           type: integer
 *         head_relationship:
 *           type: string
 *         head_education:
 *           type: string
 *         head_occupation:
 *           type: string
 *         head_income:
 *           type: number
 *         distance_from_hospital:
 *           type: string
 *         mobility:
 *           type: string
 *         referred_by:
 *           type: string
 *         exact_source:
 *           type: string
 *         present_address:
 *           type: string
 *         permanent_address:
 *           type: string
 *         local_address:
 *           type: string
 *         school_college_office:
 *           type: string
 *         contact_number:
 *           type: string
 */

// MWO-only routes
/**
 * @swagger
 * /api/outpatient-records:
 *   post:
 *     summary: Create a new outpatient record (MWO only)
 *     tags: [Outpatient Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OutpatientRecordCreate'
 *     responses:
 *       201:
 *         description: Outpatient record created successfully
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
 *                     record:
 *                       $ref: '#/components/schemas/OutpatientRecord'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: MWO access required
 *       404:
 *         description: Patient not found
 *       409:
 *         description: Record already exists for this patient
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, requireMWO, validateOutpatientRecord, OutpatientController.createOutpatientRecord);

/**
 * @swagger
 * /api/outpatient-records/my-records:
 *   get:
 *     summary: Get records created by current MWO
 *     tags: [Outpatient Records]
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
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Records retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: MWO access required
 *       500:
 *         description: Server error
 */
router.get('/my-records', authenticateToken, requireMWO, validatePagination, OutpatientController.getMyRecords);

// Protected routes (MWO and Admin)
/**
 * @swagger
 * /api/outpatient-records:
 *   get:
 *     summary: Get all outpatient records with pagination and filters
 *     tags: [Outpatient Records]
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
 *         description: Number of records per page
 *       - in: query
 *         name: marital_status
 *         schema:
 *           type: string
 *         description: Filter by marital status
 *       - in: query
 *         name: occupation
 *         schema:
 *           type: string
 *         description: Filter by occupation
 *       - in: query
 *         name: education_level
 *         schema:
 *           type: string
 *         description: Filter by education level
 *       - in: query
 *         name: religion
 *         schema:
 *           type: string
 *         description: Filter by religion
 *       - in: query
 *         name: family_type
 *         schema:
 *           type: string
 *         description: Filter by family type
 *       - in: query
 *         name: locality
 *         schema:
 *           type: string
 *         description: Filter by locality
 *       - in: query
 *         name: filled_by
 *         schema:
 *           type: integer
 *         description: Filter by MWO who filled the record
 *     responses:
 *       200:
 *         description: Records retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, validatePagination, OutpatientController.getAllOutpatientRecords);

/**
 * @swagger
 * /api/outpatient-records/stats:
 *   get:
 *     summary: Get outpatient record statistics
 *     tags: [Outpatient Records]
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
router.get('/stats', authenticateToken, requireAdmin, OutpatientController.getOutpatientStats);

/**
 * @swagger
 * /api/outpatient-records/demographic-stats:
 *   get:
 *     summary: Get demographic statistics
 *     tags: [Outpatient Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Demographic statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/demographic-stats', authenticateToken, OutpatientController.getDemographicStats);

/**
 * @swagger
 * /api/outpatient-records/{id}:
 *   get:
 *     summary: Get outpatient record by ID
 *     tags: [Outpatient Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Record ID
 *     responses:
 *       200:
 *         description: Record retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, validateId, OutpatientController.getOutpatientRecordById);

/**
 * @swagger
 * /api/outpatient-records/{id}:
 *   put:
 *     summary: Update outpatient record
 *     tags: [Outpatient Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               age_group:
 *                 type: string
 *               marital_status:
 *                 type: string
 *               year_of_marriage:
 *                 type: integer
 *               no_of_children:
 *                 type: integer
 *               occupation:
 *                 type: string
 *               actual_occupation:
 *                 type: string
 *               education_level:
 *                 type: string
 *               completed_years_of_education:
 *                 type: integer
 *               patient_income:
 *                 type: number
 *               family_income:
 *                 type: number
 *               religion:
 *                 type: string
 *               family_type:
 *                 type: string
 *               locality:
 *                 type: string
 *               head_name:
 *                 type: string
 *               head_age:
 *                 type: integer
 *               head_relationship:
 *                 type: string
 *               head_education:
 *                 type: string
 *               head_occupation:
 *                 type: string
 *               head_income:
 *                 type: number
 *               distance_from_hospital:
 *                 type: string
 *               mobility:
 *                 type: string
 *               referred_by:
 *                 type: string
 *               exact_source:
 *                 type: string
 *               present_address:
 *                 type: string
 *               permanent_address:
 *                 type: string
 *               local_address:
 *                 type: string
 *               school_college_office:
 *                 type: string
 *               contact_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - can only update own records
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, validateId, OutpatientController.updateOutpatientRecord);

/**
 * @swagger
 * /api/outpatient-records/{id}:
 *   delete:
 *     summary: Delete outpatient record
 *     tags: [Outpatient Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Record ID
 *     responses:
 *       200:
 *         description: Record deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - can only delete own records
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, validateId, OutpatientController.deleteOutpatientRecord);

/**
 * @swagger
 * /api/outpatient-records/patient/{patient_id}:
 *   get:
 *     summary: Get outpatient record by patient ID
 *     tags: [Outpatient Records]
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
 *         description: Record retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Record not found for this patient
 *       500:
 *         description: Server error
 */
router.get('/patient/:patient_id', authenticateToken, OutpatientController.getOutpatientRecordByPatientId);

module.exports = router;
