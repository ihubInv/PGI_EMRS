# EMRS PGIMER - Project Extract

**Electronic Medical Record System for Psychiatry Department**  
**Postgraduate Institute of Medical Education & Research, Chandigarh**

---

## 📋 Project Overview

EMRS PGIMER is a comprehensive web-based Electronic Medical Record System designed specifically for the Psychiatry Department. The system manages patient records, clinical assessments, prescriptions, and ADL (Additional Detail) file tracking with role-based access control.

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18.2.0
- Vite 5.0.8 (Build tool)
- Redux Toolkit 2.0.1 (State management)
- RTK Query (API integration)
- React Router 6.21.0
- Tailwind CSS 3.4.0
- Chart.js 4.4.1 (Data visualization)
- React Icons 5.0.1

**Backend:**
- Node.js (v16+)
- Express.js 4.19.2
- PostgreSQL (Database)
- Supabase (Database client)
- JWT (JSON Web Tokens) for authentication
- Swagger/OpenAPI 3.0 (API documentation)
- Express Validator (Input validation)
- Helmet, CORS (Security)

---

## 👥 User Roles & Permissions

### 1. **System Administrator**
- Full system access
- User management (create, update, delete users)
- System statistics and analytics
- All CRUD operations across all modules
- Access to all patient records

### 2. **Psychiatric Welfare Officer (MWO)**
- Patient registration and management
- Create and update patient demographic information
- View assigned patients
- Access to patient basic information
- Cannot access clinical proformas or prescriptions

### 3. **Faculty Residents (Junior Resident - JR)**
- Create and update clinical proformas
- Prescribe medications
- View patient clinical history
- Access to today's patients
- Create ADL files for complex cases
- Cannot delete patients or manage users

### 4. **Faculty Residents (Senior Resident - SR)**
- All JR permissions
- Enhanced clinical assessment capabilities
- Access to complex case management
- View all clinical records
- Prescription management

---

## 📁 Project Structure

```
PGI_EMRS/
├── Backend/
│   ├── config/              # Configuration files (Swagger, etc.)
│   ├── controllers/        # Business logic handlers
│   ├── database/           # Database schema, migrations, seeds
│   ├── middleware/         # Auth, validation middleware
│   ├── models/             # Data models (Patient, Clinical, ADL, etc.)
│   ├── routes/             # API route definitions
│   ├── utils/              # Utility functions
│   └── server.js           # Main server file
│
└── Frontend/
    ├── src/
    │   ├── app/            # Redux store configuration
    │   ├── features/        # Feature modules (API slices)
    │   │   ├── auth/
    │   │   ├── patients/
    │   │   ├── clinical/
    │   │   ├── adl/
    │   │   ├── prescriptions/
    │   │   └── users/
    │   ├── components/     # Reusable UI components
    │   ├── layouts/        # Layout components (Sidebar, Header)
    │   ├── pages/          # Page components
    │   │   ├── adl/
    │   │   ├── clinical/
    │   │   ├── patients/
    │   │   └── users/
    │   ├── utils/          # Utility functions & constants
    │   └── assets/         # Static assets
    └── public/             # Public static files
```

---

## 🗄️ Database Schema

### Core Tables

1. **users**
   - User authentication and role management
   - Supports 2FA (Two-Factor Authentication)
   - Roles: System Administrator, Psychiatric Welfare Officer, Faculty Residents (JR/SR)

2. **patients**
   - Master patient table
   - Unique identifiers: CR Number, PSY Number, ADL Number
   - Tracks case complexity (simple/complex)
   - ADL file status tracking

3. **clinical_proforma**
   - Clinical assessment records
   - Visit information (first visit/follow-up)
   - Mental Status Examination (MSE)
   - Diagnosis and treatment plans
   - Case severity classification

4. **prescriptions**
   - Medication prescriptions linked to clinical proformas
   - Medicine details, dosage, frequency, duration
   - Quantity and administration instructions

5. **adl_files**
   - Additional Detail Files for complex cases
   - File status tracking (created, stored, retrieved, active, archived)
   - Physical location management
   - Movement history tracking

6. **file_movements**
   - Complete audit trail of ADL file movements
   - User attribution for all file operations
   - Timestamp tracking

---

## 🔑 Key Features

### 1. **Authentication & Security**
- JWT-based authentication
- Conditional 2FA (Two-Factor Authentication)
- Role-based access control (RBAC)
- Password reset via OTP
- Session management
- Secure password hashing (bcrypt)

### 2. **Patient Management**
- Patient registration with unique identifiers
- Patient search and filtering
- Patient profile with complete history
- Visit history tracking
- Clinical records association
- ADL file status tracking
- Patient assignment to Psychiatric Welfare Officers

### 3. **Clinical Proforma**
- Comprehensive clinical assessment forms
- Mental Status Examination (MSE)
- Visit type tracking (first visit/follow-up)
- Room number assignment
- Informant information
- Onset, course, and duration tracking
- Mood and behavior assessment
- Diagnosis and treatment planning
- Case complexity classification
- Dynamic clinical options management

