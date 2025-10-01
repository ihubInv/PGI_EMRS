import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiArrowLeft, FiFileText, FiFolder, FiClipboard } from 'react-icons/fi';
import {
  useGetPatientByIdQuery,
  useDeletePatientMutation,
} from '../../features/patients/patientsApiSlice';
import { useGetClinicalProformaByPatientIdQuery } from '../../features/clinical/clinicalApiSlice';
import { useGetADLFileByPatientIdQuery } from '../../features/adl/adlApiSlice';
import { useGetOutpatientRecordByPatientIdQuery } from '../../features/outpatient/outpatientApiSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: patientData, isLoading: patientLoading } = useGetPatientByIdQuery(id);
  const { data: clinicalData } = useGetClinicalProformaByPatientIdQuery(id);
  const { data: adlData } = useGetADLFileByPatientIdQuery(id);
  const { data: outpatientData } = useGetOutpatientRecordByPatientIdQuery(id);
  const [deletePatient, { isLoading: isDeleting }] = useDeletePatientMutation();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        await deletePatient(id).unwrap();
        toast.success('Patient deleted successfully');
        navigate('/patients');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete patient');
      }
    }
  };

  if (patientLoading) {
    return <LoadingSpinner size="lg" className="h-96" />;
  }

  const patient = patientData?.data?.patient;

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Patient not found</p>
        <Link to="/patients">
          <Button className="mt-4">Back to Patients</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/patients">
            <Button variant="ghost" size="sm">
              <FiArrowLeft className="mr-2" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
            <p className="text-gray-600 mt-1">Patient Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/patients/${id}/edit`}>
            <Button variant="outline">
              <FiEdit className="mr-2" /> Edit
            </Button>
          </Link>
          <Button variant="danger" onClick={handleDelete} loading={isDeleting}>
            <FiTrash2 className="mr-2" /> Delete
          </Button>
        </div>
      </div>

      {/* Patient Information */}
      <Card title="Patient Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">CR Number</label>
            <p className="text-lg font-semibold">{patient.cr_no}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">PSY Number</label>
            <p className="text-lg font-semibold">{patient.psy_no}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Name</label>
            <p className="text-lg">{patient.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Sex</label>
            <p className="text-lg">{patient.sex}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Age</label>
            <p className="text-lg">{patient.actual_age} years</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Assigned Room</label>
            <p className="text-lg">{patient.assigned_room || 'Not assigned'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Case Complexity</label>
            <Badge variant={patient.case_complexity === 'complex' ? 'warning' : 'success'}>
              {patient.case_complexity || 'simple'}
            </Badge>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">ADL File Status</label>
            <Badge variant={patient.has_adl_file ? 'success' : 'default'}>
              {patient.has_adl_file ? 'Has ADL File' : 'No ADL File'}
            </Badge>
          </div>
          {patient.adl_no && (
            <div>
              <label className="text-sm font-medium text-gray-500">ADL Number</label>
              <p className="text-lg font-semibold">{patient.adl_no}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-500">Registration Date</label>
            <p className="text-lg">{formatDate(patient.created_at)}</p>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clinical Records</p>
              <p className="text-3xl font-bold text-gray-900">
                {clinicalData?.data?.proformas?.length || 0}
              </p>
            </div>
            <FiFileText className="h-12 w-12 text-blue-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">ADL Files</p>
              <p className="text-3xl font-bold text-gray-900">
                {adlData?.data?.files?.length || 0}
              </p>
            </div>
            <FiFolder className="h-12 w-12 text-purple-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Outpatient Records</p>
              <p className="text-3xl font-bold text-gray-900">
                {outpatientData?.data?.record ? 1 : 0}
              </p>
            </div>
            <FiClipboard className="h-12 w-12 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={`/clinical/new?patient_id=${id}`}>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center cursor-pointer">
              <FiFileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">New Clinical Record</p>
            </div>
          </Link>

          <Link to={`/outpatient/new?patient_id=${id}`}>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center cursor-pointer">
              <FiClipboard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">New Outpatient Record</p>
            </div>
          </Link>

          {patient.has_adl_file && (
            <Link to={`/adl-files?patient_id=${id}`}>
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center cursor-pointer">
                <FiFolder className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="font-medium">View ADL Files</p>
              </div>
            </Link>
          )}
        </div>
      </Card>

      {/* Recent Clinical Records */}
      {clinicalData?.data?.proformas && clinicalData.data.proformas.length > 0 && (
        <Card title="Recent Clinical Records">
          <div className="space-y-3">
            {clinicalData.data.proformas.slice(0, 5).map((proforma) => (
              <Link
                key={proforma.id}
                to={`/clinical/${proforma.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{proforma.diagnosis || 'No diagnosis'}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Visit: {formatDate(proforma.visit_date)} • {proforma.visit_type}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={proforma.case_severity === 'severe' ? 'danger' : 'default'}>
                      {proforma.case_severity}
                    </Badge>
                    {proforma.doctor_decision === 'complex_case' && (
                      <Badge variant="warning">Complex Case</Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PatientDetails;

