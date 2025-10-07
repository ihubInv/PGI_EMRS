import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSearch, FiEye, FiDownload, FiUpload, FiArchive, FiRefreshCw } from 'react-icons/fi';
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
  const limit = 10;

  const { data, isLoading, isFetching, refetch, error } = useGetAllADLFilesQuery({ page, limit }, {
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
        <span className="font-mono font-semibold">{row.adl_no}</span>
      ),
    },
    {
      header: 'Patient',
      accessor: 'patient_name',
    },
    {
      header: 'CR No',
      accessor: 'cr_no',
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
      header: 'Total Visits',
      accessor: 'total_visits',
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
          <p className="text-gray-600 mt-1">Track and manage complex case files</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <FiRefreshCw className={`mr-2 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Files</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {data?.data?.pagination?.total || 0}
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
              placeholder="Search by ADL number or patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {(isLoading || isFetching) ? (
          <LoadingSpinner className="h-64" />
        ) : (
          <>
            <Table
              columns={columns}
              data={data?.data?.files || []}
              loading={isLoading}
            />

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

