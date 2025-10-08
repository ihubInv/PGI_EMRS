import { createSlice } from '@reduxjs/toolkit';

// Helper function to get user from localStorage safely
const getUserFromStorage = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    localStorage.removeItem('user');
    return null;
  }
};

const initialState = {
  user: getUserFromStorage(),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!(localStorage.getItem('token') && getUserFromStorage()),
  otpRequired: false,
  loginData: null, // Store user_id and email for OTP verification
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.otpRequired = false;
      state.loginData = null;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    setOTPRequired: (state, action) => {
      state.otpRequired = true;
      state.loginData = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.otpRequired = false;
      state.loginData = null;
      try {
        // Clear all app data from storage on logout
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        // Fallback to removing known keys if clear() fails (e.g., quota issues)
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        try { sessionStorage.clear(); } catch (_) {}
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
});

export const { setCredentials, setOTPRequired, logout, updateUser } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectOTPRequired = (state) => state.auth.otpRequired;
export const selectLoginData = (state) => state.auth.loginData;

