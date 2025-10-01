import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';
import {
  useGetPatientByIdQuery,
  useUpdatePatientMutation,
} from '../../features/patients/patientsApiSlice';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SEX_OPTIONS } from '../../utils/constants';

const EditPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: patientData, isLoading: patientLoading } = useGetPatientByIdQuery(id);
  const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation();

  const [formData, setFormData] = useState({
    name: '',
    sex: '',
    actual_age: '',
    assigned_room: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (patientData?.data?.patient) {
      const patient = patientData.data.patient;
      setFormData({
        name: patient.name || '',
        sex: patient.sex || '',
        actual_age: patient.actual_age || '',
        assigned_room: patient.assigned_room || '',
      });
    }
  }, [patientData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      await updatePatient({
        id,
        ...formData,
        actual_age: parseInt(formData.actual_age),
      }).unwrap();

      toast.success('Patient updated successfully!');
      navigate(`/patients/${id}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update patient');
    }
  };

  if (patientLoading) {
    return <LoadingSpinner size="lg" className="h-96" />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/patients/${id}`}>
          <Button variant="ghost" size="sm">
            <FiArrowLeft className="mr-2" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Patient</h1>
          <p className="text-gray-600 mt-1">Update patient information</p>
        </div>
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
                onClick={() => navigate(`/patients/${id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isUpdating}>
                Update Patient
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default EditPatient;

