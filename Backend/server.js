const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// Import configurations
const { swaggerSpecs, swaggerUiOptions } = require('./config/swagger');

// Import routes
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes');
const outpatientRoutes = require('./routes/outpatientRoutes');
const clinicalRoutes = require('./routes/clinicalRoutes');
const adlRoutes = require('./routes/adlRoutes');

const app = express();
const PORT = process.env.PORT || 2025;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production'
//     ? ['https://emrs.pgimer.ac.in']
//     : ['http://31.97.60.2:3000', 'http://31.97.60.2:2026', 'http://31.97.60.2:2026'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://emrs.pgimer.ac.in']
    : true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting - DISABLED for unrestricted API access
// Uncomment and configure below if you need to enable rate limiting in production
/*
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
*/

// Compression middleware
app.use(compression());

// HTTP request logging middleware
app.use(morgan('combined', {
  skip: (req, res) => res.statusCode < 400
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'EMRS PGIMER API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API Documentation
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpecs);
});

// Favicon route to prevent 404 error
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content, but no error
});

// Middleware to prevent HTTPS conversion for Swagger UI
app.use('/api-docs', (req, res, next) => {
  // Remove security headers that might force HTTPS
  res.removeHeader('Strict-Transport-Security');
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('X-Content-Type-Options');
  res.removeHeader('X-Frame-Options');
  res.removeHeader('X-XSS-Protection');
  
  // Set headers to allow mixed content and prevent HTTPS conversion
  // Removed Cross-Origin-Opener-Policy to avoid "untrustworthy origin" error
  res.setHeader('Origin-Agent-Cluster', '?0');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Referrer-Policy', 'no-referrer');
  
  // Override any HTTPS redirects
  if (req.headers['x-forwarded-proto'] === 'https') {
    req.headers['x-forwarded-proto'] = 'http';
  }
  
  next();
});

// Custom Swagger UI route with forced HTTP URLs
app.get('/api-docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>EMRS PGIMER API Documentation</title>
      <link rel="stylesheet" type="text/css" href="http://31.97.60.2:2025/api-docs/swagger-ui.css" />
      <link rel="icon" href="/favicon.ico" />
      <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
        .swagger-ui .topbar { display: none; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="http://31.97.60.2:2025/api-docs/swagger-ui-bundle.js"></script>
      <script src="http://31.97.60.2:2025/api-docs/swagger-ui-standalone-preset.js"></script>
      <script>
        // Override fetch to prevent HTTPS
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
          if (typeof url === 'string' && url.startsWith('https://')) {
            url = url.replace('https://', 'http://');
          }
          return originalFetch(url, options);
        };
        
        // Override XMLHttpRequest to prevent HTTPS
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
          const xhr = new originalXHR();
          const originalOpen = xhr.open;
          xhr.open = function(method, url, async, user, password) {
            if (typeof url === 'string' && url.startsWith('https://')) {
              url = url.replace('https://', 'http://');
            }
            return originalOpen.call(this, method, url, async, user, password);
          };
          return xhr;
        };
        
        // Override URL constructor to force HTTP
        const originalURL = window.URL;
        window.URL = function(url, base) {
          if (typeof url === 'string' && url.startsWith('https://')) {
            url = url.replace('https://', 'http://');
          }
          if (typeof base === 'string' && base.startsWith('https://')) {
            base = base.replace('https://', 'http://');
          }
          return new originalURL(url, base);
        };
        
        // Initialize Swagger UI
        window.onload = function() {
          const ui = SwaggerUIBundle({
            url: 'http://31.97.60.2:2025/api-docs/swagger.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            plugins: [
              SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout",
            validatorUrl: null,
            requestInterceptor: function(req) {
              if (req.url && req.url.startsWith('https://')) {
                req.url = req.url.replace('https://', 'http://');
              }
              return req;
            },
            responseInterceptor: function(res) {
              if (res.url && res.url.startsWith('https://')) {
                res.url = res.url.replace('https://', 'http://');
              }
              return res;
            }
          });
          
          window.ui = ui;
        };
      </script>
    </body>
    </html>
  `);
});

// Serve Swagger UI assets
app.use('/api-docs', swaggerUi.serve);

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/outpatient-records', outpatientRoutes);
app.use('/api/clinical-proformas', clinicalRoutes);
app.use('/api/adl-files', adlRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to EMRS PGIMER API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
    endpoints: {
      users: '/api/users',
      patients: '/api/patients',
      outpatientRecords: '/api/outpatient-records',
      clinicalProformas: '/api/clinical-proformas',
      adlFiles: '/api/adl-files'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /api-docs',
      'POST /api/users/register',
      'POST /api/users/login',
      'GET /api/users/profile',
      'GET /api/patients',
      'POST /api/patients',
      'GET /api/outpatient-records',
      'POST /api/outpatient-records',
      'GET /api/clinical-proformas',
      'POST /api/clinical-proformas',
      'GET /api/adl-files',
      'POST /api/adl-files'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Invalid input data'
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Invalid ID'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Authentication failed'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Please login again'
    });
  }

  // Handle database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Service temporarily unavailable'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : 'Something went wrong'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server with port fallback
const server = app.listen(PORT, () => {
  console.log(`
🚀 EMRS PGIMER API Server is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📚 API Documentation: http://localhost:${PORT}/api-docs
🔍 Health Check: http://localhost:${PORT}/health
🏥 Endpoints:
   - Users: http://localhost:${PORT}/api/users
   - Patients: http://localhost:${PORT}/api/patients
   - Outpatient Records: http://localhost:${PORT}/api/outpatient-records
   - Clinical Proformas: http://localhost:${PORT}/api/clinical-proformas
   - ADL Files: http://localhost:${PORT}/api/adl-files
  `);
});

// Handle port already in use error
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`
❌ Port ${PORT} is already in use!

🔧 Solutions:
1. Kill the process using port ${PORT}:
   npm run kill-port

2. Or manually kill the process:
   Windows: netstat -ano | findstr :${PORT}
   Linux/Mac: lsof -ti:${PORT} | xargs kill -9

3. Or change the PORT in your .env file to a different port
   PORT=5001

4. Or find and stop the other server manually
    `);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

module.exports = app;
