import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  twoFactorRequired: false,
  tempToken: null,
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
      state.twoFactorRequired = false;
      state.tempToken = null;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    setTwoFactorRequired: (state, action) => {
      state.twoFactorRequired = true;
      state.tempToken = action.payload.tempToken;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.twoFactorRequired = false;
      state.tempToken = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
});

export const { setCredentials, setTwoFactorRequired, logout, updateUser } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectTwoFactorRequired = (state) => state.auth.twoFactorRequired;
export const selectTempToken = (state) => state.auth.tempToken;

