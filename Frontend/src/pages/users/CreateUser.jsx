import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';
import { useCreateUserMutation } from '../../features/users/usersApiSlice';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { USER_ROLES } from '../../utils/constants';

const CreateUser = () => {
  const navigate = useNavigate();
  const [createUser, { isLoading }] = useCreateUserMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
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
      const { confirmPassword, ...submitData } = formData;
      await createUser(submitData).unwrap();
      toast.success('User created successfully!');
      navigate('/users');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create user');
    }
  };

  const roleOptions = Object.entries(USER_ROLES).map(([key, value]) => ({
    value,
    label: value,
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/users">
          <Button variant="ghost" size="sm">
            <FiArrowLeft className="mr-2" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
          <p className="text-gray-600 mt-1">Add a new system user</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="space-y-6">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              error={errors.name}
              required
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@pgimer.edu.in"
              error={errors.email}
              required
            />

            <Select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={roleOptions}
              error={errors.role}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                error={errors.password}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                error={errors.confirmPassword}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/users')}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isLoading}>
                Create User
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateUser;

