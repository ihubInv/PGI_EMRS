import { useState, useMemo, useEffect } from 'react';
import {
  FiUser, FiFileText, FiFolder, FiChevronDown, FiChevronUp, FiPackage
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
import { isMWO, isAdmin, isJrSr } from '../../utils/constants';
import { useGetPrescriptionsByProformaIdQuery } from '../../features/prescriptions/prescriptionApiSlice';

const PatientDetailsView = ({ patient, formData, clinicalData, adlData, outpatientData, userRole }) => {

  const [expandedCards, setExpandedCards] = useState({
    patient: false,
    clinical: false,
    adl: false,
    prescriptions: false
  });

  const toggleCard = (cardName) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardName]: !prev[cardName]
    }));
  };


  const patientAdlFiles = adlData?.data?.adlFiles || [];


  // Get clinical proformas for this patient - ensure it's always an array
  const patientProformas = Array.isArray(clinicalData?.data?.proformas) 
    ? clinicalData.data.proformas 
    : [];

  // Fetch prescriptions for all proformas
  // Always compute proformaIds as an array with exactly 10 elements (padding with null)
  // This ensures hooks are always called with the same structure
  const proformaIds = useMemo(() => {
    const ids = patientProformas.map(p => p?.id).filter(Boolean).slice(0, 10);
    // Pad to exactly 10 elements with null to ensure consistent hook calls
    while (ids.length < 10) {
      ids.push(null);
    }
    return ids;
  }, [patientProformas]);

  // Always call the same number of hooks (10) in the same order
  // This ensures React hooks are called in a consistent order every render
  // proformaIds is guaranteed to have exactly 10 elements (padded with null if needed)
  const prescriptionResult1 = useGetPrescriptionsByProformaIdQuery(proformaIds[0], { skip: !proformaIds[0] });
  const prescriptionResult2 = useGetPrescriptionsByProformaIdQuery(proformaIds[1], { skip: !proformaIds[1] });
  const prescriptionResult3 = useGetPrescriptionsByProformaIdQuery(proformaIds[2], { skip: !proformaIds[2] });
  const prescriptionResult4 = useGetPrescriptionsByProformaIdQuery(proformaIds[3], { skip: !proformaIds[3] });
  const prescriptionResult5 = useGetPrescriptionsByProformaIdQuery(proformaIds[4], { skip: !proformaIds[4] });
  const prescriptionResult6 = useGetPrescriptionsByProformaIdQuery(proformaIds[5], { skip: !proformaIds[5] });
  const prescriptionResult7 = useGetPrescriptionsByProformaIdQuery(proformaIds[6], { skip: !proformaIds[6] });
  const prescriptionResult8 = useGetPrescriptionsByProformaIdQuery(proformaIds[7], { skip: !proformaIds[7] });
  const prescriptionResult9 = useGetPrescriptionsByProformaIdQuery(proformaIds[8], { skip: !proformaIds[8] });
  const prescriptionResult10 = useGetPrescriptionsByProformaIdQuery(proformaIds[9], { skip: !proformaIds[9] });

  // Combine all prescription results - always use all 10 results
  const prescriptionResults = [
    prescriptionResult1,
    prescriptionResult2,
    prescriptionResult3,
    prescriptionResult4,
    prescriptionResult5,
    prescriptionResult6,
    prescriptionResult7,
    prescriptionResult8,
    prescriptionResult9,
    prescriptionResult10,
  ];

  // Combine all prescriptions and group by proforma/visit date
  const allPrescriptions = useMemo(() => {
    const prescriptions = [];
    prescriptionResults.forEach((result, index) => {
      const proformaId = proformaIds[index];
      if (proformaId && result.data?.data?.prescriptions) {
        const proforma = patientProformas.find(p => p.id === proformaId);
        result.data.data.prescriptions.forEach(prescription => {
          prescriptions.push({
            ...prescription,
            proforma_id: proformaId,
            visit_date: proforma?.visit_date || proforma?.created_at,
            visit_type: proforma?.visit_type
          });
        });
      }
    });
    // Sort by visit date (most recent first)
    return prescriptions.sort((a, b) => {
      const dateA = new Date(a.visit_date || 0);
      const dateB = new Date(b.visit_date || 0);
      return dateB - dateA;
    });
  }, [prescriptionResults, patientProformas, proformaIds]);

  // Group prescriptions by visit date
  const prescriptionsByVisit = useMemo(() => {
    const grouped = {};
    allPrescriptions.forEach(prescription => {
      const visitDate = prescription.visit_date
        ? formatDate(prescription.visit_date)
        : 'Unknown Date';
      if (!grouped[visitDate]) {
        grouped[visitDate] = {
          date: prescription.visit_date,
          visitType: prescription.visit_type,
          prescriptions: []
        };
      }
      grouped[visitDate].prescriptions.push(prescription);
    });
    return grouped;
  }, [allPrescriptions]);

  // Check if user can view prescriptions (Admin or JR/SR, not MWO)
  const canViewPrescriptions = !isMWO(userRole) && (isAdmin(userRole) || isJrSr(userRole));

  return (
    <div className="space-y-6">
      {/* Card 1: Patient Details */}
      <Card className="shadow-lg border-0 bg-white">
        <div
          className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => toggleCard('patient')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiUser className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Patient Details</h3>
              <p className="text-sm text-gray-500 mt-1">{patient.name} - {patient.cr_no || 'N/A'}</p>
            </div>
          </div>
          {expandedCards.patient ? (
            <FiChevronUp className="h-6 w-6 text-gray-500" />
          ) : (
            <FiChevronDown className="h-6 w-6 text-gray-500" />
          )}
        </div>

        {expandedCards.patient && (
          <div className="p-6">
            <div className="space-y-8">
              {/* Basic Information Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{patient.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">CR Number</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{patient.cr_no || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">PSY Number</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{patient.psy_no || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Sex</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{getSexLabel(patient.sex) || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Age</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{patient.age ? `${patient.age} years` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Age Group</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{getAgeGroupLabel(patient.age_group) || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Room</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{patient.assigned_room || 'Not assigned'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Contact Number</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{patient.contact_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1">
                      <Badge
                        className={`${patient.is_active
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                          } text-sm font-medium`}
                      >
                        {patient.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Information Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Status Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Assigned Doctor</label>
                    <div className="mt-1">
                      {patient.assigned_doctor_name ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-sm font-medium">
                          {patient.assigned_doctor_name} {patient.assigned_doctor_role ? `(${patient.assigned_doctor_role})` : ''}
                        </Badge>
                      ) : (
                        <span className="text-gray-500 text-sm">Not assigned</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Case Complexity</label>
                    <div className="mt-1">
                      <Badge
                        className={`${patient.case_complexity === 'complex'
                            ? 'bg-orange-100 text-orange-800 border-orange-200'
                            : 'bg-green-100 text-green-800 border-green-200'
                          } text-sm font-medium`}
                      >
                        {patient.case_complexity === 'complex' ? 'Complex' : 'Simple'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">ADL File</label>
                    <div className="mt-1">
                      <Badge
                        className={`${patient.has_adl_file
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                          } text-sm font-medium`}
                      >
                        {patient.has_adl_file ? 'Available' : 'Not Available'}
                      </Badge>
                    </div>
                  </div>
                  {patient.adl_no && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">ADL Number</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{patient.adl_no}</p>
                    </div>
                  )}
                  {patient.special_clinic_no && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Special Clinic Number</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{patient.special_clinic_no}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Registration Date</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(patient.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Personal Information Section - if available */}
              {(formData.age_group || formData.marital_status || formData.occupation || formData.education_level) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {formData.marital_status && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Marital Status</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{getMaritalStatusLabel(formData.marital_status)}</p>
                      </div>
                    )}
                    {formData.year_of_marriage && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Year of Marriage</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{formData.year_of_marriage}</p>
                      </div>
                    )}
                    {formData.no_of_children !== '' && formData.no_of_children !== null && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Number of Children</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{formData.no_of_children}</p>
                      </div>
                    )}
                    {formData.no_of_children_male !== '' && formData.no_of_children_male !== null && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Number of Children (Male)</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{formData.no_of_children_male}</p>
                      </div>
                    )}
                    {formData.no_of_children_female !== '' && formData.no_of_children_female !== null && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Number of Children (Female)</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{formData.no_of_children_female}</p>
                      </div>
                    )}
                    {patient.dob && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(patient.dob)}</p>
                      </div>
                    )}
                    {formData.occupation && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Occupation</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{getOccupationLabel(formData.occupation)}</p>
                      </div>
                    )}
                    {formData.actual_occupation && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Actual Occupation</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{formData.actual_occupation}</p>
                      </div>
                    )}
                    {formData.education_level && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Education Level</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{getEducationLabel(formData.education_level)}</p>
                      </div>
                    )}
                    {formData.completed_years_of_education && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Years of Education</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{formData.completed_years_of_education}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Financial Information - if available */}
              {(formData.patient_income || formData.family_income) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Financial Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formData.patient_income && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Patient Income</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{formatCurrency(formData.patient_income)}</p>
                      </div>
                    )}
                    {formData.family_income && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Family Income</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{formatCurrency(formData.family_income)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Family Information - if available */}
              {(formData.religion || formData.family_type || formData.locality || formData.head_name) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Family Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {formData.religion && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Religion</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{getReligionLabel(formData.religion)}</p>
                      </div>
                    )}
                    {formData.family_type && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Family Type</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{getFamilyTypeLabel(formData.family_type)}</p>
                      </div>
                    )}
                    {formData.locality && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Locality</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{getLocalityLabel(formData.locality)}</p>
                      </div>
                    )}
                    {formData.head_name && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Head of Family</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{formData.head_name}</p>
                      </div>
                    )}
                    {formData.head_age && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Head Age</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{formData.head_age}</p>
                      </div>
                    )}
                    {formData.head_occupation && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Head Occupation</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{formData.head_occupation}</p>
                      </div>
                    )}
                    {formData.head_relationship && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Head Relationship</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{formData.head_relationship}</p>
                      </div>
                    )}
                    {formData.head_education && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Head Education</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{formData.head_education}</p>
                      </div>
                    )}
                    {formData.head_income && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Head Income</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{formatCurrency(formData.head_income)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Referral & Mobility Information - if available */}
              {(formData.distance_from_hospital || formData.mobility || formData.referred_by || formData.exact_source || formData.seen_in_walk_in_on || formData.worked_up_on || formData.school_college_office) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Referral & Mobility Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {formData.distance_from_hospital && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Distance from Hospital</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{formData.distance_from_hospital}</p>
                      </div>
                    )}
                    {formData.mobility && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Mobility</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{getMobilityLabel(formData.mobility)}</p>
                      </div>
                    )}
                    {formData.referred_by && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Referred By</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{getReferredByLabel(formData.referred_by)}</p>
                      </div>
                    )}
                    {formData.exact_source && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Exact Source</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{formData.exact_source}</p>
                      </div>
                    )}
                    {formData.seen_in_walk_in_on && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Seen in Walk-in On</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(formData.seen_in_walk_in_on)}</p>
                      </div>
                    )}
                    {formData.worked_up_on && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Worked Up On</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(formData.worked_up_on)}</p>
                      </div>
                    )}
                    {formData.school_college_office && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">School/College/Office</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{formData.school_college_office}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Registration Details - if available */}
              {(patient.department || patient.unit_consit || patient.room_no || patient.serial_no || patient.file_no || patient.unit_days || patient.category) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Registration Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patient.department && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Department</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{patient.department}</p>
                      </div>
                    )}
                    {patient.unit_consit && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Unit/Constituent</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{patient.unit_consit}</p>
                      </div>
                    )}
                    {patient.room_no && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Room Number</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{patient.room_no}</p>
                      </div>
                    )}
                    {patient.serial_no && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Serial Number</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{patient.serial_no}</p>
                      </div>
                    )}
                    {patient.file_no && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">File Number</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{patient.file_no}</p>
                      </div>
                    )}
                    {patient.unit_days && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Unit Days</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{patient.unit_days}</p>
                      </div>
                    )}
                    {patient.category && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Category</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{patient.category}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Entry Address - if available */}
              {(patient.address_line || patient.city || patient.district || patient.state || patient.pin_code || patient.country) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Quick Entry Address</h4>
                  <div>
                    <p className="text-sm text-gray-900 mt-1">{formatAddress({
                      address_line: patient.address_line,
                      address_line_2: patient.address_line_2,
                      city: patient.city,
                      district: patient.district,
                      state: patient.state,
                      pin_code: patient.pin_code,
                      country: patient.country
                    })}</p>
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {(patient.filled_by_name || formData.local_address) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {patient.filled_by_name && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Registered By</label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{patient.filled_by_name}</p>
                      </div>
                    )}
                    {formData.local_address && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Local Address</label>
                        <p className="text-sm text-gray-900 mt-1">{formData.local_address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Address Information - if available */}
              {(patient.present_address_line_1 || patient.permanent_address_line_1 || formData.present_address || formData.permanent_address) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Address Information</h4>
                  <div className="space-y-4">
                    {patient.present_address_line_1 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Present Address</label>
                        <p className="text-sm text-gray-900 mt-1">{formatAddress({
                          address_line: patient.present_address_line_1,
                          address_line_2: patient.present_address_line_2,
                          city: patient.present_city_town_village,
                          district: patient.present_district,
                          state: patient.present_state,
                          pin_code: patient.present_pin_code,
                          country: patient.present_country
                        })}</p>
                      </div>
                    )}
                    {patient.permanent_address_line_1 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Permanent Address</label>
                        <p className="text-sm text-gray-900 mt-1">{formatAddress({
                          address_line: patient.permanent_address_line_1,
                          address_line_2: patient.permanent_address_line_2,
                          city: patient.permanent_city_town_village,
                          district: patient.permanent_district,
                          state: patient.permanent_state,
                          pin_code: patient.permanent_pin_code,
                          country: patient.permanent_country
                        })}</p>
                      </div>
                    )}
                    {formData.present_address && !patient.present_address_line_1 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Present Address</label>
                        <p className="text-sm text-gray-900 mt-1">{formData.present_address}</p>
                      </div>
                    )}
                    {formData.permanent_address && !patient.permanent_address_line_1 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Permanent Address</label>
                        <p className="text-sm text-gray-900 mt-1">{formData.permanent_address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Last Updated */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">Last Updated: {formatDateTime(patient.updated_at)}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Card 2: Clinical Proforma - Hide for MWO */}
      {!isMWO(userRole) && (
        <Card className="shadow-lg border-0 bg-white">
          <div
            className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => toggleCard('clinical')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiFileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Clinical Proforma</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {patientProformas.length > 0
                    ? `${patientProformas.length} record${patientProformas.length > 1 ? 's' : ''} found`
                    : 'No clinical records'}
                </p>
              </div>
            </div>
            {expandedCards.clinical ? (
              <FiChevronUp className="h-6 w-6 text-gray-500" />
            ) : (
              <FiChevronDown className="h-6 w-6 text-gray-500" />
            )}
          </div>

          {expandedCards.clinical && (
            <div className="p-6">
              {patientProformas.length > 0 ? (
                <div className="space-y-6">
                  {patientProformas.map((proforma, index) => (
                    <div key={proforma.id || index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900">Visit #{index + 1}</h4>
                        <span className="text-sm text-gray-500">{proforma.visit_date ? formatDate(proforma.visit_date) : 'N/A'}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Visit Type</label>
                          <p className="text-base font-semibold text-gray-900 mt-1">
                            {proforma.visit_type === 'first_visit' ? 'First Visit' : 'Follow-up'}
                          </p>
                        </div>
                        {proforma.room_no && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Room Number</label>
                            <p className="text-base font-semibold text-gray-900 mt-1">{proforma.room_no}</p>
                          </div>
                        )}
                        {proforma.doctor_name && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Doctor</label>
                            <p className="text-base font-semibold text-gray-900 mt-1">
                              {proforma.doctor_name} {proforma.doctor_role ? `(${proforma.doctor_role})` : ''}
                            </p>
                          </div>
                        )}
                        {proforma.case_severity && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Case Severity</label>
                            <div className="mt-1">
                              <Badge
                                className={`${proforma.case_severity === 'severe'
                                    ? 'bg-red-100 text-red-800 border-red-200'
                                    : proforma.case_severity === 'moderate'
                                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                      : 'bg-green-100 text-green-800 border-green-200'
                                  } text-sm font-medium`}
                              >
                                {getCaseSeverityLabel(proforma.case_severity)}
                              </Badge>
                            </div>
                          </div>
                        )}
                        {proforma.decision && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Decision</label>
                            <p className="text-base font-semibold text-gray-900 mt-1">{proforma.decision}</p>
                          </div>
                        )}
                        {proforma.doctor_decision && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Doctor Decision</label>
                            <p className="text-base font-semibold text-gray-900 mt-1">
                              {proforma.doctor_decision === 'complex_case' ? 'Complex Case' : 'Simple Case'}
                            </p>
                          </div>
                        )}
                        {proforma.requires_adl_file !== undefined && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Requires ADL File</label>
                            <div className="mt-1">
                              <Badge className={proforma.requires_adl_file ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                                {proforma.requires_adl_file ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                          </div>
                        )}
                        {proforma.informant_present !== undefined && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Informant Present</label>
                            <div className="mt-1">
                              <Badge className={proforma.informant_present ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                                {proforma.informant_present ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                          </div>
                        )}
                        {proforma.created_at && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Created Date</label>
                            <p className="text-base font-semibold text-gray-900 mt-1">{formatDateTime(proforma.created_at)}</p>
                          </div>
                        )}
                      </div>

                      {/* Additional Clinical Proforma Fields */}
                      {(proforma.nature_of_information || proforma.onset_duration || proforma.course || proforma.precipitating_factor || proforma.illness_duration || proforma.current_episode_since) && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h5 className="text-md font-semibold text-gray-900 mb-3">Illness Information</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {proforma.nature_of_information && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Nature of Information</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.nature_of_information}</p>
                              </div>
                            )}
                            {proforma.onset_duration && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Onset Duration</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.onset_duration}</p>
                              </div>
                            )}
                            {proforma.course && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Course</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.course}</p>
                              </div>
                            )}
                            {proforma.precipitating_factor && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Precipitating Factor</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.precipitating_factor}</p>
                              </div>
                            )}
                            {proforma.illness_duration && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Illness Duration</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.illness_duration}</p>
                              </div>
                            )}
                            {proforma.current_episode_since && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Current Episode Since</label>
                                <p className="text-sm text-gray-900 mt-1">{formatDate(proforma.current_episode_since)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Clinical Symptoms */}
                      {(proforma.mood || proforma.behaviour || proforma.speech || proforma.thought || proforma.perception || proforma.somatic || proforma.bio_functions || proforma.adjustment || proforma.cognitive_function || proforma.fits || proforma.sexual_problem || proforma.substance_use) && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h5 className="text-md font-semibold text-gray-900 mb-3">Clinical Symptoms</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {proforma.mood && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Mood</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.mood}</p>
                              </div>
                            )}
                            {proforma.behaviour && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Behaviour</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.behaviour}</p>
                              </div>
                            )}
                            {proforma.speech && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Speech</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.speech}</p>
                              </div>
                            )}
                            {proforma.thought && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Thought</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.thought}</p>
                              </div>
                            )}
                            {proforma.perception && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Perception</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.perception}</p>
                              </div>
                            )}
                            {proforma.somatic && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Somatic</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.somatic}</p>
                              </div>
                            )}
                            {proforma.bio_functions && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Biological Functions</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.bio_functions}</p>
                              </div>
                            )}
                            {proforma.adjustment && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Adjustment</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.adjustment}</p>
                              </div>
                            )}
                            {proforma.cognitive_function && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Cognitive Function</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.cognitive_function}</p>
                              </div>
                            )}
                            {proforma.fits && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Fits</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.fits}</p>
                              </div>
                            )}
                            {proforma.sexual_problem && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Sexual Problem</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.sexual_problem}</p>
                              </div>
                            )}
                            {proforma.substance_use && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Substance Use</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.substance_use}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Mental Status Examination */}
                      {(proforma.mse_behaviour || proforma.mse_affect || proforma.mse_thought || proforma.mse_delusions || proforma.mse_perception || proforma.mse_cognitive_function) && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h5 className="text-md font-semibold text-gray-900 mb-3">Mental Status Examination (MSE)</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {proforma.mse_behaviour && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Behaviour</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.mse_behaviour}</p>
                              </div>
                            )}
                            {proforma.mse_affect && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Affect</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.mse_affect}</p>
                              </div>
                            )}
                            {proforma.mse_thought && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Thought</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.mse_thought}</p>
                              </div>
                            )}
                            {proforma.mse_delusions && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Delusions</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.mse_delusions}</p>
                              </div>
                            )}
                            {proforma.mse_perception && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Perception</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.mse_perception}</p>
                              </div>
                            )}
                            {proforma.mse_cognitive_function && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Cognitive Function</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.mse_cognitive_function}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* History */}
                      {(proforma.past_history || proforma.family_history || proforma.associated_medical_surgical) && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h5 className="text-md font-semibold text-gray-900 mb-3">History</h5>
                          <div className="space-y-4">
                            {proforma.past_history && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Past History</label>
                                <p className="text-sm text-gray-900 mt-1 leading-relaxed">{proforma.past_history}</p>
                              </div>
                            )}
                            {proforma.family_history && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Family History</label>
                                <p className="text-sm text-gray-900 mt-1 leading-relaxed">{proforma.family_history}</p>
                              </div>
                            )}
                            {proforma.associated_medical_surgical && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Associated Medical/Surgical</label>
                                <p className="text-sm text-gray-900 mt-1 leading-relaxed">{proforma.associated_medical_surgical}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* General Physical Examination */}
                      {proforma.gpe && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <label className="text-sm font-medium text-gray-600">General Physical Examination (GPE)</label>
                          <p className="text-sm text-gray-900 mt-2 leading-relaxed">{proforma.gpe}</p>
                        </div>
                      )}

                      {/* Diagnosis and Treatment */}
                      {(proforma.diagnosis || proforma.icd_code || proforma.disposal || proforma.workup_appointment || proforma.referred_to || proforma.treatment_prescribed || proforma.adl_reasoning) && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h5 className="text-md font-semibold text-gray-900 mb-3">Diagnosis and Treatment</h5>
                          <div className="space-y-4">
                            {proforma.diagnosis && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Diagnosis</label>
                                <p className="text-sm text-gray-900 mt-2 leading-relaxed">{proforma.diagnosis}</p>
                              </div>
                            )}
                            {proforma.icd_code && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">ICD Code</label>
                                <p className="text-base font-semibold text-gray-900 mt-1">{proforma.icd_code}</p>
                              </div>
                            )}
                            {proforma.disposal && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Disposal</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.disposal}</p>
                              </div>
                            )}
                            {proforma.workup_appointment && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Workup Appointment</label>
                                <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(proforma.workup_appointment)}</p>
                              </div>
                            )}
                            {proforma.referred_to && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Referred To</label>
                                <p className="text-sm text-gray-900 mt-1">{proforma.referred_to}</p>
                              </div>
                            )}
                            {proforma.treatment_prescribed && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Treatment Prescribed</label>
                                <p className="text-sm text-gray-900 mt-1 leading-relaxed">{proforma.treatment_prescribed}</p>
                              </div>
                            )}
                            {proforma.adl_reasoning && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">ADL Reasoning</label>
                                <p className="text-sm text-gray-900 mt-1 leading-relaxed">{proforma.adl_reasoning}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FiFileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base">No clinical proforma records found</p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
      {/* Card 3: Additional Details (ADL File) - Only show if ADL file exists for this patient, Hide for MWO */}
      {!isMWO(userRole) && patientAdlFiles && patientAdlFiles.length > 0 && (
        <Card className="shadow-lg border-0 bg-white">
          <div
            className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => toggleCard('adl')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiFolder className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Additional Details (ADL File)</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {patientAdlFiles.length} file{patientAdlFiles.length > 1 ? 's' : ''} found
                </p>
              </div>
            </div>
            {expandedCards.adl ? (
              <FiChevronUp className="h-6 w-6 text-gray-500" />
            ) : (
              <FiChevronDown className="h-6 w-6 text-gray-500" />
            )}
          </div>

          {expandedCards.adl && (
            <div className="p-6">
              <div className="space-y-6">
                {patientAdlFiles.map((file, index) => {
                  // Parse JSON fields if they're strings
                  const complaintsPatient = Array.isArray(file.complaints_patient) ? file.complaints_patient : (file.complaints_patient ? JSON.parse(file.complaints_patient) : []);
                  const complaintsInformant = Array.isArray(file.complaints_informant) ? file.complaints_informant : (file.complaints_informant ? JSON.parse(file.complaints_informant) : []);
                  const informants = Array.isArray(file.informants) ? file.informants : (file.informants ? JSON.parse(file.informants) : []);
                  const familyHistorySiblings = Array.isArray(file.family_history_siblings) ? file.family_history_siblings : (file.family_history_siblings ? JSON.parse(file.family_history_siblings) : []);
                  const occupationJobs = Array.isArray(file.occupation_jobs) ? file.occupation_jobs : (file.occupation_jobs ? JSON.parse(file.occupation_jobs) : []);
                  const sexualChildren = Array.isArray(file.sexual_children) ? file.sexual_children : (file.sexual_children ? JSON.parse(file.sexual_children) : []);
                  const livingResidents = Array.isArray(file.living_residents) ? file.living_residents : (file.living_residents ? JSON.parse(file.living_residents) : []);
                  const livingInlaws = Array.isArray(file.living_inlaws) ? file.living_inlaws : (file.living_inlaws ? JSON.parse(file.living_inlaws) : []);
                  const premorbidPersonalityTraits = Array.isArray(file.premorbid_personality_traits) ? file.premorbid_personality_traits : (file.premorbid_personality_traits ? JSON.parse(file.premorbid_personality_traits) : []);

                  return (
                    <div key={file.id || index} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                      {/* ADL File Header */}
                      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-300">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">ADL File #{index + 1}</h4>
                          {file.adl_no && (
                            <p className="text-sm text-gray-600 mt-1">ADL Number: {file.adl_no}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {file.file_status && (
                            <Badge
                              className={`${file.file_status === 'active'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : file.file_status === 'retrieved'
                                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                                    : file.file_status === 'stored'
                                      ? 'bg-gray-100 text-gray-800 border-gray-200'
                                      : file.file_status === 'archived'
                                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                                        : 'bg-gray-100 text-gray-800 border-gray-200'
                                } text-sm font-medium mb-2`}
                            >
                              {getFileStatusLabel(file.file_status)}
                            </Badge>
                          )}
                          {file.file_created_date && (
                            <p className="text-xs text-gray-500">{formatDate(file.file_created_date)}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-8">
                        {/* Basic Information */}
                        <div>
                          <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Basic Information</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {file.patient_name && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Patient Name</label>
                                <p className="text-base font-semibold text-gray-900 mt-1">{file.patient_name}</p>
                              </div>
                            )}
                            {file.cr_no && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">CR Number</label>
                                <p className="text-base font-semibold text-gray-900 mt-1">{file.cr_no}</p>
                              </div>
                            )}
                            {file.psy_no && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">PSY Number</label>
                                <p className="text-base font-semibold text-gray-900 mt-1">{file.psy_no}</p>
                              </div>
                            )}
                            {file.assigned_doctor_name && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Assigned Doctor</label>
                                <p className="text-base font-semibold text-gray-900 mt-1">
                                  {file.assigned_doctor_name} {file.assigned_doctor_role ? `(${file.assigned_doctor_role})` : ''}
                                </p>
                              </div>
                            )}
                            {file.proforma_visit_date && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Visit Date</label>
                                <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(file.proforma_visit_date)}</p>
                              </div>
                            )}
                            {file.created_by_name && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Created By</label>
                                <p className="text-base font-semibold text-gray-900 mt-1">
                                  {file.created_by_name} {file.created_by_role ? `(${file.created_by_role})` : ''}
                                </p>
                              </div>
                            )}
                            {file.physical_file_location && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Physical Location</label>
                                <p className="text-base font-semibold text-gray-900 mt-1">{file.physical_file_location}</p>
                              </div>
                            )}
                            {file.total_visits && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Total Visits</label>
                                <p className="text-base font-semibold text-gray-900 mt-1">{file.total_visits}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Complaints */}
                        {(complaintsPatient.length > 0 && complaintsPatient.some(c => c.complaint)) ||
                          (complaintsInformant.length > 0 && complaintsInformant.some(c => c.complaint)) ? (
                          <div>
                            <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Complaints</h5>
                            {complaintsPatient.length > 0 && complaintsPatient.some(c => c.complaint) && (
                              <div className="mb-4">
                                <label className="text-sm font-medium text-gray-600 mb-2 block">Patient Complaints</label>
                                <div className="space-y-2">
                                  {complaintsPatient.filter(c => c.complaint).map((complaint, idx) => (
                                    <div key={idx} className="bg-blue-50 p-3 rounded border border-blue-200">
                                      <p className="text-sm font-semibold text-gray-900">{complaint.complaint}</p>
                                      {complaint.duration && (
                                        <p className="text-xs text-gray-600 mt-1">Duration: {complaint.duration}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {complaintsInformant.length > 0 && complaintsInformant.some(c => c.complaint) && (
                              <div>
                                <label className="text-sm font-medium text-gray-600 mb-2 block">Informant Complaints</label>
                                <div className="space-y-2">
                                  {complaintsInformant.filter(c => c.complaint).map((complaint, idx) => (
                                    <div key={idx} className="bg-purple-50 p-3 rounded border border-purple-200">
                                      <p className="text-sm font-semibold text-gray-900">{complaint.complaint}</p>
                                      {complaint.duration && (
                                        <p className="text-xs text-gray-600 mt-1">Duration: {complaint.duration}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null}

                        {/* Informants */}
                        {informants.length > 0 && informants.some(i => i.name) && (
                          <div>
                            <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Informants</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {informants.filter(i => i.name).map((informant, idx) => (
                                <div key={idx} className="bg-gray-50 p-4 rounded border border-gray-200">
                                  <p className="text-sm font-semibold text-gray-900">{informant.name}</p>
                                  {informant.relationship && (
                                    <p className="text-xs text-gray-600 mt-1">Relationship: {informant.relationship}</p>
                                  )}
                                  {informant.reliability && (
                                    <p className="text-xs text-gray-600">Reliability: {informant.reliability}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* History of Present Illness */}
                        {(file.history_narrative || file.history_specific_enquiry || file.history_drug_intake ||
                          file.history_treatment_place || file.history_treatment_drugs || file.history_treatment_response) && (
                            <div>
                              <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">History of Present Illness</h5>
                              <div className="space-y-4">
                                {file.history_narrative && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Narrative History</label>
                                    <p className="text-sm text-gray-900 mt-1 leading-relaxed">{file.history_narrative}</p>
                                  </div>
                                )}
                                {file.history_specific_enquiry && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Specific Enquiry</label>
                                    <p className="text-sm text-gray-900 mt-1 leading-relaxed">{file.history_specific_enquiry}</p>
                                  </div>
                                )}
                                {file.history_drug_intake && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Drug Intake</label>
                                    <p className="text-sm text-gray-900 mt-1">{file.history_drug_intake}</p>
                                  </div>
                                )}
                                {(file.history_treatment_place || file.history_treatment_drugs || file.history_treatment_response) && (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {file.history_treatment_place && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Treatment Place</label>
                                        <p className="text-sm text-gray-900 mt-1">{file.history_treatment_place}</p>
                                      </div>
                                    )}
                                    {file.history_treatment_drugs && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Treatment Drugs</label>
                                        <p className="text-sm text-gray-900 mt-1">{file.history_treatment_drugs}</p>
                                      </div>
                                    )}
                                    {file.history_treatment_response && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Treatment Response</label>
                                        <p className="text-sm text-gray-900 mt-1">{file.history_treatment_response}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Past History */}
                        {(file.past_history_medical || file.past_history_psychiatric_diagnosis ||
                          file.past_history_psychiatric_treatment || file.past_history_psychiatric_interim) && (
                            <div>
                              <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Past History</h5>
                              <div className="space-y-4">
                                {file.past_history_medical && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Medical History</label>
                                    <p className="text-sm text-gray-900 mt-1">{file.past_history_medical}</p>
                                  </div>
                                )}
                                {file.past_history_psychiatric_diagnosis && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Psychiatric Diagnosis</label>
                                    <p className="text-sm text-gray-900 mt-1">{file.past_history_psychiatric_diagnosis}</p>
                                  </div>
                                )}
                                {file.past_history_psychiatric_treatment && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Psychiatric Treatment</label>
                                    <p className="text-sm text-gray-900 mt-1">{file.past_history_psychiatric_treatment}</p>
                                  </div>
                                )}
                                {file.past_history_psychiatric_interim && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Interim Period</label>
                                    <p className="text-sm text-gray-900 mt-1">{file.past_history_psychiatric_interim}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Family History */}
                        {(file.family_history_father_age || file.family_history_mother_age ||
                          familyHistorySiblings.length > 0) && (
                            <div>
                              <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Family History</h5>
                              <div className="space-y-4">
                                {(file.family_history_father_age || file.family_history_father_education ||
                                  file.family_history_father_occupation || file.family_history_father_personality) && (
                                    <div className="bg-blue-50 p-4 rounded border border-blue-200">
                                      <h6 className="text-sm font-semibold text-gray-900 mb-2">Father</h6>
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        {file.family_history_father_age && (
                                          <div><span className="text-gray-600">Age:</span> <span className="font-medium">{file.family_history_father_age}</span></div>
                                        )}
                                        {file.family_history_father_education && (
                                          <div><span className="text-gray-600">Education:</span> <span className="font-medium">{file.family_history_father_education}</span></div>
                                        )}
                                        {file.family_history_father_occupation && (
                                          <div><span className="text-gray-600">Occupation:</span> <span className="font-medium">{file.family_history_father_occupation}</span></div>
                                        )}
                                        {file.family_history_father_personality && (
                                          <div><span className="text-gray-600">Personality:</span> <span className="font-medium">{file.family_history_father_personality}</span></div>
                                        )}
                                        {file.family_history_father_deceased && (
                                          <div><span className="text-gray-600">Deceased:</span> <span className="font-medium">Yes</span></div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                {(file.family_history_mother_age || file.family_history_mother_education ||
                                  file.family_history_mother_occupation || file.family_history_mother_personality) && (
                                    <div className="bg-pink-50 p-4 rounded border border-pink-200">
                                      <h6 className="text-sm font-semibold text-gray-900 mb-2">Mother</h6>
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        {file.family_history_mother_age && (
                                          <div><span className="text-gray-600">Age:</span> <span className="font-medium">{file.family_history_mother_age}</span></div>
                                        )}
                                        {file.family_history_mother_education && (
                                          <div><span className="text-gray-600">Education:</span> <span className="font-medium">{file.family_history_mother_education}</span></div>
                                        )}
                                        {file.family_history_mother_occupation && (
                                          <div><span className="text-gray-600">Occupation:</span> <span className="font-medium">{file.family_history_mother_occupation}</span></div>
                                        )}
                                        {file.family_history_mother_personality && (
                                          <div><span className="text-gray-600">Personality:</span> <span className="font-medium">{file.family_history_mother_personality}</span></div>
                                        )}
                                        {file.family_history_mother_deceased && (
                                          <div><span className="text-gray-600">Deceased:</span> <span className="font-medium">Yes</span></div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                {familyHistorySiblings.length > 0 && familyHistorySiblings.some(s => s.age || s.sex) && (
                                  <div>
                                    <h6 className="text-sm font-semibold text-gray-900 mb-2">Siblings</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {familyHistorySiblings.filter(s => s.age || s.sex).map((sibling, idx) => (
                                        <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
                                          {sibling.age && <span className="text-gray-600">Age: </span>}
                                          {sibling.age && <span className="font-medium">{sibling.age}</span>}
                                          {sibling.sex && <span className="text-gray-600 ml-2">Sex: </span>}
                                          {sibling.sex && <span className="font-medium">{sibling.sex}</span>}
                                          {sibling.education && <span className="text-gray-600 ml-2">Education: </span>}
                                          {sibling.education && <span className="font-medium">{sibling.education}</span>}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Mental Status Examination */}
                        {(file.mse_general_demeanour || file.mse_general_tidy || file.mse_general_awareness || file.mse_general_cooperation ||
                          file.mse_psychomotor_verbalization || file.mse_psychomotor_pressure || file.mse_psychomotor_tension ||
                          file.mse_psychomotor_posture || file.mse_psychomotor_mannerism || file.mse_psychomotor_catatonic ||
                          file.mse_affect_subjective || file.mse_affect_tone || file.mse_affect_resting || file.mse_affect_fluctuation ||
                          file.mse_thought_flow || file.mse_thought_form || file.mse_thought_content ||
                          file.mse_cognitive_consciousness || file.mse_cognitive_orientation_time || file.mse_cognitive_orientation_place ||
                          file.mse_cognitive_orientation_person || file.mse_cognitive_memory_immediate || file.mse_cognitive_memory_recent ||
                          file.mse_cognitive_memory_remote || file.mse_cognitive_subtraction || file.mse_cognitive_digit_span ||
                          file.mse_cognitive_counting || file.mse_cognitive_general_knowledge || file.mse_cognitive_calculation ||
                          file.mse_cognitive_similarities || file.mse_cognitive_proverbs || file.mse_insight_understanding || file.mse_insight_judgement) && (
                            <div>
                              <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Mental Status Examination (MSE)</h5>

                              {/* General MSE */}
                              {(file.mse_general_demeanour || file.mse_general_tidy || file.mse_general_awareness || file.mse_general_cooperation) && (
                                <div className="mb-4">
                                  <h6 className="text-md font-semibold text-gray-800 mb-2">General</h6>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {file.mse_general_demeanour && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Demeanour</label>
                                        <p className="text-sm text-gray-900 mt-1">{file.mse_general_demeanour}</p>
                                      </div>
                                    )}
                                    {file.mse_general_tidy && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Tidy</label>
                                        <p className="text-sm text-gray-900 mt-1">{file.mse_general_tidy}</p>
                                      </div>
                                    )}
                                    {file.mse_general_awareness && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Awareness</label>
                                        <p className="text-sm text-gray-900 mt-1">{file.mse_general_awareness}</p>
                                      </div>
                                    )}
                                    {file.mse_general_cooperation && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Cooperation</label>
                                        <p className="text-sm text-gray-900 mt-1">{file.mse_general_cooperation}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Psychomotor */}
                              {(file.mse_psychomotor_verbalization || file.mse_psychomotor_pressure || file.mse_psychomotor_tension ||
                                file.mse_psychomotor_posture || file.mse_psychomotor_mannerism || file.mse_psychomotor_catatonic) && (
                                  <div className="mb-4">
                                    <h6 className="text-md font-semibold text-gray-800 mb-2">Psychomotor</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {file.mse_psychomotor_verbalization && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Verbalization</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_psychomotor_verbalization}</p>
                                        </div>
                                      )}
                                      {file.mse_psychomotor_pressure && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Pressure</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_psychomotor_pressure}</p>
                                        </div>
                                      )}
                                      {file.mse_psychomotor_tension && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Tension</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_psychomotor_tension}</p>
                                        </div>
                                      )}
                                      {file.mse_psychomotor_posture && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Posture</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_psychomotor_posture}</p>
                                        </div>
                                      )}
                                      {file.mse_psychomotor_mannerism && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Mannerism</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_psychomotor_mannerism}</p>
                                        </div>
                                      )}
                                      {file.mse_psychomotor_catatonic && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Catatonic</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_psychomotor_catatonic}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Affect */}
                              {(file.mse_affect_subjective || file.mse_affect_tone || file.mse_affect_resting || file.mse_affect_fluctuation) && (
                                <div className="mb-4">
                                  <h6 className="text-md font-semibold text-gray-800 mb-2">Affect</h6>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {file.mse_affect_subjective && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Subjective</label>
                                        <p className="text-sm text-gray-900 mt-1">{file.mse_affect_subjective}</p>
                                      </div>
                                    )}
                                    {file.mse_affect_tone && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Tone</label>
                                        <p className="text-sm text-gray-900 mt-1">{file.mse_affect_tone}</p>
                                      </div>
                                    )}
                                    {file.mse_affect_resting && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Resting</label>
                                        <p className="text-sm text-gray-900 mt-1">{file.mse_affect_resting}</p>
                                      </div>
                                    )}
                                    {file.mse_affect_fluctuation && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Fluctuation</label>
                                        <p className="text-sm text-gray-900 mt-1">{file.mse_affect_fluctuation}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Thought */}
                              {(file.mse_thought_flow || file.mse_thought_form || file.mse_thought_content) && (
                                <div className="mb-4">
                                  <h6 className="text-md font-semibold text-gray-800 mb-2">Thought</h6>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {file.mse_thought_flow && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Flow</label>
                                        <p className="text-sm text-gray-900 mt-1">{file.mse_thought_flow}</p>
                                      </div>
                                    )}
                                    {file.mse_thought_form && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Form</label>
                                        <p className="text-sm text-gray-900 mt-1">{file.mse_thought_form}</p>
                                      </div>
                                    )}
                                    {file.mse_thought_content && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Content</label>
                                        <p className="text-sm text-gray-900 mt-1">{file.mse_thought_content}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Cognitive */}
                              {(file.mse_cognitive_consciousness || file.mse_cognitive_orientation_time || file.mse_cognitive_orientation_place ||
                                file.mse_cognitive_orientation_person || file.mse_cognitive_memory_immediate || file.mse_cognitive_memory_recent ||
                                file.mse_cognitive_memory_remote || file.mse_cognitive_subtraction || file.mse_cognitive_digit_span ||
                                file.mse_cognitive_counting || file.mse_cognitive_general_knowledge || file.mse_cognitive_calculation ||
                                file.mse_cognitive_similarities || file.mse_cognitive_proverbs) && (
                                  <div className="mb-4">
                                    <h6 className="text-md font-semibold text-gray-800 mb-2">Cognitive</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {file.mse_cognitive_consciousness && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Consciousness</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_consciousness}</p>
                                        </div>
                                      )}
                                      {file.mse_cognitive_orientation_time && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Orientation (Time)</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_orientation_time}</p>
                                        </div>
                                      )}
                                      {file.mse_cognitive_orientation_place && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Orientation (Place)</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_orientation_place}</p>
                                        </div>
                                      )}
                                      {file.mse_cognitive_orientation_person && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Orientation (Person)</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_orientation_person}</p>
                                        </div>
                                      )}
                                      {file.mse_cognitive_memory_immediate && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Memory (Immediate)</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_memory_immediate}</p>
                                        </div>
                                      )}
                                      {file.mse_cognitive_memory_recent && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Memory (Recent)</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_memory_recent}</p>
                                        </div>
                                      )}
                                      {file.mse_cognitive_memory_remote && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Memory (Remote)</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_memory_remote}</p>
                                        </div>
                                      )}
                                      {file.mse_cognitive_subtraction && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Subtraction</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_subtraction}</p>
                                        </div>
                                      )}
                                      {file.mse_cognitive_digit_span && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Digit Span</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_digit_span}</p>
                                        </div>
                                      )}
                                      {file.mse_cognitive_counting && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Counting</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_counting}</p>
                                        </div>
                                      )}
                                      {file.mse_cognitive_general_knowledge && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">General Knowledge</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_general_knowledge}</p>
                                        </div>
                                      )}
                                      {file.mse_cognitive_calculation && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Calculation</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_calculation}</p>
                                        </div>
                                      )}
                                      {file.mse_cognitive_similarities && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Similarities</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_similarities}</p>
                                        </div>
                                      )}
                                      {file.mse_cognitive_proverbs && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Proverbs</label>
                                          <p className="text-sm text-gray-900 mt-1">{file.mse_cognitive_proverbs}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Insight */}
                              {(file.mse_insight_understanding || file.mse_insight_judgement) && (
                                <div className="mb-4">
                                  <h6 className="text-md font-semibold text-gray-800 mb-2">Insight</h6>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {file.mse_insight_understanding && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Understanding</label>
                                        <p className="text-sm text-gray-900 mt-1">{file.mse_insight_understanding}</p>
                                      </div>
                                    )}
                                    {file.mse_insight_judgement && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Judgement</label>
                                        <p className="text-sm text-gray-900 mt-1">{file.mse_insight_judgement}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                        {/* Diagnostic Formulation */}
                        {(file.diagnostic_formulation_summary || file.diagnostic_formulation_features ||
                          file.diagnostic_formulation_psychodynamic) && (
                            <div>
                              <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Diagnostic Formulation</h5>
                              <div className="space-y-4">
                                {file.diagnostic_formulation_summary && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Summary</label>
                                    <p className="text-sm text-gray-900 mt-1 leading-relaxed">{file.diagnostic_formulation_summary}</p>
                                  </div>
                                )}
                                {file.diagnostic_formulation_features && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Features</label>
                                    <p className="text-sm text-gray-900 mt-1 leading-relaxed">{file.diagnostic_formulation_features}</p>
                                  </div>
                                )}
                                {file.diagnostic_formulation_psychodynamic && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Psychodynamic</label>
                                    <p className="text-sm text-gray-900 mt-1 leading-relaxed">{file.diagnostic_formulation_psychodynamic}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Provisional Diagnosis */}
                        {file.provisional_diagnosis && (
                          <div>
                            <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Provisional Diagnosis</h5>
                            <p className="text-sm text-gray-900 leading-relaxed">{file.provisional_diagnosis}</p>
                          </div>
                        )}

                        {/* Treatment Plan */}
                        {file.treatment_plan && (
                          <div>
                            <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Treatment Plan</h5>
                            <p className="text-sm text-gray-900 leading-relaxed">{file.treatment_plan}</p>
                          </div>
                        )}

                        {/* Consultant Comments */}
                        {file.consultant_comments && (
                          <div>
                            <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Consultant Comments</h5>
                            <p className="text-sm text-gray-900 leading-relaxed">{file.consultant_comments}</p>
                          </div>
                        )}

                        {/* Notes */}
                        {file.notes && (
                          <div>
                            <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Additional Notes</h5>
                            <p className="text-sm text-gray-900 leading-relaxed">{file.notes}</p>
                          </div>
                        )}

                        {/* Last Updated */}
                        {file.updated_at && (
                          <div className="pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500">Last Updated: {formatDateTime(file.updated_at)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Card 4: Prescription History - Only show for Admin and JR/SR, not MWO */}
      {canViewPrescriptions && (
        <Card className="shadow-lg border-0 bg-white">
          <div
            className="flex items-center justify-between cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => toggleCard('prescriptions')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <FiPackage className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Prescription History</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {allPrescriptions.length > 0
                    ? `${allPrescriptions.length} prescription${allPrescriptions.length > 1 ? 's' : ''} across ${Object.keys(prescriptionsByVisit).length} visit${Object.keys(prescriptionsByVisit).length > 1 ? 's' : ''}`
                    : 'No prescriptions found'}
                </p>
              </div>
            </div>
            {expandedCards.prescriptions ? (
              <FiChevronUp className="h-6 w-6 text-gray-500" />
            ) : (
              <FiChevronDown className="h-6 w-6 text-gray-500" />
            )}
          </div>

          {expandedCards.prescriptions && (
            <div className="p-6">
              {allPrescriptions.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(prescriptionsByVisit).map(([visitDate, visitData]) => (
                    <div key={visitDate} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">Visit on {visitDate}</h4>
                          {visitData.visitType && (
                            <p className="text-sm text-gray-600 mt-1">
                              {visitData.visitType === 'first_visit' ? 'First Visit' : 'Follow-up Visit'}
                            </p>
                          )}
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-sm font-medium">
                          {visitData.prescriptions.length} {visitData.prescriptions.length === 1 ? 'Medication' : 'Medications'}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        {visitData.prescriptions.map((prescription, idx) => (
                          <div key={prescription.id || idx} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Medicine</label>
                                <p className="text-base font-bold text-gray-900 mt-1">{prescription.medicine || 'N/A'}</p>
                              </div>
                              {prescription.dosage && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Dosage</label>
                                  <p className="text-base font-semibold text-gray-900 mt-1">{prescription.dosage}</p>
                                </div>
                              )}
                              {prescription.when_to_take && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">When to Take</label>
                                  <p className="text-base font-semibold text-gray-900 mt-1">{prescription.when_to_take}</p>
                                </div>
                              )}
                              {prescription.frequency && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Frequency</label>
                                  <p className="text-base font-semibold text-gray-900 mt-1">{prescription.frequency}</p>
                                </div>
                              )}
                              {prescription.duration && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Duration</label>
                                  <p className="text-base font-semibold text-gray-900 mt-1">{prescription.duration}</p>
                                </div>
                              )}
                              {prescription.quantity && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Quantity</label>
                                  <p className="text-base font-semibold text-gray-900 mt-1">{prescription.quantity}</p>
                                </div>
                              )}
                            </div>
                            {(prescription.details || prescription.notes) && (
                              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                                {prescription.details && (
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Details</label>
                                    <p className="text-sm text-gray-900 mt-1">{prescription.details}</p>
                                  </div>
                                )}
                                {prescription.notes && (
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Notes</label>
                                    <p className="text-sm text-gray-900 mt-1">{prescription.notes}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            {prescription.created_at && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500">Prescribed on: {formatDateTime(prescription.created_at)}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FiPackage className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base">No prescription history found</p>
                  <p className="text-sm text-gray-400 mt-1">Prescriptions will appear here once medications are prescribed</p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default PatientDetailsView;
