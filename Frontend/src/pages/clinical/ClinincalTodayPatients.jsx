import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { FiCalendar, FiUser, FiPhone, FiMapPin, FiClock, FiEye, FiFilter, FiRefreshCw, FiPlusCircle, FiFileText } from 'react-icons/fi';
import { useGetAllPatientsQuery, useGetTodayPatientsQuery } from '../../features/patients/patientsApiSlice';
import { useGetClinicalProformaByPatientIdQuery } from '../../features/clinical/clinicalApiSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';

// Component to check for existing proforma and render patient row
const PatientRow = ({ patient, activeTab, navigate }) => {
  const { data: proformaData, refetch: refetchProformas, isLoading: proformasLoading } = useGetClinicalProformaByPatientIdQuery(
    patient.id, 
    { 
      skip: !patient.id,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  const proformas = proformaData?.data?.proformas || [];
  const hasExistingProforma = proformas.length > 0;
  const latestProformaId = hasExistingProforma ? proformas[0].id : null;
  
  // Refetch proformas when component becomes visible (e.g., after returning from deletion)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && patient.id) {
        refetchProformas();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [patient.id, refetchProformas]);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAgeGroupColor = (ageGroup) => {
    const colors = {
      '0-15': 'bg-blue-100 text-blue-800',
      '15-30': 'bg-green-100 text-green-800',
      '30-45': 'bg-yellow-100 text-yellow-800',
      '45-60': 'bg-orange-100 text-orange-800',
      '60+': 'bg-red-100 text-red-800',
    };
    return colors[ageGroup] || 'bg-gray-100 text-gray-800';
  };

  const getCaseComplexityColor = (complexity) => {
    return complexity === 'complex' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-green-100 text-green-800';
  };

  return (
    <div className="p-5 sm:p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-200 border-b border-gray-200 last:border-b-0 bg-white rounded-lg mb-3 shadow-sm hover:shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-start gap-5 lg:gap-6">
        {/* Patient Information Section */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Header with name, info, and badges */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-bold text-gray-900 mb-3 break-words">
                {patient.name}
              </h4>
              <div className="flex flex-wrap items-center gap-4 sm:gap-5 text-sm text-gray-600">
                <span className="flex items-center gap-1.5 whitespace-nowrap bg-gray-50 px-2.5 py-1 rounded-md">
                  <FiUser className="w-4 h-4 flex-shrink-0 text-gray-500" />
                  <span className="font-medium">{patient.sex}</span>
                  <span className="text-gray-400">•</span>
                  <span>{patient.actual_age} years</span>
                </span>
                {patient.contact_number && (
                  <span className="flex items-center gap-1.5 whitespace-nowrap bg-gray-50 px-2.5 py-1 rounded-md">
                    <FiPhone className="w-4 h-4 flex-shrink-0 text-gray-500" />
                    <span>{patient.contact_number}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5 whitespace-nowrap bg-gray-50 px-2.5 py-1 rounded-md">
                  <FiClock className="w-4 h-4 flex-shrink-0 text-gray-500" />
                  <span>{formatTime(patient.created_at)}</span>
                </span>
              </div>
            </div>
            {/* Badges */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {patient.age_group && (
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm ${getAgeGroupColor(patient.age_group)}`}>
                  {patient.age_group}
                </span>
              )}
              {patient.case_complexity && (
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm ${getCaseComplexityColor(patient.case_complexity)}`}>
                  {patient.case_complexity}
                </span>
              )}
              {patient.has_adl_file && (
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 whitespace-nowrap shadow-sm">
                  ADL File
                </span>
              )}
            </div>
          </div>

          {/* Patient Details - Essential fields only */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-gray-700 whitespace-nowrap">CR No:</span>
              <span className="text-gray-900 font-medium break-words">{patient.cr_no}</span>
            </div>
            {patient.psy_no && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-gray-700 whitespace-nowrap">PSY No:</span>
                <span className="text-gray-900 font-medium break-words">{patient.psy_no}</span>
              </div>
            )}
            {patient.assigned_room && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-gray-700 whitespace-nowrap">Room:</span>
                <span className="text-gray-900 font-medium break-words">{patient.assigned_room}</span>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="pt-3 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-600">Registered by:</span>
              <span className="ml-2">{patient.filled_by_name}</span>
              <span className="ml-1 text-gray-400">(MWO)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="lg:w-48 xl:w-56 shrink-0">
          <div className="flex flex-row lg:flex-col gap-2.5">
            {/* View Details Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/patients/${patient.id}?returnTab=${activeTab}`)}
              className="flex items-center justify-center gap-2 w-full lg:w-full px-4 py-2.5 text-sm font-medium transition-all hover:shadow-md"
            >
              <FiEye className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">View Details</span>
            </Button>
            
            {/* Clinical Proforma Button */}
            {hasExistingProforma ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/clinical/${latestProformaId}?returnTab=${activeTab}`)}
                className="flex items-center justify-center gap-2 w-full lg:w-full px-4 py-2.5 text-sm font-medium bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-all hover:shadow-md"
              >
                <FiFileText className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">View Proforma</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/clinical/new?patient_id=${patient.id}&returnTab=${activeTab}`)}
                className="flex items-center justify-center gap-2 w-full lg:w-full px-4 py-2.5 text-sm font-medium transition-all hover:shadow-md"
              >
                <FiPlusCircle className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Clinical Proforma</span>
              </Button>
            )}
            
            {/* Prescribe Medication Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/clinical/prescribe-medication?patient_id=${patient.id}&returnTab=${activeTab}`)}
              className="flex items-center justify-center gap-2 w-full lg:w-full px-4 py-2.5 text-sm font-medium transition-all hover:shadow-md"
            >
              <FiPlusCircle className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Prescribe</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClinicalTodayPatients = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUser = useSelector(selectCurrentUser);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Get tab from URL params - single source of truth
  const tabFromUrl = searchParams.get('tab');
  const activeTab = tabFromUrl === 'existing' ? 'existing' : 'new';
  
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sex: '',
    age_group: '',
    marital_status: '',
    occupation: '',
    religion: '',
    family_type: '',
    locality: '',
    category: '',
    case_complexity: '',
  });

  // Fetch patients data - must be defined before useEffects that use refetch
  const { data, isLoading, isFetching, refetch, error } = useGetAllPatientsQuery({
    page: currentPage,
    limit: 10,
    // search: search.trim() || undefined // Only include search if it has a value
  }, {
    pollingInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  
  // Track previous location to detect navigation changes
  const prevLocationRef = useRef(location.pathname);
  
  useEffect(() => {
    // If we navigated away and came back, refetch the data
    if (prevLocationRef.current !== location.pathname && location.pathname === '/clinical-today-patients') {
      refetch();
    }
    prevLocationRef.current = location.pathname;
  }, [location.pathname, refetch]);
  
  // Refetch when window comes into focus (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };
    
    // Refetch when component becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetch();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);
  
  // Update URL when tab changes
  const handleTabChange = (tab) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (tab === 'new') {
      newSearchParams.delete('tab');
    } else {
      newSearchParams.set('tab', tab);
    }
    setSearchParams(newSearchParams, { replace: true });
  };




  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setCurrentPage(1); // Reset to first page when date changes
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      sex: '',
      age_group: '',
      marital_status: '',
      occupation: '',
      religion: '',
      family_type: '',
      locality: '',
      category: '',
      case_complexity: '',
    });
  };

  // Filter function to show only today's patients
  // const filterTodayPatients = (patients) => {
  //   debugger
  //   if (!patients || !Array.isArray(patients)) return [];
    
  //   const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
  //   return patients.filter(patient => {
  //     // Check if patient has created_at date
  //     if (!patient.created_at) return false;
      
  //     // Convert patient's created_at to date string
  //     const patientDate = new Date(patient.created_at).toISOString().split('T')[0];
      
  //     // Return true if patient was created today
  //     return patientDate === today;
  //   });
  // };

  // Helper: get YYYY-MM-DD string in IST for any date-like input
  const toISTDateString = (dateInput) => {
    try {
      const d = new Date(dateInput);
      return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
    } catch (_) {
      return '';
    }
  };

  // Filter to only include patients created on selectedDate (IST) OR with visits on selectedDate
  // Patients can appear in "Today's Patients" if:
  // 1. They were created today (new patient registration by MWO), OR
  // 2. They have a visit today (follow-up visit for existing patient)
  const filterTodayPatients = (patients) => {
    if (!Array.isArray(patients)) return [];

    const targetDate = toISTDateString(selectedDate || new Date());

    return patients.filter((patient) => {
      // Check if patient was created today
      const createdToday = patient?.created_at && 
        toISTDateString(patient.created_at) === targetDate;

      // Check if patient has a visit today (from latest assignment date, visit date, or has_visit_today flag)
      const hasVisitToday = patient?.has_visit_today === true ||
        (patient?.last_assigned_date && 
        toISTDateString(patient.last_assigned_date) === targetDate) ||
        (patient?.visit_date && 
        toISTDateString(patient.visit_date) === targetDate);

      // Patient appears if created today OR has visit today
      if (!createdToday && !hasVisitToday) return false;

      // If patient was created today and API provides who filled the record, ensure it's MWO
      if (createdToday && patient?.filled_by_role && patient.filled_by_role !== 'MWO') {
        return false;
      }

      return true;
    });
  };

  // Safely derive patients from API (handles both {data:{patients}} and {patients})
  const apiPatients = data?.data?.patients || data?.patients || [];
  const apiPagination = data?.data?.pagination || data?.pagination || undefined;

  // Helper function to determine if patient is new (created today) or existing (visit today)
  const isNewPatient = (patient) => {
    if (!patient?.created_at) return false;
    const targetDate = toISTDateString(selectedDate || new Date());
    return toISTDateString(patient.created_at) === targetDate;
  };

  const isExistingPatient = (patient) => {
    const targetDate = toISTDateString(selectedDate || new Date());
    const hasVisitToday = patient?.has_visit_today === true ||
      (patient?.last_assigned_date && 
      toISTDateString(patient.last_assigned_date) === targetDate) ||
      (patient?.visit_date && 
      toISTDateString(patient.visit_date) === targetDate);
    
    // Existing patient: has visit today but NOT created today
    const createdToday = patient?.created_at && 
      toISTDateString(patient.created_at) === targetDate;
    
    return hasVisitToday && !createdToday;
  };

  const todayPatients = filterTodayPatients(apiPatients).filter((p) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;
    // Only allow JR/SR to see patients assigned to them
    if ((currentUser.role === 'JR' || currentUser.role === 'SR')) {
      // Prefer direct field; fallback to latest assignment fields if present
      if (p.assigned_doctor_id) return Number(p.assigned_doctor_id) === Number(currentUser.id);
      if (p.assigned_doctor) return Number(p.assigned_doctor) === Number(currentUser.id);
      if (p.assigned_doctor_name && p.assigned_doctor_role) {
        // If role exists but id missing, be conservative: hide
        return false;
      }
      // If no assignment info present, hide for doctors
      return false;
    }
    // Other roles: default deny
    return false;
  });
  console.log("Today's patients:", todayPatients);
  
  // Separate patients into new and existing
  const newPatients = todayPatients.filter(isNewPatient);
  const existingPatients = todayPatients.filter(isExistingPatient);
  
  // Filter patients based on active tab
  const tabFilteredPatients = activeTab === 'new' ? newPatients : existingPatients;
  
  const filteredPatients = tabFilteredPatients.filter(patient => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return patient[key]?.toString().toLowerCase().includes(value.toLowerCase());
    });
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading today's patients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Patients</h2>
          <p className="text-gray-600 mb-4">{error?.data?.message || 'Failed to load patients'}</p>
          <Button onClick={() => refetch()} className="bg-primary-600 hover:bg-primary-700">
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 space-y-6">
      {/* Header */}
      <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-primary-800/10 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex justify-between items-center">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg">
                    <FiUser className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl  font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    Today's Patients
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">
                      Department of Psychiatry
                    </p>
                    <p className="text-sm text-gray-500">
                      Postgraduate Institute of Medical Education & Research, Chandigarh
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/* Tabs */}
      <Card className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleTabChange('new')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              activeTab === 'new'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FiUser className="w-5 h-5" />
              <span>New Patient</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'new' ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {newPatients.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => handleTabChange('existing')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              activeTab === 'existing'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FiUser className="w-5 h-5" />
              <span>Existing Patient</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'existing' ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {existingPatients.length}
              </span>
            </div>
          </button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-primary-600">{filteredPatients.length}</div>
          <div className="text-sm text-gray-600">
            {activeTab === 'new' ? 'New Patients' : 'Existing Patients'}
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {filteredPatients.filter(p => p.sex === 'M').length}
          </div>
          <div className="text-sm text-gray-600">Male</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-pink-600">
            {filteredPatients.filter(p => p.sex === 'F').length}
          </div>
          <div className="text-sm text-gray-600">Female</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {filteredPatients.filter(p => p.case_complexity === 'complex').length}
          </div>
          <div className="text-sm text-gray-600">Complex Cases</div>
        </Card>
      </div>

      {/* Patients List */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {activeTab === 'new' ? 'New Patients' : 'Existing Patients'} ({filteredPatients.length})
          </h3>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <FiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600">
              {Object.values(filters).some(f => f) 
                ? `No ${activeTab === 'new' ? 'new' : 'existing'} patients match the current filters for today.`
                : activeTab === 'new'
                ? 'No new patients were registered by MWO today.'
                : 'No existing patients have visits scheduled for today.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y-0 space-y-0">
            {filteredPatients.map((patient) => (
              <PatientRow 
                key={patient.id} 
                patient={patient} 
                activeTab={activeTab}
                navigate={navigate}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {apiPagination?.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, apiPagination.total)} of {apiPagination.total} patients
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {currentPage} of {apiPagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(apiPagination.pages, prev + 1))}
                  disabled={currentPage === apiPagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ClinicalTodayPatients;
