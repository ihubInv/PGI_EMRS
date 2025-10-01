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

  const patientOptions = patientsData?.data?.patients?.map(p => ({
    value: p.id,
    label: `${p.name} (${p.cr_no})`,
  })) || [];

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
                  Search Patient <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Search by name or CR number..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
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

            <Textarea
              label="Treatment Prescribed"
              name="treatment_prescribed"
              value={formData.treatment_prescribed}
              onChange={handleChange}
              placeholder="Medications, dosages, duration..."
              rows={4}
            />

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

