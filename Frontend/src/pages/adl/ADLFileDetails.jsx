import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiDownload, FiUpload, FiArchive, FiUser, FiFileText, FiActivity } from 'react-icons/fi';
import {
  useGetADLFileByIdQuery,
  useGetFileMovementHistoryQuery,
  useRetrieveFileMutation,
  useReturnFileMutation,
  useArchiveFileMutation,
} from '../../features/adl/adlApiSlice';
import { useGetPatientByIdQuery } from '../../features/patients/patientsApiSlice';
import { useGetClinicalProformaByIdQuery } from '../../features/clinical/clinicalApiSlice';
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
  
  // Fetch full patient details for complex case
  const file = data?.data?.file;
  const { data: patientData, isLoading: patientLoading } = useGetPatientByIdQuery(
    file?.patient_id,
    { skip: !file?.patient_id }
  );
  
  // Fetch the clinical proforma that created this ADL file (complex case)
  const { data: clinicalProformaData, isLoading: clinicalLoading } = useGetClinicalProformaByIdQuery(
    file?.clinical_proforma_id,
    { skip: !file?.clinical_proforma_id }
  );

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
  
  const patient = patientData?.data?.patient;
  const clinicalProforma = clinicalProformaData?.data?.proforma;
  const isComplexCase = file?.clinical_proforma_id && clinicalProforma;

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

      {/* Complex Case - Patient Details */}
      {isComplexCase && patient && (
        <>
          <Card title="Complex Case - Patient Information" className="border-2 border-red-200 bg-red-50/30">
            <div className="mb-4 flex items-center gap-2">
              <FiActivity className="w-5 h-5 text-red-600" />
              <Badge variant="danger" className="text-sm font-semibold">
                Complex Case - Full Patient Details
              </Badge>
            </div>
            
            {patientLoading ? (
              <LoadingSpinner className="h-32" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-lg font-semibold">{patient.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Sex</label>
                  <p className="text-lg">{patient.sex}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Age</label>
                  <p className="text-lg">{patient.actual_age}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Marital Status</label>
                  <p className="text-lg">{patient.marital_status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Occupation</label>
                  <p className="text-lg">{patient.occupation || patient.actual_occupation || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Education</label>
                  <p className="text-lg">{patient.education_level || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Number</label>
                  <p className="text-lg">{patient.contact_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Present Address</label>
                  <p className="text-lg text-gray-700">
                    {patient.present_address_line_1 || patient.present_address || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Religion</label>
                  <p className="text-lg">{patient.religion || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Family Type</label>
                  <p className="text-lg">{patient.family_type || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Locality</label>
                  <p className="text-lg">{patient.locality || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Patient Income</label>
                  <p className="text-lg">{patient.patient_income || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Family Income</label>
                  <p className="text-lg">{patient.family_income || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mobility</label>
                  <p className="text-lg">{patient.mobility || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Referred By</label>
                  <p className="text-lg">{patient.referred_by || 'N/A'}</p>
                </div>
                {patient.head_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Head of Family</label>
                    <p className="text-lg">{patient.head_name} ({patient.head_relationship})</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Complex Case - Clinical Proforma Details */}
          {clinicalProforma && (
            <Card title="Complex Case - Clinical Proforma Details" className="border-2 border-blue-200 bg-blue-50/30">
              {clinicalLoading ? (
                <LoadingSpinner className="h-32" />
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Visit Date</label>
                      <p className="text-lg font-semibold">{formatDate(clinicalProforma.visit_date)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Visit Type</label>
                      <Badge variant={clinicalProforma.visit_type === 'first_visit' ? 'primary' : 'info'}>
                        {clinicalProforma.visit_type === 'first_visit' ? 'First Visit' : 'Follow Up'}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Case Severity</label>
                      <Badge variant={
                        clinicalProforma.case_severity === 'critical' ? 'danger' :
                        clinicalProforma.case_severity === 'severe' ? 'warning' :
                        clinicalProforma.case_severity === 'moderate' ? 'info' : 'success'
                      }>
                        {clinicalProforma.case_severity || 'N/A'}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Room Number</label>
                      <p className="text-lg">{clinicalProforma.room_no || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Assigned Doctor</label>
                      <p className="text-lg">{clinicalProforma.assigned_doctor || clinicalProforma.doctor_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">ICD Code</label>
                      <p className="text-lg font-mono">{clinicalProforma.icd_code || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {clinicalProforma.diagnosis && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Diagnosis</label>
                      <p className="text-gray-900 mt-1 whitespace-pre-wrap">{clinicalProforma.diagnosis}</p>
                    </div>
                  )}
                  
                  {clinicalProforma.adl_reasoning && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">ADL Reasoning</label>
                      <p className="text-gray-900 mt-1 whitespace-pre-wrap bg-yellow-50 p-3 rounded border border-yellow-200">
                        {clinicalProforma.adl_reasoning}
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <Link to={`/clinical/${clinicalProforma.id}`}>
                      <Button variant="outline" className="w-full">
                        <FiFileText className="mr-2" /> View Full Clinical Proforma
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Complex Case - Comprehensive Clinical Data (from ADL File) */}
          <Card title="Complex Case - Comprehensive Clinical Data" className="border-2 border-green-200 bg-green-50/30">
            <div className="space-y-6">
              {/* History of Present Illness - Expanded */}
              {(file.history_narrative || file.history_specific_enquiry || file.history_drug_intake) && (
                <Card title="History of Present Illness (Expanded)">
                  <div className="space-y-4">
                    {file.history_narrative && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Narrative</label>
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.history_narrative}</p>
                      </div>
                    )}
                    {file.history_specific_enquiry && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Specific Enquiry</label>
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.history_specific_enquiry}</p>
                      </div>
                    )}
                    {file.history_drug_intake && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Drug Intake</label>
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.history_drug_intake}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {file.history_treatment_place && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Treatment Place</label>
                          <p className="text-gray-900 mt-1">{file.history_treatment_place}</p>
                        </div>
                      )}
                      {file.history_treatment_dates && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Treatment Dates</label>
                          <p className="text-gray-900 mt-1">{file.history_treatment_dates}</p>
                        </div>
                      )}
                      {file.history_treatment_drugs && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Treatment Drugs</label>
                          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.history_treatment_drugs}</p>
                        </div>
                      )}
                      {file.history_treatment_response && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Treatment Response</label>
                          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.history_treatment_response}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Informants */}
              {file.informants && Array.isArray(file.informants) && file.informants.length > 0 && (
                <Card title="Informants">
                  <div className="space-y-3">
                    {file.informants.map((informant, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded">
                        <p className="font-medium">{informant.name || `Informant ${index + 1}`}</p>
                        {informant.relation && <p className="text-sm text-gray-600">Relation: {informant.relation}</p>}
                        {informant.age && <p className="text-sm text-gray-600">Age: {informant.age}</p>}
                        {informant.address && <p className="text-sm text-gray-600">Address: {informant.address}</p>}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Past History - Detailed */}
              {(file.past_history_medical || file.past_history_psychiatric_dates || file.past_history_psychiatric_diagnosis) && (
                <Card title="Past History (Detailed)">
                  <div className="space-y-4">
                    {file.past_history_medical && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Medical History</label>
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.past_history_medical}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {file.past_history_psychiatric_dates && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Psychiatric Dates</label>
                          <p className="text-gray-900 mt-1">{file.past_history_psychiatric_dates}</p>
                        </div>
                      )}
                      {file.past_history_psychiatric_diagnosis && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Psychiatric Diagnosis</label>
                          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.past_history_psychiatric_diagnosis}</p>
                        </div>
                      )}
                      {file.past_history_psychiatric_treatment && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Psychiatric Treatment</label>
                          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.past_history_psychiatric_treatment}</p>
                        </div>
                      )}
                      {file.past_history_psychiatric_interim && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Interim Period</label>
                          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.past_history_psychiatric_interim}</p>
                        </div>
                      )}
                    </div>
                    {file.past_history_psychiatric_recovery && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Recovery</label>
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.past_history_psychiatric_recovery}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Family History - Detailed */}
              {(file.family_history_father_age || file.family_history_mother_age) && (
                <Card title="Family History (Detailed)">
                  <div className="space-y-6">
                    {/* Father's History */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Father's History</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {file.family_history_father_age && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Age</label>
                            <p className="text-gray-900 mt-1">{file.family_history_father_age}</p>
                          </div>
                        )}
                        {file.family_history_father_education && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Education</label>
                            <p className="text-gray-900 mt-1">{file.family_history_father_education}</p>
                          </div>
                        )}
                        {file.family_history_father_occupation && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Occupation</label>
                            <p className="text-gray-900 mt-1">{file.family_history_father_occupation}</p>
                          </div>
                        )}
                        {file.family_history_father_personality && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Personality</label>
                            <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.family_history_father_personality}</p>
                          </div>
                        )}
                        {file.family_history_father_deceased !== undefined && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Deceased</label>
                            <p className="text-gray-900 mt-1">{file.family_history_father_deceased ? 'Yes' : 'No'}</p>
                          </div>
                        )}
                        {file.family_history_father_deceased && file.family_history_father_death_age && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Death Age</label>
                            <p className="text-gray-900 mt-1">{file.family_history_father_death_age}</p>
                          </div>
                        )}
                        {file.family_history_father_deceased && file.family_history_father_death_date && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Death Date</label>
                            <p className="text-gray-900 mt-1">{formatDate(file.family_history_father_death_date)}</p>
                          </div>
                        )}
                        {file.family_history_father_deceased && file.family_history_father_death_cause && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Death Cause</label>
                            <p className="text-gray-900 mt-1">{file.family_history_father_death_cause}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mother's History */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Mother's History</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {file.family_history_mother_age && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Age</label>
                            <p className="text-gray-900 mt-1">{file.family_history_mother_age}</p>
                          </div>
                        )}
                        {file.family_history_mother_education && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Education</label>
                            <p className="text-gray-900 mt-1">{file.family_history_mother_education}</p>
                          </div>
                        )}
                        {file.family_history_mother_occupation && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Occupation</label>
                            <p className="text-gray-900 mt-1">{file.family_history_mother_occupation}</p>
                          </div>
                        )}
                        {file.family_history_mother_personality && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Personality</label>
                            <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.family_history_mother_personality}</p>
                          </div>
                        )}
                        {file.family_history_mother_deceased !== undefined && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Deceased</label>
                            <p className="text-gray-900 mt-1">{file.family_history_mother_deceased ? 'Yes' : 'No'}</p>
                          </div>
                        )}
                        {file.family_history_mother_deceased && file.family_history_mother_death_age && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Death Age</label>
                            <p className="text-gray-900 mt-1">{file.family_history_mother_death_age}</p>
                          </div>
                        )}
                        {file.family_history_mother_deceased && file.family_history_mother_death_date && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Death Date</label>
                            <p className="text-gray-900 mt-1">{formatDate(file.family_history_mother_death_date)}</p>
                          </div>
                        )}
                        {file.family_history_mother_deceased && file.family_history_mother_death_cause && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Death Cause</label>
                            <p className="text-gray-900 mt-1">{file.family_history_mother_death_cause}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Siblings */}
                    {file.family_history_siblings && Array.isArray(file.family_history_siblings) && file.family_history_siblings.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Siblings</h4>
                        <div className="space-y-2">
                          {file.family_history_siblings.map((sibling, index) => (
                            <div key={index} className="p-3 border border-gray-200 rounded">
                              <p className="font-medium">{sibling.name || `Sibling ${index + 1}`}</p>
                              {sibling.age && <p className="text-sm text-gray-600">Age: {sibling.age}</p>}
                              {sibling.relation && <p className="text-sm text-gray-600">Relation: {sibling.relation}</p>}
                              {sibling.notes && <p className="text-sm text-gray-600">{sibling.notes}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Mental Status Examination - Expanded */}
              {(file.mse_general_demeanour || file.mse_affect_subjective || file.mse_thought_flow || file.mse_cognitive_consciousness) && (
                <Card title="Mental Status Examination (Expanded)">
                  <div className="space-y-4">
                    {/* General */}
                    {(file.mse_general_demeanour || file.mse_general_tidy || file.mse_general_awareness || file.mse_general_cooperation) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">General</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {file.mse_general_demeanour && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Demeanour</label>
                              <p className="text-gray-900 mt-1">{file.mse_general_demeanour}</p>
                            </div>
                          )}
                          {file.mse_general_tidy && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Tidy</label>
                              <p className="text-gray-900 mt-1">{file.mse_general_tidy}</p>
                            </div>
                          )}
                          {file.mse_general_awareness && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Awareness</label>
                              <p className="text-gray-900 mt-1">{file.mse_general_awareness}</p>
                            </div>
                          )}
                          {file.mse_general_cooperation && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Cooperation</label>
                              <p className="text-gray-900 mt-1">{file.mse_general_cooperation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Affect */}
                    {(file.mse_affect_subjective || file.mse_affect_tone || file.mse_affect_resting || file.mse_affect_fluctuation) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Affect</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {file.mse_affect_subjective && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Subjective</label>
                              <p className="text-gray-900 mt-1">{file.mse_affect_subjective}</p>
                            </div>
                          )}
                          {file.mse_affect_tone && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Tone</label>
                              <p className="text-gray-900 mt-1">{file.mse_affect_tone}</p>
                            </div>
                          )}
                          {file.mse_affect_resting && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Resting</label>
                              <p className="text-gray-900 mt-1">{file.mse_affect_resting}</p>
                            </div>
                          )}
                          {file.mse_affect_fluctuation && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Fluctuation</label>
                              <p className="text-gray-900 mt-1">{file.mse_affect_fluctuation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Thought */}
                    {(file.mse_thought_flow || file.mse_thought_form || file.mse_thought_content) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Thought</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {file.mse_thought_flow && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Flow</label>
                              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.mse_thought_flow}</p>
                            </div>
                          )}
                          {file.mse_thought_form && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Form</label>
                              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.mse_thought_form}</p>
                            </div>
                          )}
                          {file.mse_thought_content && (
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium text-gray-500">Content</label>
                              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.mse_thought_content}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cognitive */}
                    {(file.mse_cognitive_consciousness || file.mse_cognitive_orientation_time || file.mse_cognitive_memory_immediate) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Cognitive Function</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {file.mse_cognitive_consciousness && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Consciousness</label>
                              <p className="text-gray-900 mt-1">{file.mse_cognitive_consciousness}</p>
                            </div>
                          )}
                          {file.mse_cognitive_orientation_time && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Orientation - Time</label>
                              <p className="text-gray-900 mt-1">{file.mse_cognitive_orientation_time}</p>
                            </div>
                          )}
                          {file.mse_cognitive_orientation_place && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Orientation - Place</label>
                              <p className="text-gray-900 mt-1">{file.mse_cognitive_orientation_place}</p>
                            </div>
                          )}
                          {file.mse_cognitive_orientation_person && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Orientation - Person</label>
                              <p className="text-gray-900 mt-1">{file.mse_cognitive_orientation_person}</p>
                            </div>
                          )}
                          {file.mse_cognitive_memory_immediate && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Memory - Immediate</label>
                              <p className="text-gray-900 mt-1">{file.mse_cognitive_memory_immediate}</p>
                            </div>
                          )}
                          {file.mse_cognitive_memory_recent && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Memory - Recent</label>
                              <p className="text-gray-900 mt-1">{file.mse_cognitive_memory_recent}</p>
                            </div>
                          )}
                          {file.mse_cognitive_memory_remote && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Memory - Remote</label>
                              <p className="text-gray-900 mt-1">{file.mse_cognitive_memory_remote}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Insight */}
                    {(file.mse_insight_understanding || file.mse_insight_judgement) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Insight</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {file.mse_insight_understanding && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Understanding</label>
                              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.mse_insight_understanding}</p>
                            </div>
                          )}
                          {file.mse_insight_judgement && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Judgement</label>
                              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.mse_insight_judgement}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Physical Examination - Comprehensive */}
              {(file.physical_appearance || file.physical_pulse || file.physical_bp || file.physical_height) && (
                <Card title="Physical Examination (Comprehensive)">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {file.physical_appearance && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Appearance</label>
                          <p className="text-gray-900 mt-1">{file.physical_appearance}</p>
                        </div>
                      )}
                      {file.physical_body_build && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Body Build</label>
                          <p className="text-gray-900 mt-1">{file.physical_body_build}</p>
                        </div>
                      )}
                      {file.physical_pulse && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Pulse</label>
                          <p className="text-gray-900 mt-1">{file.physical_pulse}</p>
                        </div>
                      )}
                      {file.physical_bp && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Blood Pressure</label>
                          <p className="text-gray-900 mt-1">{file.physical_bp}</p>
                        </div>
                      )}
                      {file.physical_height && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Height</label>
                          <p className="text-gray-900 mt-1">{file.physical_height}</p>
                        </div>
                      )}
                      {file.physical_weight && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Weight</label>
                          <p className="text-gray-900 mt-1">{file.physical_weight}</p>
                        </div>
                      )}
                    </div>
                    
                    {(file.physical_cvs_apex || file.physical_cvs_heart_sounds) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Cardiovascular System</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {file.physical_cvs_apex && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Apex</label>
                              <p className="text-gray-900 mt-1">{file.physical_cvs_apex}</p>
                            </div>
                          )}
                          {file.physical_cvs_regularity && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Regularity</label>
                              <p className="text-gray-900 mt-1">{file.physical_cvs_regularity}</p>
                            </div>
                          )}
                          {file.physical_cvs_heart_sounds && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Heart Sounds</label>
                              <p className="text-gray-900 mt-1">{file.physical_cvs_heart_sounds}</p>
                            </div>
                          )}
                          {file.physical_cvs_murmurs && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Murmurs</label>
                              <p className="text-gray-900 mt-1">{file.physical_cvs_murmurs}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {(file.physical_cns_cranial || file.physical_cns_motor_sensory) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Central Nervous System</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {file.physical_cns_cranial && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Cranial Nerves</label>
                              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.physical_cns_cranial}</p>
                            </div>
                          )}
                          {file.physical_cns_motor_sensory && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Motor & Sensory</label>
                              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.physical_cns_motor_sensory}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Provisional Diagnosis and Treatment Plan */}
              {(file.provisional_diagnosis || file.treatment_plan) && (
                <Card title="Provisional Diagnosis and Treatment Plan" className="border-2 border-blue-200 bg-blue-50/30">
                  <div className="space-y-4">
                    {file.provisional_diagnosis && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Provisional Diagnosis</label>
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.provisional_diagnosis}</p>
                      </div>
                    )}
                    {file.treatment_plan && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Treatment Plan</label>
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{file.treatment_plan}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Comments of the Consultant */}
              {file.consultant_comments && (
                <Card title="Comments of the Consultant" className="border-2 border-purple-200 bg-purple-50/30">
                  <p className="text-gray-900 whitespace-pre-wrap">{file.consultant_comments}</p>
                </Card>
              )}
            </div>
          </Card>
        </>
      )}

      {/* Quick Links */}
      <Card title="Related Records">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={`/patients/${file.patient_id}`}>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center cursor-pointer">
              <FiUser className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <p className="font-medium">View Patient Record</p>
            </div>
          </Link>
          <Link to={`/clinical?patient_id=${file.patient_id}`}>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center cursor-pointer">
              <FiFileText className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <p className="font-medium">Clinical Records</p>
            </div>
          </Link>
          <Link to={`/clinical/new?patient_id=${file.patient_id}`}>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center cursor-pointer">
              <FiActivity className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <p className="font-medium">New Clinical Record</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ADLFileDetails;

