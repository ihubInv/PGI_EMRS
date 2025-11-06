import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  FiPlus, FiSearch, FiTrash2, FiEye, FiUserPlus, FiEdit, FiUsers, 
  FiFilter, FiRefreshCw, FiDownload, FiMoreVertical, FiClock, 
  FiHeart, FiFileText, FiShield, FiTrendingUp, FiMapPin, FiClipboard
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
      render: (row) => {
        // If patient has ADL file, status should be "complex"
        const isComplex = row.has_adl_file || row.case_complexity === 'complex';
        const statusText = isComplex ? 'complex' : 'simple';
        
        return (
          <div className="space-y-2">
            <Badge 
              variant={isComplex ? 'warning' : 'success'}
              className={`${
                isComplex
                  ? 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border-orange-200' 
                  : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200'
              }`}
            >
              {statusText}
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
        );
      },
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
              className="h-9 w-9 p-0 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              title="View Details"
            >
              <FiEye className="w-4 h-4 text-blue-600" />
            </Button>
          </Link>
          <Link to={`/patients/${row.id}?edit=true`}>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-9 w-9 p-0 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 hover:border-green-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              title="Edit Patient"
            >
              <FiEdit className="w-4 h-4 text-green-600" />
            </Button>
          </Link>
          {/* Show Clinical Proforma button only for JR, SR, and Admin */}
          {(user?.role === 'JR' || user?.role === 'SR' || user?.role === 'Admin') && (
            <Link to={`/clinical?patient_id=${row.id}`}>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-9 w-9 p-0 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
                title="View Clinical Proforma"
              >
                <FiClipboard className="w-4 h-4 text-purple-600" />
              </Button>
            </Link>
          )}
          {/* {user?.role === 'MWO' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleAssign(row)} 
              disabled={isAssigning}
              className="h-9 w-9 p-0 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              title="Assign Doctor"
            >
              <FiUserPlus className="w-4 h-4 text-purple-600" />
            </Button>
          )} */}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-primary-600/10 to-primary-800/5 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-lg border border-white/50">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
              <div className="flex-1 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl blur-sm opacity-50"></div>
                    <div className="relative p-4 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg">
                      <FiUsers className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent">
                      Patient Management
                    </h1>
                    <p className="text-gray-600 mt-2 text-base sm:text-lg">
                      {user?.role === 'MWO' 
                        ? 'View and manage patient records' 
                        : 'Comprehensive patient records and medical information management'}
                    </p>
                  </div>
                </div>
                
                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
                          <FiUsers className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Patients</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{data?.data?.pagination?.total || 0}</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  
                  <div className="group relative bg-gradient-to-br from-amber-50 to-orange-100/50 rounded-xl p-5 border border-amber-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-sm">
                          <FiHeart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Complex Cases</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {data?.data?.patients?.filter(p => p.has_adl_file || p.case_complexity === 'complex').length || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-600 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  
                  <div className="group relative bg-gradient-to-br from-purple-50 to-pink-100/50 rounded-xl p-5 border border-purple-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-sm">
                          <FiFileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">ADL Files</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {data?.data?.patients?.filter(p => p.has_adl_file).length || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-600 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  
                  <div className="group relative bg-gradient-to-br from-emerald-50 to-green-100/50 rounded-xl p-5 border border-emerald-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-sm">
                          <FiShield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Assigned</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {data?.data?.patients?.filter(p => p.assigned_doctor_name).length || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-green-600 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
              </div>
              
              {user?.role !== 'MWO' && (
                <div className="flex flex-col sm:flex-row gap-3 lg:flex-col xl:flex-row">
                  <Button
                    variant="outline"
                    className="bg-white/80 border-2 border-primary-200 hover:bg-primary-50 hover:border-primary-300 shadow-sm transition-all duration-200 whitespace-nowrap"
                    onClick={() => refetch()}
                    disabled={isFetching}
                  >
                    <FiRefreshCw className={`mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                    {isFetching ? 'Refreshing...' : 'Refresh'}
                  </Button>
                  <Link to="/patients/new">
                    <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap">
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
        <Card className="shadow-lg border border-gray-200/50 bg-white/90 backdrop-blur-sm">
          {error && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-red-100 rounded-lg flex-shrink-0">
                  <FiShield className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-red-800 font-semibold text-base mb-1">Error Loading Patients</p>
                  <p className="text-red-600 text-sm">{error?.data?.message || 'Failed to load patients. Please try again.'}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced Search and Filter Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <Input
                  placeholder="Search by name, CR number, or PSY number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-12 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 shadow-sm hover:shadow-md"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="h-12 px-5 bg-white border-2 border-primary-200 hover:bg-primary-50 hover:border-primary-300 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FiUsers className="w-8 h-8 text-primary-600" />
                </div>
              </div>
              <p className="mt-6 text-gray-600 font-medium text-lg">Loading patients...</p>
              <p className="mt-2 text-gray-500 text-sm">Please wait while we fetch the data</p>
            </div>
          ) : data?.data?.patients?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                <FiUsers className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-2">No patients found</p>
              <p className="text-gray-500 text-center max-w-md">
                {search 
                  ? `No patients match your search "${search}". Try a different search term.`
                  : 'There are no patients in the system yet. Add your first patient to get started.'}
              </p>
              {user?.role !== 'MWO' && !search && (
                <Link to="/patients/new" className="mt-6">
                  <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg">
                    <FiPlus className="mr-2" />
                    Add First Patient
                  </Button>
                </Link>
              )}
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

              {data?.data?.pagination && data.data.pagination.pages > 1 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mt-4">
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

