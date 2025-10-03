import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCreateClinicalProformaMutation } from '../../features/clinical/clinicalApiSlice';
import { useSearchPatientsQuery } from '../../features/patients/patientsApiSlice';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import { VISIT_TYPES, CASE_SEVERITY, DOCTOR_DECISION } from '../../utils/constants';

const CreateClinicalProforma = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientIdFromQuery = searchParams.get('patient_id');

  const [createProforma, { isLoading }] = useCreateClinicalProformaMutation();
  const [patientSearch, setPatientSearch] = useState('');
  const { data: patientsData } = useSearchPatientsQuery(
    { search: patientSearch, limit: 10 },
    { skip: !patientSearch }
  );

  const [formData, setFormData] = useState({
    patient_id: patientIdFromQuery || '',
    visit_date: new Date().toISOString().split('T')[0],
    visit_type: 'first_visit',
    room_no: '',
    assigned_doctor: '',
    informant_present: true,
    nature_of_information: '',
    onset_duration: '',
    course: '',
    precipitating_factor: '',
    illness_duration: '',
    current_episode_since: '',
    mood: '',
    behaviour: '',
    speech: '',
    thought: '',
    perception: '',
    somatic: '',
    bio_functions: '',
    adjustment: '',
    cognitive_function: '',
    fits: '',
    sexual_problem: '',
    substance_use: '',
    past_history: '',
    family_history: '',
    associated_medical_surgical: '',
    mse_behaviour: '',
    mse_affect: '',
    mse_thought: '',
    mse_delusions: '',
    mse_perception: '',
    mse_cognitive_function: '',
    gpe: '',
    diagnosis: '',
    icd_code: '',
    disposal: '',
    workup_appointment: '',
    referred_to: '',
    treatment_prescribed: '',
    doctor_decision: 'simple_case',
    case_severity: 'mild',
    requires_adl_file: false,
    adl_reasoning: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (formData.doctor_decision === 'complex_case') {
      setFormData(prev => ({ ...prev, requires_adl_file: true }));
    }
  }, [formData.doctor_decision]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.patient_id) {
      newErrors.patient_id = 'Patient is required';
    }
    if (!formData.visit_date) {
      newErrors.visit_date = 'Visit date is required';
    }
    if (!formData.treatment_prescribed?.trim()) {
      newErrors.treatment_prescribed = 'Medication prescription is required';
    }
    if (formData.doctor_decision === 'complex_case' && !formData.adl_reasoning) {
      newErrors.adl_reasoning = 'ADL reasoning is required for complex cases';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      const submitData = {
        ...formData,
        patient_id: parseInt(formData.patient_id),
      };

      const result = await createProforma(submitData).unwrap();
      toast.success('Clinical proforma created successfully!');
      
      if (result.data?.adl_file?.created) {
        toast.info(`ADL File created: ${result.data.adl_file.adl_no}`);
      }
      
      navigate(`/clinical/${result.data.proforma.id}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create clinical proforma');
    }
  };

  // Auto-select patient when exact CR match found
  useEffect(() => {
    if (!patientsData?.data?.patients || formData.patient_id) return;
    
    const patients = patientsData.data.patients;
    
    // If searching for a CR number, auto-select exact match
    if (patientSearch && patientSearch.startsWith('CR')) {
      const exactMatch = patients.find(p => 
        p.cr_no === patientSearch || p.cr_no === patientSearch.toUpperCase()
      );
      
      if (exactMatch) {
        setFormData(prev => ({ 
          ...prev, 
          patient_id: exactMatch.id.toString(),
          visit_type: 'follow_up' // Previous patient, so follow-up visit
        }));
        toast.success(`Patient found: ${exactMatch.name} (${exactMatch.cr_no})`);
      }
    } else if (patients.length === 1) {
      // Auto-select if only one result found
      setFormData(prev => ({ 
        ...prev, 
        patient_id: patients[0].id.toString(),
        visit_type: 'follow_up'
      }));
    }
  }, [patientsData, patientSearch]);

  // Create patient options (prioritize exact CR matches)
  const patientOptions = (() => {
    if (!patientsData?.data?.patients) return [];
    
    const patients = patientsData.data.patients;
    
    // If searching for CR number, prioritize exact match
    if (patientSearch && patientSearch.startsWith('CR')) {
      const exactMatch = patients.find(p => 
        p.cr_no === patientSearch || p.cr_no === patientSearch.toUpperCase()
      );
      
      if (exactMatch) {
        return [{
          value: exactMatch.id,
          label: `${exactMatch.name} (${exactMatch.cr_no}) - EXACT MATCH`,
        }];
      }
    }
    
    // Default: return all patients with CR numbers
    return patients.slice(0, 5).map(p => ({
      value: p.id,
      label: `${p.name} (${p.cr_no})`,
    }));
  })();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New Clinical Proforma</h1>
        <p className="text-gray-600 mt-1">Complete clinical assessment</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card title="Basic Information" className="mb-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Patient by CR Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    placeholder="e.g., 2024123456 (CR2024123456)"
                    value={patientSearch.startsWith('CR') ? patientSearch.slice(2) : patientSearch}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPatientSearch(value.startsWith('CR') ? value : `CR${value}`);
                    }}
                    className="pl-10"
                  />
                  <span className="absolute left-3 top-3 text-gray-500 font-semibold text-sm">CR</span>
                </div>
                
                {patientSearch && patientSearch.length < 8 && (
                  <p className="text-xs text-gray-500 mt-1">Enter at least 8 characters to search</p>
                )}
                
                {patientOptions.length > 0 && (
                  <Select
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleChange}
                    options={patientOptions}
                    placeholder="Select patient"
                    error={errors.patient_id}
                    required
                    className="mt-2"
                  />
                )}
                
                {/* Show selected patient info */}
                {formData.patient_id && patientsData?.data?.patients && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    {(() => {
                      const selectedPatient = patientsData.data.patients.find(p => p.id.toString() === formData.patient_id);
                      return selectedPatient ? (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-medium text-green-800">Patient Selected</span>
                          </div>
                          <p className="text-sm text-green-700">
                            <strong>{selectedPatient.name}</strong> - {selectedPatient.cr_no}
                          </p>
                          <p className="text-xs text-green-600">
                            Age: {selectedPatient.actual_age}, Sex: {selectedPatient.sex}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Visit Type: {formData.visit_type === 'follow_up' ? 'Follow-up Visit' : 'First Visit'}
                          </p>
                        </>
                      ) : null;
                    })()}
                  </div>
                )}
                
                {/* No results */}
                {patientSearch.length >= 8 && !patientsData?.data?.patients?.length && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      🔍 No patient found with CR number: <strong>{patientSearch}</strong>
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Make sure the patient has been registered first by MWO
                    </p>
                  </div>
                )}
              </div>

              <Input
                label="Visit Date"
                type="date"
                name="visit_date"
                value={formData.visit_date}
                onChange={handleChange}
                error={errors.visit_date}
                required
              />

              <Select
                label="Visit Type"
                name="visit_type"
                value={formData.visit_type}
                onChange={handleChange}
                options={VISIT_TYPES}
                required
              />

              <Input
                label="Room Number"
                name="room_no"
                value={formData.room_no}
                onChange={handleChange}
                placeholder="e.g., Ward A-101"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="informant_present"
                name="informant_present"
                checked={formData.informant_present}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 rounded"
              />
              <label htmlFor="informant_present" className="ml-2 text-sm text-gray-700">
                Informant Present
              </label>
            </div>

            <Textarea
              label="Nature of Information"
              name="nature_of_information"
              value={formData.nature_of_information}
              onChange={handleChange}
              placeholder="Describe the nature and reliability of information..."
              rows={3}
            />
          </div>
        </Card>

        {/* History of Present Illness */}
        <Card title="History of Present Illness" className="mb-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Textarea
                label="Onset & Duration"
                name="onset_duration"
                value={formData.onset_duration}
                onChange={handleChange}
                rows={3}
              />

              <Textarea
                label="Course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <Textarea
              label="Precipitating Factor"
              name="precipitating_factor"
              value={formData.precipitating_factor}
              onChange={handleChange}
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Illness Duration"
                name="illness_duration"
                value={formData.illness_duration}
                onChange={handleChange}
                placeholder="e.g., 6 months"
              />

              <Input
                label="Current Episode Since"
                type="date"
                name="current_episode_since"
                value={formData.current_episode_since}
                onChange={handleChange}
              />
            </div>
          </div>
        </Card>

        {/* Mental State Examination */}
        <Card title="Mental State Examination (MSE)" className="mb-6">
          <div className="space-y-6">
            <Textarea
              label="Behaviour"
              name="mse_behaviour"
              value={formData.mse_behaviour}
              onChange={handleChange}
              placeholder="General appearance, psychomotor activity, eye contact..."
              rows={3}
            />

            <Textarea
              label="Affect & Mood"
              name="mse_affect"
              value={formData.mse_affect}
              onChange={handleChange}
              placeholder="Quality, range, congruence..."
              rows={3}
            />

            <Textarea
              label="Thought (Flow, Form, Content)"
              name="mse_thought"
              value={formData.mse_thought}
              onChange={handleChange}
              placeholder="Flow: normal/accelerated/retarded; Form: logical/tangential; Content: preoccupations..."
              rows={4}
            />

            <Textarea
              label="Delusions"
              name="mse_delusions"
              value={formData.mse_delusions}
              onChange={handleChange}
              placeholder="Persecutory, grandiose, referential..."
              rows={3}
            />

            <Textarea
              label="Perception"
              name="mse_perception"
              value={formData.mse_perception}
              onChange={handleChange}
              placeholder="Hallucinations (auditory, visual), illusions..."
              rows={3}
            />

            <Textarea
              label="Cognitive Function"
              name="mse_cognitive_function"
              value={formData.mse_cognitive_function}
              onChange={handleChange}
              placeholder="Orientation, attention, concentration, memory, insight, judgment..."
              rows={3}
            />
          </div>
        </Card>

        {/* Additional History */}
        <Card title="Additional History" className="mb-6">
          <div className="space-y-6">
            <Textarea
              label="Bio-Functions (Sleep, Appetite)"
              name="bio_functions"
              value={formData.bio_functions}
              onChange={handleChange}
              rows={3}
            />

            <Textarea
              label="Substance Use"
              name="substance_use"
              value={formData.substance_use}
              onChange={handleChange}
              placeholder="Alcohol, tobacco, drugs..."
              rows={3}
            />

            <Textarea
              label="Past Psychiatric History"
              name="past_history"
              value={formData.past_history}
              onChange={handleChange}
              rows={3}
            />

            <Textarea
              label="Family History"
              name="family_history"
              value={formData.family_history}
              onChange={handleChange}
              rows={3}
            />

            <Textarea
              label="Associated Medical/Surgical Conditions"
              name="associated_medical_surgical"
              value={formData.associated_medical_surgical}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </Card>

        {/* General Physical Examination */}
        <Card title="General Physical Examination" className="mb-6">
          <Textarea
            label="GPE Findings"
            name="gpe"
            value={formData.gpe}
            onChange={handleChange}
            placeholder="BP, Pulse, Weight, BMI, General appearance, Systemic examination..."
            rows={4}
          />
        </Card>

        {/* Diagnosis & Management */}
        <Card title="Diagnosis & Management" className="mb-6">
          <div className="space-y-6">
            <Textarea
              label="Diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="Primary and secondary diagnoses..."
              rows={3}
              required
            />

            <Input
              label="ICD Code"
              name="icd_code"
              value={formData.icd_code}
              onChange={handleChange}
              placeholder="e.g., F32.1"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Case Severity"
                name="case_severity"
                value={formData.case_severity}
                onChange={handleChange}
                options={CASE_SEVERITY}
                required
              />

              <Select
                label="Doctor Decision"
                name="doctor_decision"
                value={formData.doctor_decision}
                onChange={handleChange}
                options={DOCTOR_DECISION}
                required
              />
            </div>

            {/* Prescription Section */}
            <Card title="Prescription" className="border-2 border-green-200 bg-green-50">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">💊</span>
                  </div>
                  <h4 className="font-semibold text-green-800">Medicine Prescription</h4>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Common Medications (Quick Add)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {[
                        'Paracetamol 500mg',
                        'Amoxicillin 500mg', 
                        'Omeprazole 20mg',
                        'Cetirizine 10mg',
                        'Ranitidine 150mg',
                        'Tramadol 50mg',
                        'Ibuprofen 400mg',
                        'Diclofenac 50mg',
                        'Metformin 500mg'
                      ].map((med) => (
                        <button
                          key={med}
                          type="button"
                          onClick={() => {
                            const currentPrescription = formData.treatment_prescribed || '';
                            const medicineTemplate = `1 tablet twice daily × 5 days`;
                            const newPrescription = currentPrescription 
                              ? `${currentPrescription}\n• ${med} - ${medicineTemplate}`
                              : `• ${med} - ${medicineTemplate}`;
                            handleChange({ target: { name: 'treatment_prescribed', value: newPrescription } });
                          }}
                          className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded border text-left transition-colors"
                        >
                          + {med}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <Textarea
                    label="Medications Prescribed"
                    name="treatment_prescribed"
                    value={formData.treatment_prescribed}
                    onChange={handleChange}
                    placeholder="Example:
• Paracetamol 500mg - 1 tablet 3 times daily × 5 days
• Amoxicillin 500mg - 1 tablet 3 times daily × 7 days  
• Omeprazole 20mg - 1 tablet once daily × 10 days
• Follow-up after 1 week for review"
                    rows={6}
                    className="font-mono text-sm"
                    error={errors.treatment_prescribed}
                    required
                  />
                  
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <p className="text-yellow-700">
                      <strong>💡 Prescription Guidelines:</strong><br/>
                      • Include drug name, strength, dosage, frequency, and duration<br/>
                      • Use standard dosing schedules (morning/evening/3 times daily)<br/>
                      • Specify duration of treatment<br/>
                      • Add any special instructions or precautions
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Textarea
              label="Disposal & Referral"
              name="disposal"
              value={formData.disposal}
              onChange={handleChange}
              placeholder="Admission, discharge, follow-up..."
              rows={2}
            />

            <Input
              label="Workup Appointment"
              type="date"
              name="workup_appointment"
              value={formData.workup_appointment}
              onChange={handleChange}
            />

            <Textarea
              label="Referred To"
              name="referred_to"
              value={formData.referred_to}
              onChange={handleChange}
              placeholder="Other departments or specialists..."
              rows={2}
            />
          </div>
        </Card>

        {/* ADL File Requirements */}
        {formData.doctor_decision === 'complex_case' && (
          <Card title="ADL File Requirements" className="mb-6">
            <div className="space-y-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requires_adl_file"
                  name="requires_adl_file"
                  checked={formData.requires_adl_file}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 rounded"
                />
                <label htmlFor="requires_adl_file" className="ml-2 text-sm text-gray-700">
                  Requires ADL File (Auto-checked for complex cases)
                </label>
              </div>

              <Textarea
                label="ADL Reasoning"
                name="adl_reasoning"
                value={formData.adl_reasoning}
                onChange={handleChange}
                placeholder="Explain why this case requires an ADL file..."
                rows={4}
                required
                error={errors.adl_reasoning}
              />
            </div>
          </Card>
        )}

        {/* Submit Buttons */}
        <Card>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/clinical')}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              Create Clinical Proforma
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateClinicalProforma;

