import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiUsers, FiFileText, FiFolder, FiClipboard, FiTrendingUp, FiEye, FiEdit, FiTrash2, FiUserPlus } from 'react-icons/fi';
import { selectCurrentUser } from '../features/auth/authSlice';
import { useGetPatientStatsQuery } from '../features/patients/patientsApiSlice';
import { useGetClinicalStatsQuery, useGetCasesBySeverityQuery, useGetCasesByDecisionQuery, useGetMyProformasQuery } from '../features/clinical/clinicalApiSlice';
import { useGetADLStatsQuery, useGetFilesByStatusQuery } from '../features/adl/adlApiSlice';
import { useGetOutpatientStatsQuery, useGetMyRecordsQuery, useDeleteOutpatientRecordMutation } from '../features/outpatient/outpatientApiSlice';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { toast } from 'react-toastify';

// Chart components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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
  
  // Only fetch stats if user is Admin
  const { data: patientStats, isLoading: patientsLoading, error: patientsError } = useGetPatientStatsQuery(undefined, {
    pollingInterval: user?.role === 'Admin' ? 30000 : 0, // Disable polling for non-admin
    refetchOnMountOrArgChange: true,
    skip: user?.role !== 'Admin', // Skip query entirely for non-admin
  });
  const { data: clinicalStats, isLoading: clinicalLoading, error: clinicalError } = useGetClinicalStatsQuery(undefined, {
    pollingInterval: user?.role === 'Admin' ? 30000 : 0,
    refetchOnMountOrArgChange: true,
    skip: user?.role !== 'Admin',
  });
  const { data: adlStats, isLoading: adlLoading, error: adlError } = useGetADLStatsQuery(undefined, {
    pollingInterval: user?.role === 'Admin' ? 30000 : 0,
    refetchOnMountOrArgChange: true,
    skip: user?.role !== 'Admin',
  });

  const isLoading = user?.role === 'Admin' ? (patientsLoading || clinicalLoading || adlLoading) : false;

  // Role-specific stats for JR/SR
  const isJrSr = user?.role === 'JR' || user?.role === 'SR';
  const { data: severityStats } = useGetCasesBySeverityQuery(undefined, { skip: !isJrSr });
  const { data: decisionStats } = useGetCasesByDecisionQuery(undefined, { skip: !isJrSr });
  const { data: myProformas } = useGetMyProformasQuery({ page: 1, limit: 5 }, { skip: !isJrSr });

  // Role-specific stats for MWO
  const isMwo = user?.role === 'MWO';
  const { data: outpatientStats } = useGetOutpatientStatsQuery(undefined, { skip: !isMwo, refetchOnMountOrArgChange: true });
  const { data: adlByStatus } = useGetFilesByStatusQuery(undefined, { skip: !isMwo });
  const { data: myRecords } = useGetMyRecordsQuery({ page: 1, limit: 10 }, { skip: !isMwo, refetchOnMountOrArgChange: true });

  // Helpers
  const sumValues = (obj) => Object.values(obj || {}).reduce((acc, v) => acc + (Number(v) || 0), 0);

  // Chart data for Patient Gender Distribution
  const genderChartData = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [
          patientStats?.data?.stats?.male_patients || 0,
          patientStats?.data?.stats?.female_patients || 0
        ],
        backgroundColor: ['#3B82F6', '#EC4899'],
        borderColor: ['#1D4ED8', '#BE185D'],
        borderWidth: 2,
      },
    ],
  };

  // Chart data for Clinical Cases Distribution
  const clinicalCasesChartData = {
    labels: ['First Visit', 'Follow Up'],
    datasets: [
      {
        label: 'Visits',
        data: [
          clinicalStats?.data?.stats?.first_visits || 0,
          clinicalStats?.data?.stats?.follow_ups || 0
        ],
        backgroundColor: ['#10B981', '#F59E0B'],
        borderColor: ['#059669', '#D97706'],
        borderWidth: 2,
      },
    ],
  };

  // Chart data for Case Severity Distribution
  const severityChartData = {
    labels: ['Mild', 'Moderate', 'Severe', 'Critical'],
    datasets: [
      {
        label: 'Cases',
        data: [
          clinicalStats?.data?.stats?.mild_cases || 0,
          clinicalStats?.data?.stats?.moderate_cases || 0,
          clinicalStats?.data?.stats?.severe_cases || 0,
          clinicalStats?.data?.stats?.critical_cases || 0
        ],
        backgroundColor: ['#8B5CF6', '#06B6D4', '#EF4444', '#F59E0B'],
        borderColor: ['#7C3AED', '#0891B2', '#DC2626', '#D97706'],
        borderWidth: 2,
      },
    ],
  };

  // Chart data for ADL File Status Distribution
  const adlStatusChartData = {
    labels: ['Created', 'Stored', 'Retrieved', 'Archived'],
    datasets: [
      {
        data: [
          adlStats?.data?.stats?.created_files || 0,
          adlStats?.data?.stats?.stored_files || 0,
          adlStats?.data?.stats?.retrieved_files || 0,
          adlStats?.data?.stats?.archived_files || 0
        ],
        backgroundColor: ['#EF4444', '#10B981', '#F59E0B', '#6B7280'],
        borderColor: ['#DC2626', '#059669', '#D97706', '#4B5563'],
        borderWidth: 2,
      },
    ],
  };

  // Chart data for Patient Age Distribution (mock data for demonstration)
  const ageChartData = {
    labels: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
    datasets: [
      {
        label: 'Number of Patients',
        data: [2, 4, 3, 5, 2, 1], // This would ideally come from API
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(29, 78, 216, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-96" />;
  }

  // Non-admin role - show JR/SR or MWO focused dashboard
  if (user?.role !== 'Admin') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
        </div>

        {/* Role-based quick KPIs */}
        {isJrSr && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="My Proformas" value={myProformas?.data?.pagination?.total} icon={FiFileText} color="bg-green-500" to="/clinical" />
            <StatCard title="Cases by Severity" value={sumValues(severityStats?.data?.stats)} icon={FiTrendingUp} color="bg-orange-500" to="/clinical" />
            <StatCard title="Decisions Logged" value={sumValues(decisionStats?.data?.stats)} icon={FiClipboard} color="bg-blue-500" to="/clinical" />
            <StatCard title="Patients" value="Browse" icon={FiUsers} color="bg-purple-500" to="/patients" />
          </div>
        )}
        {isMwo && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Outpatient Records" value={outpatientStats?.data?.stats?.total_records || 0} icon={FiClipboard} color="bg-blue-500" to="/outpatient" />
            <StatCard title="My Records" value={myRecords?.data?.pagination?.total || 0} icon={FiFileText} color="bg-green-500" to="/outpatient" />
            <StatCard title="All Patients" value={myRecords?.data?.pagination?.total || 0} icon={FiUsers} color="bg-purple-500" to="/patients" />
            <StatCard title="Register New" value="+" icon={FiTrendingUp} color="bg-orange-500" to="/outpatient/new" />
          </div>
        )}

        {/* Role-specific charts */}
        {(isJrSr || isMwo) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isJrSr && (
              <>
                <Card title="My Cases by Severity">
                  <div className="h-80">
                    <Bar
                      data={{
                        labels: Object.keys(severityStats?.data?.stats || {}),
                        datasets: [
                          {
                            label: 'Cases',
                            data: Object.values(severityStats?.data?.stats || {}),
                            backgroundColor: ['#8B5CF6', '#06B6D4', '#EF4444', '#F59E0B', '#10B981'],
                            borderColor: ['#7C3AED', '#0891B2', '#DC2626', '#D97706', '#059669'],
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        ...barChartOptions,
                        plugins: {
                          ...barChartOptions.plugins,
                          title: { ...barChartOptions.plugins.title, text: 'My Cases by Severity' },
                        },
                      }}
                    />
                  </div>
                </Card>

                <Card title="My Cases by Decision">
                  <div className="h-80">
                    <Doughnut
                      data={{
                        labels: Object.keys(decisionStats?.data?.stats || {}),
                        datasets: [
                          {
                            data: Object.values(decisionStats?.data?.stats || {}),
                            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
                            borderColor: ['#1D4ED8', '#059669', '#D97706', '#DC2626', '#7C3AED'],
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          title: { ...chartOptions.plugins.title, text: 'My Cases by Decision' },
                        },
                      }}
                    />
                  </div>
                </Card>
              </>
            )}

            {isMwo && (
              <>
                <Card title="Outpatient Records by Marital Status">
                  <div className="h-80">
                    <Doughnut
                      data={{
                        labels: ['Married', 'Unmarried', 'Widow/Widower', 'Divorced', 'Other'],
                        datasets: [
                          {
                            data: [
                              outpatientStats?.data?.stats?.married || 0,
                              outpatientStats?.data?.stats?.unmarried || 0,
                              outpatientStats?.data?.stats?.widow_widower || 0,
                              outpatientStats?.data?.stats?.divorced || 0,
                              outpatientStats?.data?.stats?.other_marital || 0,
                            ],
                            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
                            borderColor: ['#1D4ED8', '#059669', '#D97706', '#DC2626', '#7C3AED'],
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          title: { ...chartOptions.plugins.title, text: 'Records by Marital Status' },
                        },
                      }}
                    />
                  </div>
                </Card>

                <Card title="Records by Locality">
                  <div className="h-80">
                    <Bar
                      data={{
                        labels: ['Urban', 'Rural'],
                        datasets: [
                          {
                            label: 'Records',
                            data: [
                              outpatientStats?.data?.stats?.urban || 0,
                              outpatientStats?.data?.stats?.rural || 0,
                            ],
                            backgroundColor: ['#3B82F6', '#10B981'],
                            borderColor: ['#1D4ED8', '#059669'],
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        ...barChartOptions,
                        plugins: {
                          ...barChartOptions.plugins,
                          title: { ...barChartOptions.plugins.title, text: 'Urban vs Rural Distribution' },
                        },
                      }}
                    />
                  </div>
                </Card>
              </>
            )}
          </div>
        )}

        {/* MWO Recent Records Table with CRUD */}
        {isMwo && myRecords?.data?.records && myRecords.data.records.length > 0 && (
          <Card title="My Recent Outpatient Records" actions={
            <Link to="/outpatient">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          }>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MR No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marital Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Locality
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myRecords.data.records.slice(0, 5).map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.patient_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.mr_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.marital_status || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Badge variant={record.locality === 'Urban' ? 'info' : 'success'}>
                          {record.locality || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link to={`/outpatient/${record.id}`}>
                            <Button variant="ghost" size="sm">
                              <FiEye />
                            </Button>
                          </Link>
                          <Link to={`/patients/${record.patient_id}?edit=true`}>
                            <Button variant="ghost" size="sm">
                              <FiEdit />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* MWO Quick Actions */}
        {isMwo && (
          <Card title="Quick Actions">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/outpatient/new"
                className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-center group"
              >
                <div className="flex flex-col items-center">
                  <div className="p-3 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors mb-3">
                    <FiUserPlus className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="font-semibold text-gray-900">Register New Patient</p>
                  <p className="text-sm text-gray-500 mt-1">Create outpatient record</p>
                </div>
              </Link>

              <Link
                to="/outpatient/select"
                className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-center group"
              >
                <div className="flex flex-col items-center">
                  <div className="p-3 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors mb-3">
                    <FiClipboard className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="font-semibold text-gray-900">Existing Patient</p>
                  <p className="text-sm text-gray-500 mt-1">Add record for existing patient</p>
                </div>
              </Link>

              <Link
                to="/patients"
                className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-center group"
              >
                <div className="flex flex-col items-center">
                  <div className="p-3 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors mb-3">
                    <FiUsers className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="font-semibold text-gray-900">Browse Patients</p>
                  <p className="text-sm text-gray-500 mt-1">View all patient records</p>
                </div>
              </Link>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
      </div>

      {(patientsError || clinicalError || adlError) && (
        <Card>
          <div className="p-4 text-sm text-red-600">
            {patientsError && <div>Failed to load patient stats.</div>}
            {clinicalError && <div>Failed to load clinical stats.</div>}
            {adlError && <div>Failed to load ADL stats.</div>}
          </div>
        </Card>
      )}

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
          value={clinicalStats?.data?.stats?.complex_cases}
          icon={FiTrendingUp}
          color="bg-orange-500"
          to="/patients?complexity=complex"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Gender Distribution */}
        <Card title="Patient Gender Distribution">
          <div className="h-80">
            <Doughnut 
              data={genderChartData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'Patient Gender Distribution'
                  }
                }
              }} 
            />
          </div>
        </Card>

        {/* Clinical Cases Distribution */}
        <Card title="Visit Type Distribution">
          <div className="h-80">
            <Bar 
              data={clinicalCasesChartData} 
              options={{
                ...barChartOptions,
                plugins: {
                  ...barChartOptions.plugins,
                  title: {
                    ...barChartOptions.plugins.title,
                    text: 'Visit Type Distribution'
                  }
                }
              }} 
            />
          </div>
        </Card>

        {/* Case Severity Distribution */}
        <Card title="Case Severity Distribution">
          <div className="h-80">
            <Bar 
              data={severityChartData} 
              options={{
                ...barChartOptions,
                plugins: {
                  ...barChartOptions.plugins,
                  title: {
                    ...barChartOptions.plugins.title,
                    text: 'Case Severity Distribution'
                  }
                }
              }} 
            />
          </div>
        </Card>

        {/* ADL File Status Distribution */}
        <Card title="ADL File Status">
          <div className="h-80">
            <Doughnut 
              data={adlStatusChartData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'ADL File Status Distribution'
                  }
                }
              }} 
            />
          </div>
        </Card>
      </div>

      {/* Patient Age Distribution */}
      <Card title="Patient Age Distribution">
        <div className="h-96">
          <Line 
            data={ageChartData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Patient Age Distribution'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1
                  }
                }
              }
            }} 
          />
        </div>
      </Card>

      {/* Detailed Stats */}
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
              <Badge variant="warning">{clinicalStats?.data?.stats?.complex_cases || 0}</Badge>
            </div>
          </div>
        </Card>

        <Card title="Clinical Statistics">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">First Visits</span>
              <Badge>{clinicalStats?.data?.stats?.first_visits || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Follow-ups</span>
              <Badge variant="success">{clinicalStats?.data?.stats?.follow_ups || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Simple Cases</span>
              <Badge variant="info">{clinicalStats?.data?.stats?.simple_cases || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cases Requiring ADL</span>
              <Badge variant="warning">{clinicalStats?.data?.stats?.cases_requiring_adl || 0}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Role-based Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {user?.role === 'MWO' ? (
            <Link
              to="/outpatient/new"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
            >
              <FiUsers className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">Register Patient & Create Record</p>
            </Link>
          ) : (
            <>
              <Link
                to="/patients/new"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
              >
                <FiUsers className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="font-medium">Register New Patient</p>
              </Link>

              {user?.role === 'Admin' && (
                <Link
                  to="/outpatient/new"
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
                >
                  <FiClipboard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">New Outpatient Record</p>
                </Link>
              )}
            </>
          )}

          {(user?.role === 'JR' || user?.role === 'SR' || user?.role === 'Admin') && (
            <>
              <Link
                to="/clinical/new"
               className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
              >
                <FiFileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="font-medium">Create Clinical Proforma</p>
              </Link>

              <Link
                to="/adl-files"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
              >
                <FiFolder className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="font-medium">Manage ADL Files</p>
              </Link>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;