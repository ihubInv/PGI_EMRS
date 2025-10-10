import { FiUser, FiUsers, FiBriefcase, FiDollarSign, FiMapPin, FiPhone, FiFileText, FiFolder, FiClipboard } from 'react-icons/fi';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { formatDate } from '../../utils/formatters';

const PatientDetailsView = ({ patient, formData, clinicalData, adlData, outpatientData }) => {
  return (
    <>
      {/* Patient Information */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <FiUser className="h-5 w-5 text-primary-600" />
            <span>Patient Information</span>
          </div>
        }
      >
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
            <label className="text-sm font-medium text-gray-500">Assigned Doctor</label>
            <p className="text-lg">
              {patient.assigned_doctor_name ? (
                <Badge variant="primary">{patient.assigned_doctor_name} ({patient.assigned_doctor_role})</Badge>
              ) : (
                'Not assigned'
              )}
            </p>
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

      {/* Demographic Information - Only show if exists */}
      {outpatientData?.data?.record && (
        <>
          {/* Personal Information */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <FiUser className="h-5 w-5 text-primary-600" />
                <span>Personal Information</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.age_group && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Age Group</label>
                  <p className="text-lg">{formData.age_group}</p>
                </div>
              )}
              {formData.marital_status && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Marital Status</label>
                  <p className="text-lg">{formData.marital_status}</p>
                </div>
              )}
              {formData.year_of_marriage && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Year of Marriage</label>
                  <p className="text-lg">{formData.year_of_marriage}</p>
                </div>
              )}
              {formData.no_of_children !== '' && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Number of Children</label>
                  <p className="text-lg">{formData.no_of_children}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Occupation & Education */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <FiBriefcase className="h-5 w-5 text-primary-600" />
                <span>Occupation & Education</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.occupation && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Occupation</label>
                  <p className="text-lg">{formData.occupation}</p>
                </div>
              )}
              {formData.actual_occupation && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Actual Occupation</label>
                  <p className="text-lg">{formData.actual_occupation}</p>
                </div>
              )}
              {formData.education_level && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Education Level</label>
                  <p className="text-lg">{formData.education_level}</p>
                </div>
              )}
              {formData.completed_years_of_education && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Years of Education</label>
                  <p className="text-lg">{formData.completed_years_of_education}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Financial Information */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <FiDollarSign className="h-5 w-5 text-primary-600" />
                <span>Financial Information</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.patient_income && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Patient Income</label>
                  <p className="text-lg">₹{formData.patient_income}</p>
                </div>
              )}
              {formData.family_income && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Family Income</label>
                  <p className="text-lg">₹{formData.family_income}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Family Information */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <FiUsers className="h-5 w-5 text-primary-600" />
                <span>Family Information</span>
              </div>
            }
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.religion && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Religion</label>
                    <p className="text-lg">{formData.religion}</p>
                  </div>
                )}
                {formData.family_type && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Family Type</label>
                    <p className="text-lg">{formData.family_type}</p>
                  </div>
                )}
                {formData.locality && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Locality</label>
                    <p className="text-lg">{formData.locality}</p>
                  </div>
                )}
              </div>
              {formData.head_name && (
                <>
                  <h4 className="font-medium text-gray-900 mt-4">Head of Family</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-lg">{formData.head_name}</p>
                    </div>
                    {formData.head_age && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Age</label>
                        <p className="text-lg">{formData.head_age}</p>
                      </div>
                    )}
                    {formData.head_relationship && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Relationship</label>
                        <p className="text-lg">{formData.head_relationship}</p>
                      </div>
                    )}
                    {formData.head_education && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Education</label>
                        <p className="text-lg">{formData.head_education}</p>
                      </div>
                    )}
                    {formData.head_occupation && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Occupation</label>
                        <p className="text-lg">{formData.head_occupation}</p>
                      </div>
                    )}
                    {formData.head_income && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Income</label>
                        <p className="text-lg">₹{formData.head_income}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Referral & Mobility */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <FiMapPin className="h-5 w-5 text-primary-600" />
                <span>Referral & Mobility</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.distance_from_hospital && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Distance from Hospital</label>
                  <p className="text-lg">{formData.distance_from_hospital}</p>
                </div>
              )}
              {formData.mobility && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Mobility</label>
                  <p className="text-lg">{formData.mobility}</p>
                </div>
              )}
              {formData.referred_by && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Referred By</label>
                  <p className="text-lg">{formData.referred_by}</p>
                </div>
              )}
              {formData.exact_source && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Exact Source</label>
                  <p className="text-lg">{formData.exact_source}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Contact Information */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <FiPhone className="h-5 w-5 text-primary-600" />
                <span>Contact Information</span>
              </div>
            }
          >
            <div className="space-y-4">
              {formData.present_address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Present Address</label>
                  <p className="text-lg">{formData.present_address}</p>
                </div>
              )}
              {formData.permanent_address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Permanent Address</label>
                  <p className="text-lg">{formData.permanent_address}</p>
                </div>
              )}
              {formData.local_address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Local Address</label>
                  <p className="text-lg">{formData.local_address}</p>
                </div>
              )}
              {formData.school_college_office && (
                <div>
                  <label className="text-sm font-medium text-gray-500">School/College/Office</label>
                  <p className="text-lg">{formData.school_college_office}</p>
                </div>
              )}
              {formData.contact_number && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Number</label>
                  <p className="text-lg">{formData.contact_number}</p>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </>
  );
};

export default PatientDetailsView;
