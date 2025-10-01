const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EMRS PGIMER API',
      version: '1.0.0',
      description: `Electronic Medical Record System for Psychiatry Department - PGIMER, Chandigarh
      
## Authentication

This API uses JWT Bearer tokens for authentication.

### How to authenticate in Swagger:

1. **Register or Login**: Use the \`/api/users/register\` or \`/api/users/login\` endpoint
2. **Copy the token**: From the response, copy the \`token\` value
3. **Click the "Authorize" button**: Look for the 🔓 button at the top right of this page
4. **Enter your token**: Paste the token in the format: \`Bearer YOUR_TOKEN_HERE\` or just \`YOUR_TOKEN_HERE\`
5. **Click "Authorize"**: Then click "Close"
6. **Make requests**: Now you can access protected endpoints 🔒

### Token Format:
\`\`\`
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

**Note**: Tokens expire after a certain period. If you get a 401 error, login again to get a new token.`,
      contact: {
        name: 'PGIMER Team',
        email: 'support@pgimer.ac.in',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://emrs.pgimer.ac.in' 
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token from the login response. Format: Bearer <token>',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            error: {
              type: 'string',
              example: 'Detailed error information (development only)',
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Validation failed',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 10,
            },
            total: {
              type: 'integer',
              example: 100,
            },
            pages: {
              type: 'integer',
              example: 10,
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'User Management',
        description: 'User profile management',
      },
      {
        name: 'Admin',
        description: 'Administrative functions',
      },
      {
        name: 'Patient Management',
        description: 'Patient registration and management',
      },
      {
        name: 'Outpatient Records',
        description: 'Outpatient record management (MWO)',
      },
      {
        name: 'Clinical Proforma',
        description: 'Clinical assessment and documentation (Doctor)',
      },
      {
        name: 'ADL Files',
        description: 'ADL file management for complex cases',
      },
    ],
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js',
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
