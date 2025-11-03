const express = require('express');
const router = express.Router();
const ADLController = require('../controllers/adlController');
const { authenticateToken, requireDoctor, requireAdmin } = require('../middleware/auth');
const {
  validateId,
  validatePagination
} = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     ADLFile:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ADL file ID
 *         patient_id:
 *           type: integer
 *           description: Patient ID
 *         adl_no:
 *           type: string
 *           description: Unique ADL file number
 *         created_by:
 *           type: integer
 *           description: Doctor user ID who created the file
 *         clinical_proforma_id:
 *           type: integer
 *           description: Clinical proforma ID that triggered ADL creation
 *         file_status:
 *           type: string
 *           enum: [created, stored, retrieved, active, archived]
 *           description: Current file status
 *         physical_file_location:
 *           type: string
 *           maxLength: 100
 *           description: Physical location of the file
 *         file_created_date:
 *           type: string
 *           format: date
 *           description: Date when file was created
 *         last_accessed_date:
 *           type: string
 *           format: date
 *           description: Last date file was accessed
 *         last_accessed_by:
 *           type: integer
 *           description: User ID who last accessed the file
 *         total_visits:
 *           type: integer
 *           description: Total number of visits/accesses
 *         is_active:
 *           type: boolean
 *           description: Whether file is active
 *         notes:
 *           type: string
 *           description: Additional notes about the file
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Record creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         patient_name:
 *           type: string
 *           description: Patient name (from join)
 *         cr_no:
 *           type: string
 *           description: CR number (from join)
 *         psy_no:
 *           type: string
 *           description: PSY number (from join)
 *         created_by_name:
 *           type: string
 *           description: Doctor name who created file (from join)
 *         created_by_role:
 *           type: string
 *           description: Doctor role (from join)
 *         last_accessed_by_name:
 *           type: string
 *           description: Name of user who last accessed file (from join)
 *     
 *     ADLFileUpdate:
 *       type: object
 *       properties:
 *         file_status:
 *           type: string
 *           enum: [created, stored, retrieved, active, archived]
 *         physical_file_location:
 *           type: string
 *         last_accessed_date:
 *           type: string
 *           format: date
 *         last_accessed_by:
 *           type: integer
 *         total_visits:
 *           type: integer
 *         is_active:
 *           type: boolean
 *         notes:
 *           type: string
 *     
 *     BulkFileOperation:
 *       type: object
 *       required:
 *         - file_ids
 *       properties:
 *         file_ids:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of ADL file IDs
 */

