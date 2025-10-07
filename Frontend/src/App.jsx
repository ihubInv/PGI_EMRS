import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { selectIsAuthenticated } from './features/auth/authSlice';
import ProtectedRoute from './utils/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Patient Pages
import PatientsPage from './pages/patients/PatientsPage';
import CreatePatient from './pages/patients/CreatePatient';
import PatientDetails from './pages/patients/PatientDetails';
import EditPatient from './pages/patients/EditPatient';

// Clinical Proforma Pages
import ClinicalProformaPage from './pages/clinical/ClinicalProformaPage';
import CreateClinicalProforma from './pages/clinical/CreateClinicalProforma';
import ClinicalProformaDetails from './pages/clinical/ClinicalProformaDetails';

// Outpatient Record Pages
import OutpatientPage from './pages/outpatient/OutpatientPage';
import CreateOutpatientRecord from './pages/outpatient/CreateOutpatientRecord';
import SelectExistingOutpatient from './pages/outpatient/SelectExistingOutpatient';
import OutpatientDetails from './pages/outpatient/OutpatientDetails';

// ADL File Pages
import ADLFilesPage from './pages/adl/ADLFilesPage';
import ADLFileDetails from './pages/adl/ADLFileDetails';

// User Management Pages
import UsersPage from './pages/users/UsersPage';
import CreateUser from './pages/users/CreateUser';

// Profile
import Profile from './pages/Profile';

// API Test (Development only)
import ApiTest from './pages/ApiTest';

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/forgot-password"
            element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />}
          />
          <Route
            path="/verify-otp"
            element={isAuthenticated ? <Navigate to="/" replace /> : <VerifyOTP />}
          />
          <Route
            path="/reset-password"
            element={isAuthenticated ? <Navigate to="/" replace /> : <ResetPassword />}
          />

          {/* Protected routes */}
          <Route element={<ProtectedRoute allowedRoles={[]} />}>
            <Route element={<MainLayout />}>
              {/* Dashboard */}
              <Route path="/" element={<Dashboard />} />
              
              {/* Patient Routes - All authenticated users */}
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/patients/new" element={<CreatePatient />} />
              <Route path="/patients/:id" element={<PatientDetails />} />
              <Route path="/patients/:id/edit" element={<EditPatient />} />
              
              {/* Outpatient Records - MWO and Admin only */}
              <Route element={<ProtectedRoute allowedRoles={['Admin', 'MWO']} />}>
                <Route path="/outpatient" element={<OutpatientPage />} />
                <Route path="/outpatient/new" element={<CreateOutpatientRecord />} />
                <Route path="/outpatient/select" element={<SelectExistingOutpatient />} />
                <Route path="/outpatient/:id" element={<OutpatientDetails />} />
                <Route path="/outpatient/:id/edit" element={<div>Edit Outpatient</div>} />
              </Route>

              {/* Clinical Proforma - JR, SR, and Admin */}
              <Route element={<ProtectedRoute allowedRoles={['Admin', 'JR', 'SR']} />}>
                <Route path="/clinical" element={<ClinicalProformaPage />} />
                <Route path="/clinical/new" element={<CreateClinicalProforma />} />
                <Route path="/clinical/:id" element={<ClinicalProformaDetails />} />
                <Route path="/clinical/:id/edit" element={<div>Edit Clinical Proforma</div>} />
              </Route>

              {/* ADL Files - JR, SR, and Admin */}
              <Route element={<ProtectedRoute allowedRoles={['Admin', 'JR', 'SR']} />}>
                <Route path="/adl-files" element={<ADLFilesPage />} />
                <Route path="/adl-files/:id" element={<ADLFileDetails />} />
              </Route>

              {/* Users - Admin only */}
              <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/new" element={<CreateUser />} />
                <Route path="/users/:id/edit" element={<div>Edit User</div>} />
              </Route>

              {/* Profile - All authenticated users */}
              <Route path="/profile" element={<Profile />} />

              {/* API Test - Development only */}
              <Route path="/api-test" element={<ApiTest />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;

