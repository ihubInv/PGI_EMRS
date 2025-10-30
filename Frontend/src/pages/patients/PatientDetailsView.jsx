import { 
  FiUser, FiUsers, FiBriefcase, FiDollarSign, FiMapPin, FiPhone, FiFileText, 
  FiFolder, FiClipboard, FiCalendar, FiHome, FiActivity, FiHeart, FiClock, 
  FiShield, FiTrendingUp, FiLayers, FiHash, FiGlobe, FiEdit3, FiBookOpen,
  FiNavigation, FiTruck, FiMail, FiUserCheck, FiStar, FiInfo
} from 'react-icons/fi';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { formatDate } from '../../utils/formatters';
import { 
  getSexLabel, getMaritalStatusLabel, getFamilyTypeLabel, getLocalityLabel, 
  getReligionLabel, getAgeGroupLabel, getOccupationLabel, getEducationLabel, 
  getMobilityLabel, getReferredByLabel, getFileStatusLabel, getCaseSeverityLabel,
  formatAddress, formatCurrency, formatDateTime
} from '../../utils/enumMappings';

const PatientDetailsView = ({ patient, formData, clinicalData, adlData, outpatientData }) => {
  return (
    <div className="space-y-8">
      {/* Patient Information */}
      <Card
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FiUser className="h-6 w-6 text-primary-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">Patient Information</span>
          </div>
        }
        className="shadow-xl border-0 bg-white/80 backdrop-blur-sm"
      >
        <div className="space-y-8">
          {/* Basic Information Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiFileText className="w-4 h-4 text-blue-600" />
                </div>
                <label className="text-sm font-semibold text-gray-700">CR Number</label>
              </div>
              <p className="text-xl font-bold text-gray-900">{patient.cr_no || 'N/A'}</p>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiFileText className="w-4 h-4 text-orange-600" />
                </div>
                <label className="text-sm font-semibold text-gray-700">PSY Number</label>
              </div>
              <p className="text-xl font-bold text-gray-900">{patient.psy_no || 'N/A'}</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiHeart className="w-4 h-4 text-green-600" />
                </div>
                <label className="text-sm font-semibold text-gray-700">Name</label>
              </div>
              <p className="text-xl font-bold text-gray-900">{patient.name}</p>
            </div>
          </div>

          {/* Personal Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <FiHeart className="w-4 h-4 text-pink-600" />
                </div>
                <label className="text-sm font-semibold text-gray-700">Sex</label>
              </div>
              <p className="text-lg font-semibold text-gray-900">{getSexLabel(patient.sex)}</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiClock className="w-4 h-4 text-purple-600" />
                </div>
                <label className="text-sm font-semibold text-gray-700">Age</label>
              </div>
              <p className="text-lg font-semibold text-gray-900">{patient.actual_age} years</p>
            </div>
            
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <FiUsers className="w-4 h-4 text-teal-600" />
                </div>
                <label className="text-sm font-semibold text-gray-700">Age Group</label>
              </div>
              <p className="text-lg font-semibold text-gray-900">{getAgeGroupLabel(patient.age_group) || 'Not specified'}</p>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <FiHome className="w-4 h-4 text-amber-600" />
                </div>
                <label className="text-sm font-semibold text-gray-700">Room</label>
              </div>
              <p className="text-lg font-semibold text-gray-900">{patient.assigned_room || 'Not assigned'}</p>
            </div>
          </div>

          {/* Status Information Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FiShield className="w-4 h-4 text-indigo-600" />
                </div>
                <label className="text-sm font-semibold text-gray-700">Assigned Doctor</label>
              </div>
              {patient.assigned_doctor_name ? (
                <Badge className="bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border-indigo-200 text-sm font-medium">
                  {patient.assigned_doctor_name} ({patient.assigned_doctor_role})
                </Badge>
              ) : (
                <span className="text-gray-500 text-sm">Not assigned</span>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiTrendingUp className="w-4 h-4 text-orange-600" />
                </div>
                <label className="text-sm font-semibold text-gray-700">Complexity</label>
              </div>
              <Badge 
                className={`${
                  patient.case_complexity === 'complex' 
                    ? 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border-orange-200' 
                    : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200'
                } text-sm font-medium`}
              >
                {patient.case_complexity === 'complex' ? 'Complex' : 'Simple'}
              </Badge>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiFileText className="w-4 h-4 text-green-600" />
                </div>
                <label className="text-sm font-semibold text-gray-700">ADL File</label>
              </div>
              <Badge 
                className={`${
                  patient.has_adl_file 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' 
                    : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200'
                } text-sm font-medium`}
              >
                {patient.has_adl_file ? 'Available' : 'Not Available'}
              </Badge>
            </div>
          </div>

          {/* Additional Information Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <FiActivity className="w-4 h-4 text-violet-600" />
                </div>
                <label className="text-sm font-semibold text-gray-700">Status</label>
              </div>
              <Badge 
                className={`${
                  patient.is_active 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' 
                    : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200'
                } text-sm font-medium`}
              >
                {patient.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            
            {patient.adl_no && (
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <FiHash className="w-4 h-4 text-cyan-600" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700">ADL Number</label>
                </div>
                <p className="text-lg font-semibold text-gray-900">{patient.adl_no}</p>
              </div>
            )}
            
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <FiCalendar className="w-4 h-4 text-slate-600" />
                </div>
                <label className="text-sm font-semibold text-gray-700">Registration</label>
              </div>
              <p className="text-sm font-medium text-gray-900">{formatDate(patient.created_at)}</p>
            </div>
            
            {patient.special_clinic_no && (
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <FiStar className="w-4 h-4 text-rose-600" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700">Special Clinic</label>
                </div>
                <p className="text-lg font-semibold text-gray-900">{patient.special_clinic_no}</p>
              </div>
            )}
          </div>

          {/* Contact and Additional Info */}
          {(patient.contact_number || patient.filled_by_name || patient.file_status || patient.category) && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {patient.contact_number && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiPhone className="w-4 h-4 text-blue-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Contact</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{patient.contact_number}</p>
                </div>
              )}
              
              {patient.filled_by_name && (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <FiUserCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Filled By</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{patient.filled_by_name}</p>
                </div>
              )}
              
              {patient.file_status && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <FiInfo className="w-4 h-4 text-amber-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">File Status</label>
                  </div>
                  <Badge 
                    className={`${
                      patient.file_status === 'active' 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' 
                        : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200'
                    } text-sm font-medium`}
                  >
                    {getFileStatusLabel(patient.file_status)}
                  </Badge>
                </div>
              )}
              
              {patient.category && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FiShield className="w-4 h-4 text-purple-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Category</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{patient.category}</p>
                </div>
              )}
            </div>
          )}

          {/* Last Updated */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FiClock className="w-4 h-4 text-gray-600" />
              </div>
              <label className="text-sm font-semibold text-gray-700">Last Updated</label>
            </div>
            <p className="text-sm font-medium text-gray-900">{formatDateTime(patient.updated_at)}</p>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiFileText className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-gray-700">Clinical Records</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">
                {clinicalData?.data?.proformas?.length || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Medical assessments</p>
            </div>
            <div className="p-4 bg-blue-100 rounded-2xl">
              <FiFileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="shadow-xl border-0 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiFolder className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-sm font-semibold text-gray-700">ADL Files</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">
                {adlData?.data?.files?.length || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Activity files</p>
            </div>
            <div className="p-4 bg-purple-100 rounded-2xl">
              <FiFolder className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="shadow-xl border-0 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiClipboard className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm font-semibold text-gray-700">Outpatient Records</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">
                {outpatientData?.data?.record ? 1 : 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Visit records</p>
            </div>
            <div className="p-4 bg-green-100 rounded-2xl">
              <FiClipboard className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Demographic Information - Show if exists in either patient or outpatient data */}
      {(outpatientData?.data?.record || formData.age_group || formData.marital_status || formData.occupation) && (
        <>
          {/* Personal Information */}
          <Card
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <FiUser className="h-6 w-6 text-pink-600" />
                </div>
                <span className="text-xl font-bold text-gray-900">Personal Information</span>
              </div>
            }
            className="shadow-xl border-0 bg-white/80 backdrop-blur-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formData.age_group && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiUsers className="w-4 h-4 text-blue-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Age Group</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{getAgeGroupLabel(formData.age_group)}</p>
                </div>
              )}
              {formData.marital_status && (
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <FiHeart className="w-4 h-4 text-pink-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Marital Status</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{getMaritalStatusLabel(formData.marital_status)}</p>
                </div>
              )}
              {formData.year_of_marriage && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FiCalendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Year of Marriage</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{formData.year_of_marriage}</p>
                </div>
              )}
              {formData.no_of_children !== '' && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FiUsers className="w-4 h-4 text-green-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Total Children</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{formData.no_of_children}</p>
                </div>
              )}
              {formData.no_of_children_male !== '' && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiUser className="w-4 h-4 text-blue-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Male Children</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{formData.no_of_children_male}</p>
                </div>
              )}
              {formData.no_of_children_female !== '' && (
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <FiUser className="w-4 h-4 text-pink-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Female Children</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{formData.no_of_children_female}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Occupation & Education */}
          <Card
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiBriefcase className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-xl font-bold text-gray-900">Occupation & Education</span>
              </div>
            }
            className="shadow-xl border-0 bg-white/80 backdrop-blur-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.occupation && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiBriefcase className="w-4 h-4 text-blue-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Occupation</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{getOccupationLabel(formData.occupation)}</p>
                </div>
              )}
              {formData.actual_occupation && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FiEdit3 className="w-4 h-4 text-green-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Actual Occupation</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{formData.actual_occupation}</p>
                </div>
              )}
              {formData.education_level && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FiBookOpen className="w-4 h-4 text-purple-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Education Level</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{getEducationLabel(formData.education_level)}</p>
                </div>
              )}
              {formData.completed_years_of_education && (
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <FiClock className="w-4 h-4 text-teal-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Years of Education</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{formData.completed_years_of_education}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Financial Information */}
          <Card
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiDollarSign className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-xl font-bold text-gray-900">Financial Information</span>
              </div>
            }
            className="shadow-xl border-0 bg-white/80 backdrop-blur-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.patient_income && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FiDollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Patient Income</label>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(formData.patient_income)}</p>
                </div>
              )}
              {formData.family_income && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiUsers className="w-4 h-4 text-blue-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Family Income</label>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(formData.family_income)}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Family Information */}
          <Card
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiUsers className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-xl font-bold text-gray-900">Family Information</span>
              </div>
            }
            className="shadow-xl border-0 bg-white/80 backdrop-blur-sm"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {formData.religion && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FiGlobe className="w-4 h-4 text-blue-600" />
                      </div>
                      <label className="text-sm font-semibold text-gray-700">Religion</label>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{getReligionLabel(formData.religion)}</p>
                  </div>
                )}
                {formData.family_type && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FiUsers className="w-4 h-4 text-green-600" />
                      </div>
                      <label className="text-sm font-semibold text-gray-700">Family Type</label>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{getFamilyTypeLabel(formData.family_type)}</p>
                  </div>
                )}
                {formData.locality && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FiMapPin className="w-4 h-4 text-purple-600" />
                      </div>
                      <label className="text-sm font-semibold text-gray-700">Locality</label>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{getLocalityLabel(formData.locality)}</p>
                  </div>
                )}
              </div>
              {formData.head_name && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <FiUser className="w-5 h-5 text-amber-600" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Head of Family</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-amber-200">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Name</label>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{formData.head_name}</p>
                    </div>
                    {formData.head_age && (
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Age</label>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{formData.head_age}</p>
                      </div>
                    )}
                    {formData.head_relationship && (
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Relationship</label>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{formData.head_relationship}</p>
                      </div>
                    )}
                    {formData.head_education && (
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Education</label>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{formData.head_education}</p>
                      </div>
                    )}
                    {formData.head_occupation && (
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Occupation</label>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{formData.head_occupation}</p>
                      </div>
                    )}
                    {formData.head_income && (
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Income</label>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{formatCurrency(formData.head_income)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Referral & Mobility */}
          <Card
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <FiMapPin className="h-6 w-6 text-teal-600" />
                </div>
                <span className="text-xl font-bold text-gray-900">Referral & Mobility</span>
              </div>
            }
            className="shadow-xl border-0 bg-white/80 backdrop-blur-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formData.distance_from_hospital && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiNavigation className="w-4 h-4 text-blue-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Distance from Hospital</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{formData.distance_from_hospital}</p>
                </div>
              )}
              {formData.mobility && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FiTruck className="w-4 h-4 text-green-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Mobility</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{getMobilityLabel(formData.mobility)}</p>
                </div>
              )}
              {formData.referred_by && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FiUser className="w-4 h-4 text-purple-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Referred By</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{getReferredByLabel(formData.referred_by)}</p>
                </div>
              )}
              {formData.exact_source && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <FiInfo className="w-4 h-4 text-orange-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Exact Source</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{formData.exact_source}</p>
                </div>
              )}
              {formData.seen_in_walk_in_on && (
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <FiCalendar className="w-4 h-4 text-teal-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Walk-in Date</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(formData.seen_in_walk_in_on)}</p>
                </div>
              )}
              {formData.worked_up_on && (
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-rose-100 rounded-lg">
                      <FiClock className="w-4 h-4 text-rose-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Worked Up Date</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(formData.worked_up_on)}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Contact Information */}
          <Card
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiPhone className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-xl font-bold text-gray-900">Contact Information</span>
              </div>
            }
            className="shadow-xl border-0 bg-white/80 backdrop-blur-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.present_address && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiHome className="w-4 h-4 text-blue-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Present Address</label>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{formData.present_address}</p>
                </div>
              )}
              {formData.permanent_address && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FiMapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Permanent Address</label>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{formData.permanent_address}</p>
                </div>
              )}
              {formData.local_address && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FiMapPin className="w-4 h-4 text-purple-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Local Address</label>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{formData.local_address}</p>
                </div>
              )}
              {formData.school_college_office && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <FiBookOpen className="w-4 h-4 text-orange-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">School/College/Office</label>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{formData.school_college_office}</p>
                </div>
              )}
              {formData.contact_number && (
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <FiPhone className="w-4 h-4 text-teal-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Contact Number</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{formData.contact_number}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Address Information */}
          {(patient.present_address_line_1 || patient.permanent_address_line_1 || patient.address_line_1) && (
            <Card
              title={
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FiHome className="h-6 w-6 text-indigo-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Address Information</span>
                </div>
              }
              className="shadow-xl border-0 bg-white/80 backdrop-blur-sm"
            >
              <div className="space-y-6">
                {patient.present_address_line_1 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FiHome className="w-4 h-4 text-blue-600" />
                      </div>
                      <label className="text-sm font-semibold text-gray-700">Present Address</label>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <p className="text-sm font-medium text-gray-900">{formatAddress({
                        address_line_1: patient.present_address_line_1,
                        address_line_2: patient.present_address_line_2,
                        city_town_village: patient.present_city_town_village,
                        district: patient.present_district,
                        state: patient.present_state,
                        pin_code: patient.present_pin_code,
                        country: patient.present_country
                      })}</p>
                    </div>
                  </div>
                )}
                
                {patient.permanent_address_line_1 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FiMapPin className="w-4 h-4 text-green-600" />
                      </div>
                      <label className="text-sm font-semibold text-gray-700">Permanent Address</label>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <p className="text-sm font-medium text-gray-900">{formatAddress({
                        address_line_1: patient.permanent_address_line_1,
                        address_line_2: patient.permanent_address_line_2,
                        city_town_village: patient.permanent_city_town_village,
                        district: patient.permanent_district,
                        state: patient.permanent_state,
                        pin_code: patient.permanent_pin_code,
                        country: patient.permanent_country
                      })}</p>
                    </div>
                  </div>
                )}

                {patient.address_line_1 && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FiEdit3 className="w-4 h-4 text-purple-600" />
                      </div>
                      <label className="text-sm font-semibold text-gray-700">Quick Entry Address</label>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <p className="text-sm font-medium text-gray-900">{formatAddress({
                        address_line_1: patient.address_line_1,
                        address_line_2: patient.address_line_2,
                        city_town_village: patient.city_town_village,
                        district: patient.district,
                        state: patient.state,
                        pin_code: patient.pin_code,
                        country: patient.country
                      })}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Registration Details */}
          {(patient.department || patient.unit_consit || patient.room_no || patient.serial_no || patient.file_no || patient.unit_days) && (
            <Card
              title={
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <FiCalendar className="h-6 w-6 text-amber-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Registration Details</span>
                </div>
              }
              className="shadow-xl border-0 bg-white/80 backdrop-blur-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patient.department && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FiLayers className="w-4 h-4 text-blue-600" />
                      </div>
                      <label className="text-sm font-semibold text-gray-700">Department</label>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{patient.department}</p>
                  </div>
                )}
                {patient.unit_consit && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FiUsers className="w-4 h-4 text-green-600" />
                      </div>
                      <label className="text-sm font-semibold text-gray-700">Unit Constitution</label>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{patient.unit_consit}</p>
                  </div>
                )}
                {patient.room_no && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FiHome className="w-4 h-4 text-purple-600" />
                      </div>
                      <label className="text-sm font-semibold text-gray-700">Room Number</label>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{patient.room_no}</p>
                  </div>
                )}
                {patient.serial_no && (
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FiHash className="w-4 h-4 text-orange-600" />
                      </div>
                      <label className="text-sm font-semibold text-gray-700">Serial Number</label>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{patient.serial_no}</p>
                  </div>
                )}
                {patient.file_no && (
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <FiFileText className="w-4 h-4 text-teal-600" />
                      </div>
                      <label className="text-sm font-semibold text-gray-700">File Number</label>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{patient.file_no}</p>
                  </div>
                )}
                {patient.unit_days && (
                  <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-rose-100 rounded-lg">
                        <FiClock className="w-4 h-4 text-rose-600" />
                      </div>
                      <label className="text-sm font-semibold text-gray-700">Unit Days</label>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{patient.unit_days}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default PatientDetailsView;
