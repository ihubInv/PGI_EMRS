const ADLFile = require('../models/ADLFile');
const Patient = require('../models/Patient');

class ADLController {
  // Get all ADL files with pagination and filters
  static async getAllADLFiles(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};

      // Apply filters
      if (req.query.file_status) filters.file_status = req.query.file_status;
      if (req.query.is_active !== undefined) filters.is_active = req.query.is_active === 'true';
      if (req.query.created_by) filters.created_by = req.query.created_by;
      if (req.query.last_accessed_by) filters.last_accessed_by = req.query.last_accessed_by;
      if (req.query.date_from) filters.date_from = req.query.date_from;
      if (req.query.date_to) filters.date_to = req.query.date_to;

      const result = await ADLFile.findAll(page, limit, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all ADL files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get ADL files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get ADL file by ID
  static async getADLFileById(req, res) {
    try {
      const { id } = req.params;
      const adlFile = await ADLFile.findById(id);

      if (!adlFile) {
        return res.status(404).json({
          success: false,
          message: 'ADL file not found'
        });
      }

      res.json({
        success: true,
        data: {
          adlFile: adlFile.toJSON()
        }
      });
    } catch (error) {
      console.error('Get ADL file by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get ADL file',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get ADL file by ADL number
  static async getADLFileByADLNo(req, res) {
    try {
      const { adl_no } = req.params;
      const adlFile = await ADLFile.findByADLNo(adl_no);

      if (!adlFile) {
        return res.status(404).json({
          success: false,
          message: 'ADL file not found'
        });
      }

      res.json({
        success: true,
        data: {
          adlFile: adlFile.toJSON()
        }
      });
    } catch (error) {
      console.error('Get ADL file by ADL number error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get ADL file',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get ADL files by patient ID
  static async getADLFilesByPatientId(req, res) {
    try {
      const { patient_id } = req.params;
      const adlFiles = await ADLFile.findByPatientId(patient_id);

      res.json({
        success: true,
        data: {
          adlFiles: adlFiles.map(file => file.toJSON())
        }
      });
    } catch (error) {
      console.error('Get ADL files by patient ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get ADL files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Retrieve ADL file
  static async retrieveADLFile(req, res) {
    try {
      const { id } = req.params;
      const adlFile = await ADLFile.findById(id);

      if (!adlFile) {
        return res.status(404).json({
          success: false,
          message: 'ADL file not found'
        });
      }

      if (adlFile.file_status !== 'stored') {
        return res.status(400).json({
          success: false,
          message: 'File is not available for retrieval. Current status: ' + adlFile.file_status
        });
      }

      await adlFile.retrieveFile(req.user.id);

      res.json({
        success: true,
        message: 'ADL file retrieved successfully',
        data: {
          adlFile: adlFile.toJSON()
        }
      });
    } catch (error) {
      console.error('Retrieve ADL file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve ADL file',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Return ADL file to storage
  static async returnADLFile(req, res) {
    try {
      const { id } = req.params;
      const adlFile = await ADLFile.findById(id);

      if (!adlFile) {
        return res.status(404).json({
          success: false,
          message: 'ADL file not found'
        });
      }

      if (adlFile.file_status !== 'retrieved') {
        return res.status(400).json({
          success: false,
          message: 'File is not currently retrieved. Current status: ' + adlFile.file_status
        });
      }

      await adlFile.returnFile(req.user.id);

      res.json({
        success: true,
        message: 'ADL file returned to storage successfully',
        data: {
          adlFile: adlFile.toJSON()
        }
      });
    } catch (error) {
      console.error('Return ADL file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to return ADL file',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Archive ADL file
  static async archiveADLFile(req, res) {
    try {
      const { id } = req.params;
      const adlFile = await ADLFile.findById(id);

      if (!adlFile) {
        return res.status(404).json({
          success: false,
          message: 'ADL file not found'
        });
      }

      if (adlFile.file_status === 'archived') {
        return res.status(400).json({
          success: false,
          message: 'File is already archived'
        });
      }

      await adlFile.archiveFile(req.user.id);

      res.json({
        success: true,
        message: 'ADL file archived successfully',
        data: {
          adlFile: adlFile.toJSON()
        }
      });
    } catch (error) {
      console.error('Archive ADL file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to archive ADL file',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Update ADL file
  static async updateADLFile(req, res) {
    try {
      const { id } = req.params;
      const adlFile = await ADLFile.findById(id);

      if (!adlFile) {
        return res.status(404).json({
          success: false,
          message: 'ADL file not found'
        });
      }

      const updateData = req.body;
      await adlFile.update(updateData);

      res.json({
        success: true,
        message: 'ADL file updated successfully',
        data: {
          adlFile: adlFile.toJSON()
        }
      });
    } catch (error) {
      console.error('Update ADL file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update ADL file',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get file movement history
  static async getFileMovementHistory(req, res) {
    try {
      const { id } = req.params;
      const adlFile = await ADLFile.findById(id);

      if (!adlFile) {
        return res.status(404).json({
          success: false,
          message: 'ADL file not found'
        });
      }

      const movementHistory = await adlFile.getMovementHistory();

      res.json({
        success: true,
        data: {
          adlFile: adlFile.toJSON(),
          movementHistory
        }
      });
    } catch (error) {
      console.error('Get file movement history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get file movement history',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get files that need to be retrieved
  static async getFilesToRetrieve(req, res) {
    try {
      const filesToRetrieve = await ADLFile.getFilesToRetrieve();

      res.json({
        success: true,
        data: {
          filesToRetrieve: filesToRetrieve.map(file => file.toJSON())
        }
      });
    } catch (error) {
      console.error('Get files to retrieve error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get files to retrieve',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get active files (currently retrieved)
  static async getActiveFiles(req, res) {
    try {
      const activeFiles = await ADLFile.getActiveFiles();

      res.json({
        success: true,
        data: {
          activeFiles: activeFiles.map(file => file.toJSON())
        }
      });
    } catch (error) {
      console.error('Get active files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get active files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get ADL file statistics
  static async getADLStats(req, res) {
    try {
      const stats = await ADLFile.getStats();

      res.json({
        success: true,
        data: {
          stats
        }
      });
    } catch (error) {
      console.error('Get ADL stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get ADL statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get files by status
  static async getFilesByStatus(req, res) {
    try {
      const statusStats = await ADLFile.getFilesByStatus();

      res.json({
        success: true,
        data: {
          statusStats
        }
      });
    } catch (error) {
      console.error('Get files by status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get status statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Delete ADL file (soft delete by archiving)
  static async deleteADLFile(req, res) {
    try {
      const { id } = req.params;
      const adlFile = await ADLFile.findById(id);

      if (!adlFile) {
        return res.status(404).json({
          success: false,
          message: 'ADL file not found'
        });
      }

      await adlFile.delete();

      res.json({
        success: true,
        message: 'ADL file deleted successfully'
      });
    } catch (error) {
      console.error('Delete ADL file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete ADL file',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Bulk operations for file management
  static async bulkRetrieveFiles(req, res) {
    try {
      const { file_ids } = req.body;

      if (!Array.isArray(file_ids) || file_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'File IDs array is required'
        });
      }

      const results = [];
      const errors = [];

      for (const fileId of file_ids) {
        try {
          const adlFile = await ADLFile.findById(fileId);
          if (adlFile && adlFile.file_status === 'stored') {
            await adlFile.retrieveFile(req.user.id);
            results.push(adlFile.toJSON());
          } else {
            errors.push(`File ${fileId}: Not found or not available for retrieval`);
          }
        } catch (error) {
          errors.push(`File ${fileId}: ${error.message}`);
        }
      }

      res.json({
        success: true,
        message: `Retrieved ${results.length} files successfully`,
        data: {
          retrieved: results,
          errors: errors
        }
      });
    } catch (error) {
      console.error('Bulk retrieve files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk retrieve files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Bulk return files
  static async bulkReturnFiles(req, res) {
    try {
      const { file_ids } = req.body;

      if (!Array.isArray(file_ids) || file_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'File IDs array is required'
        });
      }

      const results = [];
      const errors = [];

      for (const fileId of file_ids) {
        try {
          const adlFile = await ADLFile.findById(fileId);
          if (adlFile && adlFile.file_status === 'retrieved') {
            await adlFile.returnFile(req.user.id);
            results.push(adlFile.toJSON());
          } else {
            errors.push(`File ${fileId}: Not found or not currently retrieved`);
          }
        } catch (error) {
          errors.push(`File ${fileId}: ${error.message}`);
        }
      }

      res.json({
        success: true,
        message: `Returned ${results.length} files successfully`,
        data: {
          returned: results,
          errors: errors
        }
      });
    } catch (error) {
      console.error('Bulk return files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk return files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = ADLController;
