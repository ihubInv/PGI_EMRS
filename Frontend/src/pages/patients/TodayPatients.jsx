import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiUser, FiPhone, FiMapPin, FiClock, FiEye, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { useGetTodayPatientsQuery } from '../../features/patients/patientsApiSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';

const TodayPatients = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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

  const { data, error, isLoading, refetch } = useGetTodayPatientsQuery({
    page: currentPage,
    limit: 10,
    date: selectedDate,
  });

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

  const filteredPatients = data?.data?.patients?.filter(patient => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return patient[key]?.toString().toLowerCase().includes(value.toLowerCase());
    });
  }) || [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
      <div className="text-center space-y-2 mb-6">
        <p className="text-sm text-gray-700 font-medium">Department of Psychiatry</p>
        <p className="text-xs text-gray-600">Postgraduate Institute of Medical Education & Research, Chandigarh</p>
        <h1 className="text-3xl font-bold text-gray-900 tracking-wide flex items-center justify-center gap-3">
          <FiCalendar className="w-8 h-8 text-primary-600" />
          Today's Patients
        </h1>
        <p className="text-sm text-gray-600">
          Patients registered by MWO on {formatDate(selectedDate)}
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <FiCalendar className="w-5 h-5 text-primary-600" />
              <label className="text-sm font-medium text-gray-700">Date:</label>
            </div>
            <Input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-48"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <FiFilter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="flex items-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Select
                label="Sex"
                name="sex"
                value={filters.sex}
                onChange={handleFilterChange}
                options={[
                  { value: '', label: 'All Sex' },
                  { value: 'M', label: 'Male' },
                  { value: 'F', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
              <Select
                label="Age Group"
                name="age_group"
                value={filters.age_group}
                onChange={handleFilterChange}
                options={[
                  { value: '', label: 'All Age Groups' },
                  { value: '0-15', label: '0-15' },
                  { value: '15-30', label: '15-30' },
                  { value: '30-45', label: '30-45' },
                  { value: '45-60', label: '45-60' },
                  { value: '60+', label: '60+' },
                ]}
              />
              <Select
                label="Marital Status"
                name="marital_status"
                value={filters.marital_status}
                onChange={handleFilterChange}
                options={[
                  { value: '', label: 'All Marital Status' },
                  { value: 'Single', label: 'Single' },
                  { value: 'Married', label: 'Married' },
                  { value: 'Divorced', label: 'Divorced' },
                  { value: 'Widowed', label: 'Widowed' },
                ]}
              />
              <Select
                label="Occupation"
                name="occupation"
                value={filters.occupation}
                onChange={handleFilterChange}
                options={[
                  { value: '', label: 'All Occupations' },
                  { value: 'Employed', label: 'Employed' },
                  { value: 'Unemployed', label: 'Unemployed' },
                  { value: 'Student', label: 'Student' },
                  { value: 'Retired', label: 'Retired' },
                  { value: 'Housewife', label: 'Housewife' },
                ]}
              />
              <Select
                label="Religion"
                name="religion"
                value={filters.religion}
                onChange={handleFilterChange}
                options={[
                  { value: '', label: 'All Religions' },
                  { value: 'Hinduism', label: 'Hinduism' },
                  { value: 'Islam', label: 'Islam' },
                  { value: 'Christianity', label: 'Christianity' },
                  { value: 'Sikhism', label: 'Sikhism' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
              <Select
                label="Family Type"
                name="family_type"
                value={filters.family_type}
                onChange={handleFilterChange}
                options={[
                  { value: '', label: 'All Family Types' },
                  { value: 'Nuclear', label: 'Nuclear' },
                  { value: 'Joint', label: 'Joint' },
                  { value: 'Extended', label: 'Extended' },
                ]}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-primary-600">{data?.data?.pagination?.total || 0}</div>
          <div className="text-sm text-gray-600">Total Patients</div>
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
            Patients ({filteredPatients.length} of {data?.data?.pagination?.total || 0})
          </h3>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <FiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600">
              {Object.values(filters).some(f => f) 
                ? 'No patients match the current filters for the selected date.'
                : 'No patients were registered by MWO on the selected date.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {patient.name}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FiUser className="w-4 h-4" />
                            {patient.sex}, {patient.actual_age} years
                          </span>
                          {patient.contact_number && (
                            <span className="flex items-center gap-1">
                              <FiPhone className="w-4 h-4" />
                              {patient.contact_number}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <FiClock className="w-4 h-4" />
                            {formatTime(patient.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {patient.age_group && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAgeGroupColor(patient.age_group)}`}>
                            {patient.age_group}
                          </span>
                        )}
                        {patient.case_complexity && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCaseComplexityColor(patient.case_complexity)}`}>
                            {patient.case_complexity}
                          </span>
                        )}
                        {patient.has_adl_file && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ADL File
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">CR No:</span>
                        <span className="ml-2 text-gray-600">{patient.cr_no}</span>
                      </div>
                      {patient.psy_no && (
                        <div>
                          <span className="font-medium text-gray-700">PSY No:</span>
                          <span className="ml-2 text-gray-600">{patient.psy_no}</span>
                        </div>
                      )}
                      {patient.special_clinic_no && (
                        <div>
                          <span className="font-medium text-gray-700">Special Clinic:</span>
                          <span className="ml-2 text-gray-600">{patient.special_clinic_no}</span>
                        </div>
                      )}
                      {patient.marital_status && (
                        <div>
                          <span className="font-medium text-gray-700">Marital Status:</span>
                          <span className="ml-2 text-gray-600">{patient.marital_status}</span>
                        </div>
                      )}
                      {patient.occupation && (
                        <div>
                          <span className="font-medium text-gray-700">Occupation:</span>
                          <span className="ml-2 text-gray-600">{patient.occupation}</span>
                        </div>
                      )}
                      {patient.education_level && (
                        <div>
                          <span className="font-medium text-gray-700">Education:</span>
                          <span className="ml-2 text-gray-600">{patient.education_level}</span>
                        </div>
                      )}
                      {patient.religion && (
                        <div>
                          <span className="font-medium text-gray-700">Religion:</span>
                          <span className="ml-2 text-gray-600">{patient.religion}</span>
                        </div>
                      )}
                      {patient.family_type && (
                        <div>
                          <span className="font-medium text-gray-700">Family Type:</span>
                          <span className="ml-2 text-gray-600">{patient.family_type}</span>
                        </div>
                      )}
                      {patient.locality && (
                        <div>
                          <span className="font-medium text-gray-700">Locality:</span>
                          <span className="ml-2 text-gray-600">{patient.locality}</span>
                        </div>
                      )}
                    </div>

                    {patient.assigned_room && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Assigned Room:</span>
                          <span className="ml-2 text-gray-600">{patient.assigned_room}</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Registered by:</span>
                        <span className="ml-2">{patient.filled_by_name} (MWO)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      className="flex items-center gap-2"
                    >
                      <FiEye className="w-4 h-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.data?.pagination?.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, data.data.pagination.total)} of {data.data.pagination.total} patients
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
                  Page {currentPage} of {data.data.pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(data.data.pagination.pages, prev + 1))}
                  disabled={currentPage === data.data.pagination.pages}
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

export default TodayPatients;
