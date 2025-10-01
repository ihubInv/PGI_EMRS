import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiUsers, FiFileText, FiFolder, FiClipboard, FiTrendingUp } from 'react-icons/fi';
import { selectCurrentUser } from '../features/auth/authSlice';
import { useGetPatientStatsQuery } from '../features/patients/patientsApiSlice';
import { useGetClinicalStatsQuery } from '../features/clinical/clinicalApiSlice';
import { useGetADLStatsQuery } from '../features/adl/adlApiSlice';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';

const StatCard = ({ title, value, icon: Icon, color, to }) => (
  <Link to={to}>
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value || 0}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </Card>
  </Link>
);

const Dashboard = () => {
  const user = useSelector(selectCurrentUser);
  
  const { data: patientStats, isLoading: patientsLoading } = useGetPatientStatsQuery();
  const { data: clinicalStats, isLoading: clinicalLoading } = useGetClinicalStatsQuery();
  const { data: adlStats, isLoading: adlLoading } = useGetADLStatsQuery();

  const isLoading = patientsLoading || clinicalLoading || adlLoading;

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={patientStats?.data?.stats?.total_patients}
          icon={FiUsers}
          color="bg-blue-500"
          to="/patients"
        />
        
        <StatCard
          title="Clinical Records"
          value={clinicalStats?.data?.stats?.total_proformas}
          icon={FiFileText}
          color="bg-green-500"
          to="/clinical"
        />
        
        <StatCard
          title="ADL Files"
          value={adlStats?.data?.stats?.total_files}
          icon={FiFolder}
          color="bg-purple-500"
          to="/adl-files"
        />
        
        <StatCard
          title="Complex Cases"
          value={patientStats?.data?.stats?.complex_cases}
          icon={FiTrendingUp}
          color="bg-orange-500"
          to="/patients?complexity=complex"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Patient Statistics">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Male Patients</span>
              <Badge variant="info">{patientStats?.data?.stats?.male_patients || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Female Patients</span>
              <Badge variant="info">{patientStats?.data?.stats?.female_patients || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Patients with ADL Files</span>
              <Badge variant="success">{patientStats?.data?.stats?.patients_with_adl || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Complex Cases</span>
              <Badge variant="warning">{patientStats?.data?.stats?.complex_cases || 0}</Badge>
            </div>
          </div>
        </Card>

        <Card title="ADL File Status">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Created</span>
              <Badge>{adlStats?.data?.stats?.created_files || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Stored</span>
              <Badge variant="success">{adlStats?.data?.stats?.stored_files || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Retrieved</span>
              <Badge variant="warning">{adlStats?.data?.stats?.retrieved_files || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Archived</span>
              <Badge variant="default">{adlStats?.data?.stats?.archived_files || 0}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Role-based Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/patients/new"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
          >
            <FiUsers className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="font-medium">Register New Patient</p>
          </Link>

          {(user?.role === 'MWO' || user?.role === 'Admin') && (
            <Link
              to="/outpatient/new"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
            >
              <FiClipboard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">New Outpatient Record</p>
            </Link>
          )}

          {(user?.role === 'JR' || user?.role === 'SR' || user?.role === 'Admin') && (
            <Link
              to="/clinical/new"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
            >
              <FiFileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">New Clinical Proforma</p>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

