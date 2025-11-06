import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetPatientByIdQuery } from '../../features/patients/patientsApiSlice';
import { useGetClinicalProformaByPatientIdQuery } from '../../features/clinical/clinicalApiSlice';
import { useGetPrescriptionsByProformaIdQuery, useCreateBulkPrescriptionsMutation } from '../../features/prescriptions/prescriptionApiSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { FiPackage, FiUser, FiSave, FiX, FiPlus, FiTrash2, FiHome, FiUserCheck, FiCalendar, FiFileText, FiClock, FiPrinter, FiList, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import PGI_Logo from '../../assets/PGI_Logo.png';

const PrescribeMedication = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patient_id');
  const returnTab = searchParams.get('returnTab'); // Get returnTab from URL
  const currentUser = useSelector(selectCurrentUser);
  const printRef = useRef(null);

  const { data: patientData, isLoading: loadingPatient } = useGetPatientByIdQuery(
    patientId,
    { skip: !patientId }
  );

  const { data: clinicalHistoryData } = useGetClinicalProformaByPatientIdQuery(
    patientId,
    { skip: !patientId }
  );

  const [createBulkPrescriptions, { isLoading: isSavingPrescriptions }] = useCreateBulkPrescriptionsMutation();

  const patient = patientData?.data?.patient;
  const clinicalHistory = clinicalHistoryData?.data?.proformas || [];

  // Get the most recent clinical proforma for past history
  const latestProforma = clinicalHistory.length > 0 ? clinicalHistory[0] : null;

  // Get today's proforma or latest proforma for linking prescriptions
  const getProformaForPrescription = () => {
    if (!clinicalHistory.length) return null;
    
    const today = new Date().toISOString().split('T')[0];
    // Try to find today's proforma first
    const todayProforma = clinicalHistory.find(p => {
      const visitDate = p.visit_date || p.created_at;
      return visitDate && new Date(visitDate).toISOString().split('T')[0] === today;
    });
    
    // Return today's proforma or the latest one
    return todayProforma || latestProforma;
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Prescription table rows
  const [prescriptions, setPrescriptions] = useState([
    { medicine: '', dosage: '', when: '', frequency: '', duration: '', qty: '', details: '', notes: '' }
  ]);

  const addPrescriptionRow = () => {
    setPrescriptions((prev) => ([...prev, { medicine: '', dosage: '', when: '', frequency: '', duration: '', qty: '', details: '', notes: '' }]));
  };

  const updatePrescriptionCell = (rowIdx, field, value) => {
    setPrescriptions((prev) => prev.map((r, i) => i === rowIdx ? { ...r, [field]: value } : r));
  };

  const removePrescriptionRow = (rowIdx) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== rowIdx));
  };

  const clearAllPrescriptions = () => {
    setPrescriptions([{ medicine: '', dosage: '', when: '', frequency: '', duration: '', qty: '', details: '', notes: '' }]);
  };

  const handleSave = async () => {
    // Filter out empty prescriptions
    const validPrescriptions = prescriptions.filter(p => p.medicine || p.dosage || p.frequency || p.details);
    
    if (validPrescriptions.length === 0) {
      toast.error('Please add at least one medication');
      return;
    }

    // Get the clinical proforma to link prescriptions to
    const proformaForPrescription = getProformaForPrescription();
    
    if (!proformaForPrescription || !proformaForPrescription.id) {
      toast.error('No clinical proforma found. Please create a clinical proforma first before saving prescriptions.');
      return;
    }

    try {
      // Prepare prescriptions data for API (ensure medicine is not empty)
      const prescriptionsToSave = validPrescriptions
        .filter(p => p.medicine && p.medicine.trim()) // Ensure medicine is not empty
        .map(p => ({
          medicine: p.medicine.trim(),
          dosage: p.dosage?.trim() || null,
          when: p.when?.trim() || null,
          frequency: p.frequency?.trim() || null,
          duration: p.duration?.trim() || null,
          qty: p.qty?.trim() || null,
          details: p.details?.trim() || null,
          notes: p.notes?.trim() || null,
        }));
      
      if (prescriptionsToSave.length === 0) {
        toast.error('Please add at least one medication with a valid medicine name');
        return;
      }

      // Save to backend using bulk API
      const result = await createBulkPrescriptions({
        clinical_proforma_id: proformaForPrescription.id,
        prescriptions: prescriptionsToSave,
      }).unwrap();

      // Also save to localStorage as backup
      const prescriptionText = validPrescriptions
        .map((p, idx) => `${idx + 1}. ${p.medicine || ''} | ${p.dosage || ''} | ${p.when || ''} | ${p.frequency || ''} | ${p.duration || ''} | ${p.qty || ''} | ${p.details || ''} | ${p.notes || ''}`)
        .join('\n');

      const prescriptionData = {
        patient_id: patientId,
        prescriptions: validPrescriptions,
        prescription_text: prescriptionText,
        created_at: new Date().toISOString(),
        clinical_proforma_id: proformaForPrescription.id,
      };

      const storedPrescriptions = JSON.parse(localStorage.getItem('patient_prescriptions') || '{}');
      storedPrescriptions[patientId] = prescriptionData;
      localStorage.setItem('patient_prescriptions', JSON.stringify(storedPrescriptions));

      toast.success(`Prescription saved successfully! ${result?.data?.prescriptions?.length || validPrescriptions.length} medication(s) recorded.`);
      
    } catch (error) {
      console.error('Error saving prescriptions:', error);
      toast.error(error?.data?.message || 'Failed to save prescriptions. Please try again.');
    }
  };

  const handlePrint = () => {
    // Filter out empty prescriptions
    const validPrescriptions = prescriptions.filter(p => p.medicine || p.dosage || p.frequency || p.details);
    
    if (validPrescriptions.length === 0) {
      toast.error('Please add at least one medication before printing');
      return;
    }

    // Trigger print
    window.print();
  };

  // Format date for display (full format for print)
  const formatDateFull = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Load existing prescriptions if available
  useEffect(() => {
    if (patientId) {
      const storedPrescriptions = JSON.parse(localStorage.getItem('patient_prescriptions') || '{}');
      const patientPrescriptions = storedPrescriptions[patientId];
      if (patientPrescriptions?.prescriptions) {
        setPrescriptions(patientPrescriptions.prescriptions);
      }
    }
  }, [patientId]);

  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm 15mm;
          }
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          html, body {
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body {
            padding: 0 !important;
            margin: 0 !important;
          }
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible !important;
          }
          .print-content {
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            opacity: 1 !important;
            visibility: visible !important;
            page-break-after: avoid !important;
            overflow: visible !important;
            height: auto !important;
            min-height: auto !important;
          }
          .no-print,
          .no-print * {
            display: none !important;
            visibility: hidden !important;
          }
          .print-header {
            margin-bottom: 12px !important;
            padding-bottom: 8px !important;
            border-bottom: 3px solid #1f2937;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          .print-header h1 {
            margin: 0 !important;
            padding: 0 !important;
            line-height: 1.2 !important;
          }
          .print-header h2 {
            margin: 8px 0 0 0 !important;
            padding: 0 !important;
          }
          .print-table {
            border-collapse: collapse;
            width: 100%;
            font-size: 9px !important;
            margin: 6px 0 !important;
            page-break-inside: auto;
          }
          .print-table thead {
            display: table-header-group;
          }
          .print-table tbody {
            display: table-row-group;
          }
          .print-table th,
          .print-table td {
            border: 1px solid #374151;
            padding: 3px 4px !important;
            text-align: left;
            vertical-align: top;
            word-wrap: break-word;
            line-height: 1.2 !important;
          }
          .print-table th {
            background-color: #f3f4f6 !important;
            font-weight: bold;
            font-size: 9px !important;
          }
          .print-table td {
            font-size: 9px !important;
          }
          .print-table tr {
            page-break-inside: avoid;
          }
          .print-footer {
            margin-top: 15px !important;
            padding-top: 8px !important;
            border-top: 2px solid #1f2937;
            page-break-inside: avoid;
            page-break-after: avoid;
          }
          .print-footer .mb-16 {
            margin-bottom: 35px !important;
          }
          .print-patient-info {
            font-size: 10px !important;
            margin-bottom: 10px !important;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          .print-patient-info > div {
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-section-title {
            font-weight: bold;
            font-size: 11px !important;
            margin: 8px 0 4px 0 !important;
            padding: 0 !important;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            page-break-after: avoid;
          }
          .print-content > div {
            page-break-inside: avoid;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-content img {
            max-height: 65px !important;
            width: auto !important;
            margin: 0 !important;
          }
          .my-4 {
            margin-top: 8px !important;
            margin-bottom: 8px !important;
          }
          .gap-12 {
            gap: 40px !important;
          }
          .gap-4 {
            gap: 12px !important;
          }
          .gap-x-8 {
            column-gap: 20px !important;
          }
          .gap-y-2 {
            row-gap: 4px !important;
          }
          .mb-3 {
            margin-bottom: 8px !important;
          }
          .mt-4 {
            margin-top: 8px !important;
          }
          .pt-3 {
            padding-top: 8px !important;
          }
          .mt-6 {
            margin-top: 12px !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-teal-50">
        <div className="w-full px-6 py-8 space-y-8">
          {/* Header with PGI Logo */}
          <div className="relative no-print">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-lg border-2 border-green-100">
                    <img src={PGI_Logo} alt="PGIMER Logo" className="h-16 w-16 object-contain" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Postgraduate Institute of Medical Education & Research
                    </h1>
                    <p className="text-lg font-semibold text-gray-700 mt-1">Department of Psychiatry</p>
                    <p className="text-base text-gray-600 mt-1">Prescription Form</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={handlePrint}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex items-center gap-2"
                  >
                    <FiPrinter className="w-4 h-4" />
                    Print Prescription
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Print Content - Hidden on screen, visible when printing */}
          <div className="print-content" ref={printRef} style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
            {/* Print Header with PGI Logo */}
            <div className="print-header">
              <div className="flex items-center justify-center gap-4 mb-3">
                <img src={PGI_Logo} alt="PGIMER Logo" className="h-24 w-24 object-contain" />
                <div className="text-center">
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">
                    POSTGRADUATE INSTITUTE OF<br />MEDICAL EDUCATION & RESEARCH
                  </h1>
                  <p className="text-base font-semibold text-gray-700 mt-1">Department of Psychiatry</p>
                  <p className="text-sm text-gray-600">Chandigarh, India</p>
                </div>
              </div>
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide text-center">PRESCRIPTION</h2>
            </div>

            {/* Print Patient Information */}
            {patient && (
              <div className="print-patient-info">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                  <div>
                    <span className="font-bold">Patient Name:</span> <span className="ml-2">{patient.name}</span>
                  </div>
                  <div>
                    <span className="font-bold">CR Number:</span> <span className="ml-2 font-mono">{patient.cr_no}</span>
                  </div>
                  <div>
                    <span className="font-bold">Age/Sex:</span> <span className="ml-2">{patient.actual_age} years, {patient.sex}</span>
                  </div>
                  {patient.psy_no && (
                    <div>
                      <span className="font-bold">PSY Number:</span> <span className="ml-2 font-mono">{patient.psy_no}</span>
                    </div>
                  )}
                  {patient.assigned_doctor_name && (
                    <div>
                      <span className="font-bold">Prescribing Doctor:</span> <span className="ml-2">{patient.assigned_doctor_name} {patient.assigned_doctor_role ? `(${patient.assigned_doctor_role})` : ''}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-bold">Room Number:</span> <span className="ml-2">{patient.assigned_room || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-bold">Date:</span> <span className="ml-2">{formatDateFull(new Date().toISOString())}</span>
                  </div>
                </div>

                {/* Past History in Print */}
                {latestProforma && (
                  <div className="mt-4 pt-3 border-t border-gray-400">
                    <h3 className="print-section-title">Past Clinical History (Most Recent):</h3>
                    <div className="text-xs space-y-1 ml-2">
                      {latestProforma.diagnosis && (
                        <p><span className="font-semibold">Diagnosis:</span> <span className="ml-1">{latestProforma.diagnosis}</span></p>
                      )}
                      {latestProforma.icd_code && (
                        <p><span className="font-semibold">ICD Code:</span> <span className="ml-1 font-mono">{latestProforma.icd_code}</span></p>
                      )}
                      {latestProforma.case_severity && (
                        <p><span className="font-semibold">Case Severity:</span> <span className="ml-1 capitalize">{latestProforma.case_severity}</span></p>
                      )}
                      {latestProforma.visit_date && (
                        <p><span className="font-semibold">Last Visit:</span> <span className="ml-1">{formatDateFull(latestProforma.visit_date)}</span></p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Print Prescription Table */}
            <div className="my-4">
              <h3 className="print-section-title">Medications Prescribed:</h3>
              <table className="print-table">
                <thead>
                  <tr>
                    <th style={{ width: '5%' }}>#</th>
                    <th style={{ width: '22%' }}>Medicine Name</th>
                    <th style={{ width: '12%' }}>Dosage</th>
                    <th style={{ width: '10%' }}>When</th>
                    <th style={{ width: '12%' }}>Frequency</th>
                    <th style={{ width: '10%' }}>Duration</th>
                    <th style={{ width: '8%' }}>Qty</th>
                    <th style={{ width: '11%' }}>Details</th>
                    <th style={{ width: '10%' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions
                    .filter(p => p.medicine || p.dosage || p.frequency || p.details)
                    .map((row, idx) => (
                      <tr key={idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td className="font-medium">{row.medicine || '-'}</td>
                        <td>{row.dosage || '-'}</td>
                        <td>{row.when || '-'}</td>
                        <td>{row.frequency || '-'}</td>
                        <td>{row.duration || '-'}</td>
                        <td className="text-center">{row.qty || '-'}</td>
                        <td>{row.details || '-'}</td>
                        <td>{row.notes || '-'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Print Footer with Signatures */}
            <div className="print-footer">
              <div className="grid grid-cols-2 gap-12 mt-6">
                <div>
                  <div className="mb-16"></div>
                  <div className="border-t-2 border-gray-700 text-center pt-2">
                    <p className="font-bold text-xs">{patient?.assigned_doctor_name || currentUser?.name || 'Doctor Name'}</p>
                    <p className="text-xs text-gray-600 mt-1">{patient?.assigned_doctor_role || currentUser?.role || 'Designation'}</p>
                    <p className="text-xs text-gray-600 mt-1">Department of Psychiatry</p>
                    <p className="text-xs text-gray-600">PGIMER, Chandigarh</p>
                  </div>
                </div>
                <div>
                  <div className="mb-16"></div>
                  <div className="border-t-2 border-gray-700 text-center pt-2">
                    <p className="font-bold text-xs">Authorized Signature</p>
                    <p className="text-xs text-gray-600 mt-1">with Hospital Stamp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Screen View - Patient Information */}
          {patient && (
            <Card
              title={
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiUser className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Patient Information</span>
                </div>
              }
              className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm no-print"
            >
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FiUser className="w-4 h-4 text-blue-600" />
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Name</label>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{patient.name}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FiFileText className="w-4 h-4 text-purple-600" />
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">CR Number</label>
                  </div>
                  <p className="text-lg font-bold text-gray-900 font-mono">{patient.cr_no}</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FiUser className="w-4 h-4 text-green-600" />
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Age / Sex</label>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{patient.actual_age} years, {patient.sex}</p>
                </div>
                {patient.psy_no && (
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-100">
                    <div className="flex items-center gap-2 mb-2">
                      <FiFileText className="w-4 h-4 text-orange-600" />
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">PSY Number</label>
                    </div>
                    <p className="text-lg font-bold text-gray-900 font-mono">{patient.psy_no}</p>
                  </div>
                )}
              </div>

              {/* Assignment & Visit Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-gray-200">
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-4 border border-sky-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FiUserCheck className="w-4 h-4 text-sky-600" />
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Assigned Doctor</label>
                  </div>
                  {patient.assigned_doctor_name ? (
                    <>
                      <p className="text-base font-semibold text-gray-900">{patient.assigned_doctor_name}</p>
                      {patient.assigned_doctor_role && (
                        <p className="text-xs text-gray-600 mt-1">({patient.assigned_doctor_role})</p>
                      )}
                    </>
                  ) : (
                    <p className="text-base text-gray-500 italic">Not assigned</p>
                  )}
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FiHome className="w-4 h-4 text-teal-600" />
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Room Number</label>
                  </div>
                  <p className="text-base font-semibold text-gray-900">{patient.assigned_room || 'Not assigned'}</p>
                </div>
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-4 border border-rose-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FiCalendar className="w-4 h-4 text-rose-600" />
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Visit Date</label>
                  </div>
                  <p className="text-base font-semibold text-gray-900">{formatDate(new Date().toISOString())}</p>
                </div>
                {patient.last_assigned_date && (
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-4 border border-violet-100">
                    <div className="flex items-center gap-2 mb-2">
                      <FiClock className="w-4 h-4 text-violet-600" />
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Last Visit</label>
                    </div>
                    <p className="text-base font-semibold text-gray-900">{formatDate(patient.last_assigned_date)}</p>
                  </div>
                )}
              </div>

              {/* Past History Section */}
              {latestProforma && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <FiFileText className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-bold text-gray-900">Past Clinical History</h3>
                    <span className="text-xs text-gray-500">(Most Recent)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {latestProforma.diagnosis && (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Diagnosis</label>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{latestProforma.diagnosis}</p>
                      </div>
                    )}
                    {latestProforma.icd_code && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">ICD Code</label>
                        <p className="text-sm font-mono font-semibold text-gray-900">{latestProforma.icd_code}</p>
                      </div>
                    )}
                    {latestProforma.treatment_prescribed && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100 md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Previous Treatment</label>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{latestProforma.treatment_prescribed}</p>
                      </div>
                    )}
                    {latestProforma.case_severity && (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Case Severity</label>
                        <p className="text-sm font-semibold text-gray-900 capitalize">{latestProforma.case_severity}</p>
                      </div>
                    )}
                    {latestProforma.visit_date && (
                      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-100">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Last Visit Date</label>
                        <p className="text-sm font-semibold text-gray-900">{formatDate(latestProforma.visit_date)}</p>
                      </div>
                    )}
                  </div>
                  {clinicalHistory.length > 1 && (
                    <div className="mt-4 text-xs text-gray-500 italic">
                      * Total {clinicalHistory.length} clinical record(s) found for this patient
                    </div>
                  )}
                </div>
              )}

              {/* Additional Patient Details */}
              {(patient.age_group || patient.marital_status || patient.occupation || patient.case_complexity) && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {patient.age_group && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Age Group</label>
                        <p className="text-sm font-medium text-gray-900">{patient.age_group}</p>
                      </div>
                    )}
                    {patient.marital_status && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Marital Status</label>
                        <p className="text-sm font-medium text-gray-900">{patient.marital_status}</p>
                      </div>
                    )}
                    {patient.occupation && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Occupation</label>
                        <p className="text-sm font-medium text-gray-900">{patient.occupation}</p>
                      </div>
                    )}
                    {patient.case_complexity && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Case Complexity</label>
                        <p className={`text-sm font-medium ${patient.case_complexity === 'complex' ? 'text-red-700' : 'text-green-700'}`}>
                          {patient.case_complexity === 'complex' ? 'Complex' : 'Simple'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Prescription Section */}
        <Card 
          title={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiPackage className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xl font-bold text-gray-900">Prescription</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Prescribing Doctor:</span> {currentUser?.name || 'N/A'} ({currentUser?.role || 'N/A'})
              </div>
            </div>
          }
          className="shadow-xl border-0 bg-white/80 backdrop-blur-sm no-print"
        >
          <div className="space-y-3">
            <div className="overflow-auto bg-white border border-green-200 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left w-10">#</th>
                    <th className="px-3 py-2 text-left">Medicine</th>
                    <th className="px-3 py-2 text-left">Dosage</th>
                    <th className="px-3 py-2 text-left">When</th>
                    <th className="px-3 py-2 text-left">Frequency</th>
                    <th className="px-3 py-2 text-left">Duration</th>
                    <th className="px-3 py-2 text-left">Qty</th>
                    <th className="px-3 py-2 text-left">Details</th>
                    <th className="px-3 py-2 text-left">Notes</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((row, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-600">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <input
                          value={row.medicine}
                          onChange={(e) => updatePrescriptionCell(idx, 'medicine', e.target.value)}
                          className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Add Medicine"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={row.dosage}
                          onChange={(e) => updatePrescriptionCell(idx, 'dosage', e.target.value)}
                          className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="e.g., 1-0-1"
                          list={`dosageOptions`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={row.when}
                          onChange={(e) => updatePrescriptionCell(idx, 'when', e.target.value)}
                          className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="before/after food"
                          list={`whenOptions`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={row.frequency}
                          onChange={(e) => updatePrescriptionCell(idx, 'frequency', e.target.value)}
                          className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="daily"
                          list={`frequencyOptions`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={row.duration}
                          onChange={(e) => updatePrescriptionCell(idx, 'duration', e.target.value)}
                          className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="5 days"
                          list={`durationOptions`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={row.qty}
                          onChange={(e) => updatePrescriptionCell(idx, 'qty', e.target.value)}
                          className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Qty"
                          list={`quantityOptions`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={row.details}
                          onChange={(e) => updatePrescriptionCell(idx, 'details', e.target.value)}
                          className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Details"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={row.notes}
                          onChange={(e) => updatePrescriptionCell(idx, 'notes', e.target.value)}
                          className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Notes"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button 
                          type="button" 
                          onClick={() => removePrescriptionRow(idx)} 
                          className="text-red-600 hover:text-red-800 hover:underline text-xs flex items-center gap-1"
                        >
                          <FiTrash2 className="w-3 h-3" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Datalist suggestions for prescription fields */}
            <datalist id="dosageOptions">
              <option value="1-0-1" />
              <option value="1-1-1" />
              <option value="1-0-0" />
              <option value="0-1-0" />
              <option value="0-0-1" />
              <option value="1-1-0" />
              <option value="0-1-1" />
              <option value="1-0-1½" />
              <option value="½-0-½" />
              <option value="SOS" />
              <option value="STAT" />
              <option value="PRN" />
              <option value="OD" />
              <option value="BD" />
              <option value="TDS" />
              <option value="QID" />
              <option value="HS" />
              <option value="Q4H" />
              <option value="Q6H" />
              <option value="Q8H" />
            </datalist>
            <datalist id="whenOptions">
              <option value="Before Food" />
              <option value="After Food" />
              <option value="With Food" />
              <option value="Empty Stomach" />
              <option value="Bedtime" />
              <option value="Morning" />
              <option value="Afternoon" />
              <option value="Evening" />
              <option value="Night" />
              <option value="Any Time" />
              <option value="Before Breakfast" />
              <option value="After Breakfast" />
              <option value="Before Lunch" />
              <option value="After Lunch" />
              <option value="Before Dinner" />
              <option value="After Dinner" />
            </datalist>
            <datalist id="frequencyOptions">
              <option value="Once Daily" />
              <option value="Twice Daily" />
              <option value="Thrice Daily" />
              <option value="Four Times Daily" />
              <option value="Every Hour" />
              <option value="Every 2 Hours" />
              <option value="Every 4 Hours" />
              <option value="Every 6 Hours" />
              <option value="Every 8 Hours" />
              <option value="Every 12 Hours" />
              <option value="Alternate Day" />
              <option value="Weekly" />
              <option value="Monthly" />
              <option value="SOS" />
              <option value="Continuous" />
              <option value="Once" />
              <option value="Tapering Dose" />
            </datalist>
            <datalist id="durationOptions">
              <option value="3 Days" />
              <option value="5 Days" />
              <option value="7 Days" />
              <option value="10 Days" />
              <option value="14 Days" />
              <option value="21 Days" />
              <option value="1 Month" />
              <option value="2 Months" />
              <option value="3 Months" />
              <option value="6 Months" />
              <option value="Until Symptoms Subside" />
              <option value="Continuous" />
              <option value="As Directed" />
            </datalist>
            <datalist id="quantityOptions">
              <option value="1" />
              <option value="2" />
              <option value="3" />
              <option value="5" />
              <option value="7" />
              <option value="10" />
              <option value="15" />
              <option value="20" />
              <option value="30" />
              <option value="60" />
              <option value="90" />
              <option value="100" />
              <option value="Custom" />
            </datalist>

            <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
              <Button
                type="button"
                onClick={addPrescriptionRow}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Add Medicine
              </Button>
              <button 
                type="button" 
                onClick={clearAllPrescriptions} 
                className="text-sm text-gray-600 hover:text-gray-800 hover:underline flex items-center gap-1"
              >
                <FiTrash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl no-print">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Navigate back to Today Patients with preserved tab if returnTab exists
                if (returnTab) {
                  navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
                } else {
                  navigate(-1);
                }
              }}
            >
              <FiX className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
            >
              <FiPrinter className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button 
              type="button" 
              onClick={handleSave}
              disabled={isSavingPrescriptions}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="w-4 h-4 mr-2" />
              {isSavingPrescriptions ? 'Saving...' : 'Save Prescription'}
            </Button>
          </div>
        </Card>

        {/* Visit & Prescription History - Only for JR/SR/Admin */}
        {(currentUser?.role === 'JR' || currentUser?.role === 'SR' || currentUser?.role === 'Admin') && clinicalHistory.length > 0 && (
          <VisitHistorySection 
            clinicalHistory={clinicalHistory}
            patientId={patientId}
            formatDate={formatDate}
            formatDateFull={formatDateFull}
          />
        )}
      </div>
    </div>
    </>
  );
};

// Visit History Component
const VisitHistorySection = ({ clinicalHistory, patientId, formatDate, formatDateFull }) => {
  const [expandedDates, setExpandedDates] = useState({});
  const [localPrescriptions, setLocalPrescriptions] = useState({});

  // Load localStorage prescriptions
  useEffect(() => {
    if (patientId) {
      const storedPrescriptions = JSON.parse(localStorage.getItem('patient_prescriptions') || '{}');
      const patientPrescriptions = storedPrescriptions[patientId];
      if (patientPrescriptions) {
        setLocalPrescriptions({ [patientPrescriptions.created_at]: patientPrescriptions.prescriptions });
      }
    }
  }, [patientId]);

  // Group visits by date
  const visitsByDate = useMemo(() => {
    const grouped = {};
    clinicalHistory.forEach((proforma) => {
      const visitDate = proforma.visit_date || proforma.created_at;
      const dateKey = new Date(visitDate).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(proforma);
    });
    // Sort dates descending
    return Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .reduce((acc, date) => {
        acc[date] = grouped[date].sort((a, b) => 
          new Date(b.visit_date || b.created_at) - new Date(a.visit_date || a.created_at)
        );
        return acc;
      }, {});
  }, [clinicalHistory]);

  const toggleDate = (date) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  return (
    <Card 
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FiList className="w-6 h-6 text-indigo-600" />
          </div>
          <span className="text-xl font-bold text-gray-900">Visit & Prescription History</span>
        </div>
      }
      className="shadow-xl border-0 bg-white/80 backdrop-blur-sm no-print"
    >
      <div className="space-y-4">
        {Object.keys(visitsByDate).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiList className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No visit history available</p>
          </div>
        ) : (
          Object.entries(visitsByDate).map(([dateKey, proformas]) => (
            <VisitDateGroup
              key={dateKey}
              date={dateKey}
              proformas={proformas}
              isExpanded={expandedDates[dateKey] ?? false}
              onToggle={() => toggleDate(dateKey)}
              formatDate={formatDate}
              formatDateFull={formatDateFull}
            />
          ))
        )}
      </div>
    </Card>
  );
};

// Visit Date Group Component
const VisitDateGroup = ({ date, proformas, isExpanded, onToggle, formatDate, formatDateFull }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gradient-to-r from-gray-50 to-white">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FiCalendar className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-900">
              {formatDateFull(date)}
            </h3>
            <p className="text-sm text-gray-600">
              {proformas.length} visit{proformas.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <FiChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <FiChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 py-4 space-y-4 border-t border-gray-200 bg-white">
          {proformas.map((proforma) => (
            <VisitDetails
              key={proforma.id}
              proforma={proforma}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Visit Details Component
const VisitDetails = ({ proforma, formatDate }) => {
  const { data: prescriptionsData, isLoading: loadingPrescriptions } = useGetPrescriptionsByProformaIdQuery(
    proforma.id,
    { skip: !proforma.id }
  );

  const prescriptions = prescriptionsData?.data?.prescriptions || [];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FiFileText className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-gray-900">Visit Details</span>
          </div>
          <p className="text-sm text-gray-600">
            {proforma.visit_date ? formatDate(proforma.visit_date) : 'Date not available'}
            {proforma.visit_type && ` • ${proforma.visit_type}`}
          </p>
        </div>
        {proforma.case_severity && (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            proforma.case_severity === 'severe' 
              ? 'bg-red-100 text-red-700' 
              : proforma.case_severity === 'moderate'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {proforma.case_severity}
          </span>
        )}
      </div>

      {/* Diagnosis & Treatment */}
      {(proforma.diagnosis || proforma.treatment_prescribed) && (
        <div className="mb-3 space-y-2">
          {proforma.diagnosis && (
            <div>
              <span className="text-xs font-semibold text-gray-700">Diagnosis: </span>
              <span className="text-sm text-gray-900">{proforma.diagnosis}</span>
              {proforma.icd_code && (
                <span className="text-xs text-gray-600 ml-2 font-mono">({proforma.icd_code})</span>
              )}
            </div>
          )}
          {proforma.treatment_prescribed && (
            <div>
              <span className="text-xs font-semibold text-gray-700">Treatment: </span>
              <span className="text-sm text-gray-900 whitespace-pre-wrap">{proforma.treatment_prescribed}</span>
            </div>
          )}
        </div>
      )}

      {/* Prescriptions */}
      {loadingPrescriptions ? (
        <div className="text-sm text-gray-500 italic">Loading prescriptions...</div>
      ) : prescriptions.length > 0 ? (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <FiPackage className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-gray-900">Prescribed Medications</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border border-gray-200 rounded">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-2 py-1 text-left border-b">#</th>
                  <th className="px-2 py-1 text-left border-b">Medicine</th>
                  <th className="px-2 py-1 text-left border-b">Dosage</th>
                  <th className="px-2 py-1 text-left border-b">When</th>
                  <th className="px-2 py-1 text-left border-b">Frequency</th>
                  <th className="px-2 py-1 text-left border-b">Duration</th>
                  <th className="px-2 py-1 text-left border-b">Qty</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((prescription, idx) => (
                  <tr key={prescription.id} className="hover:bg-gray-50">
                    <td className="px-2 py-1 border-b">{idx + 1}</td>
                    <td className="px-2 py-1 border-b font-medium">{prescription.medicine || '-'}</td>
                    <td className="px-2 py-1 border-b">{prescription.dosage || '-'}</td>
                    <td className="px-2 py-1 border-b">{prescription.when || '-'}</td>
                    <td className="px-2 py-1 border-b">{prescription.frequency || '-'}</td>
                    <td className="px-2 py-1 border-b">{prescription.duration || '-'}</td>
                    <td className="px-2 py-1 border-b">{prescription.qty || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500 italic mt-2">No prescriptions recorded for this visit</div>
      )}
    </div>
  );
};

export default PrescribeMedication;

