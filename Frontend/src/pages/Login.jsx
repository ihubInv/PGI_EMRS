import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useLoginMutation, useVerify2FAMutation } from '../features/auth/authApiSlice';
import { setCredentials, setTwoFactorRequired, selectTwoFactorRequired } from '../features/auth/authSlice';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const twoFactorRequired = useSelector(selectTwoFactorRequired);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: '',
  });

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [verify2FA, { isLoading: isVerifying }] = useVerify2FAMutation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      if (result.requiresTwoFactor) {
        dispatch(setTwoFactorRequired({ tempToken: result.tempToken }));
        toast.info('Please enter your 2FA code');
      } else {
        dispatch(setCredentials({
          user: result.data.user,
          token: result.data.token,
        }));
        toast.success('Login successful!');
        navigate('/');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Login failed');
    }
  };

  const handle2FAVerify = async (e) => {
    e.preventDefault();
    try {
      const result = await verify2FA({
        twoFactorCode: formData.twoFactorCode,
      }).unwrap();

      dispatch(setCredentials({
        user: result.data.user,
        token: result.data.token,
      }));
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      toast.error(err?.data?.message || '2FA verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PGI EMRS</h1>
          <p className="text-gray-600">
            Electronic Medical Record System
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Psychiatry Department - PGIMER Chandigarh
          </p>
        </div>

        {!twoFactorRequired ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

            <Button
              type="submit"
              className="w-full"
              loading={isLoggingIn}
              disabled={isLoggingIn}
            >
              Sign In
            </Button>
          </form>
        ) : (
          <form onSubmit={handle2FAVerify} className="space-y-4">
            <Input
              label="Two-Factor Authentication Code"
              type="text"
              name="twoFactorCode"
              value={formData.twoFactorCode}
              onChange={handleChange}
              placeholder="Enter 6-digit code"
              required
              maxLength={6}
            />

            <Button
              type="submit"
              className="w-full"
              loading={isVerifying}
              disabled={isVerifying}
            >
              Verify Code
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Authorized Personnel Only</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;

