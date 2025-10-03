import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, FiRefreshCw } from 'react-icons/fi';
import {
  useGetAllOutpatientRecordsQuery,
  useDeleteOutpatientRecordMutation,
} from '../../features/outpatient/outpatientApiSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import { formatDate, formatCurrency } from '../../utils/formatters';

const OutpatientPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;

  const { data, isLoading, isFetching, refetch, error } = useGetAllOutpatientRecordsQuery({ page, limit }, {
    pollingInterval: 30000, // Auto-refresh every 30 seconds for real-time data
    refetchOnMountOrArgChange: true,
  });
  const [deleteRecord] = useDeleteOutpatientRecordMutation();

  const handleRefresh = () => {
    refetch();
    toast.info('Refreshing data...');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this outpatient record?')) {
      try {
        await deleteRecord(id).unwrap();
        toast.success('Outpatient record deleted successfully');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete record');
      }
    }
  };

  const columns = [
    {
      header: 'Patient',
      accessor: 'patient_name',
    },
    {
      header: 'Age Group',
      accessor: 'age_group',
    },
    {
      header: 'Marital Status',
      accessor: 'marital_status',
    },
    {
      header: 'Occupation',
      accessor: 'occupation',
    },
    {
      header: 'Education',
      accessor: 'education_level',
    },
    {
      header: 'Created',
      render: (row) => formatDate(row.created_at),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Link to={`/outpatient/${row.id}`}>
            <Button variant="ghost" size="sm">
              <FiEye />
            </Button>
          </Link>
          <Link to={`/outpatient/${row.id}/edit`}>
            <Button variant="ghost" size="sm">
              <FiEdit />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)}>
            <FiTrash2 className="text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Outpatient Records</h1>
          <p className="text-gray-600 mt-1">Manage demographic and social data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isFetching}>
            <FiRefreshCw className={`mr-2 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Link to="/outpatient/new">
            <Button>
              <FiPlus className="mr-2" /> New Record
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          title="Error Loading Records"
          message={error?.data?.message || 'Failed to load outpatient records. Please check your connection and try again.'}
        />
      )}

      <Card>
        <div className="mb-4">
          <div className="relative">
            <Input
              placeholder="Search outpatient records..."
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
              data={data?.data?.records || []}
              loading={isLoading}
              emptyMessage="No outpatient records found. Click 'New Record' to create one."
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

export default OutpatientPage;

