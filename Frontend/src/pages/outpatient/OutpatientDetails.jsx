import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useGetOutpatientRecordByIdQuery } from '../../features/outpatient/outpatientApiSlice';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';

const Row = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 last:border-b-0">
    <div className="text-gray-500 text-sm">{label}</div>
    <div className="col-span-2 text-gray-900">{value ?? '-'} </div>
  </div>
);

const OutpatientDetails = () => {
  const { id } = useParams();
  const { data, isLoading, isFetching, error } = useGetOutpatientRecordByIdQuery(id);

  const record = data?.data?.record;

  if (isLoading || isFetching) {
    return <LoadingSpinner className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Outpatient Record</h1>
          <p className="text-gray-600 mt-1">Detailed demographic and social information</p>
        </div>
        <Link to="/outpatient" className="inline-flex items-center text-primary-600 hover:underline">
          <FiArrowLeft className="mr-2" /> Back to list
        </Link>
      </div>

      {error && (
        <Card>
          <div className="p-4 text-red-600">{error?.data?.message || 'Failed to load record.'}</div>
        </Card>
      )}

      <Card title="Patient">
        <div className="p-4">
          <Row label="Patient Name" value={record?.patient_name} />
          <Row label="CR No" value={record?.cr_no} />
          <Row label="PSY No" value={record?.psy_no} />
          <Row label="Filled By" value={record?.filled_by_name} />
          <Row label="Created At" value={new Date(record?.created_at || '').toLocaleString() || '-'} />
        </div>
      </Card>

      <Card title="Demographic">
        <div className="p-4">
          <Row label="Age Group" value={record?.age_group} />
          <Row label="Marital Status" value={record?.marital_status} />
          <Row label="Year of Marriage" value={record?.year_of_marriage} />
          <Row label="Children" value={record?.no_of_children} />
          <Row label="Occupation" value={record?.occupation} />
          <Row label="Education Level" value={record?.education_level} />
          <Row label="Completed Years of Education" value={record?.completed_years_of_education} />
          <Row label="Patient Income" value={record?.patient_income} />
          <Row label="Family Income" value={record?.family_income} />
          <Row label="Religion" value={record?.religion} />
          <Row label="Family Type" value={record?.family_type} />
          <Row label="Locality" value={record?.locality} />
        </div>
      </Card>

      <Card title="Family Head">
        <div className="p-4">
          <Row label="Name" value={record?.head_name} />
          <Row label="Age" value={record?.head_age} />
          <Row label="Relationship" value={record?.head_relationship} />
          <Row label="Education" value={record?.head_education} />
          <Row label="Occupation" value={record?.head_occupation} />
          <Row label="Income" value={record?.head_income} />
        </div>
      </Card>

      <Card title="Addresses & Contact">
        <div className="p-4">
          <Row label="Present Address" value={record?.present_address} />
          <Row label="Permanent Address" value={record?.permanent_address} />
          <Row label="Local Address" value={record?.local_address} />
          <Row label="School/College/Office" value={record?.school_college_office} />
          <Row label="Contact Number" value={record?.contact_number} />
          <Row label="Distance from Hospital" value={record?.distance_from_hospital} />
          <Row label="Mobility" value={record?.mobility} />
          <Row label="Referred By" value={record?.referred_by} />
          <Row label="Exact Source" value={record?.exact_source} />
        </div>
      </Card>
    </div>
  );
};

export default OutpatientDetails;


