import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useLoginMutation, useVerifyLoginOTPMutation } from '../features/auth/authApiSlice';
import { setCredentials, setOTPRequired, selectOTPRequired, selectLoginData } from '../features/auth/authSlice';
import { 
  Eye, 
  EyeOff, 
  Stethoscope, 
  Lock, 
  Mail, 
  CheckCircle, 
  Users, 
  FileText, 
  Shield,
  Phone,
  Clock
} from 'lucide-react';
import PGI_Logo from '../assets/PGI_Logo.png';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const otpRequired = useSelector(selectOTPRequired);
  const loginData = useSelector(selectLoginData);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [verifyLoginOTP, { isLoading: isVerifying }] = useVerifyLoginOTPMutation();

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

      // Check if token is returned (direct login without OTP)
      if (result.data.token) {
        // Direct login - token received
        dispatch(setCredentials({
          user: result.data.user,
          token: result.data.token,
        }));
        toast.success('Login successful!');
        navigate('/');
      } else {
        // OTP required - store login data for OTP verification
        dispatch(setOTPRequired(result.data));
        toast.info('OTP sent to your email. Please check your inbox.');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Login failed');
    }
  };

  const handleOTPVerify = async (e) => {
    e.preventDefault();
    try {
      const result = await verifyLoginOTP({
        user_id: loginData.user_id,
        otp: formData.otp,
      }).unwrap();

      dispatch(setCredentials({
        user: result.data.user,
        token: result.data.token,
      }));
      dispatch(setOTPRequired(false));
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      toast.error(err?.data?.message || 'OTP verification failed');
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative min-h-screen flex">
        {/* Left Panel - Medical Information */}
        <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
          {/* Background Medical Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute bottom-20 left-20 w-16 h-16 bg-white rounded-full"></div>
            <div className="absolute bottom-40 right-10 w-20 h-20 bg-white rounded-full"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-between p-12 text-white">
            {/* Header */}
            <div>
              <div className="flex items-center mb-8">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mr-4">
                  <img src={PGI_Logo} alt="PGIMER Logo" className="h-12 w-12 object-contain" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">PGIMER Chandigarh</h1>
                  <p className="text-blue-100">Department of Psychiatry</p>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-4xl font-bold mb-4">Department of Psychiatry EMR System</h2>
                <p className="text-xl text-blue-100 mb-6">
                Digitally transforming patient care through advanced electronic medical records             
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Smart Patient Records</h3>
                  <p className="text-blue-100 text-sm">Secure and seamless management of psychiatric patient data and medical history</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Integrated Department Workflow</h3>
                  <p className="text-blue-100 text-sm">Smooth collaboration among clinicians, therapists, and administrative staff</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Data Privacy & Security</h3>
                  <p className="text-blue-100 text-sm">HIPAA-compliant protection ensuring confidentiality of mental health records</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">24/7 Access</h3>
                  <p className="text-blue-100 text-sm">Reliable, round-the-clock access to patient information for authorized staff</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/20 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-blue-200" />
                  <span className="text-blue-100 text-sm">Need help? Call us @ 0172-2746018</span>
                </div>
                <div className="text-blue-200 text-xs">
                  T&C apply*
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-2/5 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
                <img src={PGI_Logo} alt="PGIMER Logo" className="h-8 w-8 object-contain" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">PGIMER Chandigarh</h2>
              <p className="text-sm text-gray-600">Electronic Medical Record System</p>
            </div>

            {/* Desktop Logo */}
            <div className="hidden lg:block text-center mb-8">
              <div className="inline-flex items-center justify-center mb-4">
                <img src={PGI_Logo} alt="PGIMER Logo" className="h-24 w-24 object-contain" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">PGIMER Chandigarh</h2>
              <p className="text-sm text-gray-600">Electronic Medical Record System</p>
            </div>

            {/* Login Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h2>
                <p className="text-gray-600">Welcome back! Please enter your details.</p>
              </div>

              {!otpRequired ? (
                <form className="space-y-6" onSubmit={handleLogin}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-600">Remember Me</span>
                    </label>
                    <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                      Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoggingIn ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      'Login'
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <Mail className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Your Email</h3>
                    <p className="text-sm text-gray-600">
                      We've sent a 6-digit verification code to<br />
                      <span className="font-medium text-gray-900">{loginData?.email}</span>
                    </p>
                  </div>

                  <form className="space-y-6" onSubmit={handleOTPVerify}>
                    <div>
                      <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Code
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Shield className="h-5 w-5 text-gray-400" />
                      </div>
                        <input
                          id="otp"
                          name="otp"
                          type="text"
                          maxLength="6"
                          pattern="[0-9]{6}"
                          required
                          value={formData.otp}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center text-lg font-mono tracking-widest"
                          placeholder="000000"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifying || formData.otp.length !== 6}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isVerifying ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Verifying...
                        </div>
                      ) : (
                        'Verify & Continue'
                      )}
                    </button>
                  </form>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(setOTPRequired(false));
                        setFormData(prev => ({ ...prev, otp: '' }));
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                      Back to Login
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-xs text-gray-500">
                © 2025 Post Graduate Institute of Medical Education & Research, Chandigarh
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

