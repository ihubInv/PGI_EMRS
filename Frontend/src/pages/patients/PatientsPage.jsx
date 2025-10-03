import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { useGetAllPatientsQuery, useDeletePatientMutation } from '../../features/patients/patientsApiSlice';
import { selectCurrentUser } from '../../features/auth/authSlice';
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

  const { data, isLoading, isFetching, refetch } = useGetAllPatientsQuery({ page, limit }, {
    pollingInterval: 30000, // Auto-refresh every 30 seconds
  });
  const [deletePatient] = useDeletePatientMutation();

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

  const columns = [
    {
      header: 'CR No',
      accessor: 'cr_no',
    },
    {
      header: 'PSY No',
      accessor: 'psy_no',
    },
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Sex',
      accessor: 'sex',
    },
    {
      header: 'Age',
      accessor: 'actual_age',
    },
    {
      header: 'Complexity',
      render: (row) => (
        <Badge variant={row.case_complexity === 'complex' ? 'warning' : 'success'}>
          {row.case_complexity || 'simple'}
        </Badge>
      ),
    },
    {
      header: 'ADL File',
      render: (row) => (
        <Badge variant={row.has_adl_file ? 'success' : 'default'}>
          {row.has_adl_file ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Link to={`/patients/${row.id}`}>
            <Button variant="ghost" size="sm">
              <FiEye />
            </Button>
          </Link>
          <Link to={`/patients/${row.id}/edit`}>
            <Button variant="ghost" size="sm">
              <FiEdit />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id)}
          >
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
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'MWO' 
              ? 'View patient records (Create patients via Outpatient Records)' 
              : 'Manage patient records'}
          </p>
        </div>
        {user?.role !== 'MWO' && (
          <Link to="/patients/new">
            <Button>
              <FiPlus className="mr-2" /> Add Patient
            </Button>
          </Link>
        )}
      </div>

      {user?.role === 'MWO' && (
        <Alert
          type="info"
          message="To register a new patient, please go to Outpatient Records → New Record"
        />
      )}

      <Card>
        <div className="mb-4">
          <div className="relative">
            <Input
              placeholder="Search patients..."
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
              data={data?.data?.patients || []}
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

export default PatientsPage;

