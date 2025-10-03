import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import {
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
} from '../../features/users/usersApiSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { formatDate } from '../../utils/formatters';

const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const limit = 10;

  const { data, isLoading, isFetching, refetch } = useGetAllUsersQuery({ page, limit }, {
    pollingInterval: 30000, // Auto-refresh every 30 seconds for real-time data
  });
  const [deleteUser] = useDeleteUserMutation();
  const [activateUser] = useActivateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id).unwrap();
        toast.success('User deleted successfully');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateUser(id).unwrap();
      toast.success('User activated successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to activate user');
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await deactivateUser(id).unwrap();
        toast.success('User deactivated successfully');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to deactivate user');
      }
    }
  };

  const getRoleBadgeVariant = (role) => {
    const map = {
      Admin: 'danger',
      SR: 'primary',
      JR: 'info',
      MWO: 'success',
    };
    return map[role] || 'default';
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Role',
      render: (row) => (
        <Badge variant={getRoleBadgeVariant(row.role)}>
          {row.role}
        </Badge>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={row.is_active ? 'success' : 'default'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: '2FA',
      render: (row) => (
        <Badge variant={row.two_factor_enabled ? 'success' : 'default'}>
          {row.two_factor_enabled ? 'Enabled' : 'Disabled'}
        </Badge>
      ),
    },
    {
      header: 'Last Login',
      render: (row) => row.last_login ? formatDate(row.last_login) : 'Never',
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Link to={`/users/${row.id}/edit`}>
            <Button variant="ghost" size="sm">
              <FiEdit />
            </Button>
          </Link>
          {row.is_active ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeactivate(row.id)}
              title="Deactivate"
            >
              <FiX className="text-red-500" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActivate(row.id)}
              title="Activate"
            >
              <FiCheck className="text-green-500" />
            </Button>
          )}
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and permissions</p>
        </div>
        <Link to="/users/new">
          <Button>
            <FiPlus className="mr-2" /> Add User
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['Admin', 'SR', 'JR', 'MWO'].map((role) => (
          <Card key={role}>
            <div className="text-center">
              <p className="text-sm text-gray-600">{role}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {data?.data?.users?.filter(u => u.role === role).length || 0}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-4">
          <div className="relative">
            <Input
              placeholder="Search users..."
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
              data={data?.data?.users || []}
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

export default UsersPage;

