import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCreatePatientMutation } from '../../features/patients/patientsApiSlice';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { SEX_OPTIONS } from '../../utils/constants';

const CreatePatient = () => {
  const navigate = useNavigate();
  const [createPatient, { isLoading }] = useCreatePatientMutation();

  const [formData, setFormData] = useState({
    name: '',
    sex: '',
    actual_age: '',
    assigned_room: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.sex) {
      newErrors.sex = 'Sex is required';
    }

    if (!formData.actual_age) {
      newErrors.actual_age = 'Age is required';
    } else if (formData.actual_age < 0 || formData.actual_age > 150) {
      newErrors.actual_age = 'Age must be between 0 and 150';
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
      const result = await createPatient({
        ...formData,
        actual_age: parseInt(formData.actual_age),
      }).unwrap();

      toast.success('Patient created successfully!');
      navigate(`/patients/${result.data.patient.id}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create patient');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Register New Patient</h1>
        <p className="text-gray-600 mt-1">Enter patient information</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="space-y-6">
            <Input
              label="Patient Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              error={errors.name}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Sex"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                options={SEX_OPTIONS}
                error={errors.sex}
                required
              />

              <Input
                label="Age"
                type="number"
                name="actual_age"
                value={formData.actual_age}
                onChange={handleChange}
                placeholder="Enter age"
                error={errors.actual_age}
                required
                min="0"
                max="150"
              />
            </div>

            <Input
              label="Assigned Room"
              name="assigned_room"
              value={formData.assigned_room}
              onChange={handleChange}
              placeholder="e.g., Ward A-101"
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/patients')}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isLoading}>
                Create Patient
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreatePatient;

