import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiDownload, FiUpload, FiArchive } from 'react-icons/fi';
import {
  useGetADLFileByIdQuery,
  useGetFileMovementHistoryQuery,
  useRetrieveFileMutation,
  useReturnFileMutation,
  useArchiveFileMutation,
} from '../../features/adl/adlApiSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, formatDateTime } from '../../utils/formatters';

const ADLFileDetails = () => {
  const { id } = useParams();

  const { data, isLoading } = useGetADLFileByIdQuery(id);
  const { data: movementsData } = useGetFileMovementHistoryQuery(id);
  const [retrieveFile] = useRetrieveFileMutation();
  const [returnFile] = useReturnFileMutation();
  const [archiveFile] = useArchiveFileMutation();

  const handleRetrieve = async () => {
    try {
      await retrieveFile(id).unwrap();
      toast.success('File retrieved successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to retrieve file');
    }
  };

  const handleReturn = async () => {
    try {
      await returnFile(id).unwrap();
      toast.success('File returned successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to return file');
    }
  };

  const handleArchive = async () => {
    if (window.confirm('Are you sure you want to archive this file?')) {
      try {
        await archiveFile(id).unwrap();
        toast.success('File archived successfully');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to archive file');
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-96" />;
  }

  const file = data?.data?.file;

  if (!file) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">ADL file not found</p>
        <Link to="/adl-files">
          <Button className="mt-4">Back to Additional Detail File</Button>
        </Link>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/adl-files">
            <Button variant="ghost" size="sm">
              <FiArrowLeft className="mr-2" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-mono">{file.adl_no}</h1>
            <p className="text-gray-600 mt-1">ADL File Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          {file.file_status === 'stored' && (
            <Button variant="primary" onClick={handleRetrieve}>
              <FiDownload className="mr-2" /> Retrieve File
            </Button>
          )}
          {file.file_status === 'retrieved' && (
            <Button variant="success" onClick={handleReturn}>
              <FiUpload className="mr-2" /> Return File
            </Button>
          )}
          {file.is_active && (
            <Button variant="outline" onClick={handleArchive}>
              <FiArchive className="mr-2" /> Archive
            </Button>
          )}
        </div>
      </div>

      {/* File Information */}
      <Card title="File Information">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">ADL Number</label>
            <p className="text-lg font-semibold font-mono">{file.adl_no}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Patient Name</label>
            <p className="text-lg">{file.patient_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">CR Number</label>
            <p className="text-lg font-semibold">{file.cr_no}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">PSY Number</label>
            <p className="text-lg">{file.psy_no}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">File Status</label>
            <Badge variant={getStatusVariant(file.file_status)} className="mt-1">
              {file.file_status}
            </Badge>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Active Status</label>
            <Badge variant={file.is_active ? 'success' : 'default'} className="mt-1">
              {file.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Created By</label>
            <p className="text-lg">{file.created_by_name} ({file.created_by_role})</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">File Created</label>
            <p className="text-lg">{formatDate(file.file_created_date)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Total Visits</label>
            <p className="text-lg font-semibold">{file.total_visits}</p>
          </div>
          {file.physical_file_location && (
            <div>
              <label className="text-sm font-medium text-gray-500">Physical Location</label>
              <p className="text-lg">{file.physical_file_location}</p>
            </div>
          )}
          {file.last_accessed_date && (
            <div>
              <label className="text-sm font-medium text-gray-500">Last Accessed</label>
              <p className="text-lg">{formatDate(file.last_accessed_date)}</p>
            </div>
          )}
          {file.last_accessed_by_name && (
            <div>
              <label className="text-sm font-medium text-gray-500">Last Accessed By</label>
              <p className="text-lg">{file.last_accessed_by_name}</p>
            </div>
          )}
        </div>

        {file.notes && (
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-500">Notes</label>
            <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.notes}</p>
          </div>
        )}
      </Card>

      {/* Movement History */}
      {movementsData?.data?.movements && movementsData.data.movements.length > 0 && (
        <Card title="File Movement History">
          <div className="space-y-4">
            {movementsData.data.movements.map((movement, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {movement.movement_type.charAt(0).toUpperCase() + movement.movement_type.slice(1)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        From: {movement.from_location} → To: {movement.to_location}
                      </p>
                      {movement.notes && (
                        <p className="text-sm text-gray-500 mt-1">{movement.notes}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{formatDateTime(movement.movement_date)}</p>
                      <p className="mt-1">By: {movement.moved_by_name}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Links */}
      <Card title="Related Records">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={`/patients/${file.patient_id}`}>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center cursor-pointer">
              <p className="font-medium">View Patient Record</p>
            </div>
          </Link>
          <Link to={`/clinical?patient_id=${file.patient_id}`}>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center cursor-pointer">
              <p className="font-medium">Clinical Records</p>
            </div>
          </Link>
          <Link to={`/clinical/new?patient_id=${file.patient_id}`}>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center cursor-pointer">
              <p className="font-medium">New Clinical Record</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ADLFileDetails;