// Protected routes (Doctor and Admin)
/**
 * @swagger
 * /api/adl-files:
 *   get:
 *     summary: Get all ADL files with pagination and filters
 *     tags: [Additional Detail File]
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
 *         description: Number of files per page
 *       - in: query
 *         name: file_status
 *         schema:
 *           type: string
 *           enum: [created, stored, retrieved, active, archived]
 *         description: Filter by file status
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: created_by
 *         schema:
 *           type: integer
 *         description: Filter by creator
 *       - in: query
 *         name: last_accessed_by
 *         schema:
 *           type: integer
 *         description: Filter by last accessed user
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
 *         description: ADL files retrieved successfully with patient and doctor details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           patient_name:
 *                             type: string
 *                             description: Patient name from patients table join
 *                           cr_no:
 *                             type: string
 *                             description: CR number from patients table join
 *                           assigned_doctor_name:
 *                             type: string
 *                             description: Assigned doctor name from clinical_proforma join
 *                           assigned_doctor_role:
 *                             type: string
 *                             description: Assigned doctor role
 *                           proforma_visit_date:
 *                             type: string
 *                             format: date
 *                             description: Visit date from clinical proforma
 *                           clinical_proforma_id:
 *                             type: integer
 *                             description: Link to clinical proforma for complex cases
 *                           file_created_date:
 *                             type: string
 *                             format: date
 *                             description: ADL file creation date
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, validatePagination, ADLController.getAllADLFiles);

/**
 * @swagger
 * /api/adl-files/stats:
 *   get:
 *     summary: Get ADL file statistics
 *     tags: [Additional Detail File]
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
router.get('/stats', authenticateToken, requireAdmin, ADLController.getADLStats);

/**
 * @swagger
 * /api/adl-files/status-stats:
 *   get:
 *     summary: Get files by status statistics
 *     tags: [Additional Detail File]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/status-stats', authenticateToken, ADLController.getFilesByStatus);

/**
 * @swagger
 * /api/adl-files/to-retrieve:
 *   get:
 *     summary: Get files that need to be retrieved
 *     tags: [Additional Detail File]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Files to retrieve retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/to-retrieve', authenticateToken, ADLController.getFilesToRetrieve);

/**
 * @swagger
 * /api/adl-files/active:
 *   get:
 *     summary: Get active files (currently retrieved)
 *     tags: [Additional Detail File]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active files retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/active', authenticateToken, ADLController.getActiveFiles);

/**
 * @swagger
 * /api/adl-files/bulk-retrieve:
 *   post:
 *     summary: Bulk retrieve multiple ADL files
 *     tags: [Additional Detail File]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkFileOperation'
 *     responses:
 *       200:
 *         description: Files retrieved successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/bulk-retrieve', authenticateToken, ADLController.bulkRetrieveFiles);

/**
 * @swagger
 * /api/adl-files/bulk-return:
 *   post:
 *     summary: Bulk return multiple ADL files to storage
 *     tags: [Additional Detail File]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkFileOperation'
 *     responses:
 *       200:
 *         description: Files returned successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/bulk-return', authenticateToken, ADLController.bulkReturnFiles);

/**
 * @swagger
 * /api/adl-files/{id}:
 *   get:
 *     summary: Get ADL file by ID
 *     tags: [Additional Detail File]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ADL file ID
 *     responses:
 *       200:
 *         description: ADL file retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: ADL file not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, validateId, ADLController.getADLFileById);

/**
 * @swagger
 * /api/adl-files/{id}:
 *   put:
 *     summary: Update ADL file
 *     tags: [Additional Detail File]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ADL file ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ADLFileUpdate'
 *     responses:
 *       200:
 *         description: ADL file updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: ADL file not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, validateId, ADLController.updateADLFile);

/**
 * @swagger
 * /api/adl-files/{id}:
 *   delete:
 *     summary: Delete ADL file (soft delete by archiving)
 *     tags: [Additional Detail File]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ADL file ID
 *     responses:
 *       200:
 *         description: ADL file deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: ADL file not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, validateId, ADLController.deleteADLFile);

/**
 * @swagger
 * /api/adl-files/{id}/retrieve:
 *   post:
 *     summary: Retrieve ADL file from storage
 *     tags: [Additional Detail File]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ADL file ID
 *     responses:
 *       200:
 *         description: ADL file retrieved successfully
 *       400:
 *         description: File not available for retrieval
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: ADL file not found
 *       500:
 *         description: Server error
 */
router.post('/:id/retrieve', authenticateToken, validateId, ADLController.retrieveADLFile);

/**
 * @swagger
 * /api/adl-files/{id}/return:
 *   post:
 *     summary: Return ADL file to storage
 *     tags: [Additional Detail File]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ADL file ID
 *     responses:
 *       200:
 *         description: ADL file returned successfully
 *       400:
 *         description: File not currently retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: ADL file not found
 *       500:
 *         description: Server error
 */
router.post('/:id/return', authenticateToken, validateId, ADLController.returnADLFile);

/**
 * @swagger
 * /api/adl-files/{id}/archive:
 *   post:
 *     summary: Archive ADL file
 *     tags: [Additional Detail File]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ADL file ID
 *     responses:
 *       200:
 *         description: ADL file archived successfully
 *       400:
 *         description: File already archived
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: ADL file not found
 *       500:
 *         description: Server error
 */
router.post('/:id/archive', authenticateToken, validateId, ADLController.archiveADLFile);

/**
 * @swagger
 * /api/adl-files/{id}/movement-history:
 *   get:
 *     summary: Get ADL file movement history
 *     tags: [Additional Detail File]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ADL file ID
 *     responses:
 *       200:
 *         description: Movement history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: ADL file not found
 *       500:
 *         description: Server error
 */
router.get('/:id/movement-history', authenticateToken, validateId, ADLController.getFileMovementHistory);

/**
 * @swagger
 * /api/adl-files/adl/{adl_no}:
 *   get:
 *     summary: Get ADL file by ADL number
 *     tags: [Additional Detail File]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adl_no
 *         required: true
 *         schema:
 *           type: string
 *         description: ADL file number
 *     responses:
 *       200:
 *         description: ADL file retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: ADL file not found
 *       500:
 *         description: Server error
 */
router.get('/adl/:adl_no', authenticateToken, ADLController.getADLFileByADLNo);

/**
 * @swagger
 * /api/adl-files/patient/{patient_id}:
 *   get:
 *     summary: Get ADL files by patient ID
 *     tags: [Additional Detail File]
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
 *         description: ADL files retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/patient/:patient_id', authenticateToken, ADLController.getADLFilesByPatientId);

module.exports = router;
