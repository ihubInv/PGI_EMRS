import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetPrescriptionByIdQuery, useUpdatePrescriptionMutation } from '../../features/prescriptions/prescriptionApiSlice';
import { useGetPatientByIdQuery } from '../../features/patients/patientsApiSlice';
import { useGetClinicalProformaByIdQuery } from '../../features/clinical/clinicalApiSlice';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { FiPackage, FiUser, FiSave, FiX, FiPrinter, FiFileText } from 'react-icons/fi';
import PGI_Logo from '../../assets/PGI_Logo.png';
import medicinesData from '../../assets/psychiatric_meds_india.json';
import LoadingSpinner from '../../components/LoadingSpinner';

const PrescriptionEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const returnTab = searchParams.get('returnTab');
  const currentUser = useSelector(selectCurrentUser);
  const printRef = useRef(null);

  const { data: prescriptionData, isLoading: loadingPrescription } = useGetPrescriptionByIdQuery(id);
  const prescription = prescriptionData?.data?.prescription;

  const patientId = prescription?.clinical_proforma_id ? null : searchParams.get('patient_id');
  const clinicalProformaId = prescription?.clinical_proforma_id;

  const { data: patientData, isLoading: loadingPatient } = useGetPatientByIdQuery(
    prescription?.patient_id || patientId,
    { skip: !prescription?.patient_id && !patientId }
  );

  const { data: proformaData, isLoading: loadingProforma } = useGetClinicalProformaByIdQuery(
    clinicalProformaId,
    { skip: !clinicalProformaId }
  );

  const [updatePrescription, { isLoading: isUpdating }] = useUpdatePrescriptionMutation();

  const patient = patientData?.data?.patient || proformaData?.data?.proforma?.patient;
  const proforma = proformaData?.data?.proforma;

  // Flatten medicines data for autocomplete
  const allMedicines = useMemo(() => {
    const medicines = [];
    const data = medicinesData.psychiatric_medications;
    
    const extractMedicines = (obj) => {
      if (Array.isArray(obj)) {
        obj.forEach(med => {
          medicines.push({
            name: med.name,
            displayName: med.name,
            type: 'generic',
            brands: med.brands || [],
            strengths: med.strengths || []
          });
          if (med.brands && Array.isArray(med.brands)) {
            med.brands.forEach(brand => {
              medicines.push({
                name: brand,
                displayName: `${brand} (${med.name})`,
                type: 'brand',
                genericName: med.name,
                strengths: med.strengths || []
              });
            });
          }
        });
      } else if (typeof obj === 'object' && obj !== null) {
        Object.values(obj).forEach(value => {
          extractMedicines(value);
        });
      }
    };
    
    extractMedicines(data);
    const uniqueMedicines = Array.from(
      new Map(medicines.map(m => [m.name.toLowerCase(), m])).values()
    );
    return uniqueMedicines.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    medicine: '',
    dosage: '',
    when: '',
    frequency: '',
    duration: '',
    qty: '',
    details: '',
    notes: '',
  });

  // Medicine autocomplete state
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState(null);
  const medicineInputRef = useRef(null);

  // Load prescription data
  useEffect(() => {
    if (prescription) {
      setFormData({
        medicine: prescription.medicine || '',
        dosage: prescription.dosage || '',
        when: prescription.when || '',
        frequency: prescription.frequency || '',
        duration: prescription.duration || '',
        qty: prescription.qty || '',
        details: prescription.details || '',
        notes: prescription.notes || '',
      });
    }
  }, [prescription]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Handle medicine autocomplete
    if (name === 'medicine') {
      const searchTerm = value.toLowerCase().trim();
      if (searchTerm.length > 0) {
        const filtered = allMedicines.filter(med => 
          med.name.toLowerCase().includes(searchTerm) ||
          med.displayName.toLowerCase().includes(searchTerm) ||
          (med.genericName && med.genericName.toLowerCase().includes(searchTerm))
        ).slice(0, 10);
        setMedicineSuggestions(filtered);
        setShowSuggestions(true);
        setActiveSuggestionIndex(-1);
        
        setTimeout(() => {
          const input = medicineInputRef.current;
          if (input) {
            const rect = input.getBoundingClientRect();
            const dropdownHeight = 240;
            const spaceAbove = rect.top;
            const spaceBelow = window.innerHeight - rect.bottom;
            const positionAbove = spaceAbove > dropdownHeight || spaceAbove > spaceBelow;
            
            setSuggestionPosition({
              top: positionAbove ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
              left: rect.left,
              width: rect.width
            });
          }
        }, 0);
      } else {
        setShowSuggestions(false);
        setMedicineSuggestions([]);
      }
    }
  };

  const selectMedicine = (medicine) => {
    setFormData(prev => ({ ...prev, medicine: medicine.name }));
    setShowSuggestions(false);
    setMedicineSuggestions([]);
  };

  const handleMedicineKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = activeSuggestionIndex < medicineSuggestions.length - 1 ? activeSuggestionIndex + 1 : activeSuggestionIndex;
      setActiveSuggestionIndex(nextIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = activeSuggestionIndex > 0 ? activeSuggestionIndex - 1 : -1;
      setActiveSuggestionIndex(prevIndex);
    } else if (e.key === 'Enter' && activeSuggestionIndex >= 0 && medicineSuggestions[activeSuggestionIndex]) {
      e.preventDefault();
      selectMedicine(medicineSuggestions[activeSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.medicine || !formData.medicine.trim()) {
      toast.error('Medicine name is required');
      return;
    }

    try {
      await updatePrescription({
        id: parseInt(id),
        medicine: formData.medicine.trim(),
        dosage: formData.dosage?.trim() || null,
        when: formData.when?.trim() || null,
        frequency: formData.frequency?.trim() || null,
        duration: formData.duration?.trim() || null,
        qty: formData.qty?.trim() || null,
        details: formData.details?.trim() || null,
        notes: formData.notes?.trim() || null,
      }).unwrap();

      toast.success('Prescription updated successfully!');
      
      if (returnTab) {
        navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
      } else if (patientId) {
        navigate(`/patients/${patientId}?tab=prescriptions`);
      } else if (clinicalProformaId) {
        navigate(`/prescriptions/view?clinical_proforma_id=${clinicalProformaId}`);
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.error('Error updating prescription:', error);
      toast.error(error?.data?.message || 'Failed to update prescription. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

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

  if (loadingPrescription || loadingPatient || loadingProforma) {
    return <LoadingSpinner />;
  }

  if (!prescription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-teal-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Prescription Not Found</h2>
          <p className="text-gray-600 mb-6">The prescription you're trying to edit doesn't exist.</p>
          <Button onClick={() => navigate(-1)} variant="primary">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Print-specific styles - same as CreatePrescription */}
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
          .print-table {
            border-collapse: collapse;
            width: 100%;
            font-size: 9px !important;
            margin: 6px 0 !important;
          }
          .print-table th,
          .print-table td {
            border: 1px solid #374151;
            padding: 3px 4px !important;
            text-align: left;
          }
          .print-table th {
            background-color: #f3f4f6 !important;
            font-weight: bold;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-teal-50">
        <div className="w-full px-6 py-8 space-y-8">
          {/* Header */}
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
                    <p className="text-base text-gray-600 mt-1">Edit Prescription</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={handlePrint}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex items-center gap-2"
                  >
                    <FiPrinter className="w-4 h-4" />
                    Print
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Print Content */}
          <div className="print-content" ref={printRef} style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
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
                    <span className="font-bold">Age/Sex:</span> <span className="ml-2">{patient.age} years, {patient.sex}</span>
                  </div>
                  <div>
                    <span className="font-bold">Date:</span> <span className="ml-2">{formatDateFull(new Date().toISOString())}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="my-4">
              <h3 className="print-section-title">Medication Prescribed:</h3>
              <table className="print-table">
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Dosage</th>
                    <th>When</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Qty</th>
                    <th>Details</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-medium">{formData.medicine || '-'}</td>
                    <td>{formData.dosage || '-'}</td>
                    <td>{formData.when || '-'}</td>
                    <td>{formData.frequency || '-'}</td>
                    <td>{formData.duration || '-'}</td>
                    <td className="text-center">{formData.qty || '-'}</td>
                    <td>{formData.details || '-'}</td>
                    <td>{formData.notes || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="print-footer">
              <div className="grid grid-cols-2 gap-12 mt-6">
                <div>
                  <div className="mb-16"></div>
                  <div className="border-t-2 border-gray-700 text-center pt-2">
                    <p className="font-bold text-xs">{currentUser?.name || 'Doctor Name'}</p>
                    <p className="text-xs text-gray-600 mt-1">{currentUser?.role || 'Designation'}</p>
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

          {/* Patient Information */}
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
                  <p className="text-lg font-bold text-gray-900">{patient.age} years, {patient.sex}</p>
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
            </Card>
          )}

          {/* Edit Prescription Form */}
          <Card 
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiPackage className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xl font-bold text-gray-900">Edit Prescription</span>
              </div>
            }
            className="shadow-xl border-0 bg-white/80 backdrop-blur-sm no-print"
          >
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2" style={{ position: 'relative' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medicine Name <span className="text-red-500">*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        ref={medicineInputRef}
                        type="text"
                        name="medicine"
                        value={formData.medicine}
                        onChange={handleChange}
                        onKeyDown={handleMedicineKeyDown}
                        onFocus={() => {
                          if (formData.medicine && formData.medicine.trim().length > 0) {
                            const searchTerm = formData.medicine.toLowerCase().trim();
                            const filtered = allMedicines.filter(med => 
                              med.name.toLowerCase().includes(searchTerm) ||
                              med.displayName.toLowerCase().includes(searchTerm) ||
                              (med.genericName && med.genericName.toLowerCase().includes(searchTerm))
                            ).slice(0, 10);
                            setMedicineSuggestions(filtered);
                            setShowSuggestions(true);
                            
                            setTimeout(() => {
                              const input = medicineInputRef.current;
                              if (input) {
                                const rect = input.getBoundingClientRect();
                                const dropdownHeight = 240;
                                const spaceAbove = rect.top;
                                const spaceBelow = window.innerHeight - rect.bottom;
                                const positionAbove = spaceAbove > dropdownHeight || spaceAbove > spaceBelow;
                                
                                setSuggestionPosition({
                                  top: positionAbove ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
                                  left: rect.left,
                                  width: rect.width
                                });
                              }
                            }, 0);
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setShowSuggestions(false);
                          }, 200);
                        }}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Type to search medicine..."
                        autoComplete="off"
                        required
                      />
                      {showSuggestions && medicineSuggestions.length > 0 && (
                        <div 
                          className="fixed bg-white border border-gray-300 rounded-lg shadow-2xl max-h-60 overflow-y-auto z-50"
                          style={{ 
                            top: suggestionPosition?.top ? `${suggestionPosition.top}px` : 'auto',
                            left: suggestionPosition?.left ? `${suggestionPosition.left}px` : 'auto',
                            width: suggestionPosition?.width ? `${suggestionPosition.width}px` : '300px',
                            minWidth: '300px',
                            maxWidth: '400px'
                          }}
                        >
                          {medicineSuggestions.map((med, medIdx) => (
                            <div
                              key={`${med.name}-${medIdx}`}
                              onClick={() => selectMedicine(med)}
                              onMouseDown={(e) => e.preventDefault()}
                              className={`px-3 py-2 cursor-pointer hover:bg-green-50 transition-colors ${
                                activeSuggestionIndex === medIdx ? 'bg-green-100' : ''
                              } ${medIdx === 0 ? 'rounded-t-lg' : ''} ${
                                medIdx === medicineSuggestions.length - 1 ? 'rounded-b-lg' : ''
                              }`}
                            >
                              <div className="font-medium text-gray-900">{med.name}</div>
                              {med.displayName !== med.name && (
                                <div className="text-xs text-gray-500">{med.displayName}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Input
                    label="Dosage"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleChange}
                    placeholder="e.g., 1-0-1"
                  />

                  <Input
                    label="When"
                    name="when"
                    value={formData.when}
                    onChange={handleChange}
                    placeholder="before/after food"
                  />

                  <Input
                    label="Frequency"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    placeholder="daily"
                  />

                  <Input
                    label="Duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="5 days"
                  />

                  <Input
                    label="Quantity"
                    name="qty"
                    value={formData.qty}
                    onChange={handleChange}
                    placeholder="Qty"
                  />

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Details</label>
                    <textarea
                      name="details"
                      value={formData.details}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Additional details"
                      rows={2}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Additional notes"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (returnTab) {
                        navigate(`/clinical-today-patients${returnTab === 'existing' ? '?tab=existing' : ''}`);
                      } else if (patientId) {
                        navigate(`/patients/${patientId}?tab=prescriptions`);
                      } else if (clinicalProformaId) {
                        navigate(`/prescriptions/view?clinical_proforma_id=${clinicalProformaId}`);
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
                    type="submit" 
                    disabled={isUpdating}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSave className="w-4 h-4 mr-2" />
                    {isUpdating ? 'Updating...' : 'Update Prescription'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PrescriptionEdit;

