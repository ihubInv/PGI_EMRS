import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useLoginMutation, useVerify2FAMutation } from '../features/auth/authApiSlice';
import { setCredentials, setTwoFactorRequired, selectTwoFactorRequired } from '../features/auth/authSlice';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const twoFactorRequired = useSelector(selectTwoFactorRequired);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: '',
  });
  const [rememberMe, setRememberMe] = useState(false);

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

  useEffect(() => {
    const previousBackground = document.body.style.background;
    const previousBackgroundSize = document.body.style.backgroundSize;
    const previousBackgroundRepeat = document.body.style.backgroundRepeat;
    const previousBackgroundPosition = document.body.style.backgroundPosition;
    const previousBackgroundAttachment = document.body.style.backgroundAttachment;

    document.body.setAttribute(
      'style',
      `${document.body.getAttribute('style') || ''}`
    );
    document.body.style.background = "url('/resources/images/3rdWaveLogin/loginBg.svg') no-repeat";
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundPosition = 'center center';
    document.body.style.backgroundAttachment = 'fixed';

    return () => {
      document.body.style.background = previousBackground;
      document.body.style.backgroundSize = previousBackgroundSize;
      document.body.style.backgroundRepeat = previousBackgroundRepeat;
      document.body.style.backgroundPosition = previousBackgroundPosition;
      document.body.style.backgroundAttachment = previousBackgroundAttachment;
    };
  }, []);

  return (
    <div className="min-h-screen p-3 sm:p-4 flex items-center justify-center">
      <div className="mx-auto w-full max-w-6xl bg-white/90 backdrop-blur rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Left promo section */}
          <div className="hidden lg:block lg:col-span-2 relative">
            <div className="h-full w-full p-10 pr-6 flex flex-col">
              <div className="text-primary-900 text-3xl font-extrabold">PGIMER Chandigarh</div>
              <div className="text-primary-700 mt-1 text-lg">Department of Psychiatry</div>

              <div className="flex items-center mt-8 ml-2">
                <div className="w-56">
                  <img src="https://via.placeholder.com/224x224?text=Illustration" alt="Clinician Illustration" className="object-contain" />
                </div>
                <div className="flex-1" />
                <div className="space-y-5 mr-4 max-w-xl">
                  <div className="flex items-start gap-3">
                    <img src="https://via.placeholder.com/24x24/3B82F6/FFFFFF?text=E" alt="Efficient documentation" className="h-6 w-6 mt-1 rounded" />
                    <div className="text-[#425466] text-base font-semibold">Efficient, compliant clinical documentation workflows</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <img src="https://via.placeholder.com/24x24/10B981/FFFFFF?text=S" alt="Data privacy" className="h-6 w-6 mt-1 rounded" />
                    <div className="text-[#425466] text-base font-semibold">Secure access with strict role-based permissions</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <img src="https://via.placeholder.com/24x24/F59E0B/FFFFFF?text=C" alt="Collaboration" className="h-6 w-6 mt-1 rounded" />
                    <div className="text-[#425466] text-base font-semibold">Collaborative care with accurate patient records</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <img src="https://via.placeholder.com/24x24/8B5CF6/FFFFFF?text=I" alt="Insights" className="h-6 w-6 mt-1 rounded" />
                    <div className="text-[#425466] text-base font-semibold">Insights-ready data for care and research</div>
                  </div>
                </div>
              </div>

              <div className="absolute left-0 right-0 bottom-0 px-8 py-3 bg-gradient-to-r from-teal-700/90 to-teal-500/90 text-white text-sm flex items-center justify-between">
                <span>Need help? Call us @1800 1020 127</span>
                <span className="opacity-90">T&C apply*</span>
              </div>
            </div>
          </div>

          {/* Right sign-in section */}
          <div className="col-span-1 bg-white px-6 py-8 lg:px-8 relative lg:border-l lg:border-gray-100">
            <div className="flex flex-col items-center">
              <img src="https://via.placeholder.com/160x40?text=PGIMER+Logo" alt="PGIMER Logo" className="h-10 mb-6 object-contain" />
              <div className="w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 pt-2">Sign in</h2>
                <div className="text-gray-500 mb-6">Welcome back! Please enter your details.</div>

                {!twoFactorRequired ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <div className="text-left text-sm mb-1">Email</div>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div>
                      <div className="text-left text-sm mb-1">Password</div>
                      <Input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="inline-flex items-center gap-2 select-none">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span className="text-gray-600">Remember Me</span>
                      </label>
                      <a href="#" className="text-primary-600 hover:underline">Forgot Password</a>
                    </div>

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
                    <div>
                      <div className="text-left text-sm mb-1">Two-Factor Authentication Code</div>
                      <Input
                        type="text"
                        name="twoFactorCode"
                        value={formData.twoFactorCode}
                        onChange={handleChange}
                        placeholder="Enter 6-digit code"
                        required
                        maxLength={6}
                      />
                    </div>

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

                <div className="mt-6 text-center text-xs text-gray-500">By signing in, you agree to institutional policies.</div>

                <div className="mt-6 text-center text-sm text-gray-600">
                  Authorized Personnel Only
                </div>

                

                <div className="mt-8 text-center text-xs text-gray-400"><span>PGIMER © All rights reserved</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