### 4. **Prescription Management**
- Medicine autocomplete from psychiatric medicines database
- Bulk prescription creation
- Prescription history by date
- Medicine details (dosage, frequency, duration, quantity)
- Administration instructions
- Linked to clinical proformas

### 5. **ADL File Management**
- Automatic ADL file creation for complex cases
- File status tracking (created, stored, retrieved, active, archived)
- File retrieval and return operations
- Movement history with user attribution
- Physical location tracking
- Files to retrieve list
- Active files tracking
- Archive functionality

### 6. **Dashboard & Analytics**
- Real-time statistics
- Patient statistics
- Clinical proforma statistics
- ADL file statistics
- User statistics
- Case severity distribution
- Visit trends
- File status overview

### 7. **User Management** (Admin only)
- User creation and management
- Role assignment
- User activation/deactivation
- Password reset
- 2FA management
- User statistics

---

## 🔌 API Endpoints

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users/verify-login-otp` - Verify 2FA OTP
- `POST /api/users/register` - User registration
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/change-password` - Change password
- `POST /api/users/enable-2fa` - Enable 2FA
- `POST /api/users/disable-2fa` - Disable 2FA
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/verify-otp` - Verify password reset OTP
- `POST /api/users/reset-password` - Reset password

### Patient Management
- `GET /api/patients` - Get all patients (paginated, filtered)
- `POST /api/patients` - Register new patient
- `POST /api/patients/register-complete` - Complete patient registration (MWO)
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient (Admin only)
- `GET /api/patients/search` - Search patients
- `GET /api/patients/stats` - Get patient statistics
- `GET /api/patients/today` - Get today's patients
- `GET /api/patients/:id/profile` - Get complete patient profile
- `GET /api/patients/:id/visits` - Get patient visit history
- `GET /api/patients/:id/clinical-records` - Get patient clinical records
- `GET /api/patients/:id/adl-files` - Get patient ADL files
- `POST /api/patients/assign` - Assign patient to MWO
- `GET /api/patients/cr/:cr_no` - Get patient by CR number

### Clinical Proforma
- `GET /api/clinical-proformas` - Get all clinical proformas
- `POST /api/clinical-proformas` - Create clinical proforma
- `GET /api/clinical-proformas/:id` - Get proforma by ID
- `PUT /api/clinical-proformas/:id` - Update proforma
- `DELETE /api/clinical-proformas/:id` - Delete proforma
- `GET /api/clinical-proformas/patient/:patient_id` - Get proformas by patient
- `GET /api/clinical-proformas/stats` - Get clinical statistics
- `GET /api/clinical-proformas/my-proformas` - Get my proformas
- `GET /api/clinical-proformas/complex-cases` - Get complex cases
- `GET /api/clinical-proformas/severity-stats` - Get severity statistics
- `GET /api/clinical-proformas/decision-stats` - Get decision statistics
- `GET /api/clinical-proformas/room/:room_no` - Get cases by room
- `GET /api/clinical-proformas/options/:group` - Get clinical options
- `POST /api/clinical-proformas/options/:group` - Add clinical option
- `DELETE /api/clinical-proformas/options/:group` - Delete clinical option

### Prescriptions
- `GET /api/prescriptions/proforma/:proforma_id` - Get prescriptions by proforma
- `GET /api/prescriptions/:id` - Get prescription by ID
- `POST /api/prescriptions` - Create prescription
- `POST /api/prescriptions/bulk` - Create bulk prescriptions
- `PUT /api/prescriptions/:id` - Update prescription
- `DELETE /api/prescriptions/:id` - Delete prescription

### ADL Files
- `GET /api/adl-files` - Get all ADL files
- `GET /api/adl-files/:id` - Get ADL file by ID
- `GET /api/adl-files/adl-no/:adl_no` - Get ADL file by ADL number
- `GET /api/adl-files/patient/:patient_id` - Get ADL files by patient
- `PUT /api/adl-files/:id` - Update ADL file
- `POST /api/adl-files/:id/retrieve` - Retrieve file
- `POST /api/adl-files/:id/return` - Return file to storage
- `POST /api/adl-files/:id/archive` - Archive file
- `GET /api/adl-files/:id/movement-history` - Get movement history
- `GET /api/adl-files/to-retrieve` - Get files to retrieve
- `GET /api/adl-files/active` - Get active files
- `GET /api/adl-files/stats` - Get ADL statistics
- `GET /api/adl-files/status-stats` - Get status statistics

### User Management (Admin)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users/register` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats` - Get user statistics
- `PUT /api/users/:id/activate` - Activate user
- `PUT /api/users/:id/deactivate` - Deactivate user
- `PUT /api/users/:id/reset-password` - Reset user password
- `GET /api/users/doctors` - Get all doctors (JR/SR)

---

## 📊 Frontend Pages

### Public Pages
- **Login** - User authentication with 2FA support
- **Forgot Password** - Password reset request
- **Verify OTP** - OTP verification for password reset
- **Reset Password** - New password setup

### Protected Pages

#### Dashboard
- Statistics overview
- Charts and visualizations
- Quick actions
- Recent activity

#### Patient Management
- **Patients Page** - List all patients with filters
- **Create Patient** - Register new patient
- **Patient Details** - View complete patient profile
- **Patient Edit** - Update patient information
- **Select Existing Patient** - Assign patient to doctor

#### Clinical Proforma
- **Create Clinical Proforma** - Comprehensive clinical assessment form
- **Clinical Proforma Page** - View clinical records
- **Today's Patients** - Patients scheduled for today
- **Prescribe Medication** - Prescription management with history

#### ADL Files
- **ADL Files Page** - List and manage ADL files
- **ADL File Details** - View file information and movement history

#### User Management (Admin)
- **Users Page** - Manage system users
- **Create User** - Register new user
- **User Profile** - View and edit user profile

---

## 🔐 Security Features

1. **Authentication**
   - JWT token-based authentication
   - Token expiration and refresh
   - Secure password hashing (bcrypt, 12 rounds)

2. **Authorization**
   - Role-based access control (RBAC)
   - Route-level protection
   - Component-level access control

3. **Two-Factor Authentication (2FA)**
   - Optional 2FA for enhanced security
   - Email-based OTP verification
   - Backup codes support

4. **Input Validation**
   - Server-side validation using Express Validator
   - Client-side validation
   - SQL injection prevention (parameterized queries)

5. **Security Headers**
   - Helmet.js for HTTP security headers
   - CORS configuration
   - Rate limiting (configurable)

6. **Error Handling**
   - Secure error messages (hide sensitive info in production)
   - Comprehensive logging
   - Error tracking

---

## 📝 Key Workflows

### 1. Patient Registration Workflow
1. Psychiatric Welfare Officer registers patient
2. System generates unique identifiers (CR Number, PSY Number)
3. Patient demographic information captured
4. Patient assigned to Psychiatric Welfare Officer
5. Patient available for clinical assessment

### 2. Clinical Assessment Workflow
1. Faculty Resident (JR/SR) selects patient
2. Creates clinical proforma for visit
3. Completes comprehensive assessment
4. Classifies case as simple or complex
5. If complex, ADL file automatically created
6. Prescribes medications
7. Saves clinical record

### 3. ADL File Management Workflow
1. Complex case identified in clinical proforma
2. ADL file automatically created
3. File status: created → stored
4. File can be retrieved when needed
5. File status: retrieved → active
6. File returned to storage when done
7. File can be archived
8. Complete movement history maintained

### 4. Prescription Workflow
1. Faculty Resident creates clinical proforma
2. Prescribes medications with autocomplete
3. Bulk prescription creation
4. Prescriptions linked to clinical proforma
5. Prescription history maintained by date
6. View past prescriptions for existing patients

---

## 🛠️ Development Setup

### Backend Setup

```bash
cd Backend
npm install
# Create .env file with database and JWT configuration
npm run dev
```

### Frontend Setup

```bash
cd Frontend
npm install
# Create .env file with API URL
npm run dev
```

### Database Setup

1. Create PostgreSQL database
2. Run schema SQL from `Backend/database/schema.sql`
3. Run migrations if needed
4. Seed initial data (optional)

---

## 📚 API Documentation

Swagger/OpenAPI documentation available at:
- **Development**: `http://localhost:2025/api-docs`
- **Production**: `http://31.97.60.2:2025/api-docs`

