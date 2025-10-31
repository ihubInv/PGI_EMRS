import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiArrowLeft, FiPrinter } from 'react-icons/fi';
import {
  useGetClinicalProformaByIdQuery,
  useDeleteClinicalProformaMutation,
} from '../../features/clinical/clinicalApiSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

const ClinicalProformaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTab = searchParams.get('returnTab'); // Get returnTab from URL

  const { data, isLoading } = useGetClinicalProformaByIdQuery(id);
  const [deleteProforma, { isLoading: isDeleting }] = useDeleteClinicalProformaMutation();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this clinical proforma?')) {
      try {
        await deleteProforma(id).unwrap();
        toast.success('Clinical proforma deleted successfully');
        // Navigate back to Today Patients with preserved tab if returnTab exists
        if (returnTab) {
          navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
        } else {
          navigate('/clinical');
        }
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete proforma');
      }
    }
  };

  const handleBack = () => {
    // Navigate back to Today Patients with preserved tab if returnTab exists
    if (returnTab) {
      navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
    } else {
      navigate('/clinical');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-96" />;
  }

  const proforma = data?.data?.proforma;

  if (!proforma) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Clinical proforma not found</p>
        <Button 
          className="mt-4" 
          onClick={() => {
            const returnTab = new URLSearchParams(window.location.search).get('returnTab');
            if (returnTab) {
              navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
            } else {
              navigate('/clinical');
            }
          }}
        >
          Back to Clinical Records
        </Button>
      </div>
    );
  }

  const InfoSection = ({ title, data }) => (
    <Card title={title} className="mb-6">
      <div className="space-y-4">
        {Object.entries(data).map(([key, value]) => (
          value && (
            <div key={key}>
              <label className="text-sm font-medium text-gray-500 capitalize">
                {key.replace(/_/g, ' ')}
              </label>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{value}</p>
            </div>
          )
        ))}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <FiArrowLeft className="mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clinical Proforma</h1>
            <p className="text-gray-600 mt-1">View clinical assessment details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <FiPrinter className="mr-2" /> Print
          </Button>
          <Link to={`/clinical/${id}/edit`}>
            <Button variant="outline">
              <FiEdit className="mr-2" /> Edit
            </Button>
          </Link>
          <Button variant="danger" onClick={handleDelete} loading={isDeleting}>
            <FiTrash2 className="mr-2" /> Delete
          </Button>
        </div>
      </div>

      {/* Patient & Visit Info */}
      <Card title="Patient & Visit Information">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Patient Name</label>
            <p className="text-lg font-semibold">{proforma.patient_name || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Visit Date</label>
            <p className="text-lg">{formatDate(proforma.visit_date)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Visit Type</label>
            <Badge variant={proforma.visit_type === 'first_visit' ? 'primary' : 'default'}>
              {proforma.visit_type === 'first_visit' ? 'First Visit' : 'Follow Up'}
            </Badge>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Room Number</label>
            <p className="text-lg">{proforma.room_no || 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Doctor</label>
            <p className="text-lg">{proforma.doctor_name || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Created On</label>
            <p className="text-lg">{formatDate(proforma.created_at)}</p>
          </div>
        </div>
      </Card>

      {/* History */}
      <InfoSection
        title="History of Present Illness"
        data={{
          'Onset & Duration': proforma.onset_duration,
          'Course': proforma.course,
          'Precipitating Factor': proforma.precipitating_factor,
          'Illness Duration': proforma.illness_duration,
          'Current Episode Since': proforma.current_episode_since ? formatDate(proforma.current_episode_since) : null,
        }}
      />

      {/* MSE */}
      <InfoSection
        title="Mental State Examination"
        data={{
          'Behaviour': proforma.mse_behaviour,
          'Affect': proforma.mse_affect,
          'Thought': proforma.mse_thought,
          'Delusions': proforma.mse_delusions,
          'Perception': proforma.mse_perception,
          'Cognitive Function': proforma.mse_cognitive_function,
        }}
      />

      {/* Additional History */}
      <InfoSection
        title="Additional History"
        data={{
          'Bio-Functions': proforma.bio_functions,
          'Substance Use': proforma.substance_use,
          'Past History': proforma.past_history,
          'Family History': proforma.family_history,
          'Associated Medical/Surgical': proforma.associated_medical_surgical,
        }}
      />

      {/* Physical Examination */}
      {proforma.gpe && (
        <Card title="General Physical Examination">
          <p className="text-gray-900 whitespace-pre-wrap">{proforma.gpe}</p>
        </Card>
      )}

      {/* Diagnosis & Management */}
      <Card title="Diagnosis & Management">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Diagnosis</label>
              <p className="text-lg font-semibold mt-1">{proforma.diagnosis}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">ICD Code</label>
              <p className="text-lg mt-1">{proforma.icd_code || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Case Severity</label>
              <div className="mt-1">
                <Badge variant={proforma.case_severity === 'severe' ? 'danger' : 'warning'}>
                  {proforma.case_severity}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Doctor Decision</label>
              <div className="mt-1">
                <Badge variant={proforma.doctor_decision === 'complex_case' ? 'warning' : 'success'}>
                  {proforma.doctor_decision === 'complex_case' ? 'Complex Case' : 'Simple Case'}
                </Badge>
              </div>
            </div>
          </div>

          {proforma.treatment_prescribed && (
            <div>
              <label className="text-sm font-medium text-gray-500">Treatment Prescribed</label>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{proforma.treatment_prescribed}</p>
            </div>
          )}

          {proforma.disposal && (
            <div>
              <label className="text-sm font-medium text-gray-500">Disposal</label>
              <p className="text-gray-900 mt-1">{proforma.disposal}</p>
            </div>
          )}

          {proforma.referred_to && (
            <div>
              <label className="text-sm font-medium text-gray-500">Referred To</label>
              <p className="text-gray-900 mt-1">{proforma.referred_to}</p>
            </div>
          )}
        </div>
      </Card>

      {/* ADL File Requirements */}
      {proforma.requires_adl_file && (
        <Card title="ADL File Requirements">
          <div className="space-y-4">
            <div>
              <Badge variant="warning">Requires ADL File</Badge>
            </div>
            {proforma.adl_reasoning && (
              <div>
                <label className="text-sm font-medium text-gray-500">Reasoning</label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">{proforma.adl_reasoning}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ClinicalProformaDetails;

