import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiUser, FiLock, FiShield } from 'react-icons/fi';
import { selectCurrentUser } from '../features/auth/authSlice';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useEnable2FAMutation,
  useDisable2FAMutation,
} from '../features/auth/authApiSlice';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatters';

const Profile = () => {
  const user = useSelector(selectCurrentUser);
  const { data: profileData, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [enable2FA] = useEnable2FAMutation();
  const [disable2FA] = useDisable2FAMutation();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm).unwrap();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();
      toast.success('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to change password');
    }
  };

  const handleEnable2FA = async () => {
    try {
      const result = await enable2FA().unwrap();
      // Show QR code or secret for user to scan
      toast.success('2FA enabled. Please scan the QR code in your authenticator app.');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to enable 2FA');
    }
  };

  const handleDisable2FA = async () => {
    if (window.confirm('Are you sure you want to disable 2FA?')) {
      try {
        await disable2FA().unwrap();
        toast.success('2FA disabled successfully');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to disable 2FA');
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-96" />;
  }

  const profile = profileData?.data?.user || user;

  const tabs = [
    { id: 'profile', name: 'Profile', icon: FiUser },
    { id: 'security', name: 'Security', icon: FiLock },
    { id: '2fa', name: 'Two-Factor Auth', icon: FiShield },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="mr-2 h-5 w-5" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card title="Profile Information">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">User ID</label>
                <p className="text-lg font-semibold">{profile.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <Badge variant="primary" className="mt-1">{profile.role}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Account Created</label>
                <p className="text-lg">{formatDate(profile.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Login</label>
                <p className="text-lg">{profile.last_login ? formatDate(profile.last_login) : 'Never'}</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Update Information</h3>
              <div className="space-y-6">
                <Input
                  label="Full Name"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  required
                />

                <div className="flex justify-end">
                  <Button type="submit" loading={isUpdating}>
                    Update Profile
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card title="Change Password">
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <Input
              label="Current Password"
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              required
            />

            <Input
              label="New Password"
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder="Minimum 8 characters"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              required
            />

            <div className="flex justify-end">
              <Button type="submit" loading={isChangingPassword}>
                Change Password
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 2FA Tab */}
      {activeTab === '2fa' && (
        <Card title="Two-Factor Authentication">
          <div className="space-y-6">
            <div>
              <p className="text-gray-600 mb-4">
                Two-factor authentication adds an extra layer of security to your account.
                When enabled, you'll need to enter a code from your authenticator app in addition to your password.
              </p>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Status</p>
                  <p className="text-sm text-gray-600 mt-1">
                    2FA is currently{' '}
                    <Badge variant={profile.two_factor_enabled ? 'success' : 'default'}>
                      {profile.two_factor_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </p>
                </div>
                {profile.two_factor_enabled ? (
                  <Button variant="danger" onClick={handleDisable2FA}>
                    Disable 2FA
                  </Button>
                ) : (
                  <Button onClick={handleEnable2FA}>
                    Enable 2FA
                  </Button>
                )}
              </div>
            </div>

            {!profile.two_factor_enabled && (
              <div className="border-t pt-6">
                <h4 className="font-medium mb-2">How to enable 2FA:</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Install an authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>Click "Enable 2FA" button above</li>
                  <li>Scan the QR code with your authenticator app</li>
                  <li>Enter the verification code to complete setup</li>
                </ol>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Profile;

