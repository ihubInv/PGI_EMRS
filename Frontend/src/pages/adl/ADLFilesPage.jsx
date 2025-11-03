import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSearch, FiEye, FiDownload, FiUpload, FiArchive, FiRefreshCw, FiActivity } from 'react-icons/fi';
import {
  useGetAllADLFilesQuery,
  useRetrieveFileMutation,
  useReturnFileMutation,
  useArchiveFileMutation,
} from '../../features/adl/adlApiSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

const ADLFilesPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showOnlyComplexCases, setShowOnlyComplexCases] = useState(true); // Default: only show complex cases
  const limit = 10;

  // Only fetch complex cases by default (where clinical_proforma_id exists)
  const { data, isLoading, isFetching, refetch, error } = useGetAllADLFilesQuery({ 
    page, 
    limit,
    include_all: !showOnlyComplexCases // If showOnlyComplexCases is true, don't include all
  }, {
    pollingInterval: 30000, // Auto-refresh every 30 seconds for real-time data
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [retrieveFile] = useRetrieveFileMutation();
  const [returnFile] = useReturnFileMutation();
  const [archiveFile] = useArchiveFileMutation();

  const handleRetrieve = async (id) => {
    try {
      await retrieveFile(id).unwrap();
      toast.success('File retrieved successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to retrieve file');
    }
  };

  const handleReturn = async (id) => {
    try {
      await returnFile(id).unwrap();
      toast.success('File returned successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to return file');
    }
  };

  const handleArchive = async (id) => {
    if (window.confirm('Are you sure you want to archive this file?')) {
      try {
        await archiveFile(id).unwrap();
        toast.success('File archived successfully');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to archive file');
      }
    }
  };

  const getStatusVariant = (status) => {
    const map = {
      created: 'info',
      stored: 'success',
      retrieved: 'warning',
      active: 'primary',
      archived: 'default',
    };
    return map[status] || 'default';
  };

  const columns = [
    {
      header: 'ADL Number',
      accessor: 'adl_no',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold">{row.adl_no}</span>
          {row.clinical_proforma_id && (
            <Badge variant="danger" className="text-xs">
              <FiActivity className="w-3 h-3 mr-1" />
              Complex Case
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Patient',
      accessor: 'patient_name',
      render: (row) => (
        <div>
          <p className="font-medium">{row.patient_name || 'N/A'}</p>
          {row.clinical_proforma_id && (
            <p className="text-xs text-gray-500 mt-0.5">Complex Case - Full Details Available</p>
          )}
        </div>
      ),
    },
    {
      header: 'CR No',
      accessor: 'cr_no',
      render: (row) => (
        <span className="font-mono">{row.cr_no || 'N/A'}</span>
      ),
    },
    {
      header: 'Assigned Doctor',
      render: (row) => (
        <div>
          {row.assigned_doctor_name ? (
            <>
              <p className="font-medium text-sm">{row.assigned_doctor_name}</p>
              {row.assigned_doctor_role && (
                <p className="text-xs text-gray-500">{row.assigned_doctor_role}</p>
              )}
            </>
          ) : (
            <span className="text-gray-400 text-sm">Not assigned</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={getStatusVariant(row.file_status)}>
          {row.file_status}
        </Badge>
      ),
    },
    {
      header: 'Created',
      render: (row) => formatDate(row.file_created_date),
    },
    {
      header: 'Visit Date',
      render: (row) => row.proforma_visit_date ? formatDate(row.proforma_visit_date) : <span className="text-gray-400">N/A</span>,
    },
    {
      header: 'Total Visits',
      accessor: 'total_visits',
      render: (row) => (
        <span className="font-semibold">{row.total_visits || 0}</span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Link to={`/adl-files/${row.id}`}>
            <Button variant="ghost" size="sm" title="View Details">
              <FiEye />
            </Button>
          </Link>
          {row.file_status === 'stored' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRetrieve(row.id)}
              title="Retrieve File"
            >
              <FiDownload className="text-blue-500" />
            </Button>
          )}
          {row.file_status === 'retrieved' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReturn(row.id)}
              title="Return File"
            >
              <FiUpload className="text-green-500" />
            </Button>
          )}
          {row.is_active && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleArchive(row.id)}
              title="Archive File"
            >
              <FiArchive className="text-gray-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ADL File Management</h1>
          <p className="text-gray-600 mt-1">
            {showOnlyComplexCases 
              ? 'Complex case files with comprehensive patient details' 
              : 'All ADL files (including non-complex cases)'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={showOnlyComplexCases ? "primary" : "outline"} 
            onClick={() => setShowOnlyComplexCases(!showOnlyComplexCases)}
            title={showOnlyComplexCases ? "Show all ADL files" : "Show only complex cases"}
          >
            <FiActivity className="mr-2" />
            {showOnlyComplexCases ? 'Complex Cases Only' : 'Show All Files'}
          </Button>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <FiRefreshCw className={`mr-2 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Files</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {data?.data?.pagination?.total || 0}
            </p>
          </div>
        </Card>
        <Card className="border-2 border-red-200 bg-red-50/30">
          <div className="text-center">
            <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
              <FiActivity className="w-4 h-4 text-red-600" />
              Complex Cases
            </p>
            <p className="text-3xl font-bold text-red-600 mt-1">
              {showOnlyComplexCases 
                ? (data?.data?.pagination?.total || 0)
                : (data?.data?.files?.filter(f => f.clinical_proforma_id).length || 0)
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {showOnlyComplexCases 
                ? 'Files with Full Patient Details' 
                : 'With Comprehensive Details'
              }
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Stored</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {data?.data?.files?.filter(f => f.file_status === 'stored').length || 0}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Retrieved</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">
              {data?.data?.files?.filter(f => f.file_status === 'retrieved').length || 0}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Archived</p>
            <p className="text-3xl font-bold text-gray-600 mt-1">
              {data?.data?.files?.filter(f => f.file_status === 'archived').length || 0}
            </p>
          </div>
        </Card>
      </div>

      <Card>
        {error && (
          <div className="mb-4">
            <p className="text-red-600 text-sm">{error?.data?.message || 'Failed to load ADL files.'}</p>
          </div>
        )}
        <div className="mb-4">
          <div className="relative">
            <Input
              placeholder={showOnlyComplexCases 
                ? "Search complex case files by ADL number or patient name..."
                : "Search by ADL number or patient name..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          {showOnlyComplexCases && (
            <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
              <FiActivity className="w-4 h-4" />
              <span>Showing only complex cases with comprehensive patient details stored in ADL schema</span>
            </div>
          )}
        </div>

        {(isLoading || isFetching) ? (
          <LoadingSpinner className="h-64" />
        ) : (
          <>
            {(data?.data?.files || []).length === 0 ? (
              <div className="text-center py-12">
                <FiActivity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {showOnlyComplexCases 
                    ? 'No Complex Case ADL Files Found' 
                    : 'No ADL Files Found'
                  }
                </h3>
                <p className="text-gray-500">
                  {showOnlyComplexCases
                    ? 'ADL files will appear here when complex cases are registered in clinical proformas.'
                    : 'No ADL files have been created yet.'
                  }
                </p>
              </div>
            ) : (
              <Table
                columns={columns}
                data={data?.data?.files || []}
                loading={isLoading}
              />
            )}

            {data?.data?.pagination && (
              <Pagination
                currentPage={data.data.pagination.page}
                totalPages={data.data.pagination.pages}
                totalItems={data.data.pagination.total}
                itemsPerPage={limit}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default ADLFilesPage;

