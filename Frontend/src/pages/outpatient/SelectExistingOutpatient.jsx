import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCreateOutpatientRecordMutation } from '../../features/outpatient/outpatientApiSlice';
import { useSearchPatientsQuery, useAssignPatientMutation } from '../../features/patients/patientsApiSlice';
import { useGetAllUsersQuery } from '../../features/users/usersApiSlice';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

const SelectExistingOutpatient = () => {
  const navigate = useNavigate();

  const [createRecord, { isLoading }] = useCreateOutpatientRecordMutation();
  const [assignPatient, { isLoading: isAssigning }] = useAssignPatientMutation();
  const { data: usersData } = useGetAllUsersQuery({ page: 1, limit: 100 });

  const [patientSearch, setPatientSearch] = useState('');
  const { data: patientsData, error: searchError, isLoading: searching } = useSearchPatientsQuery(
    { search: patientSearch, limit: 10 },
    { skip: !patientSearch || patientSearch.length < 2 }
  );

  const [formData, setFormData] = useState({
    patient_id: '',
    visit_type: 'follow_up',
    assigned_doctor_id: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.patient_id) newErrors.patient_id = 'Patient is required';
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
      // Create outpatient demographics record (selected patient only)
      await createRecord({ patient_id: parseInt(formData.patient_id) }).unwrap();

      // Optional: assign to doctor if selected
      if (formData.assigned_doctor_id) {
        try {
          await assignPatient({
            patient_id: parseInt(formData.patient_id),
            assigned_doctor: Number(formData.assigned_doctor_id),
          }).unwrap();
        } catch (_) {}
      }

      toast.success('Outpatient record created successfully!');
      navigate('/outpatient');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create record');
    }
  };

  // Auto-select if only one result
  useEffect(() => {
    if (!patientsData?.data?.patients || formData.patient_id) return;
    const list = patientsData.data.patients;
    if (list.length === 1) {
      setFormData((prev) => ({ ...prev, patient_id: list[0].id.toString() }));
    }
  }, [patientsData, formData.patient_id]);

  const patientOptions = (patientsData?.data?.patients || []).map((p) => ({
    value: p.id,
    label: `${p.name} (${p.cr_no})`,
  }));

  const selectedPatient = (patientsData?.data?.patients || []).find(
    (p) => p.id?.toString() === formData.patient_id
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Select Existing Patient</h1>
        <p className="text-gray-600 mt-1">Search and select an existing patient to create an outpatient record</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Patient Information">
          <div className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Search Patient</label>
              <Input
                placeholder="Type CR number, PSY number, ADL number, or patient name..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="text-sm"
              />
              {patientSearch && patientSearch.length < 2 && (
                <p className="text-xs text-gray-500">Enter at least 2 characters to search</p>
              )}
            </div>

            {/* Loading / Error */}
            {searching && <LoadingSpinner className="h-24" />}
            {searchError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {searchError?.data?.message || searchError.message}
              </div>
            )}

            {/* Select patient dropdown */}
            <Select
              label="Patient"
              name="patient_id"
              value={formData.patient_id}
              onChange={handleChange}
              options={patientOptions}
              error={errors.patient_id}
              required
            />

            {/* Selected patient details */}
            {selectedPatient && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div><span className="font-medium text-gray-700">Name:</span> <span className="ml-1 text-gray-800">{selectedPatient.name}</span></div>
                  <div><span className="font-medium text-gray-700">CR No:</span> <span className="ml-1 text-gray-800 font-mono">{selectedPatient.cr_no}</span></div>
                  <div><span className="font-medium text-gray-700">Sex:</span> <span className="ml-1 text-gray-800">{selectedPatient.sex}</span></div>
                  <div><span className="font-medium text-gray-700">Age:</span> <span className="ml-1 text-gray-800">{selectedPatient.actual_age}</span></div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  {selectedPatient.has_adl_file ? (
                    <span>📁 Has ADL file{selectedPatient.adl_no ? ` (${selectedPatient.adl_no})` : ''}</span>
                  ) : (
                    <span>📁 No ADL file</span>
                  )}
                </div>
              </div>
            )}

            {/* Assign doctor */}
            <Select
              label="Assign Doctor (JR/SR)"
              name="assigned_doctor_id"
              value={formData.assigned_doctor_id}
              onChange={handleChange}
              options={(usersData?.data?.users || [])
                .filter((u) => u.role === 'JR' || u.role === 'SR')
                .map((u) => ({ value: String(u.id), label: `${u.name} (${u.role})` }))}
              placeholder="Select doctor (optional)"
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate('/outpatient')}>Cancel</Button>
              <Button type="submit" loading={isLoading || isAssigning} disabled={!formData.patient_id}>Create Visit Record</Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default SelectExistingOutpatient;


