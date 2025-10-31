import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  FiPlus, FiSearch, FiTrash2, FiEye, FiUserPlus, FiEdit, FiUsers, 
  FiFilter, FiRefreshCw, FiDownload, FiMoreVertical, FiClock, 
  FiHeart, FiFileText, FiShield, FiTrendingUp, FiMapPin
} from 'react-icons/fi';
import { useGetAllPatientsQuery, useDeletePatientMutation, useAssignPatientMutation } from '../../features/patients/patientsApiSlice';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { formatPatientsForExport, exportData } from '../../utils/exportUtils';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';

const PatientsPage = () => {
  const user = useSelector(selectCurrentUser);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data, isLoading, isFetching, refetch, error } = useGetAllPatientsQuery({
    page,
    limit,
    search: search.trim() || undefined // Only include search if it has a value
  }, {
    pollingInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnMountOrArgChange: true,
  });
  // console.log('data', data);
  const [deletePatient] = useDeletePatientMutation();
  // const [assignPatient, { isLoading: isAssigning }] = useAssignPatientMutation();

  // const handleAssign = async (patient) => {
  //   const doctorId = prompt('Enter Doctor User ID to assign:');
  //   if (!doctorId) return;
  //   const roomNo = prompt('Enter Room No (optional):') || '';
  //   try {
  //     await assignPatient({ patient_id: patient.id, assigned_doctor: Number(doctorId), room_no: roomNo }).unwrap();
  //     toast.success('Patient assigned');
  //     refetch();
  //   } catch (err) {
  //     toast.error(err?.data?.message || 'Failed to assign');
  //   }
  // };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await deletePatient(id).unwrap();
        toast.success('Patient deleted successfully');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete patient');
      }
    }
  };

  const handleExport = () => {
    if (!data?.data?.patients || data.data.patients.length === 0) {
      toast.warning('No patient data available to export');
      return;
    }
    
    try {
      // Format all patient data for export
      const formattedData = formatPatientsForExport(data.data.patients);
      
      // Generate filename with current date
      const filename = `patients_export_${new Date().toISOString().split('T')[0]}`;
      
      // Export directly to Excel with blue theme
      exportData(formattedData, filename, 'excel', 'blue');
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export patient data');
    }
  };

  const columns = [
    {
      header: (
        <div className="flex items-center gap-2">
          <FiFileText className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">CR No</span>
        </div>
      ),
      accessor: 'cr_no',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
            <FiFileText className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-medium text-gray-900">{row.cr_no || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiUsers className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">Patient Info</span>
        </div>
      ),
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
              <FiHeart className="w-3 h-3 text-green-600" />
            </div>
            <span className="font-semibold text-gray-900">{row.name}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              {row.actual_age} years
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
              {row.sex}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiShield className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">Doctor</span>
        </div>
      ),
      render: (row) => (
        row.assigned_doctor_name ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200">
                {row.assigned_doctor_name}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">{row.assigned_doctor_role}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-gray-400 text-sm">Unassigned</span>
          </div>
        )
      ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiFileText className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">PSY No</span>
        </div>
      ),
      accessor: 'psy_no',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg flex items-center justify-center">
            <FiFileText className="w-4 h-4 text-orange-600" />
          </div>
          <span className="font-medium text-gray-900">{row.psy_no || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiTrendingUp className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">Status</span>
        </div>
      ),
      render: (row) => (
        <div className="space-y-2">
          <Badge 
            variant={row.case_complexity === 'complex' ? 'warning' : 'success'}
            className={`${
              row.case_complexity === 'complex' 
                ? 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border-orange-200' 
                : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200'
            }`}
          >
            {row.case_complexity || 'simple'}
          </Badge>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              row.has_adl_file ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
            <span className="text-xs text-gray-600">
              ADL: {row.has_adl_file ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <FiMoreVertical className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">Actions</span>
        </div>
      ),
      render: (row) => (
        <div className="flex gap-2">
          <Link to={`/patients/${row.id}`}>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200"
            >
              <FiEye className="w-4 h-4 text-blue-600" />
            </Button>
          </Link>
          <Link to={`/patients/${row.id}?edit=true`}>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200"
            >
              <FiEdit className="w-4 h-4 text-green-600" />
            </Button>
          </Link>
          {/* {user?.role === 'MWO' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleAssign(row)} 
              disabled={isAssigning}
              className="h-8 w-8 p-0 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200"
            >
              <FiUserPlus className="w-4 h-4 text-purple-600" />
            </Button>
          )} */}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="space-y-8 p-6">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-primary-800/10 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex justify-between items-center">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg">
                    <FiUsers className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                      Patients
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">
                      {user?.role === 'MWO' 
                        ? 'View patient records' 
                        : 'Manage patient records and medical information'}
                    </p>
                  </div>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FiUsers className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Patients</p>
                        <p className="text-2xl font-bold text-gray-900">{data?.data?.pagination?.total || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FiHeart className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Active Cases</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {data?.data?.patients?.filter(p => p.case_complexity === 'complex').length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FiFileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Additional Detail File</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {data?.data?.patients?.filter(p => p.has_adl_file).length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FiShield className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Assigned</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {data?.data?.patients?.filter(p => p.assigned_doctor_name).length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {user?.role !== 'MWO' && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="bg-white/50 border-primary-200 hover:bg-primary-50"
                    onClick={() => refetch()}
                  >
                    <FiRefreshCw className="mr-2" />
                    Refresh
                  </Button>
                  <Link to="/patients/new">
                    <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg">
                      <FiPlus className="mr-2" />
                      Add Patient
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* {user?.role === 'MWO' && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiMapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-blue-800 font-medium">Registration Notice</p>
                <p className="text-blue-600 text-sm">To register a new patient, please go to Outpatient Records → New Record</p>
              </div>
            </div>
          </div>
        )} */}

        {/* Main Content Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FiShield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-red-800 font-medium">Error Loading Patients</p>
                  <p className="text-red-600 text-sm">{error?.data?.message || 'Failed to load patients. Please try again.'}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Search and Filter Section */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="w-5 h-5 text-gray-400" />
                </div>
                <Input
                  placeholder="Search patients by name, CR number, or PSY number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-12 bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
              </div>
              <div className="flex gap-3">
                {/* <Button
                  variant="outline"
                  className="h-12 px-6 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 hover:bg-gray-100"
                >
                  <FiFilter className="mr-2" />
                  Filter
                </Button> */}
                <Button
                  variant="outline"
                  className="h-12 px-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:bg-blue-100"
                  onClick={handleExport}
                  disabled={!data?.data?.patients || data.data.patients.length === 0}
                >
                  <FiDownload className="mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {(isLoading || isFetching) ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FiUsers className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading patients...</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Table
                  columns={columns}
                  data={data?.data?.patients || []}
                  loading={isLoading}
                />
              </div>

              {data?.data?.pagination && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <Pagination
                    currentPage={data.data.pagination.page}
                    totalPages={data.data.pagination.pages}
                    totalItems={data.data.pagination.total}
                    itemsPerPage={limit}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </Card>

      </div>
    </div>
  );
};

export default PatientsPage;