The Swagger documentation includes:
- All available endpoints
- Request/response schemas
- Authentication requirements
- Role-based access information
- Example requests and responses

---

## 📦 Dependencies Summary

### Backend Key Dependencies
- express, cors, helmet (Web framework & security)
- jsonwebtoken, bcryptjs (Authentication)
- @supabase/supabase-js, pg (Database)
- express-validator (Validation)
- swagger-jsdoc, swagger-ui-express (Documentation)
- nodemailer (Email for 2FA)

### Frontend Key Dependencies
- react, react-dom (UI library)
- @reduxjs/toolkit, react-redux (State management)
- react-router-dom (Routing)
- tailwindcss (Styling)
- chart.js, react-chartjs-2 (Charts)
- react-icons (Icons)
- react-toastify (Notifications)

---

## 🚀 Deployment

### Production Environment
- Backend: Node.js server on port 2025
- Frontend: Vite build served via web server
- Database: PostgreSQL (Supabase)
- API Base URL: `http://31.97.60.2:2025/api`

### Environment Variables Required

**Backend:**
- Database connection string
- JWT secret and expiration
- Email configuration (for 2FA)
- Node environment

**Frontend:**
- API base URL
- Application name and version

---

## 📞 Support & Contact

- **Organization**: PGIMER, Chandigarh
- **Email**: support@pgimer.ac.in
- **API Documentation**: `/api-docs`
- **Health Check**: `/health`

---
---

## 🔄 Version

**Current Version**: 1.0.0


